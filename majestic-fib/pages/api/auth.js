const CLIENT_ID = "1533765326213222491";
const CLIENT_SECRET = "ZTzzQ3uggsHu2LBiPpYWtbMqW0JKAP_V"; // Убедитесь, что этот секрет совпадает с актуальным в Discord Developer Portal
const REDIRECT_URI = "https://vercel.app";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Код авторизации не найден в ссылке' });
  }

  try {
    // Шаг 1: Обмениваем код на токен
    const tokenResponse = await fetch('https://discord.com', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify',
      }),
    });

    // Читаем ответ как сырой текст, чтобы избежать ошибки Unexpected token '<'
    const responseText = await tokenResponse.text();

    // Если Дискорд вернул ошибку в виде HTML или невалидного текста
    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).send(`Ошибка Дискорда при обмене токена: ${responseText}`);
    }

    // Если всё ок, парсим JSON вручную
    const tokenData = JSON.parse(responseText);

    // Шаг 2: Запрашиваем профиль пользователя
    const userResponse = await fetch('https://discord.com', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    });

    const userText = await userResponse.text();

    if (!userResponse.ok) {
      return res.status(userResponse.status).send(`Ошибка Дискорда при запросе профиля: ${userText}`);
    }

    const userData = JSON.parse(userText);

    // Шаг 3: Перенаправляем на главную форму
    const profileData = encodeURIComponent(JSON.stringify(userData));
    return res.redirect(`/?user=${profileData}`);

  } catch (error) {
    return res.status(500).json({ 
      error: 'Критическая ошибка выполнения на сервере Vercel', 
      message: error.message 
    });
  }
}
