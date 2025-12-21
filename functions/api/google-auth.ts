
export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  // Use provided credentials (preferring env if set in dashboard)
  const CLIENT_ID = env.GOOGLE_CLIENT_ID || "1027735078146-l610f2vn1cnm4o791d4795m07fdq9gd2.apps.googleusercontent.com";
  const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || "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";
  const REDIRECT_URI = "https://nib-sec.pages.dev/callback";

  try {
    const { code } = await request.json();
    
    if (!code) {
      return new Response(JSON.stringify({ error: "Code is required" }), { status: 400 });
    }

    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: any = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error }), { status: 401 });
    }

    // 2. Fetch user profile information
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    return new Response(JSON.stringify(userData), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
