// pages/api/auth/callback.js
export default async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`;

  if (!code || !clientId || !clientSecret) {
    return res.status(400).json({ error: 'Отсутствует код или переменные окружения' });
  }

  try {
    // 1. Обмениваем код на токен
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

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error });
    }

    const accessToken = tokenData.access_token;

    // 2. Получаем данные пользователя
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    // 3. Возвращаем данные фронтенду
    return res.json({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator,
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
