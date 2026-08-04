import { verifyToken } from '../../lib/discord';

export default function handler(req, res) {
  // 👇 ПРОВЕРЯЕМ ВСЕ КУКИ
  console.log('🍪 Все куки:', req.cookies);
  
  // 👇 ИЩЕМ ТОКЕН В КУКАХ (ищем и "token", и "_vercel_jwt" на всякий случай)
  const token = req.cookies.token || req.cookies._vercel_jwt;
  
  console.log('📌 Найден токен:', token ? `Есть (длина: ${token.length})` : 'НЕТ');

  if (!token) {
    console.log('❌ Токен не найден в куках');
    return res.status(401).json({ error: 'No token in cookies' });
  }

  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Токен невалидный или истёк');
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  console.log('✅ Пользователь авторизован:', user.username);
  res.json({ user });
}
