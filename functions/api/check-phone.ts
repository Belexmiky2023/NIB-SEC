export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ valid: false, error: "D1 database unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ valid: false }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { phone } = body;
  if (!phone) {
    return new Response(
      JSON.stringify({ valid: false }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let normalizedPhone = String(phone).trim();
  if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "+251" + normalizedPhone.slice(1);
  } else if (!normalizedPhone.startsWith("+")) {
    normalizedPhone = "+" + normalizedPhone;
  }

  const record = await db
    .prepare(
      "SELECT 1 FROM verification WHERE phone = ? AND expires_at > ?"
    )
    .bind(normalizedPhone, new Date().toISOString())
    .first();

  return new Response(
    JSON.stringify({ valid: Boolean(record) }),
    { headers: { "Content-Type": "application/json" } }
  );
}
