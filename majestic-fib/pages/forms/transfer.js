
import { useRouter } from 'next/router';

export default function Transfer() {
  const router = useRouter();
  
  return (
    <div>
      <h1>Перевод в отдел</h1>
      <button onClick={() => router.push('/dashboard')}>Назад</button>
    </div>
  );
}
