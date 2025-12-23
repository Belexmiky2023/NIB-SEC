
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB; 

  if (!db) {
    return new Response(JSON.stringify({ error: "Database binding 'DB' not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Missing phone input" }), { status: 400 });
    }

    // Phone Normalization: Prepend +251 if starts with 0
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      // If it doesn't start with +, assume it needs international prefix
      normalizedPhone = "+" + normalizedPhone;
    }

    // Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // D1 SQL Insert (Atomic Replace)
    await db.prepare(
      "INSERT OR REPLACE INTO verification (phone, code, expires_at) VALUES (?, ?, ?)"
    )
    .bind(normalizedPhone, code, expiresAt)
    .run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Signal generation failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}