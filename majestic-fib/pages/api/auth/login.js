// pages/api/auth/login.js
export default (req, res) => {
  // На Vercel эта переменная всегда есть и содержит https://...
  // На локалке (localhost) она будет undefined, поэтому ставим запасной вариант
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  const redirectUri = `\${baseUrl}/api/auth/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  if (!clientId) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID не найден в переменных окружения!' });
  }

  const encodedRedirectUri = encodeURIComponent(redirectUri);

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  return res.redirect(authUrl);
};
