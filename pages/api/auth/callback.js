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

    // 3. Создаём JWT-токен
    const token = createToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator || '0'
    });

    console.log('✅ Токен создан, длина:', token.length); // 👈 ДЛЯ ЛОГОВ

    // 4. СОХРАНЯЕМ КУКУ (ОЧЕНЬ ВАЖНО!)
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    
    // 5. Перенаправляем на дашборд
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Ошибка OAuth2:', error);
    res.redirect('/?error=oauth_failed');
  }
}
