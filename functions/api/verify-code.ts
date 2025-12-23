
/**
 * NIB SEC - SQL Verification Protocol
 * 
 * Requirement: This worker utilizes Cloudflare D1 SQL database instead of KV.
 */

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
    let digitsOnly = phone.toString().replace(/\D/g, '');
    if (digitsOnly.startsWith("0")) {
      digitsOnly = "251" + digitsOnly.substring(1);
    }

    // 1. Fetch code from SQL and check expiration
    const now = new Date().toISOString();
    const record: any = await db.prepare(
      "SELECT code FROM verification WHERE phone = ? AND expires_at > ?"
    )
    .bind(digitsOnly, now)
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
      .bind(digitsOnly)
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
