/**
 * NIB SEC - Verification Signal Endpoint
 * 
 * Deployment Instructions for wrangler.toml:
 * [[kv_namespaces]]
 * binding = "VERIFY_KV"
 * id = "f39c6a86088a4f81ad60540ed3ce5602"
 */

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV;

  // 1. Validate environment configuration
  if (!kv) {
    return new Response(
      JSON.stringify({ error: "KV binding 'VERIFY_KV' is not configured in the environment." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // 2. Extract and validate request body
    const body: any = await request.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: phone or code." }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 3. Normalize phone number for consistent lookup
    const digitsOnly = phone.replace(/\D/g, '');
    const key = `verify:${digitsOnly}`;

    // 4. Retrieve stored signal from KV
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

    // 5. Parse stored JSON payload safely
    let parsed: { code: string };
    try {
      parsed = JSON.parse(storedValue);
    } catch (e) {
      // In case of malformed data, treat as internal error and purge the record
      await kv.delete(key);
      return new Response(
        JSON.stringify({ error: "Internal registry corruption. Please request a new code." }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 6. Verification check
    if (parsed.code !== code.toString()) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }), 
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // 7. Security: Immediate deletion for single-use enforcement
    await kv.delete(key);

    // 8. Success response
    return new Response(
      JSON.stringify({ ok: true }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    // 9. Generic error handling to prevent sensitive data exposure
    return new Response(
      JSON.stringify({ error: "An unexpected server error occurred during handshake." }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}