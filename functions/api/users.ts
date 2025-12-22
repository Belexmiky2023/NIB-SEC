
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  // Support common binding names 'DB' or 'KV'
  const kv = env.DB || env.KV;
  
  if (!kv) {
    console.error("KV Binding (DB or KV) not found in environment");
    return new Response(JSON.stringify([]), {
      status: 200, // Return 200 with empty array so UI doesn't crash
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const list = await kv.list({ prefix: "user:" });
    const users = [];
    
    // Efficiently fetch all keys
    for (const key of list.keys) {
      const val = await kv.get(key.name);
      if (val) {
        try {
          users.push(JSON.parse(val));
        } catch (e) {
          console.error(`Failed to parse user data for key ${key.name}:`, e);
        }
      }
    }

    return new Response(JSON.stringify(users), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
    });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const kv = env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV Binding not found" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const userData = await request.json();
    if (!userData || !userData.id) {
      return new Response(JSON.stringify({ error: "Missing required user ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Ensure we store exactly what the admin panel expects
    // Key prefix 'user:' ensures we can list them separately
    await kv.put(`user:${userData.id}`, JSON.stringify({
      ...userData,
      updatedAt: Date.now()
    }));

    return new Response(JSON.stringify({ success: true, id: userData.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return new Response(JSON.stringify({ error: "Persistence failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
