export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ 
        error: "D1 database binding 'DB' missing.",
        help: "Check your wrangler.jsonc or Cloudflare Dashboard (Settings > Functions > D1 Bindings)." 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Missing phone or code" }), { status: 400 });
    }

    // Normalization: 0... -> +251...
    let normalizedPhone = phone.toString().trim();
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+251" + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+" + normalizedPhone;
    }

    // Query D1 for valid, non-expired code
    const record: any = await db.prepare(
      "SELECT code FROM verification WHERE phone = ? AND expires_at > CURRENT_TIMESTAMP"
    )
    .bind(normalizedPhone)
    .first();

    if (!record) {
      return new Response(JSON.stringify({ error: "Code expired or not found" }), { status: 401 });
    }

    if (record.code.toString() !== code.toString()) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), { status: 401 });
    }

    // Atomic Delete (Single-use)
    await db.prepare("DELETE FROM verification WHERE phone = ?").bind(normalizedPhone).run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}