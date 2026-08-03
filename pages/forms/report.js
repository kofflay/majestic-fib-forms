import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReportForm() {
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
      <h1>📋 Отчёт о повышении</h1>
      <p>Форма отчёта</p>
      <button onClick={() => router.push('/dashboard')}>← Назад</button>
    </div>
  );
}
