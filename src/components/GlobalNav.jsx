import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============================================================
// GlobalNav: 모든 페이지 상단에 렌더링되는 전역 네비게이션 바
// props:
//   onOpenSettings - 설정 모달 열기 (App.jsx에서 전달)
//   onOpenAuth     - 로그인/회원가입 모달 열기 (App.jsx에서 전달)
//   t              - 다국어 번역 함수 (App.jsx에서 전달)
// 주의: /quiz 페이지에서는 네브바 전체가 숨겨짐
// ============================================================
export function GlobalNav({ onOpenSettings, onOpenAuth, t }) {
  const [menuOpen, setMenuOpen] = useState(false); // 햄버거 메뉴 열림/닫힘 상태
  const navRef = useRef(null);
  const location = useLocation(); // 현재 페이지 경로 감지용

  // 메뉴 바깥 클릭 시 자동으로 닫힘
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
      {/* 햄버거 메뉴 버튼 - /quiz 페이지에서는 숨김 */}
      <button 
        id="globalMenuBtn" 
        className="global-menu-btn" 
        title="Menu"
        onClick={(e) => {
          e.stopPropagation(); // 바깥 클릭 감지 이벤트와 충돌 방지
          setMenuOpen(!menuOpen);
        }}
        style={{ display: location.pathname === '/quiz' ? 'none' : 'block' }}
      >
        ☰
      </button>

      {/* 네브바 본체 - /quiz 페이지에서는 렌더링 안 함 */}
      {location.pathname !== '/quiz' && (
        <nav className={`main-nav ${menuOpen ? 'show' : ''}`} id="globalNav" ref={navRef}>
          <div className="nav-logo">
            <Link style={{color:'inherit', textDecoration:'none'}} to="/">{t('nav_logo')}</Link>
          </div>

          {/* 페이지 이동 링크 목록
              /         - 홈
              /quiz     - 코딩 게임 (네브바 숨겨짐)
              /note     - 노트
              /pattern  - 패턴 분석
              /minigame - 미니게임 */}
          <ul className="nav-links">
            <li><Link to="/">{t('nav_home')}</Link></li>
            <li><Link to="/quiz">문제풀기</Link></li>
            <li><Link to="/note">{t('nav_note')}</Link></li>
            <li><Link to="/pattern">{t('nav_pattern') || "패턴분석"}</Link></li>
            <li><Link to="/minigame">{t('nav_minigame')}</Link></li>
          </ul>
        </nav>
      )}

      {/* 우측 상단 버튼 영역 - /quiz 페이지에서는 렌더링 안 함 */}
      {location.pathname !== '/quiz' && (
        <div className="top-control-layer">
          <div className="top-right-controls">
            {/* 설정 버튼 → onOpenSettings() 호출 → App.jsx에서 설정 모달 열림 */}
            <button id="globalSettingsBtn" className="settings-btn" title="Settings" onClick={onOpenSettings}>⚙️</button>
            {/* 로그인 버튼 → onOpenAuth() 호출 → App.jsx에서 AuthModal.jsx 열림 */}
            <img src="/images/login.png" alt="Login" id="loginBtn" className="login-btn" title="Login" onClick={onOpenAuth} />
          </div>
        </div>
      )}
    </>
  );
}