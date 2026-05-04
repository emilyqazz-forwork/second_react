import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../game/PhaserGame';
import { EventBus } from '../game/EventBus';
import { QuizPopup } from '../components/QuizPopup';
import './MiniGame.css';

export const MiniGame = () => {
    const phaserRef = useRef();
    const navigate = useNavigate();

    const [score, setScore] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const handleScoreUpdate = (newScore) => {
            setScore(newScore);
        };

        const handleShowQuiz = () => {
            setShowQuiz(true);
        };

        const handleGameOver = () => {
            setGameOver(true);
        };

        EventBus.on('score-updated', handleScoreUpdate);
        EventBus.on('show-quiz', handleShowQuiz);
        EventBus.on('game-over', handleGameOver);

        return () => {
            EventBus.removeListener('score-updated', handleScoreUpdate);
            EventBus.removeListener('show-quiz', handleShowQuiz);
            EventBus.removeListener('game-over', handleGameOver);
        };
    }, []);

    const handleQuizResult = (isCorrect) => {
        if (isCorrect) {
            EventBus.emit('quiz-correct'); // 먼저 Phaser에 알리고
            setShowQuiz(false);            // 그 다음 퀴즈 숨기기
        } else {
            EventBus.emit('quiz-incorrect');
            setGameOver(true);
            setShowQuiz(false);
        }
    };

    const restartGame = () => {
        setGameOver(false);
        setScore(0);
        if (phaserRef.current && phaserRef.current.scene) {
            phaserRef.current.scene.scene.restart();
        }
    };

    return (
        <div className="minigame-container">
            <header className="game-header">
                <button onClick={() => navigate('/minigame')} className="back-btn">← Back</button>
                <div className="score-board">Stairs: {score}</div>
            </header>

            <main className="game-area">
                <PhaserGame ref={phaserRef} />
                {showQuiz && <QuizPopup onResult={handleQuizResult} />}
                {gameOver && (
                    <div className="game-over-overlay">
                        <h2>Game Over!</h2>
                        <p>Total Stairs: {score}</p>
                        <button onClick={restartGame} className="restart-btn">Play Again</button>
                    </div>
                )}
            </main>
        </div>
    );
};