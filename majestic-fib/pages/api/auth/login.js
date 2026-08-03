// pages/api/auth/login.js
export default (req, res) => {
  // 1. Получаем базовый URL. 
  // process.env.VERCEL_URL работает ТОЛЬКО на сервере Vercel.
  // На localhost он будет undefined, поэтому ставим запасной вариант.
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  // 2. Формируем redirectUri
  const redirectUri = `\${baseUrl}/api/auth/callback`;

  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  if (!clientId) {
    console.error('Ошибка: DISCORD_CLIENT_ID не найден!');
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID не задан!' });
  }

  // 3. Кодируем URI. Это обязательно!
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // 4. Собираем финальную ссылку
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  // 5. Перенаправляем пользователя
  return res.redirect(authUrl);
};
