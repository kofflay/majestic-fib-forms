import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BlacklistPage() {
  const router = useRouter();
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetId, setResetId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/blacklist')
      .then(res => res.json())
      .then(data => {
        if (data.blacklist) setBlacklist(data.blacklist);
        setLoading(false);
      })
      .catch(() => router.push('/dashboard'));
  }, []);

  const unban = async (userId) => {
    const res = await fetch('/api/admin/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unban', userId })
    });
    if (res.ok) {
      setBlacklist(blacklist.filter(b => b.id !== userId));
    }
  };

  const resetSpam = async () => {
    if (!resetId) return;
    const res = await fetch('/api/admin/reset-spam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: resetId })
    });
    const data = await res.json();
    setMessage(data.message || 'Готово');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a1a', color: 'white' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', color: 'white', padding: '40px' }}>
      <h1 style={{ marginBottom: '30px' }}>🚫 Управление банами</h1>

      {/* Сброс спама */}
      <div style={{
        background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)',
        borderRadius: '12px', padding: '20px', marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🔄 Сброс спам-лимита</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Discord ID"
            value={resetId}
            onChange={(e) => setResetId(e.target.value)}
            style={{
              flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white'
            }}
          />
          <button onClick={resetSpam} style={{
            background: '#FF9800', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
          }}>
            Сбросить
          </button>
        </div>
        {message && <p style={{ marginTop: '10px', color: '#FFB74D' }}>{message}</p>}
      </div>
      
      {/* Список банов */}
      <h3 style={{ marginBottom: '15px' }}>📋 Список банов</h3>
      {blacklist.length === 0 ? (
        <p style={{ color: '#8b8ba7' }}>Список банов пуст</p>
      ) : (
        <div>
          {blacklist.map(ban => (
            <div key={ban.id} style={{
              background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)',
              borderRadius: '12px', padding: '20px', marginBottom: '15px'
            }}>
              <h3>{ban.username}</h3>
              <p style={{ color: '#8b8ba7' }}>ID: {ban.id}</p>
              <p style={{ color: '#8b8ba7' }}>IP: {ban.ip || 'неизвестен'}</p>
              <p style={{ color: '#8b8ba7' }}>Причина: {ban.reason}</p>
              <p style={{ color: '#8b8ba7' }}>Дата: {ban.date}</p>
              <button onClick={() => unban(ban.id)} style={{
                background: '#4CAF50', color: 'white', border: 'none',
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                marginTop: '10px', fontSize: '14px'
              }}>
                ✅ Разбанить
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button onClick={() => router.push('/dashboard')} style={{
        background: 'rgba(255,255,255,0.1)', color: 'white',
        border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px',
        borderRadius: '8px', cursor: 'pointer', marginTop: '30px'
      }}>
        ← Назад
      </button>
    </div>
  );
}
