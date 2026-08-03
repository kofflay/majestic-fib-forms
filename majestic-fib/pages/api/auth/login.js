export default (req, res) => {
  const redirectUri = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/callback`;
  const scope = 'identify';
  const responseType = 'code';

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;

  res.redirect(authUrl);
};
