
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
    const body: any = await request.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Protocol Error: Missing phone or verification code" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Normalization node
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    // SQL Query: Check code and current timestamp
    const now = new Date().toISOString();
    const record: any = await db.prepare(
      "SELECT code FROM verification WHERE phone = ? AND expires_at > ?"
    )
    .bind(normalizedPhone, now)
    .first();

    // 1. If record missing or expired
    if (!record) {
      return new Response(
        JSON.stringify({ error: "Code expired or not found" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 2. If code mismatch
    if (record.code.toString() !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 3. Security: Single-use enforcement (Atomic Delete)
    await db.prepare("DELETE FROM verification WHERE phone = ?")
      .bind(normalizedPhone)
      .run();

    return new Response(
      JSON.stringify({ ok: true }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Handshake failure", details: err.message }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
