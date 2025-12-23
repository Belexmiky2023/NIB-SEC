
export async function onRequestGet(context: { env: any }) {
  const { env } = context;
  const db = env.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 Database binding 'DB' not found." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { results } = await db.prepare("SELECT * FROM users ORDER BY registrationDate DESC").all();
    
    // Ensure booleans are correctly typed as JS expects
    const formattedResults = results.map((u: any) => ({
      ...u,
      isProfileComplete: Boolean(u.isProfileComplete),
      isBanned: Boolean(u.isBanned),
      isVerified: Boolean(u.isVerified)
    }));

    return new Response(JSON.stringify(formattedResults), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Identity vault query failure", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });

  try {
    const u = await request.json();
    if (!u || !u.id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

    await db.prepare(`
      INSERT OR REPLACE INTO users 
      (id, username, displayName, phone, email, avatarUrl, isProfileComplete, walletBalance, isBanned, isVerified, loginMethod, registrationDate, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      u.id, 
      u.username || null, 
      u.displayName || null, 
      u.phone || null, 
      u.email || null, 
      u.avatarUrl || null, 
      u.isProfileComplete ? 1 : 0, 
      u.walletBalance || '0', 
      u.isBanned ? 1 : 0, 
      u.isVerified ? 1 : 0, 
      u.loginMethod || null, 
      u.registrationDate || Date.now(), 
      Date.now()
    )
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Persistence failure", details: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
