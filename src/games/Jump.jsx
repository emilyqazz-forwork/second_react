import { useEffect, useRef, useState } from 'react';

const W = 960;
const H = 340;
const GY = 185;
const GRAVITY = 0.85;
const JUMP_V = -14;
const DBL_V = -12;
const MAX_LIVES = 3;

const STAGE_QUIZZES = [
  [
    { code: 'System.out.println(1 + 2);', opts: ['1', '2', '3', '12'], ans: '3' },
    { code: 'System.out.println(10 - 4);', opts: ['4', '6', '14', '40'], ans: '6' },
    { code: 'System.out.println(3 * 4);', opts: ['7', '12', '34', '43'], ans: '12' },
    { code: 'System.out.println(9 / 3);', opts: ['3', '3.0', '6', '27'], ans: '3' },
    { code: 'System.out.println(2 + 4 * 3);', opts: ['18', '14', '20', 'Error'], ans: '14' },
  ],
  [
    { code: 'int x = 5;\nSystem.out.println(x + 3);', opts: ['53', '8', '5+3', 'Error'], ans: '8' },
    { code: 'String s = "Hi";\nSystem.out.println(s + s + s);', opts: ['Hi3', 'HiHiHi', 'Hi Hi Hi', 'Error'], ans: 'HiHiHi' },
    { code: 'System.out.println("hello".length());', opts: ['4', '5', '6', 'hello'], ans: '5' },
    { code: 'String s = "abc";\nSystem.out.println(s.charAt(1));', opts: ['a', 'b', 'c', '1'], ans: 'b' },
    { code: 'System.out.println("py" + "thon");', opts: ['py thon', 'python', 'pyython', 'Error'], ans: 'python' },
  ],
  [
    { code: 'int x = 10;\nif (x > 5) {\n  System.out.println("big");\n} else {\n  System.out.println("small");\n}', opts: ['big', 'small', '10', 'Error'], ans: 'big' },
    { code: 'System.out.println(5 == 5.0);', opts: ['true', 'false', '5', 'Error'], ans: 'true' },
    { code: 'int x = 3;\nSystem.out.println(x % 2 == 0);', opts: ['true', 'false', '1', 'Error'], ans: 'false' },
    { code: 'int a = 3, b = 5;\nSystem.out.println(Math.max(a, b));', opts: ['3', '5', '8', 'Error'], ans: '5' },
    { code: 'System.out.println(10 != 10);', opts: ['true', 'false', '0', 'Error'], ans: 'false' },
  ],
  [
    { code: 'int s = 0;\nfor (int i = 0; i < 4; i++) {\n  s += i;\n}\nSystem.out.println(s);', opts: ['4', '6', '10', '3'], ans: '6' },
    { code: 'int x = 1;\nwhile (x < 4) {\n  x *= 2;\n}\nSystem.out.println(x);', opts: ['4', '8', '2', '6'], ans: '4' },
    { code: 'int[] arr = {1, 2, 3};\nSystem.out.println(arr.length);', opts: ['2', '3', '6', 'Error'], ans: '3' },
    { code: 'for (int i = 2; i < 6; i += 2) {\n  System.out.print(i);\n}', opts: ['24', '246', '2 4', 'Error'], ans: '24' },
    { code: 'String s = "";\nfor (char c : "abc".toCharArray()) {\n  s = c + s;\n}\nSystem.out.println(s);', opts: ['abc', 'cba', 'bca', 'Error'], ans: 'cba' },
  ],
  [
    { code: 'int[] a = {3, 1, 2};\njava.util.Arrays.sort(a);\nSystem.out.println(a[0]);', opts: ['3', '1', '2', 'Error'], ans: '1' },
    { code: 'java.util.ArrayList<Integer> list = new java.util.ArrayList<>();\nlist.add(1);\nlist.add(2);\nSystem.out.println(list.size());', opts: ['1', '2', '3', 'Error'], ans: '2' },
    { code: 'java.util.HashMap<String, Integer> m = new java.util.HashMap<>();\nm.put("x", 10);\nSystem.out.println(m.get("x") + 5);', opts: ['10', '5', '15', 'Error'], ans: '15' },
    { code: 'String[] arr = {"a", "b", "c"};\nSystem.out.println(arr[2]);', opts: ['a', 'b', 'c', '2'], ans: 'c' },
    { code: 'System.out.println("Java".substring(1, 3));', opts: ['Ja', 'av', 'ava', 'Error'], ans: 'av' },
  ],
  [
    { code: 'static int f(int x) {\n  return x * 2;\n}\nSystem.out.println(f(4));', opts: ['4', '8', '2', 'Error'], ans: '8' },
    { code: 'static int add(int a, int b) {\n  return a + b;\n}\nSystem.out.println(add(2, 3));', opts: ['2', '3', '5', 'Error'], ans: '5' },
    { code: 'static int f(int n) {\n  if (n <= 1) return 1;\n  return n * f(n - 1);\n}\nSystem.out.println(f(4));', opts: ['4', '12', '24', 'Error'], ans: '24' },
    { code: 'int[] a = {1, 2, 3, 4};\nint sum = 0;\nfor (int v : a) if (v % 2 == 0) sum += v;\nSystem.out.println(sum);', opts: ['4', '6', '10', 'Error'], ans: '6' },
    { code: 'System.out.println(Math.pow(2, 10));', opts: ['20', '512', '1024.0', 'Error'], ans: '1024.0' },
  ],
  [
    { code: 'class A {\n  int x = 5;\n}\nA a = new A();\nSystem.out.println(a.x);', opts: ['A', '5', 'x', 'Error'], ans: '5' },
    { code: 'class C {\n  int v;\n  C(int v) { this.v = v; }\n  int get() { return v * 2; }\n}\nSystem.out.println(new C(3).get());', opts: ['3', '6', '9', 'Error'], ans: '6' },
    { code: 'class P {\n  String hi() { return "parent"; }\n}\nclass C extends P {}\nSystem.out.println(new C().hi());', opts: ['parent', 'child', 'Error', 'null'], ans: 'parent' },
    { code: 'class A {\n  static int cnt = 0;\n  A() { cnt++; }\n}\nnew A(); new A(); new A();\nSystem.out.println(A.cnt);', opts: ['0', '1', '3', 'Error'], ans: '3' },
    { code: 'class Box {\n  private int v = 7;\n  int get() { return v; }\n}\nSystem.out.println(new Box().get());', opts: ['0', '7', 'private', 'Error'], ans: '7' },
  ],
  [
    { code: 'try {\n  System.out.println(1 / 0);\n} catch (ArithmeticException e) {\n  System.out.println("zero");\n}', opts: ['0', '1', 'zero', 'Error'], ans: 'zero' },
    { code: 'int[] a = {1, 2, 3};\ntry {\n  System.out.println(a[5]);\n} catch (ArrayIndexOutOfBoundsException e) {\n  System.out.println(a.length);\n}', opts: ['5', '3', 'Error', 'null'], ans: '3' },
    { code: 'java.util.List<Integer> list = java.util.List.of(1, 2, 3);\nSystem.out.println(list.stream().mapToInt(i -> i * i).sum());', opts: ['6', '9', '14', 'Error'], ans: '14' },
    { code: 'java.util.Optional<String> s = java.util.Optional.of("Java");\nSystem.out.println(s.orElse("None"));', opts: ['Java', 'None', 'true', 'Error'], ans: 'Java' },
    { code: 'System.out.println(Integer.parseInt("12") + 3);', opts: ['123', '15', '12', 'Error'], ans: '15' },
  ],
  [
    { code: 'static int fib(int n) {\n  int a = 0, b = 1;\n  for (int i = 0; i < n; i++) {\n    int t = a + b;\n    a = b;\n    b = t;\n  }\n  return a;\n}\nSystem.out.println(fib(7));', opts: ['8', '13', '21', 'Error'], ans: '13' },
    { code: 'int[][] a = {{1, 2}, {3, 4}, {5, 6}};\nint count = 0;\nfor (int[] row : a)\n  for (int v : row)\n    if (v % 2 == 0) count++;\nSystem.out.println(count);', opts: ['2', '3', '6', 'Error'], ans: '3' },
    { code: 'java.util.function.Function<Integer, Integer> sq = x -> x * x;\nSystem.out.println(sq.apply(5));', opts: ['10', '25', '52', 'Error'], ans: '25' },
    { code: 'java.util.Deque<Integer> stack = new java.util.ArrayDeque<>();\nstack.push(1); stack.push(2); stack.push(3);\nSystem.out.println(stack.pop());', opts: ['1', '2', '3', 'Error'], ans: '3' },
    { code: 'java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\\\d+");\njava.util.regex.Matcher m = p.matcher("a1b22c333");\nint count = 0;\nwhile (m.find()) count++;\nSystem.out.println(count);', opts: ['3', '6', '1', 'Error'], ans: '3' },
  ],
];

