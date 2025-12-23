/**
 * NIB SEC - Verification Signal Endpoint
 * 
 * wrangler.jsonc / wrangler.toml binding example:
 * {
 *   "kv_namespaces": [
 *     {
 *       "binding": "VERIFY_KV",
 *       "id": "f39c6a86088a4f81ad60540ed3ce5602"
 *     }
 *   ]
 * }
 */

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  
  // Requirement 1: Unified KV Resolution
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV binding error. Please ensure a KV namespace is bound to 'VERIFY_KV', 'DB', or 'KV'." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body: any = await request.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Protocol Error: Missing phone node or verification code." }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Standardize phone key format
    const digitsOnly = phone.toString().replace(/\D/g, '');
    const key = `verify:${digitsOnly}`;

    const storedValue = await kv.get(key);

    if (!storedValue) {
      return new Response(
        JSON.stringify({ error: "Code expired or not found" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    let parsed: { code: string };
    try {
      parsed = JSON.parse(storedValue);
    } catch (e) {
      await kv.delete(key);
      return new Response(
        JSON.stringify({ error: "Neural record corruption. Handshake failed." }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify code equality
    if (parsed.code.toString() !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Security: Single-use enforcement
    await kv.delete(key);

    return new Response(
      JSON.stringify({ ok: true }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Handshake aborted due to internal signal failure." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
