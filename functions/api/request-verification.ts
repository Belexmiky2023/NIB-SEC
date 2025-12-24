export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(JSON.stringify({ error: "D1 database binding 'DB' missing." }), { status: 500 });
  }

  try {
    const { phone } = await request.json();
    if (!phone) return new Response(JSON.stringify({ error: "Missing phone" }), { status: 400 });

    // Normalization: 0... -> +251...
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    const code = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Set expiry to 5 minutes from now (SQLite compatible format)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];

    await db.prepare(
      "INSERT OR REPLACE INTO verification (phone, code, expires_at) VALUES (?, ?, ?)"
    )
    .bind(normalizedPhone, code, expiresAt)
    .run();

    // Do NOT return the code in the response for security
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Signal generation failure", details: err.message }), { status: 500 });
  }
}