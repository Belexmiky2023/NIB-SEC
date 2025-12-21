
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;

  // Cloudflare Pages Environment Variables
  const CLIENT_ID = env.GOOGLE_CLIENT_ID || "1027735078146-l610f2vn1cnm4o791d4795m07fdq9gd2.apps.googleusercontent.com";
  const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || "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";
  const REDIRECT_URI = "https://nib-sec.pages.dev/callback";

  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Authorization code missing" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Exchange the authorization code for an access token
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

    if (!tokenResponse.ok) {
      return new Response(JSON.stringify({ 
        error: "Token exchange failed", 
        details: tokenData.error_description || tokenData.error 
      }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Use the access token to fetch user information from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch user info" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userData = await userResponse.json();

    // Return the user profile to the frontend
    return new Response(JSON.stringify({
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      id: userData.sub
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Server error", message: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
