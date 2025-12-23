
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(JSON.stringify({ error: "Database connection failed" }), { status: 500 });
  }

  try {
    const { phone } = await request.json();
    let digitsOnly = phone?.toString().replace(/\D/g, '');

    if (!digitsOnly) {
      return new Response(JSON.stringify({ valid: false, error: "Missing node ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Phone Normalization: Prepend 251 if starts with 0
    if (digitsOnly.startsWith("0")) {
      digitsOnly = "251" + digitsOnly.substring(1);
    }

    // Query DB for non-expired code
    const record: any = await db.prepare(
      "SELECT code FROM verification WHERE phone = ? AND expires_at > ?"
    )
    .bind(digitsOnly, new Date().toISOString())
    .first();

    if (record) {
      return new Response(JSON.stringify({ valid: true, code: record.code }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ valid: false, error: "Registry query error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
