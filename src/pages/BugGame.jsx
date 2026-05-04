import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BugGame.css';

export default function BugGame() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [chickX, setChickX] = useState(0);
  const [gameState, setGameState] = useState('READY');
  const [words, setWords] = useState([]);

  // [수정] useRef는 null로 시작하고 useEffect에서 초기화하여 메모리 누수를 방지합니다.
  const sfxSuccess = useRef(null);
  const sfxFail = useRef(null);

  const wordPool = [
    { text: "System.out.println();", isBug: false },
    { text: "Sustem.out.print();", isBug: true },
    { text: "ArrayList<String> list;", isBug: false },
    { text: "Arraylist<Integer> a;", isBug: true },
    { text: "String s = \"CHICK\";", isBug: false },
    { text: "String s = 'CHICK';", isBug: true },
    { text: "int num = 10", isBug: true },
    { text: "public static void main", isBug: false },
    { text: "pubic static void main", isBug: true },
    { text: "for(int i=0; i<10; i++)", isBug: false },
    { text: "for(int i=0; i<10; i--)", isBug: true }
  ];

  // [추가] 컴포넌트가 처음 로드될 때 오디오 객체를 딱 한 번만 생성합니다.
  useEffect(() => {
    sfxSuccess.current = new Audio('/audio/correct.mp3');
    sfxFail.current = new Audio('/audio/Miss.mp3');

    // 컴포넌트 종료 시 오디오 객체 정리 (메모리 해제)
    return () => {
      if (sfxSuccess.current) {
        sfxSuccess.current.pause();
        sfxSuccess.current.src = "";
      }
      if (sfxFail.current) {
        sfxFail.current.pause();
        sfxFail.current.src = "";
      }
    };
  }, []);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.log("사운드 재생을 위해 사용자의 클릭이 필요합니다.");
      });
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setWords([]);
    setGameState('PLAYING');
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (containerSize.w > 0) setChickX(containerSize.w / 2);
  }, [containerSize.w]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING') return;
      const step = 50;
      if (e.key === 'ArrowLeft') setChickX(prev => Math.max(55, prev - step));
      if (e.key === 'ArrowRight') setChickX(prev => Math.min(containerSize.w - 55, prev + step));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, containerSize.w]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    const spawnInterval = setInterval(() => {
      const data = wordPool[Math.floor(Math.random() * wordPool.length)];
      setWords(prev => [...prev, {
        id: Math.random(),
        ...data,
        x: Math.random() * (containerSize.w - 300) + 150,
        y: 60,
        speed: 3 + Math.random() * 4,
        isCaught: false
      }]);
    }, 1000);
    return () => { clearInterval(timer); clearInterval(spawnInterval); };
  }, [gameState, containerSize.w]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (timeLeft === 0) setGameState('OVER');

    const moveInterval = setInterval(() => {
      setWords(prevWords => {
        const nextWords = [];
        const chickTop = containerSize.h - 150; 
        const chickBottom = containerSize.h - 40;

        for (let word of prevWords) {
          if (word.isCaught) continue;

          const nextY = word.y + word.speed;
          
          const isHit = (
            nextY + 40 > chickTop &&
            nextY < chickBottom &&
            word.x + 80 > chickX - 70 &&
            word.x - 80 < chickX + 70
          );

          if (isHit) {
            if (word.isBug) {
              setScore(s => s + 10);
              playSound(sfxSuccess); 
            } else {
              setScore(s => Math.max(0, s - 5));
              playSound(sfxFail); 
            }
            continue; 
          }

          if (nextY < containerSize.h) {
            nextWords.push({ ...word, y: nextY });
          }
        }
        return nextWords;
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [gameState, chickX, timeLeft, containerSize.h]);

  return (
    <div className="bug-game-container" ref={containerRef}>
      <div className="game-hud">
        <div className="hud-item">SCORE: <span>{score}</span></div>
        <div className="hud-item">TIME: <span>{timeLeft}</span>s</div>
      </div>

      <img 
        src="/chick.png"
        className="game-chick" 
        style={{ left: chickX, bottom: '40px' }} 
        alt="삐약이"
      />

      {words.map(word => (
        <div 
          key={word.id} 
          className="falling-word" 
          style={{ left: word.x, top: word.y }}
        >
          {word.text}
        </div>
      ))}

      {gameState === 'READY' && (
        <div className="game-overlay">
          <div className="game-modal">
            <h1>🐛 벌레 잡는 삐약이</h1>
            <p>방향키로 삐약이를 움직여 <strong>버그 코드</strong>만 골라 드세요!</p>
            <button onClick={startGame}>게임 시작 삐약!</button>
          </div>
        </div>
      )}

      {gameState === 'OVER' && (
        <div className="game-overlay">
          <div className="game-modal">
            <h1>🌳 사냥 결과 🌳</h1>
            <p className="final-score">최종 점수: {score}점</p>
            <button onClick={startGame}>다시 도전</button>
            <button onClick={() => navigate('/minigame')}>메인으로</button>
          </div>
        </div>
      )}
    </div>
  );
}