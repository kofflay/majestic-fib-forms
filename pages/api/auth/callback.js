import { createToken, getDiscordToken, getDiscordUser } from '../../../lib/discord';

export default async function handler(req, res) {
  // 1. Проверяем, есть ли код в URL
  const { code } = req.query;
  
  if (!code) {
    console.error('❌ Нет кода авторизации');
    return res.redirect('/?error=no_code');
  }

  try {
    // 2. Получаем токен доступа от Discord
    const tokenData = await getDiscordToken(code);
    
    // 3. Получаем данные пользователя
    const userData = await getDiscordUser(tokenData.access_token);

    // 4. Создаём JWT-токен для нашего сайта
    const token = createToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator || '0'
    });

    console.log('✅ Токен создан, длина:', token.length);

    // 5. Сохраняем куку
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    
    // 6. Перенаправляем на дашборд
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Ошибка OAuth2:', error);
    res.redirect('/?error=oauth_failed');
  }
}
