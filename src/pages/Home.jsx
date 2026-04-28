import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../state/app-state';

export function Home({ t }) {
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate progress
    const attempts = getAttempts();
    const totalByChapter = { 1: 13, 2: 13, 3: 13, 4: 13 };
    const correctByChapter = {};
    const seenProblems = {};
    
    for (const a of attempts) {
      if (!a.isCorrect) continue;
      const ch = a.chapter;
      const pid = a.problemId || a.title;
      if (!seenProblems[pid]) {
        seenProblems[pid] = true;
        correctByChapter[ch] = (correctByChapter[ch] || 0) + 1;
      }
    }
    
    const newProgress = {};
    [1, 2, 3, 4].forEach(ch => {
      const total = totalByChapter[ch] || 1;
      const correct = correctByChapter[ch] || 0;
      newProgress[ch] = Math.min(Math.round((correct / total) * 100), 100);
    });
    setProgress(newProgress);
  }, []);

  const handleChapterClick = (ch) => {
    setSelectedChapter(ch);
    setShowChapterModal(false);
    setShowQuizModal(true);
  };

  return (
    <div className="main-container" style={{ display: 'flex' }}>
      <header className="header">
        <h1 className="glow-title">{t('main_title')}</h1>
        <p className="subtitle">{t('main_subtitle')}</p>
      </header>

      <div className="button-wrapper">
        <button className="btn-link" onClick={() => setShowChapterModal(true)} style={{background:'none', border:'none', cursor:'pointer', padding: 0}}>
          <img src="/images/버튼_1.png" alt="문제풀기" />
        </button>
        <button className="btn-link" onClick={() => navigate('/note')} style={{background:'none', border:'none', cursor:'pointer', padding: 0}}>
          <img src="/images/버튼_2.png" alt="오답노트" />
        </button>
        <button className="btn-link" onClick={() => navigate('/pattern')} style={{background:'none', border:'none', cursor:'pointer', padding: 0}}>
          <img src="/images/버튼_3.png" alt="패턴분석" />
        </button>
        <button className="btn-link" onClick={() => navigate('/minigame')} style={{background:'none', border:'none', cursor:'pointer', padding: 0}}>
          <img src="/images/버튼_4.png" alt="미니게임" />
        </button>
      </div>

      {showChapterModal && (
        <ChapterModal 
          onClose={() => setShowChapterModal(false)} 
          onSelect={handleChapterClick} 
          progress={progress} 
          t={t} 
        />
      )}
      
      {showQuizModal && (
        <QuizSettingModal 
          onClose={() => setShowQuizModal(false)}
          chapter={selectedChapter}
          t={t}
          onStart={(settings) => {
            setShowQuizModal(false);
            navigate('/play', { state: { ...settings, chapter: selectedChapter } });
          }}
        />
      )}
    </div>
  );
}

function ChapterModal({ onClose, onSelect, progress, t }) {
  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_chapter_title')}</h2>
        <div className="chapter-list">
          <h3 className="chapter-group-title">{t('ch1_group')}</h3>
          <div className="chapter-item" onClick={() => onSelect(1)}>
            <span className="ch-title">{t('ch1_1')}</span>
            <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress[1] || 0}%` }}></div></div>
          </div>
          <div className="chapter-item" onClick={() => onSelect(2)}>
            <span className="ch-title">{t('ch1_2')}</span>
            <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress[2] || 0}%` }}></div></div>
          </div>
          <h3 className="chapter-group-title">{t('ch2_group')}</h3>
          <div className="chapter-item" onClick={() => onSelect(3)}>
            <span className="ch-title">{t('ch2_1')}</span>
            <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress[3] || 0}%` }}></div></div>
          </div>
          <div className="chapter-item" onClick={() => onSelect(4)}>
            <span className="ch-title">{t('ch2_2')}</span>
            <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress[4] || 0}%` }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizSettingModal({ onClose, onStart, t }) {
  const [ratio, setRatio] = useState(50);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('중');

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_quiz_title')}</h2>
        <div className="setting-form">
          <div className="setting-group">
            <label>{t('quiz_ratio')}</label>
            <div className="range-slider-wrapper">
              <span><span>{t('quiz_obj')}</span> {ratio}%</span>
              <input type="range" min="0" max="100" step="10" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
              <span><span>{t('quiz_subj')}</span> {100 - ratio}%</span>
            </div>
          </div>
          <div className="setting-group">
            <label>{t('quiz_count')}</label>
            <input type="number" min="1" max="20" value={count} onChange={(e) => setCount(Number(e.target.value))} className="setting-input" />
          </div>
          <div className="setting-group">
            <label>{t('quiz_diff')}</label>
            <select className="setting-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="하">{t('diff_easy')}</option>
              <option value="중">{t('diff_medium')}</option>
              <option value="상">{t('diff_hard')}</option>
            </select>
          </div>
          <button 
            className="clay-submit" 
            onClick={() => onStart({ ratio, count, difficulty })}
            style={{ width: '100%', marginTop: '15px' }}
          >
            {t('btn_start_quiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
