export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.redirect('/admin#error=no_code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect('/admin#error=token_failed');
    }

    const accessToken = tokenData.access_token;

    // Verify user identity and check allowlist
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userResponse.json();

    const allowedUsers = (process.env.ADMIN_ALLOWED_USERS || '')
      .split(',')
      .map((u) => u.trim().toLowerCase());

    if (!allowedUsers.includes(userData.login.toLowerCase())) {
      return res.redirect('/admin#error=unauthorized');
    }

    // Pass token via hash fragment (never sent to server in subsequent requests)
    res.redirect(`/admin#token=${accessToken}`);
  } catch (err) {
    res.redirect('/admin#error=server_error');
  }
}
