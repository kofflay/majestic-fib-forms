import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function BlacklistPage() {
  const router = useRouter();
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);

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
