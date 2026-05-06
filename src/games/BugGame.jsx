import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const W = 1200;
const H = 700;
const MAX_MISS = 5;
const MAX_FALLING_WORDS = 3;
const SPAWN_INTERVAL_FRAMES = 48;

const STAGE_CONFIG = [
  { stage: 1, duration: 20, speed: [0.85, 1.15], label: 'STAGE 1' },
  { stage: 2, duration: 20, speed: [2.5, 3.2], label: 'STAGE 2' },
  { stage: 3, duration: 20, speed: [3.5, 4.5], label: 'STAGE 3' },
];

const STAGE_WORDS = {
  1: [
    { text: 'Sistem.out.println("Hi");', isBug: true },
    { text: 'System.out.println("Hi");', isBug: false },
    { text: 'int x = 10', isBug: true },
    { text: 'int x = 10;', isBug: false },
    { text: "String s = 'Java';", isBug: true },
    { text: 'String s = "Java";', isBug: false },
    { text: 'pubic static void main', isBug: true },
    { text: 'public static void main', isBug: false },
    { text: 'retun result;', isBug: true },
    { text: 'return result;', isBug: false },
    { text: 'while true {', isBug: true },
    { text: 'while (true) {', isBug: false },
  ],
  2: [
    { text: 'Arraylist<String> list;', isBug: true },
    { text: 'ArrayList<String> list;', isBug: false },
    { text: 'for(int i=0; i<10; i--)', isBug: true },
    { text: 'for(int i=0; i<10; i++)', isBug: false },
    { text: 'Boolean flag = True;', isBug: true },
    { text: 'boolean flag = true;', isBug: false },
    { text: 'if x > 0 {', isBug: true },
    { text: 'if (x > 0) {', isBug: false },
    { text: 'system.out.println(x);', isBug: true },
    { text: 'System.out.println(x);', isBug: false },
    { text: 'Class Dog {', isBug: true },
    { text: 'class Dog {', isBug: false },
  ],
  3: [
    { text: 'int[] arr = new int();', isBug: true },
    { text: 'int[] arr = new int[5];', isBug: false },
    { text: 'Double d = 3.14', isBug: true },
    { text: 'double d = 3.14;', isBug: false },
    { text: 'void sayHello( {', isBug: true },
    { text: 'void sayHello() {', isBug: false },
    { text: 'static Int count = 0;', isBug: true },
    { text: 'static int count = 0;', isBug: false },
    { text: 'new scanner(System.in)', isBug: true },
    { text: 'new Scanner(System.in)', isBug: false },
    { text: 'throws NullPointerexception', isBug: true },
    { text: 'throws NullPointerException', isBug: false },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BugGame({ onBack }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const chickImgRef = useRef(null);
  const navigate = useNavigate();
  const stateRef = useRef({
    phase: 'idle',
    chick: { x: W / 2, y: H - 80 },
    words: [],
    score: 0,
    miss: 0,
    stageIdx: 0,
    timeLeft: 20,
    keys: { left: false, right: false },
    pool: [],
    poolIndex: 0,
    spawnTimer: 0,
    timerInterval: null,
    nextId: 0,
    flashTimer: 0,
    stageTransition: 0,
  });
  const [uiScore, setUiScore] = useState(0);
  const [uiTime, setUiTime] = useState(20);
  const [uiMiss, setUiMiss] = useState(0);
  const [uiStage, setUiStage] = useState(1);
  const [uiPhase, setUiPhase] = useState('idle');

  useEffect(() => {
    const topControl = document.querySelector('.top-control-layer');
    const menuBtn = document.querySelector('.global-menu-btn');
    if (topControl) topControl.style.display = 'none';
    if (menuBtn) menuBtn.style.display = 'none';
    return () => {
      if (topControl) topControl.style.display = '';
      if (menuBtn) menuBtn.style.display = '';
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = stateRef.current;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(dpr, dpr);

    const chickImg = new Image();
    chickImg.src = '/images/gamechick.png';
    chickImgRef.current = chickImg;

    function startStage(idx) {
      g.stageIdx = idx;
      g.timeLeft = STAGE_CONFIG[idx].duration;
      g.words = [];
      g.spawnTimer = 0;
      g.pool = shuffle(STAGE_WORDS[idx + 1]);
      g.poolIndex = 0;
      setUiStage(idx + 1);
      setUiTime(STAGE_CONFIG[idx].duration);

      if (g.timerInterval) clearInterval(g.timerInterval);
      g.timerInterval = setInterval(() => {
        g.timeLeft -= 1;
        setUiTime(g.timeLeft);
        if (g.timeLeft <= 0) {
          clearInterval(g.timerInterval);
          if (g.stageIdx < STAGE_CONFIG.length - 1) {
            g.phase = 'stageclear';
            g.stageTransition = 120;
          } else {
            g.phase = 'gameover';
            setUiPhase('gameover');
          }
        }
      }, 1000);
    }

    function resetState() {
      if (g.timerInterval) clearInterval(g.timerInterval);
      g.phase = 'playing';
      g.chick = { x: W / 2, y: H - 80 };
      g.score = 0;
      g.miss = 0;
      g.flashTimer = 0;
      g.stageTransition = 0;
      setUiScore(0);
      setUiMiss(0);
      setUiPhase('playing');
      startStage(0);
    }

    function spawnWord() {
      if (g.words.length >= MAX_FALLING_WORDS) return;
      if (g.poolIndex >= g.pool.length) {
        g.pool = shuffle(STAGE_WORDS[g.stageIdx + 1]);
        g.poolIndex = 0;
      }
      const item = g.pool[g.poolIndex++];
      const cfg = STAGE_CONFIG[g.stageIdx];
      const speed = cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]);
      g.words.push({
        id: g.nextId++,
        text: item.text,
        isBug: item.isBug,
        x: 100 + Math.random() * (W - 200),
        y: -30,
        speed,
      });
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
      ctx.clearRect(0, 0, W, H);

      const bgColors = [
        ['#e8f4e8', '#c8e6c8'],
        ['#e8eef8', '#c0d4f0'],
        ['#f8e8e8', '#f0c0c0'],
      ];
      const bg = bgColors[stateRef.current.stageIdx] || bgColors[0];
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bg[0]);
      grad.addColorStop(1, bg[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const groundColors = ['#7cb87c', '#6688cc', '#cc5555'];
      ctx.fillStyle = groundColors[stateRef.current.stageIdx] || groundColors[0];
      ctx.fillRect(0, H - 50, W, 50);

      if (g.phase === 'playing') {
        if (g.keys.left) g.chick.x = Math.max(50, g.chick.x - 8);
        if (g.keys.right) g.chick.x = Math.min(W - 50, g.chick.x + 8);

        g.spawnTimer++;
        if (g.spawnTimer > SPAWN_INTERVAL_FRAMES) {
          g.spawnTimer = 0;
          spawnWord();
        }

        const remaining = [];
        for (const w of g.words) {
          w.y += w.speed;

          const hit =
            Math.abs(w.x - g.chick.x) < 90 &&
            Math.abs(w.y - g.chick.y) < 45;

          if (hit) {
            if (w.isBug) {
              g.score += 10;
            } else {
              g.miss += 1;
              g.flashTimer = 20;
              setUiMiss(g.miss);
              if (g.miss >= MAX_MISS) {
                clearInterval(g.timerInterval);
                g.phase = 'gameover';
                setUiPhase('gameover');
              }
            }
            setUiScore(g.score);
            continue;
          }

          if (w.y < H + 20) {
            remaining.push(w);
          } else {
            if (w.isBug) {
              g.miss += 1;
              g.flashTimer = 20;
              setUiMiss(g.miss);
              if (g.miss >= MAX_MISS) {
                clearInterval(g.timerInterval);
                g.phase = 'gameover';
                setUiPhase('gameover');
              }
            }
          }
        }
        g.words = remaining;
      }

      if (g.phase === 'stageclear') {
        g.stageTransition--;
        if (g.stageTransition <= 0) {
          g.phase = 'playing';
          startStage(g.stageIdx + 1);
        }
      }

      ctx.font = `bold ${g.stageIdx === 2 ? 12 : 14}px monospace`;
      for (const w of g.words) {
        const tw = ctx.measureText(w.text).width + 28;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.beginPath();
        ctx.roundRect(w.x - tw / 2, w.y - 16, tw, 32, 16);
        ctx.fill();
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#3e2723';
        ctx.textAlign = 'center';
        ctx.fillText(w.text, w.x, w.y + 5);
      }

      const img = chickImgRef.current;
      if (img && img.complete && img.naturalWidth) {
        ctx.drawImage(img, g.chick.x - 40, g.chick.y - 40, 80, 80);
      } else {
        ctx.font = '48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐥', g.chick.x, g.chick.y + 10);
      }

      if (g.flashTimer > 0) {
        ctx.fillStyle = `rgba(255,0,0,${g.flashTimer / 20 * 0.45})`;
        ctx.fillRect(0, 0, W, H);
        g.flashTimer--;
      }

      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.beginPath();
      ctx.roundRect(14, 14, 220, 90, 14);
      ctx.fill();
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#3e2723';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`STAGE ${g.stageIdx + 1}  점수: ${g.score}`, 28, 40);
      ctx.fillStyle = g.timeLeft <= 5 ? '#e53935' : '#3e2723';
      ctx.fillText(`시간: ${g.timeLeft}초`, 28, 64);
      ctx.fillStyle = g.miss >= 3 ? '#e53935' : '#3e2723';
      const hearts = '❤️'.repeat(MAX_MISS - g.miss) + '🖤'.repeat(g.miss);
      ctx.fillText(`목숨: ${hearts}`, 28, 88);

      if (g.phase === 'stageclear') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`STAGE ${g.stageIdx + 1} CLEAR! 🎉`, W / 2, H / 2 - 20);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('다음 스테이지 준비중...', W / 2, H / 2 + 20);
      }

      if (g.phase === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪲 벌레 잡는 삐약이', W / 2, H / 2 - 60);
        ctx.font = '18px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('버그 코드만 먹어요! 정상 코드는 피하세요!', W / 2, H / 2 - 20);
        ctx.fillText('총 3단계 | 버그 5개 놓치거나 정상 코드 먹으면 목숨 -1', W / 2, H / 2 + 10);
        ctx.fillText('← → 방향키 / 스페이스바 또는 클릭으로 시작', W / 2, H / 2 + 40);
      }

      if (g.phase === 'gameover') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        const cleared = g.stageIdx === STAGE_CONFIG.length - 1 && g.timeLeft <= 0
          ? '🎉 전체 클리어!' : `STAGE ${g.stageIdx + 1} 실패`;
        ctx.fillText(cleared, W / 2, H / 2 - 40);
        ctx.font = '22px sans-serif';
        ctx.fillText(`최종 점수: ${g.score}점`, W / 2, H / 2 + 5);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('클릭 / 스페이스바로 다시 시작', W / 2, H / 2 + 45);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (g.timerInterval) clearInterval(g.timerInterval);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKey);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#000',
      zIndex: 500,
    }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      />
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
    </div>
  );
}