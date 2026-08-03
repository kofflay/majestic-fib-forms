// pages/api/auth/login.js
export default (req, res) => {
  // 1. Берем VERCEL_URL (он сам станет https://...app)
  // Если ты на localhost, будет http://localhost:3000
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  // 2. Формируем полный путь. Слэши пишем обычными символами.
  const redirectUri = `\${baseUrl}/api/auth/callback`;

  const scope = 'identify';
  const responseType = 'code';
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID не задан!' });
  }

  // 3. Кодируем redirectUri для вставки в URL (превращает / в %2F)
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;

  res.redirect(authUrl);
};
