import React, { useState, useEffect } from 'react';
import {
  Key,
  GitBranch,
  X,
  Check,
  ExternalLink,
  Coffee,
  LogOut,
  CheckCircle2,
  Scale,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import {
  fetchUserProfile,
  fetchUserRepos,
  createDefaultRepo,
  loginWithGitHub
} from '../services/github';
import { hasGlobalTmdbKey } from '../services/tmdb';

export default function ConfigModal({ isOpen, isInitialGate, config, onSave, onClose, onSkip, onOpenLegal }) {
  const { t, language, setLanguage } = useLanguage();
  const { addToast } = useToast();

  const hasGlobalTmdb = hasGlobalTmdbKey();
  const [showCustomTmdbInput, setShowCustomTmdbInput] = useState(() => Boolean(config?.tmdbKey));
  const [tmdbKey, setTmdbKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [error, setError] = useState('');

  // Auto-detection state
  const [userProfile, setUserProfile] = useState(null);
  const [reposList, setReposList] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('nuvio-catalogs');
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  useEffect(() => {
    if (config) {
      setTmdbKey(config.tmdbKey || '');
      setGithubToken(config.githubToken || '');
      setGithubRepo(config.githubRepo || '');
      setShowCustomTmdbInput(Boolean(config.tmdbKey));
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

  // Load user profile & repos when token is present
  const loadUserReposList = async (token, login) => {
    setIsLoadingRepos(true);
    try {
      const repos = await fetchUserRepos(token);
      setReposList(repos);
      if (repos.length > 0) {
        setGithubRepo((prev) => {
          if (prev && repos.some((r) => r.toLowerCase() === prev.toLowerCase())) {
            return prev;
          }
          const preferred =
            repos.find((r) => r.toLowerCase().endsWith('/nuvio-catalogs')) ||
            repos.find((r) => r.toLowerCase().endsWith('/mes-catalogues')) ||
            repos.find((r) => r.toLowerCase().endsWith('/easycatalog')) ||
            repos[0];
          return preferred;
        });
      }
    } catch (err) {
      console.warn("Erreur chargement dépôts:", err);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    const token = githubToken.trim();
    if (!token) {
      setUserProfile(null);
      setReposList([]);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const profile = await fetchUserProfile(token);
        if (!isMounted) return;
        setUserProfile(profile);
        await loadUserReposList(token, profile.login);
      } catch (err) {
        if (isMounted) {
          setUserProfile(null);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [githubToken]);

  const handleRefreshRepos = () => {
    if (!githubToken || !userProfile) return;
    loadUserReposList(githubToken.trim(), userProfile.login);
    addToast("Liste des dépôts mise à jour.", "info");
  };

  const handleCreateNewRepo = async (e) => {
    e?.preventDefault();
    const cleanName = newRepoName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanName) {
      addToast("Veuillez saisir un nom de dépôt valide.", "error");
      return;
    }
    const token = githubToken.trim();
    if (!token || !userProfile) return;

    setIsCreatingRepo(true);
    try {
      await createDefaultRepo(token, cleanName);
      const fullRepo = `${userProfile.login}/${cleanName}`;
      setReposList((prev) => [fullRepo, ...prev.filter((r) => r.toLowerCase() !== fullRepo.toLowerCase())]);
      setGithubRepo(fullRepo);
      setShowCreateRepo(false);
      setNewRepoName('');
      addToast(`🎉 Dépôt ${cleanName} créé et sélectionné !`, 'success');
    } catch (err) {
      addToast(err.message || "Erreur lors de la création du dépôt sur GitHub.", 'error');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handleDisconnectGithub = () => {
    setGithubToken('');
    setGithubRepo('');
    setUserProfile(null);
    setReposList([]);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_repo');
    if (onSave) {
      onSave({
        tmdbKey: tmdbKey.trim(),
        githubToken: '',
        githubRepo: ''
      });
    }
    addToast("Compte GitHub déconnecté.", "info");
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTmdb = tmdbKey.trim();
    const cleanToken = githubToken.trim();
    let cleanRepo = githubRepo.trim();

    if (cleanToken && userProfile && !cleanRepo) {
      cleanRepo = `${userProfile.login}/EasyCatalog`;
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
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
                  Configuration
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
          {/* 1. Language Selector */}
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

          {/* 2. TMDB API Key (Optional with clean accordion) */}
          {hasGlobalTmdb && !showCustomTmdbInput && !tmdbKey ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={18} color="var(--emerald)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    {t('tmdbActiveGlobal')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {t('tmdbActiveGlobalSub')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomTmdbInput(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {t('useCustomKey')}
              </button>
            </div>
          ) : (
            <div className="form-group">
              <div className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Key size={15} color="var(--emerald)" />
                  {t('tmdbKeyLabel')}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(personnelle)</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {hasGlobalTmdb && (
                    <button
                      type="button"
                      onClick={() => {
                        setTmdbKey('');
                        setShowCustomTmdbInput(false);
                        localStorage.removeItem('tmdb_key');
                        localStorage.removeItem('tmdb_api_key');
                        if (onSave) {
                          onSave({
                            tmdbKey: '',
                            githubToken: githubToken.trim(),
                            githubRepo: githubRepo.trim()
                          });
                        }
                        addToast(t('resetDefaultKey'), "info");
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--emerald)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {t('resetDefaultKey')}
                    </button>
                  )}
                  <a
                    href="https://www.themoviedb.org/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--emerald)', textDecoration: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <span>{t('tmdbKeyLink')}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <input
                type="password"
                className="glass-input"
                value={tmdbKey}
                onChange={(e) => setTmdbKey(e.target.value)}
                placeholder={t('customKeyPlaceholder')}
                autoComplete="off"
              />
              <span className="form-help">
                {hasGlobalTmdb
                  ? t('customKeyHelp')
                  : t('tmdbKeyHelp')}
              </span>
            </div>
          )}

          {/* 3. GITHUB 1-CLICK CONNECTION ONLY */}
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
                {t('githubHosting')}
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
                  title={t('disconnectGithubTitle')}
                >
                  <LogOut size={12} />
                  {t('disconnect')}
                </button>
              )}
            </div>

            {/* If user is connected: User card & Repo selector */}
            {userProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem'
                }}>
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.login}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--emerald)' }}
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
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {t('githubConnected')}
                    </span>
                  </div>
                </div>

                {/* Sélecteur et créateur de dépôt GitHub */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <GitBranch size={14} color="var(--emerald)" />
                      {t('repoForCatalogs')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={handleRefreshRepos}
                        disabled={isLoadingRepos}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                        title={t('refreshRepos')}
                      >
                        <RefreshCw size={11} className={isLoadingRepos ? 'spinner' : ''} />
                        {t('refreshRepos')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateRepo(prev => !prev)}
                        style={{
                          background: showCreateRepo ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          border: showCreateRepo ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                          color: showCreateRepo ? '#f87171' : 'var(--emerald)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.45rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {showCreateRepo ? <X size={11} /> : <Plus size={11} />}
                        {showCreateRepo ? t('cancel') : t('newRepo')}
                      </button>
                    </div>
                  </div>

                  {/* Formulaire de création d'un nouveau dépôt */}
                  {showCreateRepo && (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>
                        {t('createDedicatedRepo')}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          className="glass-input"
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                          placeholder="ex: nuvio-catalogs"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewRepo}
                          disabled={isCreatingRepo || !newRepoName.trim()}
                          className="btn btn-primary"
                          style={{ minHeight: '32px', fontSize: '0.75rem', padding: '0.3rem 0.65rem', whiteSpace: 'nowrap' }}
                        >
                          {isCreatingRepo ? <Loader2 size={12} className="spinner" /> : <Check size={12} />}
                          <span>{t('createBtn')}</span>
                        </button>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Le dépôt sera automatiquement créé en mode public sur votre GitHub et initialisé avec un README.
                      </span>
                    </div>
                  )}

                  {/* Liste déroulante des dépôts existants */}
                  <select
                    className="glass-input"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.5rem 0.7rem',
                      background: '#151921',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {reposList.length === 0 ? (
                      <option value={githubRepo}>{githubRepo || t('noReposFound')}</option>
                    ) : (
                      reposList.map((r) => (
                        <option key={r} value={r} style={{ background: '#151921', color: '#fff' }}>
                          {r}
                        </option>
                      ))
                    )}
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald)', fontSize: '0.75rem' }}>
                    <CheckCircle2 size={13} />
                    <span>{t('activeRepo')} <strong>{githubRepo || t('none')}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              /* If NOT connected: The single 1-Click GitHub button */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                  {t('connectGithubDesc')}
                </p>

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
                    padding: '0.85rem 1rem',
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
                  <span>{t('connectGithubOneClick')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Coffee support link inside settings for mobile users */}
          <a
            href="https://buymeacoffee.com/wayku"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-coffee"
            style={{ width: '100%', minHeight: '40px', fontSize: '0.85rem' }}
          >
            <Coffee size={16} />
            <span>{t('supportCoffee')}</span>
          </a>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.3rem' }}>
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

          {/* Legal, Privacy & Disclaimer trigger */}
          <div style={{ textAlign: 'center', marginTop: '0.1rem' }}>
            <button
              type="button"
              onClick={() => {
                if (onOpenLegal) onOpenLegal();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.73rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem'
              }}
            >
              <Scale size={12} />
              <span>{t('legalNoticeFooter')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
