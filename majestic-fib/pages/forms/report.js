import { useRouter } from 'next/router';

export default function Report() {
  const router = useRouter();
  
  return (
    <div>
      <h1>Отчёт о повышении</h1>
      <button onClick={() => router.push('/dashboard')}>Назад</button>
    </div>
  );
}
