export default async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Discord credentials in environment variables' });
  }

  const redirectUri = 'https://majestic-fib-forms.vercel.app/api/auth/callback';

  try {
    // 1. Получаем токен
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenData });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('No access_token returned from Discord');
      return res.status(500).json({ error: 'Discord did not return an access token' });
    }

    // 2. Получаем данные пользователя
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer \${accessToken}`,
      },
    });

    const user = await userResponse.json();

    if (!userResponse.ok) {
      // ЭТО ТО МЕСТО, ГДЕ ВОЗНИКАЕТ ТВОЯ ОШИБКА
      console.error('Failed to fetch user data:', user);
      return res.status(500).json({ 
        error: 'Failed to fetch user data', 
        details: { 
          message: user.message, 
          code: user.code,
          status: userResponse.status 
        } 
      });
    }

    return res.json({
      status: 'success',
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
