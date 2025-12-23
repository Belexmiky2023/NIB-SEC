
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  // Use VERIFY_KV as prioritized by the updated spec, falling back to existing bindings
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding 'VERIFY_KV' not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    const digitsOnly = phone?.replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 9) {
      return new Response(JSON.stringify({ error: "Invalid phone number length" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();

    // Store in KV with 5 minute expiration (300 seconds)
    // Key format: verify:<phone>
    // Value format: { "code": "..." }
    const key = `verify:${digitsOnly}`;
    await kv.put(key, JSON.stringify({ code }), { expirationTtl: 300 });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Verification request failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
