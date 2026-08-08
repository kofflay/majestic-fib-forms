import { verifyToken } from '../../lib/discord';
import { isBlacklisted, addToBlacklist } from '../../lib/blacklist';
import { containsBadWords, findBadWord, findAllBadWords } from '../../lib/badwords';
import { checkSpam } from '../../lib/antispam';
import { kv } from '@vercel/kv';

const DEPARTMENTS = {
  'ib': { name: 'IB', emoji: '🕵️', roleId: '1398200840900055071', roleId2: '1520504887497064639', webhook: process.env.WEBHOOK_REPORT_IB },
  'cid': { name: 'CID', emoji: '🔍', roleId: '1398200760843374652', roleId2: '1520680049655676948', webhook: process.env.WEBHOOK_REPORT_CID },
  'fa': { name: 'FA', emoji: '🆓', roleId: '1398200891353468928', roleId2: '1520680052176715876', webhook: process.env.WEBHOOK_REPORT_FA },
  'hrt': { name: 'HRT', emoji: '🛡️', roleId: '1398201557635567636', roleId2: '1520680047038435358', webhook: process.env.WEBHOOK_REPORT_HRT },
  'atf': { name: 'ATF', emoji: '💥', roleId: '1520680054731051159', roleId2: '1398201048598057041', webhook: process.env.WEBHOOK_REPORT_ATF },
  'af': { name: 'AF', emoji: '✈️', roleId: '1398200952602755103', roleId2: '1532529633088635041', webhook: process.env.WEBHOOK_REPORT_AF },
  'ocu': { name: 'OCU', emoji: '⚖️', roleId: '1520680060808331294', roleId2: '1418771091291115631', webhook: process.env.WEBHOOK_REPORT_OCU },
  'dea': { name: 'DEA', emoji: '💊', roleId: '1398201115379761283', roleId2: '1274110499356934209', webhook: process.env.WEBHOOK_REPORT_DEA },
  'fna': { name: 'FNA', emoji: '📚', roleId: '1520680066445742232', roleId2: '1385530645186613311', webhook: process.env.WEBHOOK_REPORT_FNA },
  'nsb': { name: 'NSB', emoji: '🏛️', roleId: '1520680069415174275', roleId2: '1398201167154122752', webhook: process.env.WEBHOOK_REPORT_NSB },
  'trainee': { name: 'Trainee', emoji: '📖', roleId: '1385530645186613311', roleId2: '1520680066445742232', webhook: process.env.WEBHOOK_REPORT_TRAINEE }
};

const TRANSFER_WEBHOOKS = {
  'cid': process.env.WEBHOOK_TRANSFER_CID, 'fa': process.env.WEBHOOK_TRANSFER_FA,
  'hrt': process.env.WEBHOOK_TRANSFER_HRT, 'atf': process.env.WEBHOOK_TRANSFER_ATF,
  'af': process.env.WEBHOOK_TRANSFER_AF, 'ocu': process.env.WEBHOOK_TRANSFER_OCU,
  'dea': process.env.WEBHOOK_TRANSFER_DEA, 'fna': process.env.WEBHOOK_TRANSFER_FNA,
  'nsb': process.env.WEBHOOK_TRANSFER_NSB
};

const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION,
  highrank: process.env.WEBHOOK_HIGH_RANK_REPORT,
  resignation: process.env.WEBHOOK_RESIGNATION,
  reinstatement: process.env.WEBHOOK_REINSTATEMENT,
  'transfer-to-fib': process.env.WEBHOOK_TRANSFER_TO_FIB,
  hiring: process.env.WEBHOOK_HIRING,
  'weapon-request': process.env.WEBHOOK_WEAPON_REQUEST,
  leave: process.env.WEBHOOK_LEAVE
};

