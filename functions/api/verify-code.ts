
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding 'VERIFY_KV' not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Missing phone or code" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const digitsOnly = phone.replace(/\D/g, '');
    const key = `verify:${digitsOnly}`;
    const storedValue = await kv.get(key);

    if (!storedValue) {
      return new Response(JSON.stringify({ error: "Code expired or not found" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(storedValue);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Registry corruption detected" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (parsed.code !== code) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Success path: Single-use code deletion
    await kv.delete(key);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
