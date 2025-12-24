type Env = {
  DB: D1Database;
};

/**
 * GET /api/users
 * Returns all users for admin panel
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
      .prepare("SELECT * FROM users ORDER BY registrationDate DESC")
      .all();

    const users = results.map((u: any) => ({
      ...u,
      isProfileComplete: Boolean(u.isProfileComplete),
      isBanned: Boolean(u.isBanned),
      isVerified: Boolean(u.isVerified),
    }));

    return new Response(JSON.stringify(users), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "User registry query failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * POST /api/users
 * Create or update a user record
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

  let user: any;
  try {
    user = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!user?.id) {
    return new Response(
      JSON.stringify({ error: "Missing user ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await db
      .prepare(`
        INSERT OR REPLACE INTO users
        (
          id,
          username,
          displayName,
          phone,
          email,
          avatarUrl,
          isProfileComplete,
          walletBalance,
          isBanned,
          isVerified,
          loginMethod,
          registrationDate,
          updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        user.id,
        user.username ?? null,
        user.displayName ?? null,
        user.phone ?? null,
        user.email ?? null,
        user.avatarUrl ?? null,
        user.isProfileComplete ? 1 : 0,
        user.walletBalance ?? "0",
        user.isBanned ? 1 : 0,
        user.isVerified ? 1 : 0,
        user.loginMethod ?? null,
        user.registrationDate ?? Date.now(),
        Date.now()
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "User persistence failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
