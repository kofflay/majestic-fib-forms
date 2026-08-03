// pages/index.jsx
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Index() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Сначала пробуем взять пользователя из localStorage (если он уже авторизован)
    const stored = localStorage.getItem('rp_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    // 2. ВАЖНО: Мы НЕ обрабатываем здесь параметр ?code из URL.
    // Этим должен заниматься файл pages/api/auth/callback.js.
    // Если ты оставишь обработку кода здесь, то при редиректе с Discord 
    // может возникнуть конфликт состояний.
    
    setLoading(false);
  }, []);

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
        
        {/* Ссылка ведет на наш API, который сам соберет правильный URL */}
        <a
          href="/api/auth/login"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: '#5865F2',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            marginTop: '20px'
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
          <p>Иные обращения к администрации.
