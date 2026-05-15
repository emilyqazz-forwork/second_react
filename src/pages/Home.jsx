import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../state/app-state';

// 챕터 데이터 - 난이도별(basic/mid/adv) 챕터 목록
const JAVA_CHAPTERS = {
  basic: [
    { id: 1, key: 'java_basic_1' },
    { id: 2, key: 'java_basic_2' },
  ],
  mid: [
    { id: 3, key: 'java_mid_1' },
    { id: 4, key: 'java_mid_2' },
  ],
  adv: [
    { id: 1, key: 'java_adv_1' },
    { id: 2, key: 'java_adv_2' },
  ],
};

export function Home({ t }) {
  // step: 현재 어떤 모달을 보여줄지 관리 (null이면 모달 없음)
  const [step, setStep] = useState(null); // null | 'lang' | 'level' | 'chapter' | 'setting'
  const [selectedLang, setSelectedLang] = useState(null);     // 선택한 언어 (java, python 등)
  const [selectedLevel, setSelectedLevel] = useState(null);   // 선택한 난이도 (basic, mid, adv)
  const [selectedChapter, setSelectedChapter] = useState(null); // 선택한 챕터 번호
  const [progress, setProgress] = useState({});               // 챕터별 진도율 (0~100%)
  const [displayText, setDisplayText] = useState('');         // 타이핑 애니메이션 텍스트
  const navigate = useNavigate();

  // 챕터별 진도율 계산
  useEffect(() => {
    const attempts = getAttempts(); // 저장된 풀이 기록 가져오기
    const totalByChapter = { 1: 13, 2: 13, 3: 13, 4: 13 }; // 챕터별 총 문제 수
    const correctByChapter = {};
    const seenProblems = {}; // 같은 문제 중복 카운트 방지용

    for (const a of attempts) {
      if (!a.isCorrect) continue; // 틀린 문제는 건너뜀
      const ch = a.chapter;
      const pid = a.problemId || a.title;
      if (!seenProblems[pid]) {
        seenProblems[pid] = true;
        correctByChapter[ch] = (correctByChapter[ch] || 0) + 1; // 챕터별 정답 수 누적
      }
    }

    // 챕터별 진도율 계산 (정답수 / 총문제수 * 100, 최대 100%)
    const newProgress = {};
    [1, 2, 3, 4].forEach(ch => {
      const total = totalByChapter[ch] || 1;
      const correct = correctByChapter[ch] || 0;
      newProgress[ch] = Math.min(Math.round((correct / total) * 100), 100);
    });
    setProgress(newProgress);
  }, []);

  // 타이핑 애니메이션 - 한 글자씩 80ms마다 추가
  useEffect(() => {
    const fullText = '초보 개발자를 위한 자바 코딩도우미';
    let idx = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      idx += 1;
      setDisplayText(fullText.slice(0, idx));
      if (idx >= fullText.length) clearInterval(timer); // 다 출력되면 타이머 종료
    }, 80);
    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  // 모달 전체 닫기 및 선택값 초기화
  const closeAll = () => {
    setStep(null);
    setSelectedLang(null);
    setSelectedLevel(null);
    setSelectedChapter(null);
  };

  return (
    <div className="main-container home-page" style={{ display: 'flex' }}>
      <style>{`
        .home-page .btn-link img {
          mix-blend-mode: multiply;
          transition: transform 0.25s ease, filter 0.25s ease;
        }
        .home-page .btn-link:hover img {
          animation: home-btn-float 1.4s ease-in-out infinite;
          filter:
            drop-shadow(0 0 6px rgba(255, 235, 130, 1))
            drop-shadow(0 0 14px rgba(255, 210, 70, 0.9))
            drop-shadow(0 0 26px rgba(255, 193, 7, 0.55));
        }
        .home-page .btn-link:active img {
          animation: home-btn-pop 0.45s ease forwards;
          filter:
            drop-shadow(0 0 8px rgba(255, 245, 170, 1))
            drop-shadow(0 0 18px rgba(255, 220, 90, 1))
            drop-shadow(0 0 34px rgba(255, 193, 7, 0.8));
        }
        .home-page .btn-link:hover .home-btn-label {
          text-shadow:
            0 0 8px rgba(255, 220, 100, 0.95),
            0 0 16px rgba(255, 193, 7, 0.5),
            0 1px 0 rgba(255, 248, 216, 0.8);
        }
        .home-page .btn-link:active .home-btn-label {
          text-shadow:
            0 0 10px rgba(255, 235, 140, 1),
            0 0 20px rgba(255, 200, 60, 0.85),
            0 1px 0 rgba(255, 248, 216, 0.8);
        }
        .home-page .btn-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .home-page .home-btn-label {
          font-family: 'Jua', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #3e2723;
          text-shadow: 0 1px 0 rgba(255, 248, 216, 0.8);
          pointer-events: none;
        }
        @keyframes home-btn-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes home-btn-pop {
          0% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-16px) scale(1.06); }
          65% { transform: translateY(-10px) scale(1.03); }
          100% { transform: translateY(-12px) scale(1.04); }
        }
      `}</style>
      <header className="header">
        <h1 className="glow-title">{t('main_title')}</h1>
        {/* 타이핑 애니메이션 텍스트 + 깜빡이는 커서 */}
        <p className="subtitle">{displayText}<span className="cursor">|</span></p>
      </header>

      {/* 메인 버튼 메뉴 */}
      <div className="button-wrapper">
        <button
          className="btn-link"
          onClick={() => setStep('lang')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/images/home_quiz.png" alt="" />
          <span className="home-btn-label">문제풀기</span>
        </button>
        <button
          className="btn-link"
          onClick={() => navigate('/note')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/images/home_ox.png" alt="" />
          <span className="home-btn-label">오답노트</span>
        </button>
        <button
          className="btn-link"
          onClick={() => navigate('/pattern')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/images/home_pattern.png" alt="" />
          <span className="home-btn-label">패턴분석</span>
        </button>
        <button
          className="btn-link"
          onClick={() => navigate('/minigame')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img src="/images/home_game.png" alt="" />
          <span className="home-btn-label">미니게임</span>
        </button>
      </div>

      {/* step 상태에 따라 해당 모달만 렌더링 */}

      {/* 1단계: 언어 선택 모달 */}
      {step === 'lang' && (
        <LangModal
          t={t}
          onClose={closeAll}
          onSelect={(lang) => {
            setSelectedLang(lang);
            setStep('level'); // 언어 선택 후 난이도 선택으로 이동
          }}
        />
      )}

      {/* 2단계: 난이도 선택 모달 */}
      {step === 'level' && (
        <LevelModal
          t={t}
          onClose={closeAll}
          onBack={() => setStep('lang')} // 이전 버튼 누르면 언어 선택으로 돌아감
          onSelect={(level) => {
            setSelectedLevel(level);
            setStep('chapter'); // 난이도 선택 후 챕터 선택으로 이동
          }}
        />
      )}

      {/* 3단계: 챕터 선택 모달 */}
      {step === 'chapter' && (
        <ChapterModal
          t={t}
          level={selectedLevel}
          progress={progress}
          onClose={closeAll}
          onBack={() => setStep('level')} // 이전 버튼 누르면 난이도 선택으로 돌아감
          onSelect={(chapter) => {
            setSelectedChapter(chapter);
            setStep('setting'); // 챕터 선택 후 퀴즈 설정으로 이동
          }}
        />
      )}

      {/* 4단계: 퀴즈 설정 모달 */}
      {step === 'setting' && (
        <QuizSettingModal
          t={t}
          onClose={closeAll}
          onBack={() => setStep('chapter')} // 이전 버튼 누르면 챕터 선택으로 돌아감
          onStart={(settings) => {
            closeAll();
            // 퀴즈 시작 - 설정값과 챕터 정보를 가지고 /play 페이지로 이동
            navigate('/play', { state: { ...settings, chapter: selectedChapter } });
          }}
        />
      )}
    </div>
  );
}

// 언어 선택 모달 컴포넌트
function LangModal({ t, onClose, onSelect }) {
  const langs = [
    { id: 'java', label: 'Java', emoji: '☕', ready: true },
    { id: 'python', label: 'Python', emoji: '🐍', ready: false }, // 준비중
    { id: 'c', label: 'C언어', emoji: '⚙️', ready: false },       // 준비중
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
              // 준비중인 언어는 클릭 불가 (opacity 0.5, cursor not-allowed)
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

// 난이도 선택 모달 컴포넌트
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

// 챕터 선택 모달 컴포넌트
function ChapterModal({ t, level, progress, onClose, onBack, onSelect }) {
  // 선택한 난이도에 해당하는 챕터 목록 가져오기
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
              {/* 챕터별 진도율 프로그레스바 */}
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

// 퀴즈 설정 모달 컴포넌트
function QuizSettingModal({ t, onClose, onBack, onStart }) {
  const [ratio, setRatio] = useState(50);           // 객관식/주관식 비율 (기본 50:50)
  const [count, setCount] = useState(10);           // 문제 수 (기본 10개)

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_quiz_title')}</h2>
        <div className="setting-form">
          {/* 객관식/주관식 비율 슬라이더 */}
          <div className="setting-group">
            <label>{t('quiz_ratio')}</label>
            <div className="range-slider-wrapper">
              <span><span>{t('quiz_obj')}</span> {ratio}%</span>
              <input type="range" min="0" max="100" step="10" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
              <span><span>{t('quiz_subj')}</span> {100 - ratio}%</span>
            </div>
          </div>
          {/* 문제 수 입력 */}
          <div className="setting-group">
            <label>{t('quiz_count')}</label>
            <input type="number" min="1" max="20" value={count} onChange={(e) => setCount(Number(e.target.value))} className="setting-input" />
          </div>
          {/* 퀴즈 시작 버튼 - 설정값을 onStart에 전달 */}
          <button
            className="clay-submit"
            onClick={() => onStart({ ratio, count })}
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