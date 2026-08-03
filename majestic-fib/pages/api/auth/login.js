export default (req, res) => {
  console.log('FORCE REDEPLOY: ' + new Date().toISOString());
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';

  if (!baseUrl) {
    console.error('CRITICAL ERROR: VERCEL_URL is undefined!');
    return res.status(500).json({ error: 'Server misconfiguration: VERCEL_URL missing' });
  }

  const redirectUri = `\${baseUrl}/api/auth/callback`;
  
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    console.error('CRITICAL ERROR: DISCORD_CLIENT_ID is missing!');
    return res.status(500).json({ error: 'Server misconfiguration: DISCORD_CLIENT_ID missing' });
  }

  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const scope = 'identify';
  const responseType = 'code';

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  return res.redirect(authUrl);
};
