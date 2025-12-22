
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const kv = env.DB || env.KV;

  if (!kv) {
    console.error("KV Binding (DB or KV) not found in environment for purchases");
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const list = await kv.list({ prefix: "purchase:" });
    const purchases = [];

    for (const key of list.keys) {
      const val = await kv.get(key.name);
      if (val) {
        try {
          purchases.push(JSON.parse(val));
        } catch (e) {
          console.error(`Failed to parse purchase data for key ${key.name}:`, e);
        }
      }
    }

    return new Response(JSON.stringify(purchases), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
    });
  } catch (err) {
    console.error("GET /api/purchases error:", err);
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
    const purchase = await request.json();
    if (!purchase || !purchase.id) {
      return new Response(JSON.stringify({ error: "Missing required purchase record ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Prefix 'purchase:' for easy filtering and listing
    await kv.put(`purchase:${purchase.id}`, JSON.stringify({
      ...purchase,
      processedAt: Date.now()
    }));

    return new Response(JSON.stringify({ success: true, id: purchase.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("POST /api/purchases error:", err);
    return new Response(JSON.stringify({ error: "Ledger update failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
