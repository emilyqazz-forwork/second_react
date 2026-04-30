import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function GlobalNav({ onOpenSettings, onOpenAuth, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <button 
        id="globalMenuBtn" 
        className="global-menu-btn" 
        title="Menu"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        style={{ display: location.pathname === '/play' ? 'none' : 'block' }}
      >
        ☰
      </button>

      {location.pathname !== '/play' && (
        <nav className={`main-nav ${menuOpen ? 'show' : ''}`} id="globalNav" ref={navRef}>
          <div className="nav-logo"><Link style={{color:'inherit', textDecoration:'none'}} to="/">{t('nav_logo')}</Link></div>
          <ul className="nav-links">
            <li><Link to="/">{t('nav_home')}</Link></li>
            <li><Link to="/play">{t('nav_play')}</Link></li>
            <li><Link to="/note">{t('nav_note')}</Link></li>
            <li><Link to="/pattern">{t('nav_pattern') || "패턴분석"}</Link></li>
            <li><Link to="/minigame">{t('nav_minigame')}</Link></li>
          </ul>
        </nav>
      )}

      {location.pathname !== '/play' && (
        <div className="top-control-layer">
          <div className="top-right-controls">
            <button id="globalSettingsBtn" className="settings-btn" title="Settings" onClick={onOpenSettings}>⚙️</button>
            <img src="/images/login.png" alt="Login" id="loginBtn" className="login-btn" title="Login" onClick={onOpenAuth} />
          </div>
        </div>
      )}
    </>
  );
}
