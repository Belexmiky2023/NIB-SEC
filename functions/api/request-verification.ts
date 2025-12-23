
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB; // Assumes D1 binding name is DB

  if (!db) {
    return new Response(JSON.stringify({ error: "Database binding 'DB' not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    let digitsOnly = phone?.toString().replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 9) {
      return new Response(JSON.stringify({ error: "Invalid phone node length" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Phone Normalization: Prepend 251 if starts with 0
    if (digitsOnly.startsWith("0")) {
      digitsOnly = "251" + digitsOnly.substring(1);
    }

    // Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // D1 SQL Insert (Atomic Replace)
    await db.prepare(
      "INSERT OR REPLACE INTO verification (phone, code, expires_at) VALUES (?, ?, ?)"
    )
    .bind(digitsOnly, code, expiresAt)
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
