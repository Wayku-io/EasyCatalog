import React, { useState, useRef, useEffect } from 'react';
import { Layers, Settings, Coffee, GitBranch, Smartphone, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Header({ onOpenSettings, onGoHub, currentRepo, onOpenMobile }) {
  const { t, language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
    { code: 'pt', label: 'PT', flag: '🇵🇹', name: 'Português' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="brand" onClick={onGoHub} title={t('backToHub')}>
        <div className="brand-icon">
          <Layers size={20} color="#ffffff" />
        </div>
        <div className="brand-title">
          Easy<span>Catalog</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Desktop-only repo or connect badge */}
        {currentRepo ? (
          <div
            className="btn btn-secondary desktop-only"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
            title={`${t('connectedRepo')} ${currentRepo}`}
          >
            <GitBranch size={13} color="var(--accent-light)" />
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentRepo}</span>
          </div>
        ) : (
          <button
            onClick={onOpenSettings}
            className="btn btn-secondary desktop-only"
            style={{
              fontSize: '0.8rem',
              padding: '0.4rem 0.75rem',
              gap: '0.4rem',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: 'var(--emerald)'
            }}
            title="Se connecter avec GitHub"
          >
            <svg height="14" width="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span>Connexion GitHub</span>
          </button>
        )}

        {/* Custom Sleek Language Selector with Flags */}
        <div ref={langDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="btn btn-secondary"
            style={{
              padding: '0.4rem 0.65rem',
              fontSize: '0.85rem',
              minHeight: '38px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title={t('languageLabel')}
          >
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <ChevronDown
              size={13}
              style={{
                opacity: 0.7,
                transform: isLangOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          {isLangOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--panel-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              zIndex: 1100,
              boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
              minWidth: '135px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: language === l.code ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: language === l.code ? 'var(--accent-light)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.825rem',
                    fontWeight: language === l.code ? 700 : 500,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    if (language !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (language !== l.code) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
                  <span style={{ flex: 1 }}>{l.name}</span>
                  {language === l.code && <Check size={13} color="var(--accent-light)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop-only Coffee button */}
        <a
          href="https://buymeacoffee.com/wayku"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-coffee desktop-only"
          style={{ fontSize: '0.85rem', minHeight: '38px', padding: '0.45rem 0.85rem' }}
        >
          <Coffee size={15} />
          <span>{t('coffee')}</span>
        </a>

        {/* Desktop-only Mobile QR button */}
        <button
          onClick={onOpenMobile}
          className="btn btn-secondary desktop-only"
          style={{ fontSize: '0.85rem', minHeight: '38px', padding: '0.45rem 0.85rem' }}
          title="Tester sur iPhone / mobile"
        >
          <Smartphone size={15} color="var(--cyan)" />
          <span>Mobile</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary btn-icon-only"
          style={{ minHeight: '38px', width: '38px' }}
          title={t('settings')}
          aria-label={t('settings')}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
