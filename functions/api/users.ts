export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;
  
  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding not found. Please bind your KV namespace to 'VERIFY_KV'." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const users = [];
    let cursor = undefined;

    do {
      const listResponse: any = await kv.list({ prefix: "user:", cursor });
      for (const key of listResponse.keys) {
        const value = await kv.get(key.name);
        if (value) {
          try {
            users.push(JSON.parse(value));
          } catch (e) {
            console.error(`Corrupt node detected at ${key.name}`);
          }
        }
      }
      cursor = listResponse.list_complete ? undefined : listResponse.cursor;
    } while (cursor);

    return new Response(JSON.stringify(users), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Failed to query identity vault", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const userData = await request.json();
    if (!userData || !userData.id) {
      return new Response(JSON.stringify({ error: "Node identification failed: Missing ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `user:${userData.id}`;
    await kv.put(key, JSON.stringify({
      ...userData,
      updatedAt: Date.now()
    }));

    return new Response(JSON.stringify({ success: true, node: key }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Identity persistence failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}