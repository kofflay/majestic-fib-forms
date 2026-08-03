// pages/api/submit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён. Используйте POST.' });
  }

  const { type, discord_id, username, ...data } = req.body;

  if (!discord_id) {
    return res.status(400).json({ error: 'Отсутствует Discord ID. Сначала авторизуйтесь.' });
  }

  // Проверка чёрного списка
  const blockedIdsString = process.env.BLOCKED_DISCORD_IDS || '';
  const blockedIds = blockedIdsString.split(',').map(id => id.trim()).filter(Boolean);

  if (blockedIds.includes(String(discord_id))) {
    console.log(`Заблокированный ID попытался отправить заявку: ${discord_id}`);
    return res.status(403).json({ 
      success: false, 
      error: 'Вы находитесь в чёрном списке и не можете отправлять заявки.' 
    });
  }

  // Формирование Discord Embed
  let embed = {
    title: '📝 Новая заявка — Majestic RP',
    footer: { text: 'Majestic RP | Заявки' },
    timestamp: new Date().toISOString(),
    color: 5793266 // сине-фиолетовый цвет
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
    console.error('Ошибка: DISCORD_WEBHOOK_URL не задан в переменных окружения!');
    return res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера: не настроен Discord Webhook.' 
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Ошибка отправки в Discord:', errData);
      return res.status(response.status).json({ 
        success: false, 
        error: `Не удалось отправить заявку: ${errData.message || 'Ошибка Discord'}` 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Заявка успешно отправлена!' 
    });
  } catch (error) {
    console.error('Критическая ошибка отправки:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера при отправке заявки.' 
    });
  }
}
