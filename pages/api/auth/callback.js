import { generateToken } from '../../../lib/discord';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export default async function handler(req, res) {
  // Получаем код из URL (Discord передаёт его после авторизации)
  const { code } = req.query;
  
  // Если кода нет — ошибка
  if (!code) {
    console.error('❌ Нет кода авторизации');
    return res.redirect('/?error=no_code');
  }

  try {
    // 1. Обмениваем код на токен доступа
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('❌ Ошибка получения токена:', tokenData);
      throw new Error(tokenData.error || 'Ошибка получения токена');
    }

    // 2. Получаем данные пользователя по токену
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('❌ Ошибка получения данных пользователя:', userData);
      throw new Error(userData.error || 'Ошибка получения данных пользователя');
    }

    // 3. Генерируем JWT-токен для нашего сайта
    const token = generateToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator || '0'
    });

    // 4. Сохраняем токен в cookies и перенаправляем на дашборд
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`);
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Ошибка OAuth2:', error);
    res.redirect('/?error=oauth_failed');
  }
}
