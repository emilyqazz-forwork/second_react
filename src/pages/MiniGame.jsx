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
    return <Jump onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'bugs') {
    return <BugGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'stairs') {
    return <StairGame onBack={() => setSelectedGame(null)} />;
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