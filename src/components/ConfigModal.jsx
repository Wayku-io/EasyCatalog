import React, { useState, useEffect } from 'react';
import {
  Key,
  GitBranch,
  FolderGit2,
  X,
  Check,
  ExternalLink,
  Coffee,
  Loader2,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import {
  fetchUserProfile,
  fetchUserRepos,
  createDefaultRepo,
  loginWithGitHub,
  getGitHubClientId
} from '../services/github';

export default function ConfigModal({ isOpen, isInitialGate, config, onSave, onClose, onSkip }) {
  const { t, language, setLanguage } = useLanguage();
  const { addToast } = useToast();

  const [tmdbKey, setTmdbKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [error, setError] = useState('');

  // Auto-detection state
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isAutoCreatingRepo, setIsAutoCreatingRepo] = useState(false);
  const [showAdvancedRepo, setShowAdvancedRepo] = useState(false);

  useEffect(() => {
    if (config) {
      setTmdbKey(config.tmdbKey || '');
      setGithubToken(config.githubToken || '');
      setGithubRepo(config.githubRepo || '');
    }
  }, [config, isOpen]);

  // Lock body scroll on modal open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [isOpen]);

  // Auto-detect user & auto-configure repository
  useEffect(() => {
    const token = githubToken.trim();
    if (!token) {
      setUserProfile(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsLoadingUser(true);
      setError('');
      try {
        const profile = await fetchUserProfile(token);
        if (!isMounted) return;
        setUserProfile(profile);

        // If repo is not set yet, automatically set it to username/EasyCatalog
        const defaultRepo = `${profile.login}/EasyCatalog`;
        if (!githubRepo || githubRepo.endsWith('/EasyCatalog')) {
          setGithubRepo(defaultRepo);
        }

        // Check if repo exists; if not, auto-create it silently
        const repos = await fetchUserRepos(token);
        if (!isMounted) return;

        const exists = repos.some((r) => r.toLowerCase() === defaultRepo.toLowerCase());
        if (!exists && (!githubRepo || githubRepo === defaultRepo)) {
          setIsAutoCreatingRepo(true);
          try {
            await createDefaultRepo(token, 'EasyCatalog');
            addToast(`Dépôt "${defaultRepo}" créé automatiquement sur GitHub !`, 'success');
          } catch (createErr) {
            console.warn("Auto-create repo notice:", createErr);
          } finally {
            if (isMounted) setIsAutoCreatingRepo(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUserProfile(null);
        }
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [githubToken]);

  const handleDisconnectGithub = () => {
    setGithubToken('');
    setGithubRepo('');
    setUserProfile(null);
    setShowAdvancedRepo(false);
    addToast("Compte GitHub déconnecté.", "info");
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTmdb = tmdbKey.trim();
    const cleanToken = githubToken.trim();
    let cleanRepo = githubRepo.trim();

    // If user has a token & profile but repo is empty, auto-fill it
    if (cleanToken && userProfile && !cleanRepo) {
      cleanRepo = `${userProfile.login}/EasyCatalog`;
    }

    if (cleanRepo && !cleanRepo.includes('/')) {
      setError("Le dépôt GitHub doit être sous la forme 'pseudo/nom-du-depot'.");
      return;
    }

    setError('');
    onSave({
      tmdbKey: cleanTmdb,
      githubToken: cleanToken,
      githubRepo: cleanRepo
    });

    addToast(t('configSavedSuccess'), 'success');
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isInitialGate) {
          onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 className="modal-title">
                {isInitialGate ? t('configTitle') : t('settingsTitle')}
              </h2>
              {isInitialGate && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px'
                }}>
                  Mode Découverte
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {isInitialGate ? t('configSubtitle') : t('settingsSubtitle')}
            </p>
          </div>
          <button onClick={onClose} className="close-btn" aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger)',
            color: '#fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Language Selector */}
          <div className="form-group">
            <label className="form-label">{t('languageLabel')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="glass-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="fr" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>🇫🇷 Français</option>
              <option value="en" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>🇬🇧 English</option>
              <option value="es" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>🇪🇸 Español</option>
              <option value="pt" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>🇵🇹 Português</option>
            </select>
          </div>

          {/* TMDB API Key */}
          <div className="form-group">
            <div className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={15} color="var(--emerald)" />
                {t('tmdbKeyLabel')}
              </span>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--emerald)', textDecoration: 'none', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <span>{t('tmdbKeyLink')}</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <input
              type="password"
              className="glass-input"
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              placeholder={t('tmdbKeyPlaceholder')}
              autoComplete="off"
            />
            <span className="form-help">{t('tmdbKeyHelp')}</span>
          </div>

          {/* GITHUB INTEGRATION - 1 STEP ONLY */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <GitBranch size={16} color="var(--emerald)" />
                Connexion GitHub (Hébergement)
              </span>
              {userProfile && (
                <button
                  type="button"
                  onClick={handleDisconnectGithub}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.4rem'
                  }}
                  title="Déconnecter le compte GitHub"
                >
                  <LogOut size={12} />
                  Déconnecter
                </button>
              )}
            </div>

            {/* If user is connected */}
            {userProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem'
                }}>
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.login}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--emerald)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        {userProfile.name || userProfile.login}
                      </span>
                      <span style={{ color: 'var(--emerald)', fontSize: '0.82rem', fontWeight: 500 }}>
                        @{userProfile.login}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      <CheckCircle2 size={14} />
                      <span>Compte connecté & Dépôt <strong>{githubRepo || `${userProfile.login}/EasyCatalog`}</strong> prêt</span>
                    </div>
                  </div>
                </div>

                {/* Advanced: customize repo if power user really wants */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedRepo(!showAdvancedRepo)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: 0
                    }}
                  >
                    <span>Personnaliser le nom du dépôt (avancé)</span>
                    {showAdvancedRepo ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {showAdvancedRepo && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        className="glass-input"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder={`${userProfile.login}/EasyCatalog`}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* If NOT connected */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                  Connectez votre compte pour héberger et synchroniser vos catalogues automatiquement sur GitHub.
                </p>

                {/* 1. Official GitHub OAuth Button (1 Clic) */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      loginWithGitHub();
                    } catch (err) {
                      setError(err.message || "Erreur de configuration GitHub OAuth.");
                    }
                  }}
                  style={{
                    background: '#24292e',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#2f363d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#24292e')}
                >
                  <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <span>Se connecter avec GitHub (1 Clic)</span>
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.1rem 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    OU AVEC UN TOKEN PERSONNEL
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                </div>

                {/* Direct 1-click token generator button */}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=EasyCatalog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    padding: '0.55rem',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    color: 'var(--emerald)'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Générer un Token pré-rempli sur GitHub</span>
                  <ExternalLink size={12} />
                </a>

                {/* Single Token Input */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="glass-input"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="Collez votre token ici (ghp_...)"
                      autoComplete="off"
                      style={{ paddingRight: isLoadingUser ? '2.5rem' : '0.9rem', fontSize: '0.85rem' }}
                    />
                    {isLoadingUser && (
                      <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader2 size={16} className="spin" color="var(--emerald)" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Coffee support link inside settings for mobile users */}
          <a
            href="https://buymeacoffee.com/wayku"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-coffee"
            style={{ width: '100%', minHeight: '42px', fontSize: '0.85rem' }}
          >
            <Coffee size={16} />
            <span>Soutenir le projet (Offrir un café)</span>
          </a>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
            {isInitialGate ? (
              <button
                type="button"
                onClick={onSkip}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <span>{t('skipTest')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                {t('cancel')}
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5 }}
            >
              <Check size={18} />
              <span>{isInitialGate ? t('saveAndContinue') : t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
