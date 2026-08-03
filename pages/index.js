import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Вшиваем прямо в код
const DISCORD_CLIENT_ID = '1533765326213222491';
const DISCORD_REDIRECT_URI = 'https://majestic-fib-forms-beta.vercel.app/api/auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.query.error) {
      setError('Ошибка авторизации. Попробуйте снова.');
    }
    
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router.query]);

  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
      prompt: 'none'
    });
    
    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-card">
        <div className="logo">🔰</div>
        <h1>Majestic FIB Forms</h1>
        <p className="subtitle">Система подачи заявок FIB</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button onClick={handleDiscordLogin} className="discord-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="white"/>
          </svg>
          Войти через Discord
        </button>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
        }
        .login-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 50px 40px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-width: 420px;
          width: 90%;
        }
        .logo {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: white;
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .subtitle {
          color: #8b8ba7;
          margin-bottom: 35px;
          font-size: 16px;
        }
        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff4444;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .discord-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #5865F2;
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          justify-content: center;
        }
        .discord-btn:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4);
        }
        .loading {
          color: white;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}
