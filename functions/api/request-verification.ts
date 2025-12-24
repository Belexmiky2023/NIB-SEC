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

  const { phone } = body;

  if (!phone) {
    return new Response(
      JSON.stringify({ error: "Missing phone" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let normalizedPhone = String(phone).trim();
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "+251" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("+")) {
    normalizedPhone = "+" + normalizedPhone;
  }

  // Secure 7-digit code
  const code = crypto.getRandomValues(new Uint32Array(1))[0] % 9000000 + 1000000 + "";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await db
    .prepare(
      "INSERT OR REPLACE INTO verification (phone, code, expires_at) VALUES (?, ?, ?)"
    )
    .bind(normalizedPhone, code, expiresAt)
    .run();

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
