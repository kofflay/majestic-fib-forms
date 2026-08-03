// pages/api/auth/login.js
export default (req, res) => {
  // 1. Получаем базовый URL.
  // process.env.VERCEL_URL — это автоматическая переменная от Vercel.
  // Она выглядит как https://majestic-fib-forms.vercel.app
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  
  // 2. Формируем redirect_uri.
  // Важно: используем переменную baseUrl, а не строку "\${baseUrl}"
  const redirectUri = `\${baseUrl}/api/auth/callback`;
  
  const clientId = process.env.DISCORD_CLIENT_ID;
  const scope = 'identify';
  const responseType = 'code';

  // Проверка: если Client ID нет, значит, переменная не настроена
  if (!clientId) {
    console.error('ОШИБКА: DISCORD_CLIENT_ID не найден в переменных окружения!');
    return res.status(500).json({ error: 'Настрой переменные окружения в Vercel!' });
  }

  // 3. Кодируем только значение redirect_uri для передачи в URL
  const encodedRedirectUri = encodeURIComponent(redirectUri);

  // 4. Собираем финальную ссылку
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=${responseType}&scope=${scope}`;

  // 5. Перенаправляем пользователя
  return res.redirect(authUrl);
};
