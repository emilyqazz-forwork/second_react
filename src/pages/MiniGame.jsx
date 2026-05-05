import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiniGame as Jump } from '../games/Jump';
import BugGame from '../games/BugGame';
import StairGame from '../games/StairGame';
import './MiniGame.css';

const GAMES = [
  {
    id: 'jump',
    emoji: '🐥',
    title: '자바 퀴즈 러너',
    desc: '장애물을 피하며 자바 퀴즈 풀기!',
    ready: true,
  },
  {
    id: 'bugs',
    emoji: '🪲',
    title: '벌레 잡는 삐약이',
    desc: '버그 코드만 골라 드세요!',
    ready: true,
  },
  {
    id: 'stairs',
    emoji: '🪜',
    title: '무한 계단오르기',
    desc: '얼마나 높이 올라갈 수 있을까?',
    ready: true,
  },
];

export function MiniGame() {
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  if (selectedGame === 'jump') {
    return (
      <div className="game-wrapper">
        <button className="back-btn" onClick={() => setSelectedGame(null)}>
          ← 돌아가기
        </button>
        <Jump />
      </div>
    );
  }

  if (selectedGame === 'bugs') {
    return (
      <div className="game-wrapper">
        <style>{`
          .buggame-stage { position: fixed; inset: 0; background: url('/images/게임배경.png') center / cover no-repeat; overflow: hidden; display: flex; justify-content: center; padding: 16px; }
          .buggame-shell { width: 100%; max-width: 980px; height: 100%; position: relative; }
          .buggame-back { position: absolute; top: 14px; left: 14px; z-index: 2000; padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.15); background: rgba(255,255,255,0.85); color: #111; font-weight: 900; cursor: pointer; backdrop-filter: blur(6px); }
          .buggame-back:hover { background: rgba(255,255,255,0.95); }
          .bug-game-container { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; }
          .game-hud { position: absolute; top: 0; left: 0; width: 100%; height: 60px; background: rgba(0,0,0,0.55); color: #fff; display: flex; justify-content: space-around; align-items: center; font-weight: 900; z-index: 100; }
          .game-chick { position: absolute; width: 110px; height: 110px; transform: translateX(-50%); z-index: 50; }
          .falling-word { position: absolute; padding: 10px 18px; border-radius: 999px; background: rgba(255,255,255,0.92); border: 1px solid rgba(0,0,0,0.18); font-weight: 900; white-space: nowrap; }
          .game-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .game-modal { background: rgba(255,255,255,0.95); padding: 26px; border-radius: 16px; text-align: center; max-width: min(520px, calc(100vw - 32px)); }
          .game-modal button { padding: 12px 18px; border-radius: 10px; border: 0; background: #111; color: #fff; font-weight: 900; cursor: pointer; }
          body { overflow: hidden; }
        `}</style>
        <div className="buggame-stage">
          <div className="buggame-shell">
            <button type="button" className="buggame-back" onClick={() => setSelectedGame(null)}>
              ← 돌아가기
            </button>
            <BugGame />
          </div>
        </div>
      </div>
    );
  }

  if (selectedGame === 'stairs') {
    return (
      <div className="game-wrapper">
        <button className="back-btn" onClick={() => setSelectedGame(null)}>
          ← 돌아가기
        </button>
        <StairGame />
      </div>
    );
  }

  return (
    <div className="minigame-container">
      <button className="back-btn" onClick={() => navigate('/')} style={{ alignSelf: 'flex-start' }}>
        ← 돌아가기
      </button>
      <h2 className="minigame-title">🎮 미니게임</h2>
      <div className="game-cards">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`game-card ${!game.ready ? 'coming-soon' : ''}`}
            onClick={() => game.ready && setSelectedGame(game.id)}
          >
            <div className="card-emoji">{game.emoji}</div>
            <h3>{game.title}</h3>
            <p>{game.desc}</p>
            {!game.ready && <span className="coming-badge">준비중 🐣</span>}
          </div>
        ))}
      </div>
    </div>
  );
}