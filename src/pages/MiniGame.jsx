import { useState } from 'react';
import { MiniGame as Jump } from '../games/Jump';
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
    ready: false,
  },
  {
    id: 'stairs',
    emoji: '🪜',
    title: '무한 계단오르기',
    desc: '얼마나 높이 올라갈 수 있을까?',
    ready: false,
  },
];

export function MiniGame() {
  const [selectedGame, setSelectedGame] = useState(null);

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

  // 나중에 팀원 코드 받으면 여기에 추가
  // if (selectedGame === 'bugs') return ( <div><button onClick={...}>← 돌아가기</button><Bugs /></div> );
  // if (selectedGame === 'stairs') return ( <div><button onClick={...}>← 돌아가기</button><Stairs /></div> );

  return (
    <div className="minigame-container">
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