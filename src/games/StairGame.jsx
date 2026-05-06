import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const W = 600;
const H = 450;
const GRAVITY = 0.38;
const JUMP_V = -11;
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
  let y = H - 50;
  platforms.push({ x: 100, y, id: 0 });
  for (let i = 1; i < 20; i++) {
    y -= 40 + Math.random() * 10;
    platforms.push({
      x: Math.random() * (W - PLATFORM_W),
      y,
      id: i,
    });
  }
  return platforms;
}

export default function StairGame({ onBack }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const chickImgRef = useRef(null);
  const navigate = useNavigate();
  const initialPlatforms = generatePlatforms();
  const stateRef = useRef({
    bird: { x: 100, y: H - 80, vy: 0 },
    platforms: initialPlatforms,
    cameraY: 0,
    score: 0,
    highestId: 0,
    lastQuizScore: 0,
    keys: { left: false, right: false },
    phase: 'idle',
    nextPlatformId: 20,
    highestPlatformY: initialPlatforms[initialPlatforms.length - 1].y,
    rainDrops: null,
    stars: null,
  });
  const [uiPhase, setUiPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const topControl = document.querySelector('.top-control-layer');
    const menuBtn = document.querySelector('.global-menu-btn');
    const prevOverflow = document.body.style.overflow;
    if (topControl) topControl.style.display = 'none';
    if (menuBtn) menuBtn.style.display = 'none';
    document.body.style.overflow = 'hidden';
    return () => {
      if (topControl) topControl.style.display = '';
      if (menuBtn) menuBtn.style.display = '';
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = stateRef.current;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const LETTERBOX = '#6eb6e8';
    let lastDw = -1;
    let lastDh = -1;
    function applyCanvasTransform() {
      const dpr = window.devicePixelRatio || 1;
      const dw = Math.max(1, canvas.clientWidth);
      const dh = Math.max(1, canvas.clientHeight);
      if (dw !== lastDw || dh !== lastDh) {
        lastDw = dw;
        lastDh = dh;
        canvas.width = Math.floor(dw * dpr);
        canvas.height = Math.floor(dh * dpr);
      }
      const scale = Math.min(dw / W, dh / H);
      const drawW = W * scale;
      const drawH = H * scale;
      const ox = (dw - drawW) / 2;
      const oy = (dh - drawH) / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = LETTERBOX;
      ctx.fillRect(0, 0, dw, dh);
      ctx.imageSmoothingEnabled = true;
      if (typeof ctx.imageSmoothingQuality === 'string') ctx.imageSmoothingQuality = 'high';
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
    }

    const chickImg = new Image();
    chickImg.src = '/images/gamechick.png';
    chickImgRef.current = chickImg;

    function resetState() {
      const platforms = generatePlatforms();
      Object.assign(g, {
        bird: { x: 100, y: H - 80, vy: JUMP_V },
        platforms,
        cameraY: 0,
        score: 0,
        highestId: 0,
        lastQuizScore: 0,
        phase: 'playing',
        nextPlatformId: 20,
        highestPlatformY: platforms[platforms.length - 1].y,
      });
      setScore(0);
      setUiPhase('playing');
    }

    const onKey = (e) => {
      if (e.type === 'keydown') {
        if (e.code === 'ArrowLeft') g.keys.left = true;
        if (e.code === 'ArrowRight') g.keys.right = true;
        if (e.code === 'Space' && (g.phase === 'idle' || g.phase === 'gameover')) resetState();
      }
      if (e.type === 'keyup') {
        if (e.code === 'ArrowLeft') g.keys.left = false;
        if (e.code === 'ArrowRight') g.keys.right = false;
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    canvas.addEventListener('click', () => {
      if (g.phase === 'idle' || g.phase === 'gameover') resetState();
    });

    function loop() {
      applyCanvasTransform();
      ctx.clearRect(0, 0, W, H);

      // 배경 - 높이에 따라 변화
      function drawBackground() {
        const altitude = -g.cameraY; // 높이 (위로 갈수록 증가)

        // 배경 단계 정의
        const stages = [
          { alt: 0, top: '#4a7c4e', bot: '#6aaf6e' },
          { alt: 900, top: '#87CEEB', bot: '#c8e6f8' },
          { alt: 2400, top: '#8a9bb0', bot: '#b0bec5' },
          { alt: 4500, top: '#ff8c42', bot: '#ffcc80' },
          { alt: 7500, top: '#1a1a4e', bot: '#3d2b6b' },
          { alt: 12000, top: '#000000', bot: '#0a0a1a' },
          { alt: 18000, top: '#000005', bot: '#00000a' }, // 깊은 우주
          { alt: 25000, top: '#000000', bot: '#000000' }, // 완전한 암흑
        ];

        // 현재 단계 찾기
        let stageIdx = 0;
        for (let i = 0; i < stages.length - 1; i++) {
          if (altitude >= stages[i].alt) stageIdx = i;
        }
        const next = Math.min(stageIdx + 1, stages.length - 1);
        const cur = stages[stageIdx];
        const nxt = stages[next];

        // 단계 간 보간
        const range = stages[next].alt - stages[stageIdx].alt || 1;
        const t = Math.min((altitude - stages[stageIdx].alt) / range, 1);

        function lerpColor(c1, c2, t) {
          const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
          const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
          const r = Math.round(r1 + (r2 - r1) * t);
          const gg = Math.round(g1 + (g2 - g1) * t);
          const b = Math.round(b1 + (b2 - b1) * t);
          return `rgb(${r},${gg},${b})`;
        }

        const topColor = lerpColor(cur.top, nxt.top, t);
        const botColor = lerpColor(cur.bot, nxt.bot, t);

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 비 효과
        if (altitude > 2100 && altitude < 4800) {
          const rainOpacity = altitude < 2400 ? (altitude - 2100) / 300
            : altitude > 4500 ? (4800 - altitude) / 300 : 1;
          if (!g.rainDrops) {
            g.rainDrops = Array.from({ length: 80 }, () => ({
              x: Math.random() * W,
              y: Math.random() * H,
              speed: 6 + Math.random() * 4,
              len: 12 + Math.random() * 8,
            }));
          }
          ctx.strokeStyle = `rgba(174,194,224,${rainOpacity * 0.6})`;
          ctx.lineWidth = 1;
          for (const d of g.rainDrops) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - 2, d.y + d.len);
            ctx.stroke();
            d.y += d.speed;
            if (d.y > H) { d.y = -20; d.x = Math.random() * W; }
          }
        } else {
          g.rainDrops = null;
        }

        // 별 효과 (밤하늘~우주)
        if (altitude > 6000) {
          const starOpacity = Math.min((altitude - 6000) / 1500, 1);
          if (!g.stars) {
            g.stars = Array.from({ length: 60 }, () => ({
              x: Math.random() * W,
              y: Math.random() * H,
              r: 0.5 + Math.random() * 1.5,
              twinkle: Math.random() * Math.PI * 2,
            }));
          }
          for (const s of g.stars) {
            s.twinkle += 0.05;
            const alpha = starOpacity * (0.5 + Math.sin(s.twinkle) * 0.5);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          g.stars = null;
        }

        // 땅 (낮은 고도)
        if (altitude < 200) {
          const groundAlpha = 1 - altitude / 200;
          ctx.fillStyle = `rgba(101,163,97,${groundAlpha})`;
          ctx.fillRect(0, H - 30, W, 30);
        }
      }

      drawBackground();

      if (g.phase === 'playing') {
        const bird = g.bird;

        bird.vy += GRAVITY;
        bird.y += bird.vy;

        if (g.keys.left) bird.x -= 7;
        if (g.keys.right) bird.x += 7;

        if (bird.x < 0) bird.x = W;
        if (bird.x > W) bird.x = 0;

        // 카메라 (위로만 따라감)
        if (bird.y - g.cameraY < H * 0.3) {
          g.cameraY = bird.y - H * 0.3;
        }

        // 플랫폼 충돌
        for (const p of g.platforms) {
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
        if (g.highestPlatformY > g.cameraY - 150) {
          g.highestPlatformY -= 40 + Math.random() * 10;
          g.platforms.push({
            x: Math.random() * (W - PLATFORM_W),
            y: g.highestPlatformY,
            id: g.nextPlatformId++,
          });
        }

        // 오래된 플랫폼 제거
        g.platforms = g.platforms.filter(p => p.y < g.cameraY + H + 300);

        // 게임오버
        if (bird.y - g.cameraY > H + 90) {
          g.phase = 'gameover';
          setUiPhase('gameover');
        }
      }

      // 플랫폼 그리기
      for (const p of g.platforms) {
        const screenY = p.y - g.cameraY;
        if (screenY > -20 && screenY < H + 20) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(p.x, screenY, PLATFORM_W, PLATFORM_H, 4);
          ctx.fill();
          ctx.strokeStyle = '#aaaaaa';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 병아리
      const birdScreenY = g.bird.y - g.cameraY;
      const chickImgEl = chickImgRef.current;
      if (chickImgEl && chickImgEl.complete && chickImgEl.naturalWidth) {
        ctx.imageSmoothingEnabled = true;
        if (typeof ctx.imageSmoothingQuality === 'string') ctx.imageSmoothingQuality = 'high';
        const cw = 56;
        const ch = 56;
        ctx.drawImage(chickImgEl, g.bird.x - cw / 2, birdScreenY - ch / 2, cw, ch);
      } else {
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐥', g.bird.x, birdScreenY);
      }

      // idle
      if (g.phase === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪜 무한 계단오르기', W / 2, H / 2 - 24);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('스페이스바 / 클릭으로 시작', W / 2, H / 2 + 14);
        ctx.fillText('← → 방향키로 이동', W / 2, H / 2 + 36);
      }

      // gameover
      if (g.phase === 'gameover') {
        ctx.fillStyle = 'rgba(200,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', W / 2, H / 2 - 24);
        ctx.font = '16px sans-serif';
        ctx.fillText(`올라간 계단: ${g.score}`, W / 2, H / 2 + 10);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('클릭 / 스페이스바로 재시작', W / 2, H / 2 + 38);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

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
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 500,
      overflow: 'hidden',
      fontFamily: 'Noto Sans KR, sans-serif',
    }}>
      <button
        type="button"
        onClick={() => (onBack ? onBack() : navigate('/minigame'))}
        style={{
          position: 'absolute',
          top: 16, right: 16,
          padding: '8px 18px',
          borderRadius: 12,
          border: '2px solid #e0d0b0',
          background: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 900,
          color: '#5c3d1e',
          zIndex: 600,
        }}
      >
        ← 돌아가기
      </button>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      />
      <div style={{
        position: 'absolute',
        top: 52,
        left: 12,
        right: 12,
        zIndex: 550,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>🪜 무한 계단오르기</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>계단: {score}</span>
      </div>

      {uiPhase === 'quiz' && quiz && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 550,
            maxHeight: 'min(42vh, 380px)',
            overflow: 'auto',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            padding: '16px 20px',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
          }}>
            <p style={{ fontSize: 14, fontWeight: 900, marginBottom: 12, color: '#333' }}>
              🪜 계단 퀴즈! {quiz.q}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {quiz.opts.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    border: '1px solid #bbb', background: '#fff',
                    cursor: 'pointer', fontSize: 13, fontWeight: 900,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
      )}
    </div>
  );
}