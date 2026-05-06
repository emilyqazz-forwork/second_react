import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function GlobalNav({ onOpenSettings, onOpenAuth, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile();
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setProfile({
        username: user.user_metadata?.username || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setShowProfileMenu(false);
  }

  async function handleNameUpdate() {
    if (!newName.trim()) return;
    const { error } = await supabase.auth.updateUser({
      data: { username: newName }
    });
    if (!error) {
      setProfile(prev => ({ ...prev, username: newName }));
      setEditMode(false);
      setNewName('');
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });
      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
    }
  }

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
        style={{ display: location.pathname === '/quiz' ? 'none' : 'block' }}
      >
        ☰
      </button>

      {location.pathname !== '/quiz' && (
        <nav className={`main-nav ${menuOpen ? 'show' : ''}`} id="globalNav" ref={navRef}>
          <div className="nav-logo">
            <Link style={{ color: 'inherit', textDecoration: 'none' }} to="/">{t('nav_logo')}</Link>
          </div>
          <ul className="nav-links">
            <li><Link to="/">{t('nav_home')}</Link></li>
            <li><Link to="/quiz">문제풀기</Link></li>
            <li><Link to="/note">{t('nav_note')}</Link></li>
            <li><Link to="/pattern">{t('nav_pattern') || "패턴분석"}</Link></li>
            <li><Link to="/minigame">{t('nav_minigame')}</Link></li>
          </ul>
        </nav>
      )}

      {location.pathname !== '/quiz' && (
        <div className="top-control-layer">
          <div className="top-right-controls">
            <button id="globalSettingsBtn" className="settings-btn" title="Settings" onClick={onOpenSettings}>⚙️</button>

            {user ? (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', background: 'rgba(255,248,216,0.9)',
                    border: '3px solid #5d4037', borderRadius: 40,
                    padding: '6px 14px', boxShadow: '0 4px 0 #3e2723',
                  }}
                >
                  <img
                    src={profile?.avatar_url || '/images/chick.png'}
                    alt="프로필"
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5d4037' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 900, color: '#5d4037' }}>
                    {profile?.username || user.email?.split('@')[0] || '삐약이'}
                  </span>
                </div>

                {showProfileMenu && (
                  <div style={{
                    position: 'absolute', right: 0, top: 50,
                    background: '#fdf6e3', border: '3px solid #5d4037',
                    borderRadius: 16, padding: 20, width: 220,
                    boxShadow: '6px 6px 0 #3e2723', zIndex: 9999,
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <img
                        src={profile?.avatar_url || '/images/chick.png'}
                        alt="프로필"
                        style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '3px solid #5d4037' }}
                      />
                    </div>

                    {editMode ? (
                      <div style={{ marginBottom: 12 }}>
                        <input
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="새 이름 입력"
                          style={{
                            width: '100%', padding: '6px 10px', borderRadius: 8,
                            border: '2px solid #8d6e63', marginBottom: 6, fontSize: 13,
                          }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={handleNameUpdate}
                            style={{
                              flex: 1, padding: '6px', borderRadius: 8,
                              background: '#5d4037', color: 'white', border: 'none',
                              cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
                            }}
                          >저장</button>
                          <button
                            onClick={() => setEditMode(false)}
                            style={{
                              flex: 1, padding: '6px', borderRadius: 8,
                              background: '#e0d0b0', color: '#5d4037', border: 'none',
                              cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
                            }}
                          >취소</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditMode(true); setNewName(profile?.username || ''); }}
                        style={{
                          width: '100%', padding: '8px', borderRadius: 8, marginBottom: 8,
                          background: '#fdf6e3', border: '2px solid #8d6e63',
                          cursor: 'pointer', fontSize: 13, fontWeight: 'bold', color: '#5d4037',
                        }}
                      >✏️ 이름 변경</button>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 8,
                        background: '#ef9a9a', border: '2px solid #c62828',
                        cursor: 'pointer', fontSize: 13, fontWeight: 'bold', color: '#c62828',
                      }}
                    >🚪 로그아웃</button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={onOpenAuth}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', background: 'rgba(255,248,216,0.9)',
                  border: '3px solid #5d4037', borderRadius: 40,
                  padding: '6px 14px', boxShadow: '0 4px 0 #3e2723',
                }}
              >
                <img
                  src="/images/chick.png"
                  alt="게스트"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #5d4037' }}
                />
                <span style={{ fontSize: 13, fontWeight: 900, color: '#5d4037' }}>로그인/회원가입</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}