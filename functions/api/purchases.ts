type Env = {
  DB: D1Database;
};

/**
 * GET /api/purchases
 * Returns all purchases for admin panel
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
      .prepare("SELECT * FROM purchases ORDER BY timestamp DESC")
      .all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Purchase ledger query failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /api/purchases
 * Create or update a purchase record
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

  let purchase: any;
  try {
    purchase = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!purchase?.id || !purchase?.userId) {
    return new Response(
      JSON.stringify({ error: "Missing purchase ID or user ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await db
      .prepare(`
        INSERT OR REPLACE INTO purchases
        (
          id,
          userId,
          username,
          amount,
          method,
          timestamp,
          status,
          submittedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        purchase.id,
        purchase.userId,
        purchase.username ?? null,
        purchase.amount ?? "0",
        purchase.method ?? null,
        purchase.timestamp ?? Date.now(),
        purchase.status ?? "pending",
        purchase.submittedAt ?? Date.now()
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Purchase persistence failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
