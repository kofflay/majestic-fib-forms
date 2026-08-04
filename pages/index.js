import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
        }
      });
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🏛️ Majestic FIB Forms</h1>
        <p>Войдите через Discord, чтобы подать заявку</p>
        <button onClick={handleLogin} className="login-btn">
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
          padding: 20px;
        }
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 50px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          color: white;
          font-size: 28px;
          margin-bottom: 10px;
        }
        p {
          color: #8b8ba7;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #5865F2;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover {
          background: #4752C4;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
