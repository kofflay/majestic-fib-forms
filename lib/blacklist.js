import { kv } from '@vercel/kv';

const BLACKLIST_KEY = 'fib:blacklist';
const BAN_LOGS_KEY = 'fib:ban_logs';
const IP_BANS_KEY = 'fib:ip_bans';

export async function isBlacklisted(userId, ip) {
  try {
    const banned = await kv.hget(BLACKLIST_KEY, userId);
    if (banned) return true;
    
    if (ip && ip !== 'unknown' && ip !== 'неизвестен') {
      const ipBanned = await kv.hget(IP_BANS_KEY, ip);
      if (ipBanned) return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка проверки бана:', error);
    return false;
  }
}

export async function addToBlacklist(userId, username, reason, ip) {
  try {
    const banData = {
      username,
      reason,
      ip: ip || 'неизвестен',
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    await kv.hset(BLACKLIST_KEY, { [userId]: JSON.stringify(banData) });
    
    if (ip && ip !== 'unknown' && ip !== 'неизвестен') {
      await kv.hset(IP_BANS_KEY, { 
        [ip]: JSON.stringify({ userId, username, reason, date: new Date().toISOString() }) 
      });
    }
    
    await kv.lpush(BAN_LOGS_KEY, JSON.stringify({
      userId, username, reason, ip: ip || 'неизвестен',
      timestamp: Date.now(), date: new Date().toISOString()
    }));
    
    console.log(`🚫 ${username} (${userId}) забанен: ${reason}. IP: ${ip || 'неизвестен'}`);
  } catch (error) {
    console.error('Ошибка бана:', error);
  }
}

export async function removeFromBlacklist(userId) {
  try {
    const data = await kv.hget(BLACKLIST_KEY, userId);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.ip && parsed.ip !== 'неизвестен') {
        await kv.hdel(IP_BANS_KEY, parsed.ip);
      }
    }
    await kv.hdel(BLACKLIST_KEY, userId);
    console.log(`✅ ${userId} разбанен`);
  } catch (error) {
    console.error('Ошибка разбана:', error);
  }
}

export async function getBlacklist() {
  try {
    const all = await kv.hgetall(BLACKLIST_KEY);
    if (!all) return [];
    return Object.entries(all).map(([id, data]) => {
      try { const parsed = JSON.parse(data); return { id, ...parsed }; }
      catch { return { id, data }; }
    });
  } catch (error) {
    return [];
  }
}

export async function getBanLogs(limit = 50) {
  try {
    const logs = await kv.lrange(BAN_LOGS_KEY, 0, limit - 1);
    return logs.map(log => { try { return JSON.parse(log); } catch { return log; } });
  } catch (error) {
    return [];
  }
}
