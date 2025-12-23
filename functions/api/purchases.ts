
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const db = env.DB;

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });

  try {
    const { results } = await db.prepare("SELECT * FROM purchases ORDER BY timestamp DESC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Ledger query failure" }), { status: 500 });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });

  try {
    const p = await request.json();
    if (!p || !p.id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

    await db.prepare(`
      INSERT OR REPLACE INTO purchases 
      (id, userId, username, amount, method, timestamp, status, submittedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(p.id, p.userId, p.username, p.amount, p.method, p.timestamp, p.status, Date.now())
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Ledger write failure" }), { status: 500 });
  }
}
