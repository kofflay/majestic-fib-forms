export default (req, res) => {
  // 👇 ВОТ ЗДЕСЬ МЕНЯЕМ ТОЛЬКО ЧАСТЬ ДО .vercel.app
  const baseUrl = 'https://majestic-fib-forms.vercel.app';
  
  const redirectUri = `${baseUrl}/api/auth/callback`;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  if (!clientId) {
    return res.status(500).json({ error: 'DISCORD_CLIENT_ID is missing' });
  }

  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  return res.redirect(authUrl);
};
