import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const sections = [
  {
    id: 'promotion',
    title: 'Запрос на повышение',
    description: 'Подать заявку на повышение в должности',
    icon: '📈',
    color: '#4CAF50'
  },
  {
    id: 'transfer',
    title: 'Перевод в отдел',
    description: 'Запросить перевод в другой отдел',
    icon: '🔄',
    color: '#2196F3'
  },
  {
    id: 'report',
    title: 'Отчёт о повышении',
    description: 'Отправить отчёт о выполненном повышении',
    icon: '📋',
    color: '#FF9800'
  }
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
        if (!data.user) {
          router.push('/');
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, []);

  const copyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const logout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="header">
        <div className="user-info">
          <img 
            src={user.avatar 
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
              : `https://cdn.discordapp.com/embed/avatars/0.png`
            }
            alt={user.username}
            className="avatar"
          />
          <div>
            <h2>{user.username}</h2>
            <p className="user-id">
              ID: {user.id}
              <button onClick={copyId} className="copy-btn">
                {copied ? '✓' : '📋'}
              </button>
            </p>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          Выйти
        </button>
      </header>

      <main className="main">
        <h1>Выберите тип заявки</h1>
        <div className="sections-grid">
          {sections.map(section => (
            <div 
              key={section.id}
              className="section-card"
              onClick={() => router.push(`/forms/${section.id}`)}
            >
              <span className="section-icon">{section.icon}</span>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <div className="card-line" style={{ background: section.color }}></div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #5865F2;
        }
        .user-info h2 {
          color: white;
          font-size: 18px;
        }
        .user-id {
          color: #8b8ba7;
          font-size: 14px;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 2px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .logout-btn:hover {
          background: rgba(255, 0, 0, 0.2);
          border-color: rgba(255, 0, 0, 0.4);
        }
        .main {
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .main h1 {
          color: white;
          margin-bottom: 30px;
          font-size: 28px;
        }
        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .section-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 30px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .section-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .card-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
        .section-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 15px;
        }
        .section-card h3 {
          color: white;
          margin-bottom: 10px;
          font-size: 20px;
        }
        .section-card p {
          color: #8b8ba7;
          font-size: 14px;
          line-height: 1.5;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0a0a1a;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(88, 101, 242, 0.2);
          border-top-color: #5865F2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-container p {
          color: #8b8ba7;
        }
      `}</style>
    </div>
  );
}
