export default async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = encodeURIComponent('https://majestic-fib-forms.vercel.app/api/auth/callback');

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Discord client credentials in environment variables' });
  }

  // 1. Обмениваем код на токен у Discord
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
    return res.status(tokenData.error_code || 400).json({ error: 'Failed to exchange code for token', details: tokenData });
  }

  const accessToken = tokenData.access_token;

  // 2. Получаем данные пользователя (опционально, но полезно)
  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer \${accessToken}`,
    },
  });

  const user = await userResponse.json();

  if (!userResponse.ok) {
    console.error('Failed to fetch user data:', user);
    return res.status(500).json({ error: 'Failed to fetch user data', details: user });
  }

  // 3. Здесь ты можешь сохранить сессию (в cookie, в базу, в NextAuth и т.п.)
  // Для примера просто возвращаем данные — это значит, что всё сработало
  return res.json({
    status: 'success',
    message: 'Authentication successful',
    user: {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
    },
    expiresIn: tokenData.expires_in,
  });
};
