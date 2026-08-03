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
        // Сюда попадает и ошибка чёрного списка (403)
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
