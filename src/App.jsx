import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalNav } from './components/GlobalNav';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Note } from './pages/Note';
import { Pattern } from './pages/Pattern';
import { Result } from './pages/Result';
import { useI18n } from './state/i18n';
import { MiniGame } from './pages/MiniGame';

function App() {
  const { t, params, setParams } = useI18n();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <BrowserRouter>
      <GlobalNav 
        onOpenSettings={() => setShowSettings(true)} 
        onOpenAuth={() => setShowAuth(true)} 
        t={t}
      />
      
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} t={t} />}
      {showSettings && <GlobalSettingsModal onClose={() => setShowSettings(false)} t={t} params={params} setParams={setParams} />}

      <Routes>
        <Route path="/" element={<Home t={t} />} />
        <Route path="/play" element={<Play t={t} />} />
        <Route path="/note" element={<Note t={t} />} />
        <Route path="/pattern" element={<Pattern t={t} />} />
        <Route path="/result" element={<Result t={t} />} />
        <Route path="/minigame" element={<MiniGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
