import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AuthModal({ onClose, t }) {
  const [tab, setTab] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [regId, setRegId] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [loginMsg, setLoginMsg] = useState({ text: '', success: false });
  const [registerMsg, setRegisterMsg] = useState({ text: '', success: false });

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId, password: loginPw })
      });
      const data = await res.json();
      if (data.success) {
        setLoginMsg({ text: data.message, success: true });
        localStorage.setItem('chickode_user', JSON.stringify({ username: loginId, nickname: data.nickname }));
        setTimeout(() => { onClose(); window.location.reload(); }, 800);
      } else {
        setLoginMsg({ text: data.message, success: false });
      }
    } catch {
      setLoginMsg({ text: '서버 오류!', success: false });
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regId, password: regPw, nickname: regNickname })
      });
      const data = await res.json();
      if (data.success) {
        setRegisterMsg({ text: data.message, success: true });
        setTimeout(() => setTab('login'), 1000);
      } else {
        setRegisterMsg({ text: data.message, success: false });
      }
    } catch {
      setRegisterMsg({ text: '서버 오류!', success: false });
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ width: '420px', textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>로그인</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>회원가입</button>
        </div>

        {tab === 'login' && (
          <div className="auth-form">
            <h2 className="modal-header">🐥 로그인</h2>
            <input type="text" className="setting-input" placeholder="아이디" value={loginId} onChange={e => setLoginId(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />
            <input type="password" className="setting-input" placeholder="비밀번호" value={loginPw} onChange={e => setLoginPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ width: '100%', marginBottom: '16px' }} />
            <button className="clay-submit" onClick={handleLogin} style={{ width: '100%' }}>로그인</button>
            {loginMsg.text && <p className="auth-msg" style={{ color: loginMsg.success ? '#55ff55' : '#ff5555' }}>{loginMsg.text}</p>}
          </div>
        )}

        {tab === 'register' && (
          <div className="auth-form">
            <h2 className="modal-header">🐣 회원가입</h2>
            <input type="text" className="setting-input" placeholder="아이디 (3자 이상)" value={regId} onChange={e => setRegId(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />
            <input type="password" className="setting-input" placeholder="비밀번호 (4자 이상)" value={regPw} onChange={e => setRegPw(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />
            <input type="text" className="setting-input" placeholder="닉네임" value={regNickname} onChange={e => setRegNickname(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />
            <button className="clay-submit" onClick={handleRegister} style={{ width: '100%' }}>가입하기</button>
            {registerMsg.text && <p className="auth-msg" style={{ color: registerMsg.success ? '#55ff55' : '#ff5555' }}>{registerMsg.text}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
