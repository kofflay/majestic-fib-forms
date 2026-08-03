// pages/api/auth/login.js
export default (req, res) => {
  // 1. Получаем адрес сайта прямо из запроса пользователя.
  // host = majestic-fib-forms-xxxxx.vercel.app (или localhost:3000)
  const host = req.headers.host;
  // Проверяем, идет ли запрос по https (на Vercel всегда да, на localhost нет)
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `\${baseUrl}/api/auth/callback`;
  
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  if (!clientId) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID не найден в переменных!' });
  }

  // 2. Кодируем URI (обязательно для Discord)
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // 3. Собираем ссылку
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  // 4. Перенаправляем
  return res.redirect(authUrl);
};
