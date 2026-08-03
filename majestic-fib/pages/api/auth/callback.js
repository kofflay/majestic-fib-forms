export default async (req, res) => {
  const code = req.query.code;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Discord client credentials in environment variables' });
  }

  // 1. Динамически формируем redirectUri на основе реального запроса.
  // Это гарантирует, что URL, который мы шлем в Discord, ТОЧНО совпадает с тем, 
  // который браузер уже использовал для получения кода.
  const protocol = req.headers.referer?.startsWith('https') ? 'https' : 'http';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth/callback`;
  
  // Кодируем для отправки в body запроса
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // 2. Обмениваем код на токен
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
      redirect_uri: encodedRedirectUri, // Отправляем тот самый URL, который сработал
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error('Token exchange failed:', tokenData);
    // Если ошибка про redirect_uri, она будет здесь. Но теперь она должна исчезнуть.
    return res.status(tokenData.error_code || 400).json({ 
      error: 'Failed to exchange code for token', 
      details: tokenData 
    });
  }

  const accessToken = tokenData.access_token;

  // 3. Получаем данные пользователя
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

  // 4. Возвращаем успех
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
