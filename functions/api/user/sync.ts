
export async function onRequestGet(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const userId = url.searchParams.get('id');

  if (!db) return new Response(JSON.stringify({ error: "Database not found" }), { status: 500 });
  if (!userId) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

  try {
    const user: any = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Node not found" }), { status: 404 });
    }

    // Cast SQL integer booleans back to JS booleans
    const formatted = {
      ...user,
      isProfileComplete: Boolean(user.isProfileComplete),
      isBanned: Boolean(user.isBanned),
      isVerified: Boolean(user.isVerified)
    };

    return new Response(JSON.stringify(formatted), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Sync failure", details: err.message }), { status: 500 });
  }
}
