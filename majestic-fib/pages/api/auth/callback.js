export default async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Отсутствует код авторизации' });
  }

  const redirectUri = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`;

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const user = await userResponse.json();

    return res.json({ 
      id: user.id, 
      username: user.username, 
      avatar: user.avatar 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
