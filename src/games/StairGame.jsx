import { useEffect, useRef, useState } from 'react';

const W = 400;
const H = 600;
const GRAVITY = 0.5;
const JUMP_V = -13;
const PLATFORM_W = 80;
const PLATFORM_H = 15;

const QUIZ_POOL = [
  { q: 'System.out.println(1 + 2); 결과는?', opts: ['1', '2', '3', '12'], ans: '3' },
  { q: 'String s = "Hi"; s.length() 결과는?', opts: ['1', '2', '3', '4'], ans: '2' },
  { q: 'for(int i=0;i<3;i++) 반복 횟수는?', opts: ['2', '3', '4', '0'], ans: '3' },
  { q: 'System.out.println(10 % 3) 결과는?', opts: ['1', '2', '3', '0'], ans: '1' },
  { q: 'int[] arr = new int[5]; arr.length는?', opts: ['4', '5', '6', '0'], ans: '5' },
  { q: 'System.out.println(2 * 4); 결과는?', opts: ['6', '8', '24', '42'], ans: '8' },
  { q: '"hello".charAt(1) 결과는?', opts: ['h', 'e', 'l', 'o'], ans: 'e' },
  { q: 'System.out.println(10 / 3); 결과는?', opts: ['3', '3.3', '4', '2'], ans: '3' },
  { q: 'int x=5; x+=3; x의 값은?', opts: ['5', '3', '8', '15'], ans: '8' },
  { q: 'System.out.println(true && false); 결과는?', opts: ['true', 'false', 'null', 'error'], ans: 'false' },
];

function generatePlatforms() {
  const platforms = [];
  platforms.push({ x: W / 2 - PLATFORM_W / 2, y: H - 50, id: 0 });
  for (let i = 1; i < 20; i++) {
    platforms.push({
      x: Math.random() * (W - PLATFORM_W),
      y: H - 50 - i * 100,
      id: i,
    });
  }
  return platforms;
}

