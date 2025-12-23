
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding 'DB' or 'KV' not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { phone } = await request.json();
    const digitsOnly = phone?.replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 8) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate random 7-digit numeric code
    const code = Math.floor(1000000 + Math.random() * 9000000).toString();

    // Store in KV with 5 minute expiration (100 seconds)
    const key = `verification:${digitsOnly}`;
    await kv.put(key, code, { expirationTtl: 100 });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Verification request failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
