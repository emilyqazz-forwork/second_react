import React, { useState, useEffect } from 'react';
import { getRandomProblem } from '../data/stairProblems';
import './QuizPopup.css';

export const QuizPopup = ({ onResult }) => {
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        setProblem(getRandomProblem());
    }, []);

    const handleAnswer = (index) => {
        if (index === problem.answer) {
            onResult(true);
        } else {
            onResult(false);
        }
    };

    if (!problem) return null;

    return (
        <div className="quiz-overlay">
            <div className="quiz-container">
                <h2>코딩 퀴즈!</h2>
                <p className="quiz-question">{problem.question}</p>
                <div className="quiz-options">
                    {problem.options.map((option, index) => (
                        <button 
                            key={index} 
                            className="quiz-button"
                            onClick={() => handleAnswer(index)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
