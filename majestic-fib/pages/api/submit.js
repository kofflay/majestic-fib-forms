import { verifyToken } from '../../lib/discord';

const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION,
  transfer: process.env.WEBHOOK_TRANSFER,
  report: process.env.WEBHOOK_REPORT
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.token;
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, userId, username, ...formData } = req.body;
  const webhookUrl = webhooks[type];

  if (!webhookUrl) {
    return res.status(400).json({ error: 'Invalid form type' });
  }

  const embed = {
    title: getFormTitle(type),
    color: getFormColor(type),
    author: {
      name: username,
      icon_url: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`
    },
    fields: [
      {
        name: '👤 Отправитель',
        value: `<@${userId}>`,
        inline: true
      },
      {
        name: '🆔 Discord ID',
        value: userId,
        inline: true
      },
      ...Object.entries(formData).map(([key, value]) => ({
        name: formatFieldName(key),
        value: String(value) || 'Не указано',
        inline: false
      }))
    ],
    footer: {
      text: 'Majestic FIB Forms • ' + new Date().toLocaleDateString('ru-RU'),
    },
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
        username: 'Majestic FIB Forms',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png'
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const error = await response.text();
      throw new Error(`Webhook failed: ${error}`);
    }
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
}

function getFormTitle(type) {
  const titles = {
    promotion: '📈 Запрос на повышение',
    transfer: '🔄 Запрос на перевод',
    report: '📋 Отчёт о повышении'
  };
  return titles[type] || 'Новая заявка';
}

function getFormColor
