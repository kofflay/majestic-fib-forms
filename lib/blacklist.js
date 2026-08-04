import { kv } from '@vercel/kv';

const BLACKLIST_KEY = 'fib:blacklist';
const BAN_LOGS_KEY = 'fib:ban_logs';

// Проверить, забанен ли пользователь
export async function isBlacklisted(userId) {
  try {
    const banned = await kv.hget(BLACKLIST_KEY, userId);
    return !!banned;
  } catch (error) {
    console.error('Ошибка проверки бана:', error);
    return false;
  }
}

// Добавить в бан
export async function addToBlacklist(userId, username, reason) {
  try {
    const banData = {
      username,
      reason,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    await kv.hset(BLACKLIST_KEY, { [userId]: JSON.stringify(banData) });
    
    await kv.lpush(BAN_LOGS_KEY, JSON.stringify({
      userId, username, reason,
      timestamp: Date.now(),
      date: new Date().toISOString()
    }));
    
    console.log(`🚫 ${username} (${userId}) забанен: ${reason}`);
  } catch (error) {
    console.error('Ошибка бана:', error);
  }
}

// Разбанить
export async function removeFromBlacklist(userId) {
  try {
    await kv.hdel(BLACKLIST_KEY, userId);
    console.log(`✅ ${userId} разбанен`);
  } catch (error) {
    console.error('Ошибка разбана:', error);
  }
}

// Список банов
export async function getBlacklist() {
  try {
    const all = await kv.hgetall(BLACKLIST_KEY);
    if (!all) return [];
    return Object.entries(all).map(([id, data]) => {
      const parsed = JSON.parse(data);
      return { id, ...parsed };
    });
  } catch (error) {
    return [];
  }
}
