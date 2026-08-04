import { verifyToken } from '../../lib/discord';

export default function handler(req, res) {
  // 1. Смотрим, что пришло в куках
  console.log('🔍 Все куки:', req.cookies);
  
  // 2. Пытаемся достать токен
  const token = req.cookies._vercel_jwt || req.cookies.token;
  
  console.log('📌 Найден токен:', token ? `Есть (длина: ${token.length})` : 'НЕТ');

  if (!token) {
    console.log('❌ Токен не найден в куках');
    return res.status(401).json({ error: 'No token in cookies' });
  }

  // 3. Проверяем токен
  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Токен невалидный или истёк');
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  console.log('✅ Пользователь авторизован:', user.username);
  res.json({ user });
}
