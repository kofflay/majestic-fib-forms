import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleCallback(code);
      return;
    }

    const stored = localStorage.getItem('rp_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleCallback = async (code) => {
    try {
      const res = await fetch(`/api/auth/callback?code=${code}`);
      const data = await res.json();

      if (data.id) {
        localStorage.setItem('rp_user', JSON.stringify({
          id: data.id,
          username: data.username,
          avatar: data.avatar
        }));
        setUser(data);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('Ошибка авторизации:', data.error);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rp_user');
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Majestic RP — Заявки</h1>
        <p>Выберите тип заявки после авторизации через Discord.</p>
        <a
          href="/api/auth/login"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: '#5865F2',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          Войти через Discord
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Панель заявок — {user.username}</h1>
      <p style={{ marginBottom: '32px' }}>Выберите тип заявки:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Link href="/forms/promotion" style={cardStyle}>
          <h3>⭐ Запрос на повышение</h3>
          <p>Подать заявку на повышение в должности.</p>
        </Link>
        <Link href="/forms/transfer" style={cardStyle}>
          <h3>🔄 Перевод в отдел</h3>
          <p>Запросить перевод между отделами.</p>
        </Link>
        <Link href="/forms/report" style={cardStyle}>
          <h3>📄 Отчёт о повышении</h3>
          <p>Сдать отчёт по результатам повышения.</p>
        </Link>
        <Link href="/forms/other" style={cardStyle}>
          <h3>💬 Прочие запросы</h3>
          <p>Иные обращения к администрации.</p>
        </Link>
      </div>

      <button onClick={logout} style={{ marginTop: '40px', padding: '10px 20px', cursor: 'pointer' }}>
        Выйти
      </button>
    </div>
  );
}

const cardStyle = {
  display: 'block',
  padding: '24px',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  textDecoration: 'none',
  color: '#333',
  transition: 'box-shadow 0.2s',
};
