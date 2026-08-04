import { createToken, getDiscordToken, getDiscordUser } from '../../../lib/discord';

export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    console.error('❌ Нет кода авторизации');
    return res.redirect('/?error=no_code');
  }

  try {
    const tokenData = await getDiscordToken(code);
    const userData = await getDiscordUser(tokenData.access_token);

    const token = createToken({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator || '0'
    });

    console.log('✅ Токен создан, длина:', token.length);

    // 👇 ВАЖНО: сохраняем куку с именем "token" (не "_vercel_jwt")
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    
    // 👇 ПРОВЕРКА: выводим в лог, что кука установлена
    console.log('🍪 Кука token установлена');

    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('❌ Ошибка OAuth2:', error);
    res.redirect('/?error=oauth_failed');
  }
}
