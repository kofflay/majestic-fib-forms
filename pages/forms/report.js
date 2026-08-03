import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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

const RANKS = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' },
  { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '8', label: '8' },
  { value: '9', label: '9' }, { value: '10', label: '10' }
];

export default function ReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    currentRank: '',
    targetRank: '',
    isInstructor: '',
    workLinks: ''
  });

  const targetRankNum = parseInt(formData.targetRank);
  const showInstructorField = (targetRankNum === 9 || targetRankNum === 10) && formData.department !== 'fa';
  const isFormValid = () => {
    if (!showInstructorField) return true;
    return formData.isInstructor === 'yes';
  };

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

    if (showInstructorField && formData.isInstructor !== 'yes') {
      alert('⚠️ Для повышения на 9 или 10 ранг необходимо подтвердить назначение на инструктора!');
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report',
          department: formData.department,
          fullName: formData.fullName,
          currentRank: formData.currentRank,
          targetRank: formData.targetRank,
          isInstructor: formData.isInstructor || 'no',
          workLinks: formData.workLinks
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
            <label>Имя Фамилия + Статик *</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Например: Sanya Suspect 270726"
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
            <label>Ваш текущий ранг *</label>
            <select
              required
              value={formData.currentRank}
              onChange={(e) => setFormData({...formData, currentRank: e.target.value})}
              className="select-input"
            >
              <option value="">-- Выберите текущий ранг --</option>
              {RANKS.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>На какой ранг повышаетесь *</label>
            <select
              required
              value={formData.targetRank}
              onChange={(e) => {
                setFormData({
                  ...formData, 
                  targetRank: e.target.value,
                  isInstructor: ''
                });
              }}
              className="select-input"
            >
              <option value="">-- Выберите целевой ранг --</option>
              {RANKS.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </div>

         
