
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.KV || env.VERIFY_KV || env.DB;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    const digitsOnly = phone?.toString().replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 9) {
      return new Response(JSON.stringify({ error: "Invalid phone number length" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();

    // Key format: verify:<phone>
    // Value format: { "code": "..." }
    const key = `verify:${digitsOnly}`;
    await kv.put(key, JSON.stringify({ code }), { expirationTtl: 300 });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Verification request failure" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
