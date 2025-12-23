
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  // Prioritize 'DB' as the primary binding name for the KV hive
  const kv = env.DB || env.KV;
  
  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding 'DB' not bound in Cloudflare dashboard" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const users = [];
    let cursor = undefined;

    // Use a loop to handle KV pagination (limit is 1000 per list call)
    // This ensures the Overseer sees EVERY user, even as the hive grows
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
  const kv = env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding 'DB' not found" }), { 
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

    // Force a consistent key format for listing
    const key = `user:${userData.id}`;
    
    // Persist user with updated timestamp for sorting in Overseer
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
