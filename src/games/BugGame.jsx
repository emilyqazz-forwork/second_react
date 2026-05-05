import React, { useState, useEffect, useRef } from 'react';
import './BugGame.css';

export default function BugGame() {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(window.innerHeight);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [chickX, setChickX] = useState(window.innerWidth / 2);
  const [gameState, setGameState] = useState('READY');
  const [words, setWords] = useState([]);

  const WORD_W = 200;
  const WORD_H = 40;
  const CHICK_W = 110;
  const CHICK_H = 110;
  const CHICK_BOTTOM = 40;

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

  useEffect(() => {
    sfxSuccess.current = new Audio('/audio/correct.mp3');
    sfxFail.current = new Audio('/audio/Miss.mp3');
    return () => {
      if (sfxSuccess.current) { sfxSuccess.current.pause(); sfxSuccess.current.src = ""; }
      if (sfxFail.current) { sfxFail.current.pause(); sfxFail.current.src = ""; }
    };
  }, []);

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
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
    const update = () => setContainerH(el.getBoundingClientRect().height || window.innerHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING') return;
      const step = 50;
      if (e.key === 'ArrowLeft') setChickX(prev => Math.max(55, prev - step));
      if (e.key === 'ArrowRight') setChickX(prev => Math.min(window.innerWidth - 55, prev + step));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    const spawnInterval = setInterval(() => {
      const data = wordPool[Math.floor(Math.random() * wordPool.length)];
      const safeX = Math.max(0, window.innerWidth - 250);
      setWords(prev => [...prev, {
        id: Math.random(), ...data,
        x: Math.random() * safeX,
        y: 60, speed: 1.5 + Math.random() * 2, isCaught: false
      }]);
    }, 1000);
    return () => { clearInterval(timer); clearInterval(spawnInterval); };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (timeLeft === 0) setGameState('OVER');
    const moveInterval = setInterval(() => {
      setWords(prevWords => {
        const nextWords = [];
        const chickBottom = containerH - CHICK_BOTTOM;
        const chickTop = chickBottom - CHICK_H;
        const chickLeft = chickX - CHICK_W / 2;
        const chickRight = chickX + CHICK_W / 2;
        const headBand = 18;
        for (let word of prevWords) {
          if (word.isCaught) continue;
          const nextY = word.y + word.speed;
          const isHit = (
            nextY + WORD_H >= chickTop && nextY + WORD_H <= chickTop + headBand &&
            word.x + WORD_W > chickLeft && word.x < chickRight
          );
          if (isHit) {
            if (word.isBug) { setScore(s => s + 10); playSound(sfxSuccess); }
            else { setScore(s => Math.max(0, s - 5)); playSound(sfxFail); }
            continue;
          }
          if (nextY < window.innerHeight) nextWords.push({ ...word, y: nextY });
        }
        return nextWords;
      });
    }, 20);
    return () => clearInterval(moveInterval);
  }, [gameState, chickX, timeLeft, containerH]);

  return (
    <div
      ref={containerRef}
      className="bug-game-container"
      style={{
        backgroundImage: "url('/images/게임배경.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="game-hud">
        <div className="hud-item">SCORE: <span>{score}</span></div>
        <div className="hud-item">TIME: <span>{timeLeft}</span>s</div>
      </div>

      <img
        src="/images/chick.png"
        className="game-chick"
        style={{ left: chickX, bottom: '40px' }}
        alt="삐약이"
      />

      {words.map(word => (
        <div key={word.id} className="falling-word" style={{ left: word.x, top: word.y }}>
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
          </div>
        </div>
      )}
    </div>
  );
}