export default function StairGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({
    bird: { x: W / 2, y: H - 80, vy: 0 },
    platforms: generatePlatforms(),
    cameraY: 0,
    score: 0,
    highestId: 0,
    lastQuizScore: 0,
    keys: { left: false, right: false },
    phase: 'idle', // idle | playing | quiz | gameover
    nextPlatformId: 20,
    highestPlatformY: H - 50 - 19 * 100,
  });
  const [uiPhase, setUiPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = stateRef.current;

    const onKey = (e) => {
      if (e.type === 'keydown') {
        if (e.code === 'ArrowLeft') g.keys.left = true;
        if (e.code === 'ArrowRight') g.keys.right = true;
        if (e.code === 'Space' && g.phase === 'idle') startGame();
      }
      if (e.type === 'keyup') {
        if (e.code === 'ArrowLeft') g.keys.left = false;
        if (e.code === 'ArrowRight') g.keys.right = false;
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    function startGame() {
      Object.assign(g, {
        bird: { x: W / 2, y: H - 80, vy: JUMP_V },
        platforms: generatePlatforms(),
        cameraY: 0,
        score: 0,
        highestId: 0,
        lastQuizScore: 0,
        phase: 'playing',
        nextPlatformId: 20,
        highestPlatformY: H - 50 - 19 * 100,
      });
      setScore(0);
      setUiPhase('playing');
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);

      // 배경
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, W, H);

      if (g.phase === 'playing') {
        const bird = g.bird;

        // 중력
        bird.vy += GRAVITY;
        bird.y += bird.vy;

        // 좌우 이동
        if (g.keys.left) bird.x -= 4;
        if (g.keys.right) bird.x += 4;

        // 화면 좌우 wrap
        if (bird.x < 0) bird.x = W;
        if (bird.x > W) bird.x = 0;

        // 카메라 따라가기 (올라갈 때만)
        const birdScreenY = bird.y - g.cameraY;
        if (birdScreenY < H * 0.4) {
          g.cameraY = bird.y - H * 0.4;
        }

        // 플랫폼 충돌
        for (const p of g.platforms) {
          const screenY = p.y - g.cameraY;
          if (
            bird.vy > 0 &&
            bird.y + 20 >= p.y &&
            bird.y + 20 <= p.y + PLATFORM_H + bird.vy + 2 &&
            bird.x + 10 > p.x &&
            bird.x - 10 < p.x + PLATFORM_W
          ) {
            bird.vy = JUMP_V;
            bird.y = p.y - 20;

            if (p.id > g.highestId) {
              g.highestId = p.id;
              g.score = p.id;
              setScore(p.id);

              // 10계단마다 퀴즈
              if (g.score >= g.lastQuizScore + 10) {
                g.lastQuizScore = g.score;
                g.phase = 'quiz';
                setUiPhase('quiz');
                const q = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
                setQuiz(q);
              }
            }
          }
        }

        // 새 플랫폼 생성
        if (g.highestPlatformY > g.cameraY - 200) {
          g.highestPlatformY -= 100;
          g.platforms.push({
            x: Math.random() * (W - PLATFORM_W),
            y: g.highestPlatformY,
            id: g.nextPlatformId++,
          });
        }

        // 오래된 플랫폼 제거
        g.platforms = g.platforms.filter(p => p.y < g.cameraY + H + 100);

        // 게임오버 (화면 아래로 떨어짐)
        if (bird.y - g.cameraY > H + 50) {
          g.phase = 'gameover';
          setUiPhase('gameover');
        }
      }

      // 플랫폼 그리기
      ctx.fillStyle = '#ffffff';
      for (const p of g.platforms) {
        const screenY = p.y - g.cameraY;
        if (screenY > -20 && screenY < H + 20) {
          ctx.beginPath();
          ctx.roundRect(p.x, screenY, PLATFORM_W, PLATFORM_H, 4);
          ctx.fill();
          ctx.strokeStyle = '#aaa';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 병아리 그리기
      const birdScreenY = g.bird.y - g.cameraY;
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐥', g.bird.x, birdScreenY);

      // idle 화면
      if (g.phase === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('무한 계단오르기', W / 2, H / 2 - 30);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('스페이스바 / 클릭으로 시작', W / 2, H / 2 + 10);
      }

      // gameover 화면
      if (g.phase === 'gameover') {
        ctx.fillStyle = 'rgba(200,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', W / 2, H / 2 - 20);
        ctx.font = '16px sans-serif';
        ctx.fillText(`올라간 계단: ${g.score}`, W / 2, H / 2 + 15);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('클릭으로 재시작', W / 2, H / 2 + 45);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    canvas.addEventListener('click', () => {
      if (g.phase === 'idle' || g.phase === 'gameover') {
        Object.assign(g, {
          bird: { x: W / 2, y: H - 80, vy: JUMP_V },
          platforms: generatePlatforms(),
          cameraY: 0,
          score: 0,
          highestId: 0,
          lastQuizScore: 0,
          phase: 'playing',
          nextPlatformId: 20,
          highestPlatformY: H - 50 - 19 * 100,
        });
        setScore(0);
        setUiPhase('playing');
      }
    });

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
    };
  }, []);

  const handleAnswer = (opt) => {
    const g = stateRef.current;
    if (opt === quiz.ans) {
      g.phase = 'playing';
      setUiPhase('playing');
      setQuiz(null);
    } else {
      g.phase = 'gameover';
      setUiPhase('gameover');
      setQuiz(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <div style={{ width: W, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: '#5c3d1e', fontWeight: 'bold' }}>
          🪜 무한 계단오르기
        </span>
        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#5c3d1e' }}>
          계단: {score}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', borderRadius: 12, border: '2px solid #e0d0b0', cursor: 'pointer' }}
        />

        {/* 퀴즈 오버레이 */}
        {uiPhase === 'quiz' && quiz && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', borderRadius: 12,
          }}>
            <div style={{
              background: 'white', padding: '28px 24px', borderRadius: 16,
              textAlign: 'center', width: 320,
            }}>
              <p style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
                🪜 계단 퀴즈! {quiz.q}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {quiz.opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    style={{
                      padding: '8px 18px', borderRadius: 8, border: '1px solid #ccc',
                      background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}