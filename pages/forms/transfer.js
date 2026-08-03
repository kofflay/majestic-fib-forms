import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TransferForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>🔄 Перевод в отдел</h1>
      <p>Форма перевода</p>
      <button onClick={() => router.push('/dashboard')}>← Назад</button>
    </div>
  );
}
