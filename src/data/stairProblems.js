export const problems = [
  {
    id: 1,
    question: "React에서 상태를 관리하기 위해 사용하는 Hook은?",
    options: ["useContext", "useEffect", "useState", "useReducer"],
    answer: 2 // 0-indexed, so 2 corresponds to "useState"
  },
  {
    id: 2,
    question: "JavaScript에서 변수 선언 키워드가 아닌 것은?",
    options: ["var", "let", "const", "def"],
    answer: 3
  },
  {
    id: 3,
    question: "Phaser.js에서 게임 설정 객체에 전달하는 속성이 아닌 것은?",
    options: ["type", "physics", "scene", "component"],
    answer: 3
  },
  {
    id: 4,
    question: "React 컴포넌트의 생명주기 중 마운트 직후에 호출되는 Hook은?",
    options: ["useEffect", "useMemo", "useCallback", "useRef"],
    answer: 0
  },
  {
    id: 5,
    question: "배열의 마지막 요소를 제거하는 JavaScript 메서드는?",
    options: ["push", "pop", "shift", "unshift"],
    answer: 1
  }
];

// Helper to get a random problem
export const getRandomProblem = () => {
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
};
