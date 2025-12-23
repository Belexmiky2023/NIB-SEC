
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: "Signal Database (D1) not found. Check binding 'DB'." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Protocol Error: Missing phone node or verification code." }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Normalize phone node for lookup
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    // 1. Fetch code from SQL and check expiration
    const now = new Date().toISOString();
    const record: any = await db.prepare(
      "SELECT code FROM verification WHERE phone = ? AND expires_at > ?"
    )
    .bind(normalizedPhone, now)
    .first();

    // 2. If record missing or expired
    if (!record) {
      return new Response(
        JSON.stringify({ error: "Code expired or not found" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 3. Verify code equality
    if (record.code.toString() !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 4. Security: Single-use enforcement (SQL Delete)
    await db.prepare("DELETE FROM verification WHERE phone = ?")
      .bind(normalizedPhone)
      .run();

    // 5. Success
    return new Response(
      JSON.stringify({ ok: true }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Neural link handshake failure." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}