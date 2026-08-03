// pages/forms/[type].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function FormPage() {
  const router = useRouter();
  const type = router.query.type;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('rp_user');
    if (!stored) router.push('/');
    else setUser(JSON.parse(stored));
  }, [router]);

  const departments = ['LSPD', 'FIB', 'EMS', 'SANG', 'LSSD', 'Прочие'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          discord_id: user.id,
          username: user.username,
          ...data
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('✅ Заявка успешно отправлена в Discord!');
      } else {
        // Сюда попадёт и ошибка чёрного списка (403)
        setStatus(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      setStatus('❌ Ошибка сети. Проверьте консоль.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '20px' }}>Загрузка…</div>;

  let fields;

  switch (type) {
    case 'transfer':
      fields = (
        <>
          <label>Текущий отдел:</label>
          <select name="current_department" required style={selectStyle}>
            {departments.map(d => <option value={d}>{d}</option>)}
          </select>

          <label>Желаемый отдел:</label>
          <select name="target_department" required style={selectStyle}>
            {departments.map(d => <option value={d}>{d}</option>)}
          </select>

          <label>Причина перевода:</label>
          <textarea name="reason" rows="4" required style={textareaStyle}></textarea>
        </>
      );
      break;
    case 'promotion':
      fields = (
        <>
          <label>Основание для повышения:</label>
          <textarea name="promotion_reason" rows="4" required style={textareaStyle}></textarea>

          <label>Доказательства (ссылка):</label>
          <input type="url" name="evidence" placeholder="https://..." style={inputStyle} />
        </>
      );
      break;
    case 'report':
      fields = (
        <>
          <label>Описание выполненных задач:</label>
          <textarea name="report_details" rows="5" required style={textareaStyle}></textarea>

          <label>Ссылки на доказательства:</label>
          <textarea name="evidence_links" rows="3" style={textareaStyle}></textarea>
        </>
      );
      break;
    default:
      fields = (
        <>
          <label>Тема обращения:</label>
          <input name="subject" required style={inputStyle} />

          <label>Текст заявки:</label>
          <textarea name="text" rows="6" required style={textareaStyle}></textarea>
        </>
      );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Форма: {getTitle(type)}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {fields}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Отправка…' : 'Отправить заявку'}
        </button>
      </form>
      {status && <p style={{ marginTop: '20px', padding: '12px', background: '#ffebee', borderRadius: '8px' }}>{status}</p>}
      <button onClick={() => router.push('/')} style={{ marginTop: '10px', color: '#5865F2', background: 'none', border: 'none', cursor: 'pointer' }}>← Назад к меню</button>
    </div>
  );
}

function getTitle(type) {
  switch (type) {
    case 'transfer': return 'Перевод в отдел';
    case 'promotion': return 'Запрос на повышение';
    case 'report': return 'Отчёт о повышении';
    default: return 'Прочие запросы';
  }
}

const selectStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ccc' };
const textareaStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' };
const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' };
const buttonStyle = { padding: '12px 24px', background: '#5865F2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
