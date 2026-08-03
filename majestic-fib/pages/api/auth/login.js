// pages/api/auth/login.js
export default (req, res) => {
  // 1. Получаем базовый URL. 
  // На Vercel process.env.VERCEL_URL всегда содержит полный адрес (https://...)
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  // 2. Формируем redirectUri. 
  // ВАЖНО: Здесь мы используем обычный JS, переменная подставится ДО отправки ответа клиенту.
  const redirectUri = `\${baseUrl}/api/auth/callback`;

  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  if (!clientId) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID не задан в переменных окружения!' });
  }

  // 3. Кодируем URI. encodeURIComponent превратит https://site.com в https%3A%2F%2Fsite.com
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // 4. Формируем финальную ссылку
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  // 5. Делаем редирект
  return res.redirect(authUrl);
};
