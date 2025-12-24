
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB; 

  if (!db) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' missing" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Protocol Error: Missing phone node" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Normalization: Prepend +251 if starts with 0
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    // Security: Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Expiry: 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Persist to SQL (Atomic Replace)
    await db.prepare(
      "INSERT OR REPLACE INTO verification (phone, code, expires_at) VALUES (?, ?, ?)"
    )
    .bind(normalizedPhone, code, expiresAt)
    .run();

    // IMPORTANT: Do NOT log or return the code in the success response
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Signal registry failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
