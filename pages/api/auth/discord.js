// ПРАВИЛЬНЫЙ ПУТЬ: поднимаемся на 3 уровня (из auth/ → api/ → pages/ → корень → lib/)
import { generateToken } from '../../../lib/discord';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export default function handler(req, res) {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
}
