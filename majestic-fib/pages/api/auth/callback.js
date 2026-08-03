// pages/api/auth/callback.js
export default async (req, res) => {
  const { code } = req.query;

  // Если Discord не прислал код (ошибка или отмена), возвращаем ошибку
  if (!code) {
    return res.status(400).json({ error: 'Отсутствует код авторизации. Возможно, вход был отменен.' });
  }

  // Определяем правильный callback URL (важно для Vercel)
  const redirectUri = `\${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`;

  try {
    // ШАГ 1: Обмениваем код на access_token
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

    // Проверка на ошибки от Discord (неверный код, истек срок и т.д.)
    if (tokenData.error) {
      console.error('Ошибка получения токена:', tokenData);
      return res.status(400).json({ error: tokenData.error });
    }

    // ШАГ 2: Используем полученный токен, чтобы получить данные пользователя
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer \${tokenData.access_token}` }
    });

    const user = await userResponse.json();

    // ШАГ 3: Возвращаем данные фронтенду
    // Мы отдаем только то, что нужно для форм: ID (для черного списка) и имя
    return res.json({ 
      id: user.id, 
      username: user.username, 
      avatar: user.avatar 
    });

  } catch (error) {
    console.error('Критическая ошибка в callback:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера при обработке входа' });
  }
};
