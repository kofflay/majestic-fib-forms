import { kv } from '@vercel/kv';

// 2 заявки за 2 часа
const HOURLY_LIMIT = 2;
const HOURLY_WINDOW = 7200; // 2 часа в секундах

// 5 заявок за 5 секунд
const BURST_LIMIT = 5;
const BURST_WINDOW = 5; // 5 секунд

// 3 заявки с одного IP за 10 минут
const IP_LIMIT = 3;
const IP_WINDOW = 600; // 10 минут

export async function checkSpam(userId, ip) {
  const hourlyKey = `fib:spam:hourly:${userId}`;
  const burstKey = `fib:spam:burst:${userId}`;
  const ipKey = `fib:spam:ip:${ip || 'unknown'}`;
  
  try {
    // 1. Проверка IP
    if (ip && ip !== 'unknown') {
      const ipCount = await kv.get(ipKey);
      if (ipCount && parseInt(ipCount) >= IP_LIMIT) {
        return {
          isSpam: true,
          ban: true,
          reason: `IP-бан`,
          message: `🚫 С вашего IP слишком много заявок. Доступ заблокирован.`
        };
      }
    }

    // 2. Проверка burst (5 заявок за 5 секунд)
    const burstCount = await kv.get(burstKey);
    if (burstCount && parseInt(burstCount) >= BURST_LIMIT) {
      return {
        isSpam: true,
        ban: true,
        reason: `Спам-атака (${BURST_LIMIT}+ заявок за ${BURST_WINDOW} сек)`,
        message: `🚫 Обнаружена спам-атака! Доступ заблокирован.`
      };
    }

    // 3. Проверка часового лимита (2 заявки за 2 часа)
    const hourlyCount = await kv.get(hourlyKey);
    if (hourlyCount && parseInt(hourlyCount) >= HOURLY_LIMIT) {
      const ttl = await kv.ttl(hourlyKey);
      const minutes = Math.ceil((ttl || HOURLY_WINDOW) / 60);
      return {
        isSpam: true,
        ban: false,
        reason: `Лимит заявок`,
        message: `⏳ Вы исчерпали лимит заявок (${HOURLY_LIMIT} шт). Подождите ${minutes} мин.`
      };
    }

    // Обновляем счётчики
    const newHourly = hourlyCount ? parseInt(hourlyCount) + 1 : 1;
    const newBurst = burstCount ? parseInt(burstCount) + 1 : 1;
    const newIp = ip && ip !== 'unknown' ? (await kv.get(ipKey) ? parseInt(await kv.get(ipKey)) + 1 : 1) : 1;

    await kv.set(hourlyKey, newHourly, { ex: HOURLY_WINDOW });
    await kv.set(burstKey, newBurst, { ex: BURST_WINDOW });
    if (ip && ip !== 'unknown') {
      await kv.set(ipKey, newIp, { ex: IP_WINDOW });
    }

    return { isSpam: false };
  } catch (error) {
    console.error('Ошибка проверки спама:', error);
    return { isSpam: false };
  }
}

// Сброс лимитов
export async function resetSpam(userId, ip) {
  try {
    await kv.del(`fib:spam:hourly:${userId}`);
    await kv.del(`fib:spam:burst:${userId}`);
    if (ip) await kv.del(`fib:spam:ip:${ip}`);
  } catch (error) {
    console.error('Ошибка сброса:', error);
  }
}
