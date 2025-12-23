
/**
 * NIB SEC - Verification Signal Endpoint
 * 
 * wrangler.jsonc / wrangler.toml binding example:
 * {
 *   "kv_namespaces": [
 *     {
 *       "binding": "KV",
 *       "id": "f39c6a86088a4f81ad60540ed3ce5602"
 *     }
 *   ]
 * }
 */

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  
  // Per requirement: KV binding variable in Worker is 'KV'
  const kv = env.KV;

  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV binding 'KV' not found. Check your wrangler configuration." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // 1. Accept only POST requests with JSON body
    const body: any = await request.json().catch(() => ({}));
    const { phone, code } = body;

    // 2. Validate inputs; return HTTP 400 if missing
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: phone and code are mandatory." }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Normalize phone (strip non-digits) to ensure lookup consistency
    const digitsOnly = phone.toString().replace(/\D/g, '');
    const key = `verify:${digitsOnly}`;

    // 3. Read KV to get stored code
    const storedValue = await kv.get(key);

    // 4. If KV key not found, return HTTP 401 with specific error
    if (!storedValue) {
      return new Response(
        JSON.stringify({ error: "Code expired or not found" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 5. Handle malformed KV values gracefully
    let parsed: { code: string };
    try {
      parsed = JSON.parse(storedValue);
    } catch (e) {
      // If the data is corrupt, delete it and ask for a retry
      await kv.delete(key);
      return new Response(
        JSON.stringify({ error: "Internal registry error. Please request a new signal." }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 6. If code does not match, return HTTP 401
    // Using string comparison to handle numeric codes safely
    if (parsed.code.toString() !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 7. If code matches: Delete KV entry immediately (single-use)
    await kv.delete(key);

    // 8. Return HTTP 200 with { ok: true }
    return new Response(
      JSON.stringify({ ok: true }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    // 9. Security: Do not log or expose codes or detailed internal errors
    return new Response(
      JSON.stringify({ error: "Server error occurred during handshake." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
