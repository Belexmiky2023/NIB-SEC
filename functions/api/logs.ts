
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const db = env.DB;

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });

  try {
    const { results } = await db.prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Log query failure" }), { status: 500 });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });

  try {
    const log = await request.json();
    const logId = `log:${Date.now()}:${Math.random().toString(36).substr(2, 5)}`;
    
    await db.prepare(`
      INSERT INTO logs (id, type, sender, content, timestamp, delta) 
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(logId, log.type, log.sender, log.content, Date.now(), log.delta || null)
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Log storage failure" }), { status: 500 });
  }
}
