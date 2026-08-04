import { createToken, getDiscordToken, getDiscordUser } from '../../../lib/discord';

export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    console.error('❌ Нет кода авторизации');
    return res.redirect('/?error=no_code');
  }

  try {
    // 1. Получаем токен доступа
    const tokenData = await getDiscordToken(code);
    
    // 2. Получаем данные пользователя
    const userData = await getDiscordUser(tokenData.access_token);

    // 3. Создаём JWT-токен для нашего сайта
    const token = createToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator || '0'
    });

    // 4. Сохраняем в cookies и перенаправляем
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Ошибка OAuth2:', error);
    res.redirect('/?error=oauth_failed');
  }
}
