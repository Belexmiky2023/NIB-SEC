export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding not found" }), { status: 500 });
  }

  try {
    const { phone } = await request.json();
    const digitsOnly = phone?.replace(/\D/g, '');

    if (!digitsOnly) {
      return new Response(JSON.stringify({ valid: false, error: "Missing phone" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Match the new 'verify:' prefix and JSON structure
    const storedValue = await kv.get(`verify:${digitsOnly}`);

    if (storedValue) {
      try {
        const parsed = JSON.parse(storedValue);
        return new Response(JSON.stringify({ valid: true, code: parsed.code }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ valid: false, error: "Malformed record" }), { status: 500 });
      }
    } else {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ valid: false, error: "Server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}