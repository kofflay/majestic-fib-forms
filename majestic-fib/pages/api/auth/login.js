// pages/api/auth/login.js
export default (req, res) => {
  // Формируем правильный URL редиректа в зависимости от среды (локально или Vercel)
  const redirectUri = `\${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`;
  
  // Параметры OAuth2
  const scope = 'identify'; // Нам нужно только узнать ID и имя пользователя
  const responseType = 'code';
  
  // Генерируем ссылку для Discord
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
  
  // Делаем редирект
  res.redirect(authUrl);
};
