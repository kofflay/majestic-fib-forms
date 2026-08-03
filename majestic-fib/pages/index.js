import { useState, useEffect } from 'react';

// 🛑 ЧЁРНЫЙ СПИСОК DISCORD ID (Вписывайте вредителей через запятую)
const BLACKLIST = [
  "857583974104956948", // Нарушитель со скриншота
  "112233445566778899"
];

const WEBHOOK_URL = "https://discord.com";

export default function FibForm() {
  const [user, setUser] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({ nameAndStatic: '', rankChange: '1-2 ранг', evidenceLinks: '' });

  // Логика авторизации: полностью прямая, простая текстовая ссылка без переменных
const handleLogin = () => {
  window.location.href = "https://discord.com";
};

  // Ловим данные пользователя, когда он вернулся от Дискорда
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        const loggedInUser = JSON.parse(decodeURIComponent(userParam));
        setUser(loggedInUser);
        
        if (BLACKLIST.includes(loggedInUser.id)) {
          setIsBanned(true);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Ошибка при обработке профиля", e);
      }
    }
  }, []);

  const sanitizeText = (text) => {
    return text.replace(/@everyone/g, "everyone").replace(/@here/g, "here");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBanned) return alert("Доступ заблокирован.");

    setStatus('⏳ Отправка отчета...');

    const payload = {
      content: "💼 **Поступил новый отчет на повышение!**",
      embeds: [{
        title: "📑 Кадровый аудит | Заявление на повышение",
        color: 3447003,
        fields: [
          { name: "👤 Имя Фамилия + Статик", value: sanitizeText(formData.nameAndStatic), inline: false },
          { name: "📈 Повышение ранга", value: formData.rankChange, inline: true },
          { name: "🛡️ Верифицированный Discord", value: `<@${user.id}> (ID: ${user.id})`, inline: true },
          { name: "🔗 Ссылки на док-ва выполненной работы [5 фракционных активностей]", value: sanitizeText(formData.evidenceLinks), inline: false }
        ],
        footer: { text: "Majestic RP • FIB Auth System" },
        timestamp: new Date().toISOString()
      }]
    };

    const options = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(payload)
    };

    const sendWithRetry = async (retries = 3, delay = 2000) => {
      try {
        const response = await fetch(WEBHOOK_URL, options);

        if (response.status === 429) {
          const rateLimitData = await response.json();
          const waitTime = (rateLimitData.retry_after * 1000) || delay;
          if (retries > 0) {
            setStatus(`⚠️ Дискорд перегружен. Повтор через ${Math.ceil(waitTime/1000)} сек...`);
            await new Promise(res => setTimeout(res, waitTime));
            return sendWithRetry(retries - 1, delay);
          }
        }

        if (response.ok) {
          setStatus('✅ Отчет успешно отправлен кадровому аудиту!');
          setFormData({ nameAndStatic: '', rankChange: '1-2 ранг', evidenceLinks: '' });
          return;
        }

        const errorText = await response.text();
        setStatus(`❌ Ошибка Дискорда (Код ${response.status}).`);
      } catch (err) {
        if (retries > 0) {
          await new Promise(res => setTimeout(res, delay));
          return sendWithRetry(retries - 1, delay * 2);
        }
        setStatus('❌ Ошибка сети. Не удалось связаться с Discord.');
      }
    };

    await sendWithRetry();
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', maxWidth: '600px', margin: '40px auto', padding: '25px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '20px' }}>FIB | Повышение хай-рангов</h2>
      
      {!user ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ color: '#555', marginBottom: '20px' }}>Перед заполнением анкеты необходимо войти в свой аккаунт Discord:</p>
          <button onClick={handleLogin} style={{ backgroundColor: '#5865F2', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            Войти через Discord
          </button>
        </div>
      ) : isBanned ? (
        <div style={{ color: '#d32f2f', textAlign: 'center', fontWeight: 'bold', padding: '20px', background: '#ffebee', borderRadius: '6px' }}>
          ❌ Ваш аккаунт занесен в чёрный список фракции. Доступ заблокирован.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <img src={`https://discordapp.com{user.id}/${user.avatar}.png`} style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
            <span>Вы вошли как: <b style={{ color: '#5865F2' }}>{user.username}</b> (ID: {user.id})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Имя Фамилия + Статик <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="text" required placeholder="Pavel Kargobob 666" value={formData.nameAndStatic} onChange={e => setFormData({...formData, nameAndStatic: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>С какого на какой ранг вы повышаетесь <span style={{ color: '#e53e3e' }}>*</span></label>
            <select value={formData.rankChange} onChange={e => setFormData({...formData, rankChange: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff' }}>
              {Array.from({ length: 14 }, (_, i) => `${i + 1}-${i + 2} ранг`).map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Ссылки на док-ва [5 фракционных активностей] <span style={{ color: '#e53e3e' }}>*</span></label>
            <textarea required rows="5" placeholder="Вставьте ссылки на доказательства" value={formData.evidenceLinks} onChange={e => setFormData({...formData, evidenceLinks: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', resize: 'vertical' }} />
          </div>

          <button type="submit" style={{ backgroundColor: '#2f855a', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            Отправить отчет
          </button>
          {status && <p style={{ textAlign: 'center', fontWeight: 'bold', color: status.startsWith('✅') ? '#2f855a' : '#c53030' }}>{status}</p>}
        </form>
      )}
    </div>
  );
}
