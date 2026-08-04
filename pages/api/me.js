// ПРАВИЛЬНЫЙ ПУТЬ: поднимаемся на 2 уровня (из api/ → pages/ → корень → lib/)
import { verifyToken } from '../../lib/discord';

export default function handler(req, res) {
  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({ user });
}
