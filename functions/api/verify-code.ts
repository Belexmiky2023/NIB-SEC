export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: "D1 database binding 'DB' missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { phone, code } = body;

  if (!phone || !code) {
    return new Response(
      JSON.stringify({ error: "Missing phone or verification code" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Phone normalization
  let normalizedPhone = String(phone).trim();
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "+251" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("+")) {
    normalizedPhone = "+" + normalizedPhone;
  }

  const now = new Date().toISOString();

  const record = await db
    .prepare("SELECT code FROM verification WHERE phone = ? AND expires_at > ?")
    .bind(normalizedPhone, now)
    .first<{ code: string }>();

  if (!record) {
    return new Response(
      JSON.stringify({ error: "Code expired or not found" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (record.code !== String(code)) {
    return new Response(
      JSON.stringify({ error: "Invalid verification code" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Single-use enforcement
  await db
    .prepare("DELETE FROM verification WHERE phone = ?")
    .bind(normalizedPhone)
    .run();

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
