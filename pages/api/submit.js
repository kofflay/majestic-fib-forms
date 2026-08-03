import { verifyToken } from '../../lib/discord';

// ===== СПИСОК ВСЕХ ОТДЕЛОВ ДЛЯ ОТЧЁТОВ (ВКЛЮЧАЯ IB) =====
const DEPARTMENTS = {
  'ib': {
    name: 'IB (Intelligence Branch)',
    webhook: process.env.WEBHOOK_REPORT_IB,
    emoji: '🕵️'
  },
  'cid': {
    name: 'CID (Criminal Investigation Department)',
    webhook: process.env.WEBHOOK_REPORT_CID,
    emoji: '🔍'
  },
  'fa': {
    name: 'FA (Free Agent)',
    webhook: process.env.WEBHOOK_REPORT_FA,
    emoji: '🆓'
  },
  'hrt': {
    name: 'HRT (Hostage Rescue Team)',
    webhook: process.env.WEBHOOK_REPORT_HRT,
    emoji: '🛡️'
  },
  'atf': {
    name: 'ATF (Anti Terrorism Force)',
    webhook: process.env.WEBHOOK_REPORT_ATF,
    emoji: '💥'
  },
  'af': {
    name: 'AF (Air Force)',
    webhook: process.env.WEBHOOK_REPORT_AF,
    emoji: '✈️'
  },
  'ocu': {
    name: 'OCU (Organized Crime Unit)',
    webhook: process.env.WEBHOOK_REPORT_OCU,
    emoji: '⚖️'
  },
  'dea': {
    name: 'DEA (Drug Enforcement Administration)',
    webhook: process.env.WEBHOOK_REPORT_DEA,
    emoji: '💊'
  },
  'fna': {
    name: 'FNA (Federal National Academy)',
    webhook: process.env.WEBHOOK_REPORT_FNA,
    emoji: '📚'
  },
  'nsb': {
    name: 'NSB (National Security Branch)',
    webhook: process.env.WEBHOOK_REPORT_NSB,
    emoji: '🏛️'
  },
  'trainee': {
    name: 'Trainee (Стажёр)',
    webhook: process.env.WEBHOOK_REPORT_TRAINEE,
    emoji: '📖'
  }
};

// ===== ВЕБХУКИ ДЛЯ ПЕРЕВОДОВ (ПО ОТДЕЛАМ, БЕЗ IB И TRAINEE) =====
const TRANSFER_WEBHOOKS = {
  'cid': process.env.WEBHOOK_TRANSFER_CID,
  'fa': process.env.WEBHOOK_TRANSFER_FA,
  'hrt': process.env.WEBHOOK_TRANSFER_HRT,
  'atf': process.env.WEBHOOK_TRANSFER_ATF,
  'af': process.env.WEBHOOK_TRANSFER_AF,
  'ocu': process.env.WEBHOOK_TRANSFER_OCU,
  'dea': process.env.WEBHOOK_TRANSFER_DEA,
  'fna': process.env.WEBHOOK_TRANSFER_FNA,
  'nsb': process.env.WEBHOOK_TRANSFER_NSB
};

