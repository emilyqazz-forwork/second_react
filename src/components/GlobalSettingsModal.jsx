export function GlobalSettingsModal({ onClose, t, params, setParams }) {
  const handleSave = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{params.lang === 'en' ? 'Global settings' : '설정'}</h2>
        <div className="setting-form" style={{ gap: '30px', marginTop: '30px' }}>
          <div className="setting-group" style={{ alignItems: 'center' }}>
            <label>{t('setting_theme')}</label>
            <select 
              className="setting-select" 
              style={{ width: '80%' }}
              value={params.theme}
              onChange={(e) => setParams({ ...params, theme: e.target.value })}
            >
              <option value="light">{t('theme_light')}</option>
              <option value="dark">{t('theme_dark')}</option>
            </select>
          </div>
          <div className="setting-group" style={{ alignItems: 'center' }}>
            <label>{t('setting_language')}</label>
            <select 
              className="setting-select" 
              style={{ width: '80%' }}
              value={params.lang}
              onChange={(e) => setParams({ ...params, lang: e.target.value })}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
          <button className="clay-submit" onClick={handleSave} style={{ marginTop: '10px' }}>
            {t('btn_save')}
          </button>
        </div>
      </div>
    </div>
  );
}
