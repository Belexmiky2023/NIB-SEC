export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const kv = env.VERIFY_KV || env.DB || env.KV;

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding not found" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const purchases = [];
    let cursor = undefined;

    do {
      const listResponse: any = await kv.list({ prefix: "purchase:", cursor });
      for (const key of listResponse.keys) {
        const value = await kv.get(key.name);
        if (value) {
          try {
            purchases.push(JSON.parse(value));
          } catch (e) {
            console.error(`Ledger error at ${key.name}`);
          }
        }
      }
      cursor = listResponse.list_complete ? undefined : listResponse.cursor;
    } while (cursor);

    return new Response(JSON.stringify(purchases), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Vault access denied", details: err.message }), {
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
    const purchaseData = await request.json();
    if (!purchaseData || !purchaseData.id) {
      return new Response(JSON.stringify({ error: "Purchase record malformed: Missing ID" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `purchase:${purchaseData.id}`;
    await kv.put(key, JSON.stringify({
      ...purchaseData,
      submittedAt: Date.now()
    }));

    return new Response(JSON.stringify({ success: true, record: key }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Ledger registration failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}