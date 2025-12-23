
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV not found" }), { status: 500 });
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

    const code = await kv.get(`verification:${digitsOnly}`);

    if (code) {
      return new Response(JSON.stringify({ valid: true, code: code }), {
        headers: { "Content-Type": "application/json" },
      });
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
