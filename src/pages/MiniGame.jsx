import { useState } from 'react';
import Jump from '../games/Jump';
// 나중에 추가
// import BugGame from '../games/BugGame';
// import StairGame from '../games/StairGame';
import './MiniGame.css';

export function MiniGame() {
  const [selectedGame, setSelectedGame] = useState(null);

  // 게임 선택되면 해당 게임 렌더링
  if (selectedGame === 'jump') return (
    <div>
      <button onClick={() => setSelectedGame(null)}>← 뒤로가기</button>
      <Jump />
    </div>
  );

  if (selectedGame === 'bug') return (
    <div>
      <button onClick={() => setSelectedGame(null)}>← 뒤로가기</button>
      <p>준비중입니다 🐣</p>
    </div>
  );

  if (selectedGame === 'stair') return (
    <div>
      <button onClick={() => setSelectedGame(null)}>← 뒤로가기</button>
      <p>준비중입니다 🐣</p>
    </div>
  );

  // 썸네일 화면
  return (
    <div className="minigame-container">
      <h2>🎮 미니게임</h2>
      <div className="game-cards">

        <div className="game-card" onClick={() => setSelectedGame('jump')}>
          <div className="card-emoji">🐥</div>
          <h3>자바 퀴즈 러너</h3>
          <p>장애물을 피하며 자바 퀴즈 풀기!</p>
        </div>

        <div className="game-card" onClick={() => setSelectedGame('bug')}>
          <div className="card-emoji">🪲</div>
          <h3>벌레 잡는 삐약이</h3>
          <p>버그 코드만 골라 드세요!</p>
        </div>

        <div className="game-card" onClick={() => setSelectedGame('stair')}>
          <div className="card-emoji">🪜</div>
          <h3>무한 계단오르기</h3>
          <p>얼마나 높이 올라갈 수 있을까?</p>
        </div>

      </div>
    </div>
  );
}