async function sendToDiscord(webhookUrl, data, retries = 3) {
  let lastError = null;
  const url = data.thread_id ? `${webhookUrl}?thread_id=${data.thread_id}` : webhookUrl;
  const { thread_id, ...payload } = data;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) return { success: true, status: response.status };
      if (response.status === 429) { await new Promise(r => setTimeout(r, (parseInt(response.headers.get('Retry-After')) || 5) * 1000)); continue; }
      const errorText = await response.text();
      return { success: false, status: response.status, error: errorText };
    } catch (error) { lastError = error; if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
  return { success: false, error: lastError?.message || 'Неизвестная ошибка' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Глобальный лок
  const isLocked = await kv.get('fib:global:locked');
  if (isLocked) { const ttl = await kv.ttl('fib:global:locked'); return res.status(429).json({ error: `🚫 Сайт заблокирован. Подождите ${Math.ceil((ttl||3600)/60)} мин.` }); }
  const gc = await kv.get('fib:global:requests');
  const ngc = gc ? parseInt(gc) + 1 : 1;
  if (ngc > 5) { await kv.set('fib:global:locked', '1', { ex: 3600 }); await kv.del('fib:global:requests'); return res.status(429).json({ error: '🚫 Сайт заблокирован на 1 час.' }); }
  await kv.set('fib:global:requests', ngc, { ex: 20 });

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (await isBlacklisted(user.id, ip)) return res.status(403).json({ error: '⛔ Вы заблокированы.' });

  const spamCheck = await checkSpam(user.id, ip);
  if (spamCheck.isSpam) { if (spamCheck.ban) await addToBlacklist(user.id, user.username, spamCheck.reason, ip); return res.status(429).json({ error: spamCheck.message }); }

  const { type, department, targetDepartment, leaveType, ...formData } = req.body;

  const allText = Object.values(formData).filter(v => typeof v === 'string').join(' ');
  if (containsBadWords(allText)) {
    const fw = findAllBadWords(allText);
    const f = findBadWord(allText);
    await sendBanWordAlert(user, f || fw.join(', '), allText, type, req);
    await addToBlacklist(user.id, user.username, `Банворд: ${f || fw.join(', ')}`, ip);
    return res.status(403).json({ error: '⛔ Запрещённое слово. Вы заблокированы.' });
  }

  let webhookUrl, roleMentions = '', threadId = null, leaveDept = null;

  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    if (!dept) return res.status(400).json({ error: 'Выберите отдел' });
    webhookUrl = dept.webhook; if (!webhookUrl) return res.status(500).json({ error: 'Вебхук не настроен' });
    if (dept.roleId) roleMentions += `<@&${dept.roleId}> `; if (dept.roleId2) roleMentions += `<@&${dept.roleId2}>`;
  } else if (type === 'transfer') {
    webhookUrl = TRANSFER_WEBHOOKS[targetDepartment]; if (!webhookUrl) return res.status(500).json({ error: 'Вебхук не настроен' });
    const di = DEPARTMENTS[targetDepartment]; if (di?.roleId) roleMentions += `<@&${di.roleId}> `; if (di?.roleId2) roleMentions += `<@&${di.roleId2}>`;
  } else if (type === 'highrank') { webhookUrl = webhooks.highrank; roleMentions = '<@&1289343511354671125>'; }
  else if (type === 'resignation') { webhookUrl = webhooks.resignation; roleMentions = '<@&1274110499356934211>'; }
  else if (type === 'reinstatement') { webhookUrl = webhooks.reinstatement; roleMentions = '<@&1274110499377778755> <@&1289343511354671125>'; }
  else if (type === 'transfer-to-fib') { webhookUrl = webhooks['transfer-to-fib']; roleMentions = '<@&1274110499377778755> <@&1289343511354671125>'; }
  else if (type === 'hiring') { webhookUrl = webhooks.hiring; roleMentions = '<@&1274110499377778755>'; }
  else if (type === 'weapon-request') { webhookUrl = webhooks['weapon-request']; roleMentions = '<@&1274110499356934211>'; }
  else if (type === 'leave') {
    webhookUrl = webhooks.leave;
    leaveDept = formData.department;
    const di = DEPARTMENTS[leaveDept];
    if (di?.roleId) roleMentions += `<@&${di.roleId}> `; if (di?.roleId2) roleMentions += `<@&${di.roleId2}>`;
    threadId = leaveType === 'ooc' ? '1479656377994580060' : '1479695882302787624';
  } else { webhookUrl = webhooks.promotion; roleMentions = '<@&1274110499356934211>'; }
  if (!webhookUrl) return res.status(500).json({ error: 'Вебхук не настроен' });

  const ipCount = await kv.get(`fib:spam:ip:${ip}`);
  if (ipCount && parseInt(ipCount) >= 5) return res.status(429).json({ error: '🚫 Слишком много с IP.' });

  const embed = {
    title: getFormTitle(type, department, targetDepartment, leaveType, leaveDept),
    color: getFormColor(type),
    author: { name: user.username, icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
    fields: buildFields(type, department, targetDepartment, leaveDept, formData, leaveType, user.id),
    footer: { text: 'Majestic FIB Forms • ' + new Date().toLocaleDateString('ru-RU') },
    timestamp: new Date().toISOString()
  };

  const result = await sendToDiscord(webhookUrl, { content: roleMentions.trim() || undefined, embeds: [embed], username: 'Majestic FIB Forms', avatar_url: 'https://i.imgur.com/AfFp7pu.png', ...(threadId ? { thread_id: threadId } : {}) });
  if (result.success) res.status(200).json({ success: true });
  else res.status(500).json({ error: `Не удалось отправить: ${result.error}` });
}

function getFormTitle(type, department, targetDepartment, leaveType, leaveDept) {
  if (type === 'report') { const d = DEPARTMENTS[department]; return `📋 Отчёт • ${d ? d.emoji + ' ' + d.name : 'Отдел'}`; }
  if (type === 'transfer') { const n = { cid:'CID',fa:'FA',hrt:'HRT',atf:'ATF',af:'AF',ocu:'OCU',dea:'DEA',fna:'FNA',nsb:'NSB' }; return `🔄 Перевод в ${n[targetDepartment]||'Отдел'}`; }
  if (type === 'highrank') return '🌟 Хай Ранги';
  if (type === 'resignation') return '🚪 Увольнение';
  if (type === 'reinstatement') return '🔄 Восстановление';
  if (type === 'transfer-to-fib') return '🏛️ Перевод в FIB';
  if (type === 'hiring') return '📝 Трудоустройство';
  if (type === 'weapon-request') return '🔫 Спец вооружение';
  if (type === 'leave') return `🏖️ ${leaveType === 'ooc' ? 'OOC' : 'IC'} Отпуск`;
  return '📈 Повышение';
}

function getFormColor(type) {
  const c = { promotion:0x4CAF50, transfer:0x2196F3, report:0xFF9800, highrank:0xFF69B4, resignation:0xDC3545, reinstatement:0x9C27B0, 'transfer-to-fib':0x00BCD4, hiring:0x4CAF50, 'weapon-request':0xFF5722, leave:0x00BCD4 };
  return c[type] || 0x5865F2;
}

function buildFields(type, department, targetDepartment, leaveDept, data, leaveType, userId) {
  const base = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'leave') {
    const d = DEPARTMENTS[leaveDept];
    return [
      { name: '📋 Тип', value: leaveType === 'ooc' ? '🌍 OOC' : '🎮 IC', inline: false },
      { name: '👤 Имя', value: data.fullName || '-', inline: false },
      { name: '🏢 Отдел', value: d ? d.emoji + ' ' + d.name : (leaveDept || '-'), inline: false },
      { name: '📝 Причина', value: data.reason || '-', inline: false },
      { name: '📅 С', value: data.startDate || '-', inline: true },
      { name: '📅 По', value: data.endDate || '-', inline: true },
      ...base
    ];
  }

  if (type === 'report') {
    const d = DEPARTMENTS[department];
    return [
      { name: '👤 Имя', value: data.fullName || '-', inline: false },
      { name: '🏢 Отдел', value: d ? d.emoji + ' ' + d.name : '-', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || '-', inline: false },
      { name: '🎯 Целевой ранг', value: data.targetRank || '-', inline: false },
      { name: '👨‍🏫 Инструктор', value: data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет', inline: false },
      { name: '🔗 Ссылки', value: data.workLinks || '-', inline: false },
      ...base
    ];
  }

  if (type === 'promotion') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '📊 Ранги', value: data.rankRange || '-', inline: false },
    { name: '🔗 Отчёт', value: data.reportLink || '-', inline: false },
    ...base
  ];

  if (type === 'highrank') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '📊 Ранги', value: data.rankRange || '-', inline: false },
    { name: '🔗 Работа', value: data.workLink || '-', inline: false },
    ...base
  ];

  if (type === 'resignation') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '📸 Планшет', value: data.screenshot || '-', inline: false },
    ...base
  ];

  if (type === 'reinstatement') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '📌 Ранг при увольнении', value: data.rankAtDismissal || '-', inline: false },
    { name: '📸 Док-во ранга', value: data.rankProof || '-', inline: false },
    { name: '⚠️ Ban/Warn', value: data.wasWarned === 'yes' ? '✅ Да' : '❌ Нет', inline: false },
    ...(data.wasWarned === 'yes' ? [{ name: '📄 State Fractions', value: data.stateFractionsProof || '-', inline: false }] : []),
    ...base
  ];

  if (type === 'transfer-to-fib') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '✅ Одобрение', value: data.approvalProof || '-', inline: false },
    { name: '📸 Ранг', value: data.rankProof || '-', inline: false },
    ...base
  ];

  if (type === 'hiring') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '🎂 Возраст', value: data.age || '-', inline: false },
    { name: '💼 Опыт', value: data.experience || '-', inline: false },
    { name: '📚 Законы', value: (data.lawKnowledge||'?') + '/10', inline: false },
    { name: '🪪 Паспорт', value: data.passport || '-', inline: false },
    { name: '🎖️ Военный', value: data.militaryId || '-', inline: false },
    { name: '🏥 Мед.', value: data.medical || '-', inline: false },
    ...base
  ];

  if (type === 'weapon-request') return [
    { name: '👤 Имя', value: data.fullName || '-', inline: false },
    { name: '🏢 Отдел', value: data.department || '-', inline: false },
    { name: '📌 Ранг', value: data.rank || '-', inline: false },
    { name: '🔫 Оружие', value: data.weapon || '-', inline: false },
    ...base
  ];

  if (type === 'transfer') {
    const f = [
      { name: '👤 Имя', value: data.fullName || '-', inline: false },
      { name: '📌 Ранг', value: data.rank || '-', inline: false },
      { name: '🏢 Текущий', value: data.currentDepartment || '-', inline: false },
      { name: '🎯 Желаемый', value: targetDepartment || '-', inline: false },
      { name: '📝 Причина', value: data.reason || '-', inline: false }
    ];
    if (targetDepartment === 'cid') f.push(
      { name: '📋 Что такое CID?', value: data.cidWhatIs || '-', inline: false },
      { name: '📋 Опыт в CID', value: data.cidExperience || '-', inline: false },
      { name: '📋 Примеры', value: data.cidExamples || '-', inline: false },
      { name: '📋 Серверы', value: data.cidServers || '-', inline: false },
      { name: '📋 Знания CID', value: (data.cidKnowledge||'?') + '/10', inline: false },
      { name: '📋 Законка', value: (data.cidLawKnowledge||'?') + '/10', inline: false }
    );
    if (targetDepartment === 'fa') f.push(
      { name: '📋 ПОИП', value: data.faRules || '-', inline: false },
      { name: '📋 Был в FA?', value: data.faPrevious || '-', inline: false }
    );
    f.push(...base); return f;
  }

  return [...base, ...Object.entries(data).map(([k,v]) => ({ name: k, value: String(v) || '-', inline: false }))];
}

async function sendBanWordAlert(user, badWords, fullText, type, req) {
  const wh = process.env.WEBHOOK_BANWORDS || process.env.WEBHOOK_LOGS;
  if (!wh) return;
  const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || '?';
  await sendToDiscord(wh, {
    content: '🚨 Банворд!',
    embeds: [{
      title: '🚨 БАНВОРД',
      color: 0xFF0000,
      author: { name: user.username, icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
      fields: [
        { name: '👤', value: `<@${user.id}>`, inline: true },
        { name: '🆔', value: user.id, inline: true },
        { name: '🌐 IP', value: ip, inline: true },
        { name: '📋 Тип', value: type || '?', inline: true },
        { name: '🚫 Слово', value: `**${badWords}**`, inline: true },
        { name: '📝 Текст', value: `\`\`\`\n${fullText.slice(0,1000)}\n\`\`\``, inline: false }
      ],
      footer: { text: 'Модерация' },
      timestamp: new Date().toISOString()
    }],
    username: 'FIB Модератор',
    avatar_url: 'https://i.imgur.com/AfFp7pu.png'
  });
}
