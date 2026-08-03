const CLIENT_ID = "1533765326213222491";
const CLIENT_SECRET = "0hzfJfnNr4-_6LxhVXBh9uWfZA6S2zsV";

export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Код не найден' });

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth`;

  try {
    const tokenResponse = await fetch('https://discord.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        scope: 'identify',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) return res.status(400).json({ error: tokenData.error_description });

    const userResponse = await fetch('https://discord.com', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    res.setHeader('Content-Type', 'text/html');
    res.write(`
      <script>
        window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
        window.close();
      </script>
    `);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