const STAGES = [
  { name: 'STAGE 1', bg: ['#e8f4e8', '#c8e6c8'], ground: '#7cb87c', accent: '#5a9b5a', speed: 3.8, color: '#5a9b5a', stageLen: 1600, gap: 250, dark: false },
  { name: 'STAGE 2', bg: ['#e8eef8', '#c0d4f0'], ground: '#6688cc', accent: '#4466aa', speed: 5, color: '#4466aa', stageLen: 1800, gap: 220, dark: false },
  { name: 'STAGE 3', bg: ['#f8f0e0', '#f0d8b0'], ground: '#c8944a', accent: '#a07030', speed: 6.1, color: '#c8944a', stageLen: 2000, gap: 190, dark: false },
  { name: 'STAGE 4', bg: ['#f0e8f8', '#d8c0f0'], ground: '#9966cc', accent: '#7744aa', speed: 7.2, color: '#9966cc', stageLen: 2200, gap: 170, dark: false },
  { name: 'STAGE 5', bg: ['#f8e8e8', '#f0c0c0'], ground: '#cc5555', accent: '#aa3333', speed: 8.4, color: '#cc5555', stageLen: 2400, gap: 150, dark: false },
  { name: 'STAGE 6', bg: ['#e0f0f8', '#b0d8f0'], ground: '#3399bb', accent: '#1177aa', speed: 9.6, color: '#3399bb', stageLen: 2600, gap: 135, dark: false },
  { name: 'STAGE 7', bg: ['#1a1a2e', '#16213e'], ground: '#e94560', accent: '#c73652', speed: 10.8, color: '#e94560', stageLen: 2800, gap: 122, dark: true },
  { name: 'STAGE 8', bg: ['#0a0a0a', '#111111'], ground: '#ff6600', accent: '#dd4400', speed: 12, color: '#ff6600', stageLen: 3000, gap: 112, dark: true },
  { name: 'STAGE 9', bg: ['#000000', '#0a000a'], ground: '#ff00ff', accent: '#cc00cc', speed: 13.5, color: '#ff44ff', stageLen: 3400, gap: 102, dark: true },
];

function roundedRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function emptyQuizState() {
  return { visible: false, code: '', opts: [], feedback: '', feedbackColor: '', locked: false };
}

export function MiniGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastUiStateRef = useRef(null);
  const answerQuizRef = useRef(null);
  const gameRef = useRef({
    stageIdx: 0, state: 'idle', dist: 0, bgOffset: 0, lives: MAX_LIVES,
    obstacles: [], sparkles: [], deathFlash: 0, stageComplete: false,
    quizActive: false, currentQuiz: null, currentObs: null,
    bird: { x: 80, y: GY, vy: 0, onGround: true, canDouble: true, dead: false, legPhase: 0 },
  });
  const [uiState, setUiState] = useState({ stage: 'STAGE 1', prog: 0, lives: MAX_LIVES, color: '#5a9b5a' });
  const [quizState, setQuizState] = useState(emptyQuizState);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    function getStage() { return STAGES[Math.min(g.stageIdx, STAGES.length - 1)]; }
    function getQuizPool() { return STAGE_QUIZZES[Math.min(g.stageIdx, STAGE_QUIZZES.length - 1)]; }

    function syncUi(nextState) {
      const prev = lastUiStateRef.current;
      if (prev && prev.stage === nextState.stage && prev.prog === nextState.prog && prev.lives === nextState.lives && prev.color === nextState.color) return;
      lastUiStateRef.current = nextState;
      setUiState(nextState);
    }

    function spawnSparkles(x, y) {
      const s = getStage();
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 4;
        g.sparkles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col: s.color });
      }
    }

    function genObstacles() {
      const s = getStage(); const pool = getQuizPool();
      const obstacles = []; let ox = 420; let i = 0;
      while (ox < s.stageLen) {
        const quiz = pool[i % pool.length];
        const h = 40 + Math.random() * 18;
        obstacles.push({ ox, x: ox, y: GY + 36 - h, w: 46, h, quiz, passed: false });
        ox += s.gap + Math.random() * 45; i++;
      }
      g.obstacles = obstacles;
    }

    function resetGame(nextStage = false) {
      if (nextStage && g.stageIdx < STAGES.length - 1) { g.stageIdx++; }
      else if (!nextStage || g.stageIdx >= STAGES.length - 1) { g.stageIdx = 0; g.lives = MAX_LIVES; }
      g.state = 'running'; g.dist = 0; g.bgOffset = 0; g.deathFlash = 0;
      g.stageComplete = false; g.quizActive = false; g.currentQuiz = null; g.currentObs = null; g.sparkles = [];
      Object.assign(g.bird, { y: GY, vy: 0, onGround: true, canDouble: true, dead: false, legPhase: 0 });
      genObstacles();
      setQuizState(emptyQuizState());
      syncUi({ stage: getStage().name, prog: 0, lives: g.lives, color: getStage().color });
    }

    function collides(o) {
      if (o.passed) return false;
      const bx = g.bird.x + 12, by = g.bird.y + 6, bw = 20, bh = 38;
      return bx < o.x + o.w && bx + bw > o.x && by < o.y + o.h && by + bh > o.y;
    }

    function showQuiz(quiz, obstacle) {
      g.quizActive = true; g.currentQuiz = quiz; g.currentObs = obstacle;
      setQuizState({ visible: true, code: quiz.code, opts: quiz.opts, feedback: '', feedbackColor: '', locked: false });
    }

    function finishQuiz() {
      g.quizActive = false; g.currentQuiz = null; g.currentObs = null;
      setQuizState(emptyQuizState());
      syncUi({ stage: getStage().name, prog: Math.min(Math.round((g.dist / getStage().stageLen) * 100), 100), lives: g.lives, color: getStage().color });
    }

    answerQuizRef.current = (answer) => {
      if (!g.quizActive || !g.currentQuiz || !g.currentObs) return;
      const correct = answer === g.currentQuiz.ans;
      setQuizState((prev) => ({ ...prev, locked: true }));
      if (correct) {
        g.currentObs.passed = true;
        spawnSparkles(g.bird.x + 18, g.bird.y);
        syncUi({ stage: getStage().name, prog: Math.min(Math.round((g.dist / getStage().stageLen) * 100), 100), lives: g.lives, color: getStage().color });
        setQuizState((prev) => ({ ...prev, feedback: '정답! 장애물을 통과합니다.', feedbackColor: '#2e7d32' }));
        window.setTimeout(finishQuiz, 650);
        return;
      }
      g.lives = Math.max(0, g.lives - 1);
      g.deathFlash = 0.8;
      g.currentObs.passed = true;
      syncUi({ stage: getStage().name, prog: Math.min(Math.round((g.dist / getStage().stageLen) * 100), 100), lives: g.lives, color: getStage().color });
      setQuizState((prev) => ({ ...prev, feedback: `오답! 정답: ${g.currentQuiz.ans} / 목숨 -1`, feedbackColor: '#c62828' }));
      window.setTimeout(() => {
        if (g.lives <= 0) {
          g.bird.dead = true; g.state = 'dead'; g.quizActive = false; g.deathFlash = 1;
          setQuizState(emptyQuizState()); return;
        }
        finishQuiz();
      }, 900);
    };

    function drawBg(s) {
      if (s.dark) {
        ctx.fillStyle = s.bg[0]; ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 32; i++) {
          const sx = ((i * 73 + g.bgOffset * 0.12) % W + W) % W;
          const sy = (i * 37) % GY;
          const br = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255,255,255,${br * 0.45})`;
          ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, GY);
        grad.addColorStop(0, s.bg[0]); grad.addColorStop(1, s.bg[1]);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, GY);
        for (let i = 0; i < 4; i++) {
          const clx = ((i * 180 + g.bgOffset * 0.3) % W + W) % W;
          const cly = 28 + i * 15;
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.beginPath(); ctx.ellipse(clx, cly, 35, 13, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(clx - 20, cly + 5, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(clx + 22, cly + 5, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = s.ground; ctx.fillRect(0, GY + 36, W, H - GY - 36);
      ctx.strokeStyle = s.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GY + 36); ctx.lineTo(W, GY + 36); ctx.stroke();
    }

    function drawBird() {
      const { bird } = g; const bx = bird.x + 18; const by = bird.y;
      if (bird.onGround) {
        const ls = Math.sin(bird.legPhase) * 5;
        ctx.strokeStyle = '#e8b84b'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx - 6, by + 30); ctx.lineTo(bx - 6 + ls, by + 42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 4, by + 30); ctx.lineTo(bx + 4 - ls, by + 42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx - 6 + ls, by + 42); ctx.lineTo(bx - 6 + ls + 8, by + 42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 4 - ls, by + 42); ctx.lineTo(bx + 4 - ls + 8, by + 42); ctx.stroke();
      } else {
        ctx.strokeStyle = '#e8b84b'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx - 6, by + 30); ctx.lineTo(bx - 14, by + 36); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 4, by + 30); ctx.lineTo(bx + 12, by + 36); ctx.stroke();
      }
      ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.ellipse(bx, by + 20, 18, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 4, by + 4, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F5C400'; ctx.beginPath(); ctx.ellipse(bx - 8, by + 18, 10, 7, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F08000';
      ctx.beginPath(); ctx.moveTo(bx + 15, by + 5); ctx.lineTo(bx + 22, by + 7); ctx.lineTo(bx + 15, by + 9); ctx.closePath(); ctx.fill();
      if (bird.dead) {
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bx + 5, by); ctx.lineTo(bx + 9, by + 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + 9, by); ctx.lineTo(bx + 5, by + 4); ctx.stroke();
      } else {
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(bx + 8, by + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx + 9, by + 1, 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#FF6060';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(bx + 1 + i * 4 - 4, by - 8 + (i === 1 ? -2 : 0), 3, 0, Math.PI * 2); ctx.fill(); }
    }

    function drawObstacle(o, s) {
      if (o.passed) return;
      const col = s.dark ? s.color : '#4466cc';
      ctx.fillStyle = s.dark ? `${col}99` : `${col}dd`;
      ctx.beginPath(); roundedRect(ctx, o.x, o.y, o.w, o.h, 7); ctx.fill();
      ctx.strokeStyle = s.dark ? s.color : 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); roundedRect(ctx, o.x, o.y, o.w, o.h, 7); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
      ctx.fillText('🪨', o.x + o.w / 2, o.y + o.h / 2 + 6);
    }

    function drawProgressBar(s) {
      const pct = Math.min(g.dist / s.stageLen, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); roundedRect(ctx, W - 120, 10, 110, 8, 4); ctx.fill();
      ctx.fillStyle = s.color; ctx.beginPath(); roundedRect(ctx, W - 120, 10, 110 * pct, 8, 4); ctx.fill();
      ctx.fillStyle = s.dark ? '#fff' : '#333'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(s.name, W - 10, 9);
    }

    function drawOverlay(s) {
      const tc = s.dark ? '#fff' : '#333';
      const sc = s.dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)';
      if (g.state === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = tc; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('CHICKODE JAVA RUNNER', W / 2, H / 2 - 24);
        ctx.font = '13px sans-serif'; ctx.fillStyle = sc;
        ctx.fillText('장애물에 부딪히면 자바 퀴즈! 정답이면 통과, 오답이면 목숨 -1', W / 2, H / 2);
        ctx.fillStyle = s.color; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('스페이스바 / 클릭으로 시작', W / 2, H / 2 + 22);
      }
      if (g.state === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#e55'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 22);
        ctx.font = '13px sans-serif'; ctx.fillStyle = sc; ctx.fillText(`${s.name} 도달`, W / 2, H / 2 + 2);
        ctx.fillStyle = tc; ctx.fillText('스페이스바 / 클릭으로 재시작', W / 2, H / 2 + 22);
      }
      if (g.stageComplete) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = s.color; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${s.name} CLEAR!`, W / 2, H / 2 - 18);
        ctx.font = '13px sans-serif'; ctx.fillStyle = tc;
        if (g.stageIdx >= STAGES.length - 1) { ctx.fillText('전설의 병아리!', W / 2, H / 2 + 10); }
        else { ctx.fillText(`목숨 ${g.lives}개 유지 - 클릭으로 다음 스테이지`, W / 2, H / 2 + 10); }
      }
      if (g.deathFlash > 0) {
        ctx.fillStyle = `rgba(255,80,80,${g.deathFlash * 0.35})`; ctx.fillRect(0, 0, W, H);
        g.deathFlash -= 0.08;
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      const s = getStage();
      if (g.state === 'running' && !g.stageComplete && !g.quizActive) {
        g.dist += s.speed; g.bgOffset += s.speed;
        g.obstacles.forEach((o) => { o.x = o.ox - g.dist; });
        const { bird } = g;
        bird.vy += GRAVITY; bird.y += bird.vy;
        if (bird.y >= GY) { bird.y = GY; bird.vy = 0; bird.onGround = true; bird.canDouble = true; }
        if (bird.onGround) bird.legPhase += 0.35;
        for (const o of g.obstacles) {
          if (!o.passed && o.x > -60 && o.x < 170 && collides(o)) { showQuiz(o.quiz, o); break; }
        }
        if (g.dist >= s.stageLen) { g.stageComplete = true; spawnSparkles(W / 2, H / 2); spawnSparkles(g.bird.x + 18, g.bird.y); }
        const pct = Math.min(Math.round((g.dist / s.stageLen) * 100), 100);
        syncUi({ stage: s.name, prog: pct, lives: g.lives, color: s.color });
      }
      drawBg(s);
      g.obstacles.forEach((o) => { if (o.x > -80 && o.x < W + 20) drawObstacle(o, s); });
      g.sparkles = g.sparkles.filter((sp) => sp.life > 0);
      g.sparkles.forEach((sp) => { sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.12; sp.life -= 0.04; });
      ctx.save();
      g.sparkles.forEach((sp) => { ctx.globalAlpha = sp.life; ctx.fillStyle = sp.col; ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.restore();
      drawBird(); drawProgressBar(s); drawOverlay(s);
      rafRef.current = requestAnimationFrame(loop);
    }

    function action() {
      if (g.quizActive) return;
      if (g.state === 'idle' || g.state === 'dead') { resetGame(false); return; }
      if (g.stageComplete) { resetGame(g.stageIdx < STAGES.length - 1); return; }
      const { bird } = g;
      if (bird.onGround) { bird.vy = JUMP_V; bird.onGround = false; bird.canDouble = true; }
      else if (bird.canDouble) { bird.vy = DBL_V; bird.canDouble = false; }
    }

    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); action(); } };
    const onClick = () => action();
    const onTouch = (e) => { e.preventDefault(); action(); };

    document.addEventListener('keydown', onKey);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    genObstacles();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, []);

  const lifeText = '♥'.repeat(uiState.lives) + '♡'.repeat(MAX_LIVES - uiState.lives);
  const lifeColor = uiState.lives === 1 ? '#e53935' : uiState.lives === 2 ? '#f57c00' : '#2e7d32';

  return (
    <div style={{ fontFamily: 'Noto Sans KR, sans-serif', maxWidth: 980, margin: '40px auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 12, fontSize: 20, fontWeight: 900 }}>자바 퀴즈 미니게임</h2>

      {/* 캔버스 + 퀴즈 오버레이를 감싸는 relative 컨테이너 */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: 'block', width: '100%', borderRadius: 12, border: '1px solid #e0e0e0', cursor: 'pointer' }}
        />

        {/* 퀴즈 오버레이 - 캔버스 위에 반투명하게 */}
        {quizState.visible && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(6px)',
            borderRadius: '0 0 12px 12px',
            padding: '14px 18px',
            borderTop: '1px solid rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 900 }}>
              이 Java 코드의 출력 결과는?
            </div>
            <pre style={{
              fontFamily: 'Consolas, monospace',
              fontSize: 13,
              background: 'rgba(255,255,255,0.9)',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              color: '#333',
              lineHeight: 1.6,
              margin: '0 0 12px 0',
              whiteSpace: 'pre-wrap',
            }}>
              {quizState.code}
            </pre>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {quizState.opts.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={quizState.locked}
                  onClick={() => answerQuizRef.current?.(option)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    border: '1px solid #bbb',
                    background: quizState.locked ? '#eee' : '#fff',
                    color: '#333',
                    fontSize: 12,
                    cursor: quizState.locked ? 'default' : 'pointer',
                    fontFamily: 'Consolas, monospace',
                    fontWeight: 900,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizState.feedback && (
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 900, color: quizState.feedbackColor }}>
                {quizState.feedback}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 2px 0' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 900, padding: '2px 10px', borderRadius: 20, background: `${uiState.color}33`, color: uiState.color }}>
            {uiState.stage}
          </span>
          <span style={{ fontSize: 12, color: '#666', fontWeight: 800 }}>
            진행: <b style={{ color: '#333' }}>{uiState.prog}%</b>
          </span>
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#666', fontWeight: 800 }}>
            목숨: <b style={{ color: lifeColor }}>{lifeText}</b>
          </span>
        </div>
      </div>
    </div>
  );
}