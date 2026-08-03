const CLIENT_ID = "1533765326213222491";
const CLIENT_SECRET = "ZTzzQ3uggsHu2LBiPpYWtbMqW0JKAP_V"; // Убедитесь, что тут ваш новый секрет
const REDIRECT_URI = "https://vercel.app";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Код авторизации не найден в ссылке' });
  }

  try {
    // Отправляем запрос обмена токенов в Дискорд с полной маскировкой под браузер
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

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ 
        error: 'Дискорд отклонил запрос авторизации', 
        details: tokenData.error_description || tokenData.error 
      });
    }

    // Запрашиваем реальный профиль пользователя
    const userResponse = await fetch('https://discord.com', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    });
    const userData = await userResponse.json();

    // Перенаправляем обратно на главную форму
    const profileData = encodeURIComponent(JSON.stringify(userData));
    return res.redirect(`/?user=${profileData}`);

  } catch (error) {
    return res.status(500).json({ 
      error: 'Критическая ошибка на сервере Vercel', 
      message: error.message 
    });
  }
}
