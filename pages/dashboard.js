import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const sections = [
  { id: 'promotion', title: 'Запрос на повышение', description: 'Подать заявку на повышение в должности', icon: '📈', color: '#4CAF50' },
  { id: 'transfer', title: 'Перевод в отдел', description: 'Запросить перевод в другой отдел', icon: '🔄', color: '#2196F3' },
  { id: 'report', title: 'Отчёт о повышении', description: 'Отправить отчёт о выполненном повышении', icon: '📋', color: '#FF9800' }
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, []);

  const copyId = () => {
    if (user) { navigator.clipboard.writeText(user.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const logout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a1a', color: 'white' }}>
        Загрузка...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`}
            alt={user.username}
            style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #5865F2' }}
          />
          <div>
            <h2 style={{ color: 'white', fontSize: '18px', margin: 0 }}>{user.username}</h2>
            <p style={{ color: '#8b8ba7', fontSize: '14px', margin: '2px 0 0 0' }}>
              ID: {user.id}
              <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginLeft: '8px' }}>
                {copied ? '✅' : '📋'}
              </button>
            </p>
          </div>
        </div>
        <button onClick={logout} style={{
          background: 'rgba(255,255,255,0.08)', color: 'white',
          border: '1px solid rgba(255,255,255,0.15)', padding: '8px 20px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
        }}>
          Выйти
        </button>
      </header>

      <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', marginBottom: '30px', fontSize: '28px' }}>Выберите тип заявки</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {sections.map(section => (
            <div key={section.id}
              onClick={() => router.push(`/forms/${section.id}`)}
              style={{
                background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
                borderRadius: '16px', padding: '30px', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: section.color }}></div>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>{section.icon}</span>
              <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '20px' }}>{section.title}</h3>
              <p style={{ color: '#8b8ba7', fontSize: '14px' }}>{section.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
