// App.jsx - 앱의 최상위 컴포넌트 (모든 페이지/모달의 총괄 관리자)

import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 페이지 라우팅 (URL에 따라 페이지 전환)
import { GlobalNav } from './components/GlobalNav'; // 전역 네브바
import { GlobalSettingsModal } from './components/GlobalSettingsModal'; // 설정 모달
import { AuthModal } from './components/AuthModal'; // 로그인/회원가입 모달
import { Play } from './pages/Play';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';    
import { Note } from './pages/Note';
import { Pattern } from './pages/Pattern';
import { Result } from './pages/Result';
import { useI18n } from './state/i18n'; // 다국어 처리 훅
import { MiniGame } from './pages/MiniGame';

//사용자가 설정을 바꾸거나 로그인을 시도할 때 이 상태값들이 변화하며 화면을 업데이트한다. 
function App() {
  const { t, params, setParams } = useI18n(); // t = 번역 함수, params = 언어 설정값
  
  // 모달 열림/닫힘 상태 관리 (true면 화면에 표시)
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <BrowserRouter> {/* 전체 앱을 라우터로 감쌈 */}

      {/* 네브바: 모든 페이지에서 항상 표시
          onOpenSettings - 설정 모달 열기
          onOpenAuth     - 로그인/회원가입 모달 열기 */}
      <GlobalNav 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenAuth={() => setShowAuth(true)} 
        t={t}
      />
      
      {/* 모달: 조건부 렌더링 (상태가 true일 때만 표시) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} t={t} />}
      {showSettings && <GlobalSettingsModal onClose={() => setShowSettings(false)} t={t} params={params} setParams={setParams} />}

      {/* 페이지 라우팅: URL 경로에 따라 다른 컴포넌트 렌더링 */}
      <Routes>
        <Route path="/"         element={<Home t={t} />} />
        <Route path="/play"     element={<Play t={t} />} />
        <Route path="/quiz"     element={<Quiz t={t} />} />     {/* pages/Quiz.jsx */}
        <Route path="/note"     element={<Note t={t} />} />
        <Route path="/pattern"  element={<Pattern t={t} />} />
        <Route path="/result"   element={<Result t={t} />} />
        <Route path="/minigame" element={<MiniGame />} />       {/* t 미전달 - 다국어 미적용 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;