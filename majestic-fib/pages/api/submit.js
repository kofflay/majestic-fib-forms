export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Только POST' });

  const { type, discord_id, username, ...data } = req.body;

  if (!discord_id) {
    return res.status(400).json({ error: 'Нет Discord ID — нужна авторизация' });
  }

  // Чёрный список
  const blockedIdsString = process.env.BLOCKED_DISCORD_IDS || '';
  const blockedIds = blockedIdsString.split(',').map(id => id.trim()).filter(Boolean);

  if (blockedIds.includes(String(discord_id))) {
    console.log(`Заблокированный ID попытался отправить заявку: ${discord_id}`);
    return res.status(403).json({ error: 'Вы находитесь в чёрном списке и не можете отправлять заявки.' });
  }

  // Формируем embed
  let embed = {
    title: '📝 Новая заявка — Majestic RP',
    footer: { text: 'Majestic RP | Заявки' },
    timestamp: new Date().toISOString(),
    color: 5793266
  };

  switch (type) {
    case 'transfer':
      embed.title = '🔄 Перевод в отдел';
      embed.fields = [
        { name: 'Игрок', value: username, inline: true },
        { name: 'Discord ID', value: discord_id, inline: true },
        { name: 'Текущий отдел', value: data.current_department || 'Не указан', inline: true },
        { name: 'Желаемый отдел', value: data.target_department || 'Не указан', inline: true },
        { name: 'Причина', value: data.reason || 'Без причины' }
      ];
      break;
    case 'promotion':
      embed.title = '⭐ Запрос на повышение';
      embed.fields = [
        { name: 'Игрок', value: username, inline: true },
        { name: 'Discord ID', value: discord_id, inline: true },
        { name: 'Основание', value: data.promotion_reason || 'Не указано' },
        { name: 'Доказательства', value: data.evidence ? `[Ссылка](${data.evidence})` : 'Нет ссылки' }
      ];
      break;
    case 'report':
      embed.title = '📄 Отчёт о повышении';
      embed.fields = [
        { name: 'Игрок', value: username, inline: true },
        { name: 'Discord ID', value: discord_id, inline: true },
        { name: 'Описание задач', value: data.report_details || 'Нет описания' },
        { name: 'Доказательства', value: data.evidence_links || 'Нет ссылок' }
      ];
      break;
    default:
      embed.title = '💬 Прочие запросы';
      embed.description = `Тип: ${type}`;
      embed.fields = [
        { name: 'Игрок', value: username, inline: true },
        { name: 'Discord ID', value: discord_id, inline: true },
        { name: 'Тема', value: data.subject || 'Без темы' },
        { name: 'Текст', value: data.text || 'Без текста' }
      ];
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
