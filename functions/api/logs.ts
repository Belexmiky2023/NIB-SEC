type Env = {
  DB: D1Database;
};

/**
 * GET /api/logs
 * Returns all logs
 */
export async function onRequestGet({ env }: { env: Env }) {
  const db = env.DB;
  if (!db) {
    return new Response(
      JSON.stringify({ error: "D1 database binding 'DB' missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { results } = await db
      .prepare("SELECT * FROM logs ORDER BY timestamp DESC")
      .all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Logs query failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /api/logs
 * Add a log entry
 */
export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const db = env.DB;
  if (!db) {
    return new Response(
      JSON.stringify({ error: "D1 database binding 'DB' missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let log: any;
  try {
    log = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!log?.id || !log?.type || !log?.content) {
    return new Response(
      JSON.stringify({ error: "Missing log ID, type, or content" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await db
      .prepare(`
        INSERT INTO logs
        (id, type, sender, content, timestamp, delta)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        log.id,
        log.type,
        log.sender ?? null,
        log.content,
        log.timestamp ?? Date.now(),
        log.delta ?? null
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Log persistence failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
