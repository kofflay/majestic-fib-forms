// Временное хранилище (сбросится при перезапуске)
const blacklist = new Map();

export function isBlacklisted(userId) {
  return blacklist.has(userId);
}

export function addToBlacklist(userId, username, reason) {
  blacklist.set(userId, { username, reason, timestamp: Date.now() });
  console.log(`🚫 Пользователь ${username} (${userId}) добавлен в чёрный список. Причина: ${reason}`);
}

export function removeFromBlacklist(userId) {
  blacklist.delete(userId);
}

export function getBlacklist() {
  return Array.from(blacklist.entries()).map(([id, data]) => ({ id, ...data }));
}
