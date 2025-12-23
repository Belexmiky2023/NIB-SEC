export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV not found" }), { status: 500 });
  }

  try {
    const logs = [];
    const listResponse = await kv.list({ prefix: "log:", limit: 100 });
    
    for (const key of listResponse.keys) {
      const value = await kv.get(key.name);
      if (value) {
        logs.push(JSON.parse(value));
      }
    }

    logs.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify(logs), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Log access failure" }), { status: 500 });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) return new Response(JSON.stringify({ error: "KV not found" }), { status: 500 });

  try {
    const logData = await request.json();
    const logId = `log:${Date.now()}:${Math.random().toString(36).substr(2, 5)}`;
    
    await kv.put(logId, JSON.stringify({
      ...logData,
      id: logId,
      timestamp: Date.now()
    }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Log storage failure" }), { status: 500 });
  }
}