// Вебхук для повышения (общий)
const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION
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

  const { type, userId, username, department, ...formData } = req.body;
  
  let webhookUrl;

  // ===== ВЫБИРАЕМ ВЕБХУК =====
  if (type === 'report') {
    // Для отчётов — по отделам (включая IB и Trainee)
    const dept = DEPARTMENTS[department];
    if (!dept) {
      return res.status(400).json({ 
        error: 'Выберите корректный отдел для отчёта' 
      });
    }
    webhookUrl = dept.webhook;
    if (!webhookUrl) {
      return res.status(500).json({ 
        error: `Вебхук для отдела "${dept.name}" не настроен на сервере` 
      });
    }
  } else if (type === 'transfer') {
    // Для переводов — по отделам (без IB и Trainee)
    const deptKey = department;
    if (!deptKey || !TRANSFER_WEBHOOKS[deptKey]) {
      return res.status(400).json({ 
        error: 'Некорректный отдел для перевода' 
      });
    }
    webhookUrl = TRANSFER_WEBHOOKS[deptKey];
    if (!webhookUrl) {
      return res.status(500).json({ 
        error: `Вебхук для перевода в отдел "${department}" не настроен на сервере` 
      });
    }
  } else {
    // Для повышения — общий вебхук
    webhookUrl = webhooks[type];
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Invalid form type' });
    }
  }

  // ===== ФОРМИРУЕМ EMBED =====
  const embed = {
    title: getFormTitle(type, department),
    color: getFormColor(type),
    author: {
      name: username,
      icon_url: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`
    },
    fields: buildFields(type, department, formData, userId, username),
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function getFormTitle(type, department) {
  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    return `📋 Отчёт о повышении • ${dept ? dept.emoji + ' ' + dept.name : 'Отдел'}`;
  }
  if (type === 'transfer') {
    // Для переводов — показываем название отдела
    const deptNames = {
      'cid': 'CID',
      'fa': 'FA',
      'hrt': 'HRT',
      'atf': 'ATF',
      'af': 'AF',
      'ocu': 'OCU',
      'dea': 'DEA',
      'fna': 'FNA',
      'nsb': 'NSB'
    };
    const deptName = deptNames[department] || 'Отдел';
    return `🔄 Запрос на перевод в ${deptName}`;
  }
  const titles = {
    promotion: '📈 Запрос на повышение'
  };
  return titles[type] || 'Новая заявка';
}

function getFormColor(type) {
  const colors = {
    promotion: 0x4CAF50,
    transfer: 0x2196F3,
    report: 0xFF9800
  };
  return colors[type] || 0x5865F2;
}

function buildFields(type, department, data, userId, username) {
  const baseFields = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    const instructorText = data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет';
    
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: dept ? dept.emoji + ' ' + dept.name : 'Не указан', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || 'Не указан', inline: false },
      { name: '🎯 Целевой ранг', value: data.targetRank || 'Не указан', inline: false },
      ...(data.isInstructor ? [{ name: '👨‍🏫 Назначен на инструктора', value: instructorText, inline: false }] : []),
      { name: '🔗 Ссылки на работу', value: data.workLinks || 'Не указаны', inline: false },
      ...baseFields
    ];
  }

  if (type === 'promotion') {
    return [
      ...baseFields,
      { name: '📛 Текущая должность', value: data.currentRank || 'Не указано', inline: false },
      { name: '⭐ Запрашиваемая должность', value: data.requestedRank || 'Не указано', inline: false },
      { name: '📝 Причина', value: data.reason || 'Не указано', inline: false },
      { name: '💼 Опыт работы', value: data.experience || 'Не указано', inline: false }
    ];
  }

  if (type === 'transfer') {
    const fields = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Текущий отдел', value: data.currentDepartment || 'Не указано', inline: false },
      { name: '🎯 Желаемый отдел', value: data.targetDepartment || 'Не указано', inline: false },
      { name: '📝 Причина перевода', value: data.reason || 'Не указано', inline: false }
    ];

    // Если желаемый отдел — CID, добавляем доп. поля
    if (data.targetDepartment === 'cid') {
      fields.push(
        { name: '📋 Чем занимается CID/DB?', value: data.cidWhatIs || 'Не указано', inline: false },
        { name: '📋 Опыт работы в CID/DB?', value: data.cidExperience || 'Не указано', inline: false },
        { name: '📋 Примеры работ', value: data.cidExamples || 'Не указано', inline: false },
        { name: '📋 Серверы с CID/DB', value: data.cidServers || 'Не указано', inline: false },
        { name: '📋 Знания по работе CID (1-10)', value: data.cidKnowledge || 'Не указано', inline: false },
        { name: '📋 Знания по законке (1-10)', value: data.cidLawKnowledge || 'Не указано', inline: false }
      );
    }

    // Если желаемый отдел — FA, добавляем доп. поля
    if (data.targetDepartment === 'fa') {
      fields.push(
        { name: '📋 Знание правил ПОИП', value: data.faRules || 'Не указано', inline: false },
        { name: '📋 Был ли в FA раньше', value: data.faPrevious || 'Не указано', inline: false }
      );
    }

    // Добавляем базовые поля в конец
    fields.push(...baseFields);
    return fields;
  }

  return [
    ...baseFields,
    ...Object.entries(data).map(([key, value]) => ({
      name: key,
      value: String(value) || 'Не указано',
      inline: false
    }))
  ];
}
