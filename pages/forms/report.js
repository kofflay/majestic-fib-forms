import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// ===== СПИСОК ОТДЕЛОВ =====
const DEPARTMENTS = [
  { id: 'ib', name: 'IB (Intelligence Branch)', emoji: '🕵️' },
  { id: 'cid', name: 'CID (Criminal Investigation Department)', emoji: '🔍' },
  { id: 'fa', name: 'FA (Free Agent)', emoji: '🆓' },
  { id: 'hrt', name: 'HRT (Hostage Rescue Team)', emoji: '🛡️' },
  { id: 'atf', name: 'ATF (Anti Terrorism Force)', emoji: '💥' },
  { id: 'af', name: 'AF (Air Force)', emoji: '✈️' },
  { id: 'ocu', name: 'OCU (Organized Crime Unit)', emoji: '⚖️' },
  { id: 'dea', name: 'DEA (Drug Enforcement Administration)', emoji: '💊' },
  { id: 'fna', name: 'FNA (Federal National Academy)', emoji: '📚' },
  { id: 'nsb', name: 'NSB (National Security Branch)', emoji: '🏛️' },
  { id: 'trainee', name: 'Trainee (Стажёр)', emoji: '📖' }
];

export default function ReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    content: '',
    results: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          userId: user.id,
          username: user.username,
          department: formData.department,
          content: formData.content,
          results: formData.results
        })
      });

      if (res.ok) {
        alert('✅ Отчёт успешно отправлен!');
        router.push('/dashboard');
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Ошибка отправки');
      }
    } catch (error) {
      alert('❌ Ошибка при отправке отчёта: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <button onClick={() => router.push('/dashboard')} className="back-btn">
        ← Назад к выбору
      </button>
      
      <div className="form-container">
        <h1>📋 Отчёт о повышении</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Discord ID</label>
            <input 
              type="text" 
              value={`${user.username} (${user.id})`}
              disabled 
              className="disabled-input" 
            />
          </div>

          <div className="form-group">
            <label>Выберите отдел *</label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="select-input"
            >
              <option value="">-- Выберите отдел --</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.emoji} {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Содержание отчёта *</label>
            <textarea 
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Опишите суть отчёта..."
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Результаты и достижения *</label>
            <textarea 
              required
              value={formData.results}
              onChange={(e) => setFormData({...formData, results: e.target.value})}
              placeholder="Опишите достигнутые результаты..."
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? '⏳ Отправка...' : '📤 Отправить отчёт'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .form-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%);
          padding: 30px;
        }
        .back-btn {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.2s;
          font-size: 14px;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        h1 {
          color: white;
          margin-bottom: 30px;
          font-size: 28px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          color: #8b8ba7;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        input, textarea, .select-input {
          width: 100%;
          padding: 12px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: white;
          font-size: 15px;
          transition: border-color 0.2s;
        }
        .select-input {
          appearance: none;
          cursor: pointer;
        }
        .select-input option {
          background: #1a1a3e;
          color: white;
        }
        input:focus, textarea:focus, .select-input:focus {
          outline: none;
          border-color: #5865F2;
          background: rgba(255, 255, 255, 0.08);
        }
        .disabled-input {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.03);
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        .submit-btn {
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
          margin-top: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #4752C4;
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
