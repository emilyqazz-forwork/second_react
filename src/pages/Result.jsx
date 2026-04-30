import { useLocation, useNavigate } from 'react-router-dom';

export function Result({ t }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { total = 10, correct = 0 } = location.state || {};
  const accuracy = Math.round((correct / total) * 100) || 0;

  return (
    <div className="result-view" style={{ display: 'flex' }}>
      <div className="result-box">
        <h1 className="glow-title" style={{ fontSize: '3.5rem' }}>{t('result_title')}</h1>
        <div className="score-card">
          <p><span>{t('res_total')}</span>: <strong>{total}</strong></p>
          <p><span>{t('res_correct')}</span>: <strong>{correct}</strong></p>
          <p><span>{t('res_accuracy')}</span>: <strong>{accuracy}%</strong></p>
        </div>
        <button 
          className="clay-submit" 
          onClick={() => navigate('/')} 
          style={{ marginTop: '20px' }}
        >
          {t('btn_go_home')}
        </button>
      </div>
    </div>
  );
}
