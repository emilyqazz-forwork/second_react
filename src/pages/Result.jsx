/*퀴즈 풀이 후 결과를 보여주는 페이지입니다. 사용자가 푼 문제의 총 개수, 맞힌 개수, 정확도 등을 시각적으로 보여주고, 다시 홈으로 돌아갈 수 있는 버튼을 제공합니다.*/

/*이전 페이지(퀴즈 화면)에서 넘겨준 데이터를 받아오는 것*/
import { useLocation, useNavigate } from 'react-router-dom';

/*t함수는 나중에 영어 버전이나 다른 언어 버전을 만들 때 매우 유리한 구조*/
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
