import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Search,
  Package,
  ListOrdered,
  Globe,
  Shield,
  Zap,
  Tv,
  Heart,
  Coffee,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight,
  ExternalLink,
  Film,
  HelpCircle,
  Play,
  Copy,
  Trash2,
  Folder
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { landingTranslations } from '../i18n/landingTranslations';
import './LandingPage.css';

function GithubIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function LandingPage({ onLaunchApp, onOpenSettings, onOpenLegal }) {
  const { language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const langDropdownRef = useRef(null);

  const t = (key) => {
    const dict = landingTranslations[language] || landingTranslations.fr;
    return dict[key] || landingTranslations.fr[key] || key;
  };

  const mockupMoviesList = Array.isArray(t('mockupMovies')) ? t('mockupMovies') : landingTranslations.fr.mockupMovies;

  const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
    { code: 'pt', label: 'PT', flag: '🇵🇹', name: 'Português' },
    { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'it', label: 'IT', flag: '🇮🇹', name: 'Italiano' }
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="lp-container">
      {/* Aurora Ambient Background */}
      <div className="lp-aurora-bg" aria-hidden="true">
        <div className="lp-aurora-blob-1" />
        <div className="lp-aurora-blob-2" />
      </div>

      {/* Navigation Header */}
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-brand" onClick={onLaunchApp}>
            <div className="lp-brand-icon">
              <Layers size={20} color="#ffffff" />
            </div>
            <div className="lp-brand-title">
              Easy<span>Catalog</span>
            </div>
          </div>

          <nav className="lp-nav-links" style={{ display: 'flex' }}>
            <a href="#features" className="lp-nav-link max-md:hidden">
              {t('navFeatures')}
            </a>
            <a href="#how" className="lp-nav-link max-md:hidden">
              {t('navHow')}
            </a>
            <a href="#why" className="lp-nav-link max-md:hidden">
              {t('navWhy')}
            </a>
            <a href="#faq" className="lp-nav-link max-md:hidden">
              {t('navFaq')}
            </a>
          </nav>

          <div className="lp-header-actions">
            {/* Language Selector */}
            <div ref={langDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="lp-btn-secondary"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  minHeight: '38px'
                }}
                title="Langue / Language"
              >
                <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: isLangOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    opacity: 0.7
                  }}
                />
              </button>

              {isLangOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '155px',
                    background: '#0d1420',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
                    padding: '0.35rem',
                    zIndex: 110,
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        background: language === l.code ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: language === l.code ? 'var(--accent-light)' : '#ffffff',
                        fontWeight: language === l.code ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </span>
                      {language === l.code && <Check size={14} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coffee Button */}
            <a
              href="https://buymeacoffee.com/wayku"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-btn-secondary lp-btn-coffee max-sm:hidden"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', minHeight: '38px' }}
              title={t('ctaCoffee')}
            >
              <Coffee size={15} />
              <span>{t('ctaCoffee')}</span>
            </a>

            {/* Primary Action Button */}
            <button
              onClick={onLaunchApp}
              className="lp-btn-primary"
              style={{ padding: '0.5rem 1.15rem', fontSize: '0.88rem', minHeight: '38px' }}
            >
              <span>{t('openDashboard')}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero-section">
        <div className="lp-pill-badge">
          <Sparkles size={14} />
          <span>{t('heroBadge')}</span>
        </div>

        <h1 className="lp-hero-h1">
          {t('heroTitle1')} <span className="lp-aurora-text">{t('heroTitle2')}</span>
        </h1>

        <p className="lp-hero-sub">{t('heroSubtitle')}</p>

        <div className="lp-hero-ctas">
          <button onClick={onLaunchApp} className="lp-btn-primary" style={{ padding: '1rem 2.2rem', fontSize: '1.05rem' }}>
            <span>{t('launchAppCta')}</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="https://buymeacoffee.com/wayku"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-secondary lp-btn-coffee"
            style={{ padding: '1rem 1.6rem', fontSize: '1rem' }}
          >
            <Coffee size={18} />
            <span>{t('ctaCoffee')}</span>
          </a>
        </div>

        {/* Highlights Bar */}
        <div className="lp-trust-bar">
          <div className="lp-trust-item">
            <CheckCircle2 size={17} />
            <span>{t('stat1')}</span>
          </div>
          <div className="lp-trust-item">
            <Zap size={17} />
            <span>{t('stat2')}</span>
          </div>
          <div className="lp-trust-item">
            <GithubIcon size={17} />
            <span>{t('stat3')}</span>
          </div>
          <div className="lp-trust-item">
            <Film size={17} />
            <span>{t('stat4')}</span>
          </div>
        </div>

        {/* Showcase Mockup Window */}
        <div className="lp-showcase-wrapper" onClick={onLaunchApp} style={{ cursor: 'pointer' }} title={t('openDashboard')}>
          <div className="lp-mockup-window">
            <div className="lp-mockup-header">
              <div className="lp-window-dots">
                <span className="lp-dot lp-dot-red" />
                <span className="lp-dot lp-dot-yellow" />
                <span className="lp-dot lp-dot-green" />
              </div>
              <div className="lp-window-title">
                <Layers size={13} color="var(--accent)" />
                <span>{t('mockupTitle')}</span>
              </div>
              <div className="lp-col-pill" style={{ fontSize: '0.72rem' }}>
                {t('mockupSyncedPill')}
              </div>
            </div>

            <div className="lp-mockup-body">
              {/* Left Col Mockup: Collections List */}
              <div className="lp-mockup-col max-md:hidden">
                <div className="lp-mockup-col-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Folder size={14} color="var(--accent)" />
                    <span>{t('mockupCol1Title')}</span>
                  </span>
                  <span className="lp-col-pill">{t('mockupCol1Count')}</span>
                </div>

                {/* Superpack AIO Metadata Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(5, 150, 105, 0.12))',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.78rem', color: '#fff' }}>
                      <Package size={13} color="var(--accent-light)" />
                      <span>{t('mockupCol1Superpack')}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.25)', color: 'var(--accent-light)', fontWeight: 700 }}>AIO</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <div style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.35)',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      color: 'var(--accent-light)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      cdn.jsdelivr.net/gh/mon-compte/aio-catalogs@v1.4...
                    </div>
                    <div style={{ width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Copy size={11} />
                    </div>
                  </div>
                </div>

                {/* Collections List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.15rem' }}>
                  {/* Harry Potter (Active) */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.12)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff' }}>
                        {t('mockupCol1Item1')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-light)', marginTop: '1px' }}>
                        {t('mockupCol1Sub1')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.3)', borderRadius: '4px', color: '#fff', fontWeight: 700 }}>{t('mockupActiveBadge')}</span>
                      <Copy size={12} color="var(--accent-light)" />
                    </div>
                  </div>

                  {/* Retour vers le futur */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t('mockupCol1Item2')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {t('mockupCol1Sub2')}
                      </div>
                    </div>
                    <Copy size={12} color="var(--text-muted)" />
                  </div>

                  {/* Seigneur des Anneaux */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t('mockupCol1Item3')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {t('mockupCol1Sub3')}
                      </div>
                    </div>
                    <Copy size={12} color="var(--text-muted)" />
                  </div>
                </div>
              </div>

              {/* Center Col Mockup (Search TMDB) */}
              <div className="lp-mockup-col" style={{ flex: 1 }}>
                <div className="lp-mockup-col-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Search size={14} color="var(--accent)" />
                    <span>{t('mockupCol2Title')}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-light)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Film size={11} /> {t('mockupFilterMovies')}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Tv size={11} /> {t('mockupFilterSeries')}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.82rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Search size={14} color="var(--accent)" />
                  <span style={{ fontWeight: 600 }}>Harry Potter</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.65rem',
                    marginTop: '0.35rem'
                  }}
                >
                  {mockupMoviesList.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        position: 'relative',
                        aspectRatio: '2/3',
                        background: '#151c2c',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
                      }}
                    >
                      <img
                        src={m.img}
                        alt={m.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '5px',
                          left: '5px',
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontWeight: 700
                        }}
                      >
                        {t('mockupBadgeTypeFilm')}
                      </span>
                      <span
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: 'rgba(16, 185, 129, 0.85)',
                          color: '#fff',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Check size={9} /> {t('mockupBadgeAdded')}
                      </span>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '6px 7px',
                          background: 'linear-gradient(0deg, rgba(7, 10, 18, 0.98) 0%, rgba(7, 10, 18, 0.8) 75%, transparent 100%)',
                          fontSize: '0.68rem',
                          color: '#fff'
                        }}
                      >
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          lineHeight: 1.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {m.title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>{m.year}</span>
                          <span style={{ color: '#fbbf24', fontWeight: 600 }}>★ {m.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col Mockup (Builder) */}
              <div className="lp-mockup-col max-md:hidden">
                <div className="lp-mockup-col-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={13} color="var(--accent)" />
                    <span>{t('mockupCol3Title')}</span>
                  </span>
                  <span className="lp-col-pill">{t('mockupCol3Count')}</span>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Harry Potter</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-light)', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>{t('mockupCol3TypeTag')}</span>
                </div>

                <div
                  style={{
                    fontSize: '0.73rem',
                    color: 'var(--accent-light)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ListOrdered size={12} />
                  <span>{t('mockupSort')}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                  {mockupMoviesList.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.4rem 0.5rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      <span style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700, minWidth: '18px' }}>#{i + 1}</span>
                      <img
                        src={item.img}
                        alt={item.title}
                        style={{ width: '22px', height: '32px', objectFit: 'cover', borderRadius: '3px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.year}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={14} />
                  <span>{t('mockupPublishBtn')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Before vs After) */}
      <section className="lp-section" id="comparison">
        <div className="lp-section-header">
          <span className="lp-section-tag">{t('compTag')}</span>
          <h2 className="lp-section-title">{t('compTitle')}</h2>
          <p className="lp-section-sub">{t('compSubtitle')}</p>
        </div>

        <div className="lp-comparison-grid">
          {/* Before Card */}
          <div className="lp-card-before">
            <span className="lp-comp-badge lp-comp-badge-danger">{t('beforeBadge')}</span>
            <h3 className="lp-card-h3" style={{ fontSize: '1.25rem', marginTop: '0.65rem' }}>
              {t('beforeTitle')}
            </h3>
            <p className="lp-card-p" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {t('beforeDesc')}
            </p>

            <ul className="lp-checklist">
              <li className="lp-checklist-item">
                <XCircle size={16} color="#ef4444" />
                <span>{t('beforeP1')}</span>
              </li>
              <li className="lp-checklist-item">
                <XCircle size={16} color="#ef4444" />
                <span>{t('beforeP2')}</span>
              </li>
              <li className="lp-checklist-item">
                <XCircle size={16} color="#ef4444" />
                <span>{t('beforeP3')}</span>
              </li>
              <li className="lp-checklist-item">
                <XCircle size={16} color="#ef4444" />
                <span>{t('beforeP4')}</span>
              </li>
            </ul>
          </div>

          {/* After Card */}
          <div className="lp-card-after">
            <span className="lp-comp-badge lp-comp-badge-success">{t('afterBadge')}</span>
            <h3 className="lp-card-h3" style={{ fontSize: '1.25rem', marginTop: '0.65rem' }}>
              {t('afterTitle')}
            </h3>
            <p className="lp-card-p" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {t('afterDesc')}
            </p>

            <ul className="lp-checklist">
              <li className="lp-checklist-item">
                <CheckCircle2 size={16} color="var(--accent)" />
                <span>{t('afterP1')}</span>
              </li>
              <li className="lp-checklist-item">
                <CheckCircle2 size={16} color="var(--accent)" />
                <span>{t('afterP2')}</span>
              </li>
              <li className="lp-checklist-item">
                <CheckCircle2 size={16} color="var(--accent)" />
                <span>{t('afterP3')}</span>
              </li>
              <li className="lp-checklist-item">
                <CheckCircle2 size={16} color="var(--accent)" />
                <span>{t('afterP4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="lp-section" id="features">
        <div className="lp-section-header">
          <span className="lp-section-tag">{t('featTag')}</span>
          <h2 className="lp-section-title">{t('featTitle')}</h2>
          <p className="lp-section-sub">{t('featSubtitle')}</p>
        </div>

        <div className="lp-bento-grid">
          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <Search size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f1Title')}</h3>
            <p className="lp-card-p">{t('f1Desc')}</p>
          </div>

          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <Sparkles size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f2Title')}</h3>
            <p className="lp-card-p">{t('f2Desc')}</p>
          </div>

          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <GithubIcon size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f3Title')}</h3>
            <p className="lp-card-p">{t('f3Desc')}</p>
          </div>

          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <Package size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f4Title')}</h3>
            <p className="lp-card-p">{t('f4Desc')}</p>
          </div>

          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <ListOrdered size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f5Title')}</h3>
            <p className="lp-card-p">{t('f5Desc')}</p>
          </div>

          <div className="lp-bento-card">
            <div className="lp-card-icon-box">
              <Globe size={22} />
            </div>
            <h3 className="lp-card-h3">{t('f6Title')}</h3>
            <p className="lp-card-p">{t('f6Desc')}</p>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step) */}
      <section className="lp-section" id="how">
        <div className="lp-section-header">
          <span className="lp-section-tag">{t('howTag')}</span>
          <h2 className="lp-section-title">{t('howTitle')}</h2>
          <p className="lp-section-sub">{t('howSubtitle')}</p>
        </div>

        <div className="lp-steps-grid">
          <div className="lp-step-card">
            <div className="lp-step-number">1</div>
            <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
              {t('step1Title')}
            </h3>
            <p className="lp-card-p">{t('step1Desc')}</p>
          </div>

          <div className="lp-step-card">
            <div className="lp-step-number">2</div>
            <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
              {t('step2Title')}
            </h3>
            <p className="lp-card-p">{t('step2Desc')}</p>
          </div>

          <div className="lp-step-card">
            <div className="lp-step-number">3</div>
            <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
              {t('step3Title')}
            </h3>
            <p className="lp-card-p">{t('step3Desc')}</p>
          </div>

          <div className="lp-step-card">
            <div className="lp-step-number">4</div>
            <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
              {t('step4Title')}
            </h3>
            <p className="lp-card-p">{t('step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Why Choose EasyCatalog */}
      <section className="lp-section" id="why">
        <div className="lp-section-header">
          <span className="lp-section-tag">{t('whyTag')}</span>
          <h2 className="lp-section-title">{t('whyTitle')}</h2>
          <p className="lp-section-sub">{t('whySubtitle')}</p>
        </div>

        <div className="lp-why-grid">
          <div className="lp-why-card">
            <div className="lp-why-icon">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
                {t('w1Title')}
              </h3>
              <p className="lp-card-p">{t('w1Desc')}</p>
            </div>
          </div>

          <div className="lp-why-card">
            <div className="lp-why-icon">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
                {t('w2Title')}
              </h3>
              <p className="lp-card-p">{t('w2Desc')}</p>
            </div>
          </div>

          <div className="lp-why-card">
            <div className="lp-why-icon">
              <Tv size={22} />
            </div>
            <div>
              <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
                {t('w3Title')}
              </h3>
              <p className="lp-card-p">{t('w3Desc')}</p>
            </div>
          </div>

          <div className="lp-why-card">
            <div className="lp-why-icon">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="lp-card-h3" style={{ fontSize: '1.15rem' }}>
                {t('w4Title')}
              </h3>
              <p className="lp-card-p">{t('w4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="lp-section" id="faq">
        <div className="lp-section-header">
          <span className="lp-section-tag">{t('faqTag')}</span>
          <h2 className="lp-section-title">{t('faqTitle')}</h2>
          <p className="lp-section-sub">{t('faqSubtitle')}</p>
        </div>

        <div className="lp-faq-container">
          {[
            { q: t('q1'), a: t('a1') },
            { q: t('q2'), a: t('a2') },
            { q: t('q3'), a: t('a3') },
            { q: t('q4'), a: t('a4') },
            { q: t('q5'), a: t('a5') }
          ].map((faq, i) => (
            <div key={i} className={`lp-faq-item ${openFaqIndex === i ? 'active' : ''}`}>
              <button
                className="lp-faq-question"
                onClick={() => toggleFaq(i)}
                aria-expanded={openFaqIndex === i}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className="lp-faq-icon" />
              </button>
              {openFaqIndex === i && <div className="lp-faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="lp-cta-banner">
        <h2 className="lp-cta-banner-h2">{t('bottomTitle')}</h2>
        <p className="lp-cta-banner-sub">{t('bottomSubtitle')}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            onClick={onLaunchApp}
            className="lp-btn-primary"
            style={{ padding: '1rem 2.2rem', fontSize: '1.05rem' }}
          >
            <span>{t('bottomBtn')}</span>
          </button>
          <a
            href="https://buymeacoffee.com/wayku"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-secondary lp-btn-coffee"
            style={{ padding: '1rem 1.6rem', fontSize: '1rem' }}
          >
            <Coffee size={18} />
            <span>{t('coffeeBtn')}</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-brand" onClick={onLaunchApp}>
              <div className="lp-brand-icon">
                <Layers size={20} color="#ffffff" />
              </div>
              <div className="lp-brand-title">
                Easy<span>Catalog</span>
              </div>
            </div>

            <div className="lp-footer-links">
              <a href="#features" className="lp-footer-link">
                {t('navFeatures')}
              </a>
              <a href="#how" className="lp-footer-link">
                {t('navHow')}
              </a>
              <a href="#why" className="lp-footer-link">
                {t('navWhy')}
              </a>
              <a href="#faq" className="lp-footer-link">
                {t('navFaq')}
              </a>
              <button
                onClick={onOpenLegal}
                className="lp-footer-link"
                style={{ cursor: 'pointer' }}
              >
                {t('legalNotice')}
              </button>
              <a
                href="https://buymeacoffee.com/wayku"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-footer-link"
                style={{ color: '#fbbf24', fontWeight: 600 }}
              >
                {t('coffeeBtn')}
              </a>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} EasyCatalog. {t('madeFor')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={onOpenSettings}
                className="lp-footer-link"
                style={{ fontSize: '0.8rem' }}
              >
                ⚙️ Paramètres
              </button>
              <button
                onClick={onOpenLegal}
                className="lp-footer-link"
                style={{ fontSize: '0.8rem' }}
              >
                ⚖️ {t('legalNotice')}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
