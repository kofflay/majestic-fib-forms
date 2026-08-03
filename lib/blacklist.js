import fs from 'fs';
import path from 'path';

const BLACKLIST_FILE = path.join(process.cwd(), 'data', 'blacklist.json');

// Убедимся, что папка data существует
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Загружаем список из файла
function loadBlacklist() {
  try {
    if (fs.existsSync(BLACKLIST_FILE)) {
      return JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка загрузки чёрного списка:', error);
  }
  return [];
}

// Сохраняем список в файл
function saveBlacklist(list) {
  try {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения чёрного списка:', error);
  }
}

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

// Проверка наличия в чёрном списке
export function isBlacklisted(userId) {
  const list = loadBlacklist();
  return list.some(entry => entry.userId === userId);
}

// Добавление в чёрный список
export function addToBlacklist(userId, username, reason = 'Банворд') {
  const list = loadBlacklist();
  if (list.some(entry => entry.userId === userId)) {
    return false;
  }
  list.push({
    userId,
    username,
    reason,
    timestamp: new Date().toISOString()
  });
  saveBlacklist(list);
  return true;
}

// Удаление из чёрного списка
export function removeFromBlacklist(userId) {
  const list = loadBlacklist();
  const filtered = list.filter(entry => entry.userId !== userId);
  saveBlacklist(filtered);
  return filtered.length !== list.length;
}

// Получение всего списка
export function getBlacklist() {
  return loadBlacklist();
}

export default loadBlacklist();
