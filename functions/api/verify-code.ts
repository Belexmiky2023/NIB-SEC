
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.DB || env.KV;

  if (!kv) return new Response(JSON.stringify({ error: "KV not found" }), { status: 500 });

  try {
    const { phone, code } = await request.json();
    const digitsOnly = phone?.replace(/\D/g, '');

    if (!digitsOnly || !code) {
      return new Response(JSON.stringify({ error: "Missing phone or code" }), { status: 400 });
    }

    const storedCode = await kv.get(`verification:${digitsOnly}`);

    if (storedCode && storedCode === code) {
      // Clean up the code after successful verification
      await kv.delete(`verification:${digitsOnly}`);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired code" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Verification failure" }), { status: 500 });
  }
}
