
export async function onRequestGet(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;
  const url = new URL(request.url);
  const userId = url.searchParams.get('id');

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV not found" }), { status: 500 });
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  try {
    const data = await kv.get(`user:${userId}`);
    if (!data) {
      return new Response(JSON.stringify({ error: "Node not found" }), { status: 404 });
    }

    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Sync failure", details: err.message }), { status: 500 });
  }
}
