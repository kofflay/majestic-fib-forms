import fs from 'fs';
import path from 'path';
import { addToBlacklist } from './blacklist';

const LOG_FILE = path.join(process.cwd(), 'data', 'spam_log.json');

// Убедимся, что папка data существует
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ===== НАСТРОЙКИ АНТИСПАМА =====
const CONFIG = {
  COOLDOWN_SECONDS: 30,   // Кулдаун между заявками
  SPAM_BAN_REASON: 'Автоматический бан за спам (нарушение кулдауна)'
};

// ===== ЗАГРУЗКА ЛОГА =====
function loadSpamLog() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка загрузки лога спама:', error);
  }
  return {};
}

// ===== СОХРАНЕНИЕ ЛОГА =====
function saveSpamLog(log) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения лога спама:', error);
  }
}

// ===== ПРОВЕРКА КУЛДАУНА С БАНОМ =====
export function checkSpam(userId, username) {
  const log = loadSpamLog();
  const now = Date.now();
  const cooldownMs = CONFIG.COOLDOWN_SECONDS * 1000;
  
  // Если пользователь уже есть в логе
  if (log[userId]) {
    const lastRequest = log[userId];
    const timeSinceLast = now - lastRequest;
    
    // Если прошло меньше кулдауна — БАН!
    if (timeSinceLast < cooldownMs) {
      const timeLeft = Math.ceil((cooldownMs - timeSinceLast) / 1000);
      
      // Добавляем пользователя в чёрный список
      addToBlacklist(userId, username, CONFIG.SPAM_BAN_REASON);
      
      // Удаляем из лога (он уже забанен)
      delete log[userId];
      saveSpamLog(log);
      
      return {
        isSpam: true,
        isBanned: true,
        message: `⛔ Вы нарушили кулдаун (30 секунд между заявками). Доступ к системе заблокирован.`,
        timeLeft: timeLeft
      };
    }
    
    // Если прошло больше кулдауна — обновляем время
    log[userId] = now;
    saveSpamLog(log);
    
    return {
      isSpam: false,
      isBanned: false,
      timeLeft: 0
    };
  }
  
  // Первый запрос пользователя
  log[userId] = now;
  saveSpamLog(log);
  
  return {
    isSpam: false,
    isBanned: false,
    timeLeft: 0
  };
}

// ===== СБРОС ЛОГА ДЛЯ ПОЛЬЗОВАТЕЛЯ (при разбане) =====
export function clearSpamLog(userId) {
  const log = loadSpamLog();
  if (log[userId]) {
    delete log[userId];
    saveSpamLog(log);
    return true;
  }
  return false;
}

// ===== ПОЛУЧЕНИЕ СТАТИСТИКИ =====
export function getSpamStats(userId) {
  const log = loadSpamLog();
  if (!log[userId]) return null;
  
  const now = Date.now();
  const cooldownMs = CONFIG.COOLDOWN_SECONDS * 1000;
  const timeSinceLast = now - log[userId];
  const timeLeft = Math.max(0, Math.ceil((cooldownMs - timeSinceLast) / 1000));
  
  return {
    lastRequest: log[userId],
    timeLeft: timeLeft,
    cooldownSeconds: CONFIG.COOLDOWN_SECONDS
  };
}
