import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Film,
  Tv,
  Check,
  Plus,
  Copy,
  Trash2,
  Package,
  Folder,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
  ExternalLink,
  Sparkles,
  Lock,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import { searchTMDB, getEffectiveTmdbKey } from '../services/tmdb';
import SortDropdown from './SortDropdown';
import {
  fetchExistingCollections,
  loadCollectionData,
  deleteCollectionFromGithub,
  compileSuperManifest,
  fetchSuperManifestInfo,
  parseRepoString
} from '../services/github';

export default function DesktopDashboard({
  config,
  catalogName,
  setCatalogName,
  selectedItems,
  setSelectedItems,
  onToggleItem,
  sortOption = 'manual',
  setSortOption,
  onSortChange,
  resultData,
  setResultData,
  isPublishing,
  handlePublish,
  handleResetBuilder,
  editingCollectionPath,
  setEditingCollectionPath,
  onOpenSettings,
  onOpenLegal
}) {
  const { t, language } = useLanguage();
  const { addToast } = useToast();

  // Left column: Collections state
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingColPath, setLoadingColPath] = useState(null);
  const [copiedColPath, setCopiedColPath] = useState(null);

  // Pack complet state
  const [isCompilingPack, setIsCompilingPack] = useState(false);
  const [packResult, setPackResult] = useState(null);
  const [copiedPack, setCopiedPack] = useState(false);

  // Center column: TMDB Search state
  const normalizedLockedType = selectedItems.length > 0
    ? (selectedItems[0].type === 'tv' || selectedItems[0].type === 'series' ? 'series' : 'movie')
    : null;
  const isSeriesMode = normalizedLockedType === 'series';
  const isMovieMode = normalizedLockedType === 'movie';

  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState(() => (isSeriesMode ? 'series' : 'movie'));
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Right column: Builder sort & state
  const [copiedManifest, setCopiedManifest] = useState(false);

  const loadCollectionsList = async () => {
    if (!config?.githubToken || !config?.githubRepo) return;
    setLoadingCollections(true);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const [list, superInfo] = await Promise.all([
        fetchExistingCollections(owner, repo, config.githubToken),
        fetchSuperManifestInfo(owner, repo, config.githubToken)
      ]);
      setCollections(list);
      if (superInfo) {
        setPackResult(superInfo);
      }
    } catch (err) {
      console.warn("Erreur chargement collections:", err);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Load existing collections when config changes
  useEffect(() => {
    if (config?.githubToken && config?.githubRepo) {
      loadCollectionsList();
    }
  }, [config?.githubToken, config?.githubRepo]);

  // Sync mediaType if lockedType changes
  useEffect(() => {
    if (normalizedLockedType && mediaType !== normalizedLockedType) {
      setMediaType(normalizedLockedType);
    }
  }, [normalizedLockedType, mediaType]);

  const effectiveTmdbKey = getEffectiveTmdbKey(config?.tmdbKey);

  // TMDB live search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchTMDB(query, mediaType, effectiveTmdbKey, language);
        setResults(res);
      } catch (err) {
        console.error('TMDB Search error', err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, mediaType, effectiveTmdbKey, language]);


  const handleOpenCollection = async (col) => {
    setLoadingColPath(col.path);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const data = await loadCollectionData(owner, repo, config.githubToken, col.path);
      setCatalogName(data.name || '');
      setSelectedItems(data.items || []);
      if (setEditingCollectionPath) setEditingCollectionPath(col.path);
      if (onSortChange) onSortChange('manual');
      else setSortOption?.('manual');
      setResultData({
        jsDelivrUrl: data.jsDelivrUrl,
        stremioUrl: data.stremioUrl
      });
      addToast(`"${col.displayName}" ${t('colLoadedToast')}`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingColPath(null);
    }
  };

  const handleSaveAndRefresh = async () => {
    await handlePublish();
    setTimeout(() => {
      loadCollectionsList();
    }, 800);
  };

  const handleCopyColUrl = (col, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(col.manifestUrl);
    setCopiedColPath(col.path);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopiedColPath(null), 2000);
  };

  const handleDeleteCollection = async (col, e) => {
    e.stopPropagation();
    if (!window.confirm(`${t('deleteConfirm')} (${col.displayName})`)) return;

    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      await deleteCollectionFromGithub(owner, repo, config.githubToken, col.path);
      setCollections(prev => prev.filter(c => c.path !== col.path));
      addToast(t('deletedSuccess'), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompilePack = async () => {
    setIsCompilingPack(true);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const res = await compileSuperManifest(owner, repo, config.githubToken);
      setPackResult(res);
      addToast(t('packReady'), 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setIsCompilingPack(false);
    }
  };

  const handleCopyPack = () => {
    if (!packResult?.jsDelivrUrl) return;
    navigator.clipboard.writeText(packResult.jsDelivrUrl);
    setCopiedPack(true);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopiedPack(false), 2000);
  };

  const handlePillClick = (type) => {
    if (normalizedLockedType && type !== normalizedLockedType) {
      addToast(t('cannotMixTypesError'), 'error');
      return;
    }
    setMediaType(type);
  };

  const isSelected = (itemId) => {
    return selectedItems.some(i => i.id === itemId);
  };

  // Reorder builder items
  const moveUp = (index) => {
    if (index === 0) return;
    setSelectedItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    if (onSortChange) onSortChange('manual');
    else setSortOption?.('manual');
  };

  const moveDown = (index) => {
    if (index === selectedItems.length - 1) return;
    setSelectedItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    if (onSortChange) onSortChange('manual');
    else setSortOption?.('manual');
  };

  const removeItem = (id) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSortChange = (newVal) => {
    if (onSortChange) {
      onSortChange(newVal);
    }
  };

  const copyManifestUrl = () => {
    if (!resultData?.jsDelivrUrl) return;
    navigator.clipboard.writeText(resultData.jsDelivrUrl);
    setCopiedManifest(true);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="desktop-dashboard-grid">
      {/* ========================================================
          COLONNE 1 : MES CATALOGUES & PACK COMPLET (310px)
          ======================================================== */}
      <div className="glass-panel dashboard-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={18} color="var(--accent-light)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800 }}>
              {t('myCollectionsTitle')}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={loadCollectionsList}
              className="btn btn-secondary"
              style={{ minHeight: '32px', width: '32px', padding: 0 }}
              title={t('refreshTitle')}
            >
              <RefreshCw size={13} className={loadingCollections ? 'spinner' : ''} />
            </button>
            <button
              onClick={handleResetBuilder}
              className="btn btn-primary"
              style={{ minHeight: '32px', padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
              title={t('newCollectionTitle')}
            >
              <Plus size={14} />
              <span>{t('newCatalogShort')}</span>
            </button>
          </div>
        </div>

        {/* Active Repository Indicator */}
        {config?.githubRepo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.45rem 0.65rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, overflow: 'hidden' }}>
              <GitBranch size={13} color="var(--emerald)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{t('repoLabel')}</span>
              <span style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={config.githubRepo}>
                {config.githubRepo}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--emerald)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.1rem 0.3rem',
                flexShrink: 0
              }}
              title={t('settings')}
            >
              {t('changeRepoBtn')}
            </button>
          </div>
        )}

        {/* Bannière Tout ajouter à AIO (Lien universel AIO Metadata) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.12))',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={17} color="var(--accent-light)" />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
              {t('allInOnePackTitle')}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {t('allInOnePackDesc')}
          </p>

          {!packResult ? (
            <button
              onClick={handleCompilePack}
              disabled={isCompilingPack || collections.length === 0}
              className="btn btn-primary"
              style={{ minHeight: '34px', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {isCompilingPack ? (
                <>
                  <Loader2 size={13} className="spinner" />
                  <span>{t('compilingPack')}</span>
                </>
              ) : (
                <>
                  <Package size={14} />
                  <span>{t('compilePackBtn')}</span>
                </>
              )}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="text"
                  readOnly
                  value={packResult.jsDelivrUrl}
                  className="glass-input"
                  style={{ fontSize: '0.75rem', minHeight: '32px', padding: '0.3rem 0.5rem', color: 'var(--accent-light)' }}
                />
                <button
                  onClick={handleCopyPack}
                  className="btn btn-primary"
                  style={{ minHeight: '32px', width: '34px', padding: 0, flexShrink: 0 }}
                  title={t('allInOnePackBtn')}
                >
                  {copiedPack ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Bouton Mettre à jour le super manifeste */}
              <button
                onClick={handleCompilePack}
                disabled={isCompilingPack || collections.length === 0}
                className="btn btn-secondary"
                style={{
                  minHeight: '30px',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  color: 'var(--emerald)',
                  borderColor: 'rgba(16, 185, 129, 0.3)'
                }}
                title={t('updatePackBtn')}
              >
                <RefreshCw size={12} className={isCompilingPack ? 'spinner' : ''} />
                <span>{isCompilingPack ? t('updatingPack') : t('updatePackBtn')}</span>
              </button>

              {/* Notice réinstallation discrète */}
              {packResult.isUpdate && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.5rem',
                  lineHeight: 1.3
                }}>
                  {t('reinstallNotice')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liste des catalogues existants */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!config?.githubRepo ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <GitBranch size={28} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
              <p>{t('configureRepoNotice')}</p>
            </div>
          ) : loadingCollections ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Loader2 size={24} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              <p>{t('collectionsLoading')}</p>
            </div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <p>{t('noRepoFoundNotice')}</p>
              <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>{t('createFirstColNotice')}</p>
            </div>
          ) : (
            collections.map(col => (
              <div
                key={col.path}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => handleOpenCollection(col)}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {col.displayName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {col.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenCollection(col)}
                    className="btn btn-secondary"
                    style={{ minHeight: '30px', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    title={t('openInEditor')}
                  >
                    {loadingColPath === col.path ? <Loader2 size={12} className="spinner" /> : t('editBtn')}
                  </button>
                  <button
                    onClick={(e) => handleCopyColUrl(col, e)}
                    className="btn btn-secondary"
                    style={{ minHeight: '30px', width: '30px', padding: 0 }}
                    title={t('copyDirectLink')}
                  >
                    {copiedColPath === col.path ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteCollection(col, e)}
                    className="btn btn-danger"
                    style={{ minHeight: '30px', width: '30px', padding: 0 }}
                    title={t('deleteCollection')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info & Legal */}
        <div style={{ textAlign: 'center', marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.4rem' }}>
          <button
            type="button"
            onClick={() => onOpenLegal && onOpenLegal()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>{t('legalModalTitle')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          COLONNE 2 : RECHERCHE TMDB EN DIRECT (Flexible 1fr)
          ======================================================== */}
      <div className="glass-panel dashboard-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
            {t('searchTitle')}
          </h2>

          {/* Filtres Films / Séries */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={`type-pill ${mediaType === 'movie' ? 'active' : ''} ${isSeriesMode ? 'disabled-locked' : ''}`}
              onClick={() => handlePillClick('movie')}
              style={{ minHeight: '34px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', ...(isSeriesMode ? { opacity: 0.45, cursor: 'not-allowed' } : {}) }}
              title={isSeriesMode ? t('typeLockedNoticeSeries') : undefined}
            >
              <Film size={13} />
              <span>{t('movies')}</span>
              {isSeriesMode && <Lock size={11} style={{ marginLeft: '3px' }} />}
            </button>

            <button
              className={`type-pill ${mediaType === 'series' ? 'active' : ''} ${isMovieMode ? 'disabled-locked' : ''}`}
              onClick={() => handlePillClick('series')}
              style={{ minHeight: '34px', padding: '0.3rem 0.85rem', fontSize: '0.82rem', ...(isMovieMode ? { opacity: 0.45, cursor: 'not-allowed' } : {}) }}
              title={isMovieMode ? t('typeLockedNoticeMovie') : undefined}
            >
              <Tv size={13} />
              <span>{t('series')}</span>
              {isMovieMode && <Lock size={11} style={{ marginLeft: '3px' }} />}
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="glass-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholderCenter')}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '0.4rem'
              }}
              aria-label={t('clearList')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Grille de résultats TMDB */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          {!effectiveTmdbKey ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Film size={36} color="var(--accent-light)" style={{ opacity: 0.5, margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: '#fff', marginBottom: '0.35rem' }}>{t('tmdbKeyRequiredTitle')}</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{t('tmdbKeyRequiredDesc')}</p>
              <button onClick={onOpenSettings} className="btn btn-primary" style={{ minHeight: '36px', fontSize: '0.85rem' }}>
                {t('settings')} ⚙️
              </button>
            </div>
          ) : searching ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Loader2 size={30} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>{t('searchingTmdb')}</p>
            </div>
          ) : query && results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <p>{t('noResultsFor')} "{query}".</p>
            </div>
          ) : !query ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="var(--accent-light)" style={{ opacity: 0.35, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>{t('searchCenterPrompt')}</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                {t('searchCenterSub')}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.85rem'
            }}>
              {results.map((item) => {
                const added = isSelected(item.id);
                const isTypeIncompatible = normalizedLockedType && (
                  isSeriesMode ? item.type !== 'series' : item.type !== 'movie'
                );

                return (
                  <div
                    key={item.id}
                    className="movie-card"
                    onClick={() => onToggleItem(item)}
                    style={{
                      cursor: 'pointer',
                      ...(isTypeIncompatible ? { opacity: 0.45, filter: 'grayscale(0.6)' } : {})
                    }}
                  >
                    <img src={item.poster} alt={item.title} loading="lazy" />
                    <span className="card-badge card-badge-type">
                      {item.type === 'movie' ? t('movies') : t('series')}
                    </span>
                    {added && (
                      <span className="card-badge card-badge-added">
                        <Check size={11} style={{ display: 'inline', marginRight: '2px' }} />
                        {t('alreadyAdded')}
                      </span>
                    )}
                    <div className="movie-card-overlay">
                      <div className="movie-card-title">{item.title}</div>
                      <div className="movie-card-meta">
                        <span>{item.year}</span>
                        {item.voteAverage && <span>★ {item.voteAverage}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          COLONNE 3 : ÉDITEUR EN DIRECT (BUILDER) (360px)
          ======================================================== */}
      <div className="glass-panel dashboard-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              {t('builderTitle')}
            </h3>
            {editingCollectionPath && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.7rem',
                color: 'var(--accent-light)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '4px',
                padding: '0.1rem 0.4rem',
                marginTop: '0.25rem',
                fontWeight: 600
              }}>
                <Sparkles size={10} />
                {t('editingModeBadge')}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {selectedItems.length > 0 && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-light)',
                border: '1px solid rgba(16, 185, 129, 0.28)',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {isSeriesMode ? '📺 ' + t('series') : '🎬 ' + t('movies')}
              </span>
            )}
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-light)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {selectedItems.length}
            </span>
          </div>
        </div>

        {/* Nom du catalogue */}
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.78rem' }}>{t('catalogNameLabel')}</label>
          <input
            type="text"
            className="glass-input"
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
            placeholder={t('catalogNamePlaceholder')}
            style={{ minHeight: '38px', fontSize: '0.875rem' }}
          />
        </div>

        {/* Barre d'outils tri & vider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <SortDropdown value={sortOption} onChange={handleSortChange} />

          {(selectedItems.length > 0 || catalogName || resultData) && (
            <button
              onClick={() => {
                if (window.confirm(t('resetBuilderConfirm'))) {
                  handleResetBuilder();
                  addToast(t('resetBuilderToast'), "info");
                }
              }}
              className="btn btn-danger btn-icon-only"
              style={{ width: '34px', height: '34px', flexShrink: 0 }}
              title={t('clearList')}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Liste des titres sélectionnés */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingRight: '0.2rem' }}>
          {selectedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Film size={32} color="var(--accent-light)" style={{ opacity: 0.35, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>{t('emptyBuilder')}</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>{t('emptyBuilderSub')}</p>
            </div>
          ) : (
            selectedItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.65rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', width: '18px' }}>
                  {index + 1}
                </span>
                <img
                  src={item.poster}
                  alt={item.title}
                  style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.year}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="btn btn-secondary"
                    style={{ width: '26px', height: '26px', padding: 0 }}
                    title={t('moveUp')}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === selectedItems.length - 1}
                    className="btn btn-secondary"
                    style={{ width: '26px', height: '26px', padding: 0 }}
                    title={t('moveDown')}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger"
                    style={{ width: '26px', height: '26px', padding: 0 }}
                    title={t('removeItem')}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Boutons d'action : Enregistrer sur GitHub & Exporter JSON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: 'auto' }}>
          <button
            onClick={handleSaveAndRefresh}
            disabled={isPublishing || selectedItems.length === 0}
            className="btn btn-primary"
            style={{
              width: '100%',
              minHeight: '42px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: editingCollectionPath
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              boxShadow: editingCollectionPath
                ? '0 4px 15px rgba(5, 150, 105, 0.4)'
                : '0 4px 15px var(--accent-glow)'
            }}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>{t('updatingOnGithub')}</span>
              </>
            ) : editingCollectionPath ? (
              <>
                <RefreshCw size={15} />
                <span>{t('updateCatalogBtn')}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{t('publishCatalogBtn')}</span>
              </>
            )}
          </button>
        </div>

        {/* Carte de résultat si publié */}
        {resultData && resultData.jsDelivrUrl && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.12))',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={16} color="var(--emerald)" />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{t('readyForAio')}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input
                type="text"
                readOnly
                value={resultData.jsDelivrUrl}
                className="glass-input"
                style={{ fontSize: '0.75rem', minHeight: '32px', padding: '0.3rem 0.5rem', color: 'var(--accent-light)' }}
              />
              <button
                onClick={copyManifestUrl}
                className="btn btn-primary"
                style={{ minHeight: '32px', width: '34px', padding: 0, flexShrink: 0 }}
                title={t('copyUrl')}
              >
                {copiedManifest ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('aioHelpTip')}
            </div>

            {resultData.isUpdate && (
              <div style={{
                fontSize: '0.73rem',
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.6rem',
                lineHeight: 1.35
              }}>
                {t('reinstallNotice')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
