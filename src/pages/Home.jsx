import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../state/app-state';

// 챕터 데이터
const JAVA_CHAPTERS = {
  basic: [
    // problems.js 챕터 id(1~4)에 맞춰 매핑
    { id: 1, key: 'java_basic_1' },
    { id: 1, key: 'java_basic_2' },
    { id: 2, key: 'java_basic_3' },
    { id: 2, key: 'java_basic_4' },
  ],
  mid: [
    { id: 3, key: 'java_mid_1' },
    { id: 3, key: 'java_mid_2' },
    { id: 4, key: 'java_mid_3' },
    { id: 4, key: 'java_mid_4' },
  ],
  adv: [
    { id: 1, key: 'java_adv_1' },
    { id: 2, key: 'java_adv_2' },
  ],
};

export function Home({ t }) {
  const [step, setStep] = useState(null); // null | 'lang' | 'level' | 'chapter' | 'setting'
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [progress, setProgress] = useState({});
  const [displayText, setDisplayText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

  useEffect(() => {
    const fullText = '초보 개발자를 위한 자바 코딩도우미';
    let idx = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      idx += 1;
      setDisplayText(fullText.slice(0, idx));
      if (idx >= fullText.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const closeAll = () => {
    setStep(null);
    setSelectedLang(null);
    setSelectedLevel(null);
    setSelectedChapter(null);
  };

  return (
    <div className="main-container" style={{ display: 'flex' }}>
      <header className="header">
        <h1 className="glow-title">{t('main_title')}</h1>
        <p className="subtitle">{displayText}<span className="cursor">|</span></p>
      </header>

      <div className="button-wrapper">
        <div className="btn-bar">
          <button className="flat-btn" onClick={() => setStep('lang')}>
            <span className="btn-icon">✏️</span>
            문제풀기
          </button>
          <button className="flat-btn" onClick={() => navigate('/note')}>
            <span className="btn-icon">📖</span>
            오답노트
          </button>
          <button className="flat-btn" onClick={() => navigate('/pattern')}>
            <span className="btn-icon">📊</span>
            패턴분석
          </button>
          <button className="flat-btn" onClick={() => navigate('/minigame')}>
            <span className="btn-icon">🎮</span>
            미니게임
          </button>
        </div>
      </div>

      {/* 언어 선택 */}
      {step === 'lang' && (
        <LangModal
          t={t}
          onClose={closeAll}
          onSelect={(lang) => {
            setSelectedLang(lang);
            setStep('level');
          }}
        />
      )}

      {/* 난이도 선택 */}
      {step === 'level' && (
        <LevelModal
          t={t}
          onClose={closeAll}
          onBack={() => setStep('lang')}
          onSelect={(level) => {
            setSelectedLevel(level);
            setStep('chapter');
          }}
        />
      )}

      {/* 챕터 선택 */}
      {step === 'chapter' && (
        <ChapterModal
          t={t}
          level={selectedLevel}
          progress={progress}
          onClose={closeAll}
          onBack={() => setStep('level')}
          onSelect={(chapter) => {
            setSelectedChapter(chapter);
            setStep('setting');
          }}
        />
      )}

      {/* 퀴즈 설정 */}
      {step === 'setting' && (
        <QuizSettingModal
          t={t}
          onClose={closeAll}
          onBack={() => setStep('chapter')}
          onStart={(settings) => {
            closeAll();
            navigate('/play', { state: { ...settings, chapter: selectedChapter } });
          }}
        />
      )}
    </div>
  );
}

// 언어 선택 모달
function LangModal({ t, onClose, onSelect }) {
  const langs = [
    { id: 'java', label: 'Java', emoji: '☕', ready: true },
    { id: 'python', label: 'Python', emoji: '🐍', ready: false },
    { id: 'c', label: 'C언어', emoji: '⚙️', ready: false },
  ];

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_lang_title')}</h2>
        <div className="chapter-list">
          {langs.map(lang => (
            <div
              key={lang.id}
              className="chapter-item"
              style={{ opacity: lang.ready ? 1 : 0.5, cursor: lang.ready ? 'pointer' : 'not-allowed', justifyContent: 'space-between' }}
              onClick={() => lang.ready && onSelect(lang.id)}
            >
              <span className="ch-title">{lang.emoji} {lang.label}</span>
              {!lang.ready && <span style={{ fontSize: 12, color: '#aaa' }}>준비중</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 난이도 선택 모달
function LevelModal({ t, onClose, onBack, onSelect }) {
  const levels = [
    { id: 'basic', label: t('level_basic'), emoji: '🌱' },
    { id: 'mid', label: t('level_mid'), emoji: '🌿' },
    { id: 'adv', label: t('level_adv'), emoji: '🌳' },
  ];

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_level_title')}</h2>
        <div className="chapter-list">
          {levels.map(level => (
            <div
              key={level.id}
              className="chapter-item"
              onClick={() => onSelect(level.id)}
            >
              <span className="ch-title">{level.emoji} {level.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onBack} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 13 }}>← 이전</button>
      </div>
    </div>
  );
}

// 챕터 선택 모달
function ChapterModal({ t, level, progress, onClose, onBack, onSelect }) {
  const chapters = JAVA_CHAPTERS[level] || [];

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_chapter_title')}</h2>
        <div className="chapter-list">
          {chapters.map(ch => (
            <div
              key={ch.id}
              className="chapter-item"
              onClick={() => onSelect(ch.id)}
            >
              <span className="ch-title">{t(ch.key)}</span>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress[ch.id] || 0}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onBack} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 13 }}>← 이전</button>
      </div>
    </div>
  );
}

// 퀴즈 설정 모달
function QuizSettingModal({ t, onClose, onBack, onStart }) {
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
        <button onClick={onBack} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 13 }}>← 이전</button>
      </div>
    </div>
  );
}