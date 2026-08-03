export const config = {
  runtime: 'edge',
};

const CLIENT_ID = "1533765326213222491";
const CLIENT_SECRET = "ZTzzQ3uggsHu2LBiPpYWtbMqW0JKAP_V";
const REDIRECT_URI = "https://vercel.app";

export default async function handler(req) {
  try {
    // Получаем код напрямую из URL стандартным методом
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response(JSON.stringify({ error: 'Код авторизации Дискорда не найден в ссылке' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Отправляем запрос обмена в Дискорд
    const tokenResponse = await fetch('https://discord.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify',
      }),
    });

    const tokenData = await tokenResponse.json();

    // Если Дискорд отклонил ключи, выводим точную техническую причину вместо общей ошибки
    if (tokenData.error) {
      return new Response(JSON.stringify({ 
        error: 'Дискорд отклонил запрос авторизации', 
        details: tokenData.error_description || tokenData.error 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Запрашиваем реальный профиль пользователя
    const userResponse = await fetch('https://discord.com', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // Перенаправляем обратно на главную форму
    const profileData = encodeURIComponent(JSON.stringify(userData));
    return Response.redirect(`https://vercel.app{profileData}`);

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Критическая ошибка на сервере Vercel', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
