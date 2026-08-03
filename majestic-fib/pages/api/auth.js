// Переключаем сервер на Edge Runtime, чтобы обойти блокировку fetch на Vercel
export const config = {
  runtime: 'edge',
};

const CLIENT_ID = "1533765326213222491";
const CLIENT_SECRET = "0hzfJfnNr4-_6LxhVXBh9uWfZA6S2zsV";

export default async function handler(req) {
  try {
    // Получаем параметры из URL запроса
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return new Response(JSON.stringify({ error: 'Код не найден' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Определяем обратный адрес (динамически подстраивается под ваш домен)
    const host = req.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth`;

    // 1. Обмениваем временный код на секретный токен доступа
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
    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Запрашиваем реальный профиль пользователя по полученному токену
    const userResponse = await fetch('https://discord.com', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // 3. Безопасно перенаправляем пользователя обратно на главную страницу, прикрепив профиль в URL
    const profileData = encodeURIComponent(JSON.stringify(userData));
    const origin = `${protocol}://${host}`;
    
    return Response.redirect(`${origin}/?user=${profileData}`);

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Ошибка на стороне сервера авторизации' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
