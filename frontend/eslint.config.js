// Vite로 React 프로젝트 만들면 자동으로 생성되는 파일

import js from '@eslint/js' // ESLint의 기본 권장 규칙들을 가져옵니다.
import globals from 'globals' // 브라우저 환경에서 사용하는 전역 변수(window, document 등)를 인식시키기 위해 가져옵니다.
import reactHooks from 'eslint-plugin-react-hooks' // 리액트 Hooks(useState, useEffect 등)의 올바른 사용을 체크합니다.
import reactRefresh from 'eslint-plugin-react-refresh' // Vite 환경에서 리액트 Fast Refresh가 잘 작동하도록 돕는 규칙입니다.
import { defineConfig, globalIgnores } from 'eslint/config' // 설정을 구조화하고 특정 폴더를 제외하기 위한 도구입니다.

export default defineConfig([
  // [1] 전역 무시 설정: 빌드 결과물인 dist 폴더는 검사하지 않습니다.
  globalIgnores(['dist']), 

  {
    // [2] 대상 파일 지정: 모든 .js 및 .jsx 파일을 검사 대상으로 잡습니다.
    files: ['**/*.{js,jsx}'], 

    // [3] 규칙 확장: 기본 권장 세트들을 적용합니다.
    extends: [
      js.configs.recommended, // 자바스크립트 표준 권장 규칙
      reactHooks.configs.flat.recommended, // 리액트 Hooks 권장 규칙
      reactRefresh.configs.vite, // Vite 환경 전용 규칙
    ],

    // [4] 언어 옵션 설정: 코드를 어떻게 해석할지 결정합니다.
    languageOptions: {
      ecmaVersion: 2020, // ES2020 문법까지 지원합니다.
      globals: globals.browser, // 브라우저의 전역 변수들을 에러로 처리하지 않고 허용합니다.
      parserOptions: {
        ecmaVersion: 'latest', // 최신 자바스크립트 문법 지원
        ecmaFeatures: { jsx: true }, // JSX 문법(리액트 컴포넌트)을 인식하도록 설정
        sourceType: 'module', // import/export를 사용하는 모듈 방식을 사용함을 명시
      },
    },

    // [5] 사용자 정의 규칙: 프로젝트 성향에 맞춰 규칙을 세밀하게 조정합니다.
    rules: {
      // 사용하지 않는 변수가 있으면 에러를 냅니다.
      // 단, 대문자로 시작하거나(컴포넌트 등) 언더바(_)로 시작하는 변수는 무시하도록 정규표현식 설정을 추가했습니다.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])