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
  Download,
  Sparkles,
  Lock,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import { searchTMDB, getEffectiveTmdbKey } from '../services/tmdb';
import {
  fetchExistingCollections,
  loadCollectionData,
  deleteCollectionFromGithub,
  compileSuperManifest,
  parseRepoString
} from '../services/github';
import { exportCatalogToJson, exportAllCollectionsToJson } from '../services/export';

export default function DesktopDashboard({
  config,
  catalogName,
  setCatalogName,
  selectedItems,
  setSelectedItems,
  onToggleItem,
  resultData,
  setResultData,
  isPublishing,
  handlePublish,
  handleResetBuilder,
  _editingCollectionPath,
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

  // Right column: Builder sort state
  const [sortOption, setSortOption] = useState('manual');
  const [copiedManifest, setCopiedManifest] = useState(false);

  const loadCollectionsList = async () => {
    if (!config?.githubToken || !config?.githubRepo) return;
    setLoadingCollections(true);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const list = await fetchExistingCollections(owner, repo, config.githubToken);
      setCollections(list);
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
      setResultData({
        jsDelivrUrl: data.jsDelivrUrl,
        stremioUrl: data.stremioUrl
      });
      addToast(`Catalogue "${col.displayName}" chargé dans l'éditeur`, 'success');
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
    setSortOption('manual');
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
    setSortOption('manual');
  };

  const removeItem = (id) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortOption(val);
    if (val === 'manual') return;

    setSelectedItems(prev => {
      const copy = [...prev];
      if (val === 'year-asc') {
        copy.sort((a, b) => parseInt(a.year || 0) - parseInt(b.year || 0));
      } else if (val === 'year-desc') {
        copy.sort((a, b) => parseInt(b.year || 0) - parseInt(a.year || 0));
      } else if (val === 'alpha') {
        copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }
      return copy;
    });
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
              title="Rafraîchir"
            >
              <RefreshCw size={13} className={loadingCollections ? 'spinner' : ''} />
            </button>
            <button
              onClick={handleResetBuilder}
              className="btn btn-primary"
              style={{ minHeight: '32px', padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
              title="Créer un nouveau catalogue vide"
            >
              <Plus size={14} />
              <span>Nouveau</span>
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
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Dépôt :</span>
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
              title="Changer de dépôt GitHub"
            >
              Changer
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
          )}
        </div>

        {/* Liste des catalogues existants */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {!config?.githubRepo ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <GitBranch size={28} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
              <p>Configurez votre dépôt GitHub dans les Paramètres ⚙️ pour charger vos catalogues.</p>
            </div>
          ) : loadingCollections ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Loader2 size={24} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              <p>Chargement de vos catalogues...</p>
            </div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <p>Aucun catalogue trouvé sur votre dépôt.</p>
              <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Créez votre première collection à droite !</p>
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
                    title="Charger dans l'éditeur"
                  >
                    {loadingColPath === col.path ? <Loader2 size={12} className="spinner" /> : "Éditer"}
                  </button>
                  <button
                    onClick={(e) => handleCopyColUrl(col, e)}
                    className="btn btn-secondary"
                    style={{ minHeight: '30px', width: '30px', padding: 0 }}
                    title="Copier le lien AIO"
                  >
                    {copiedColPath === col.path ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                  </button>
                  <button
                    onClick={(e) => handleDeleteCollection(col, e)}
                    className="btn btn-danger"
                    style={{ minHeight: '30px', width: '30px', padding: 0 }}
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bouton Exporter Tout en JSON */}
        {collections.length > 0 && (
          <button
            onClick={() => exportAllCollectionsToJson(collections)}
            className="btn btn-secondary"
            style={{ width: '100%', minHeight: '34px', fontSize: '0.8rem', marginTop: 'auto' }}
          >
            <Download size={14} />
            <span>Exporter mes catalogues en JSON</span>
          </button>
        )}

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
            <span>Mentions Légales & Confidentialité</span>
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
            placeholder="Tapez le titre d'un film ou d'une série..."
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
              aria-label="Effacer"
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
              <h4 style={{ color: '#fff', marginBottom: '0.35rem' }}>Clé API TMDB requise</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Renseignez votre clé TMDB pour rechercher en direct.</p>
              <button onClick={onOpenSettings} className="btn btn-primary" style={{ minHeight: '36px', fontSize: '0.85rem' }}>
                Paramètres ⚙️
              </button>
            </div>
          ) : searching ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Loader2 size={30} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Recherche TMDB en cours...</p>
            </div>
          ) : query && results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <p>Aucun résultat pour "{query}".</p>
            </div>
          ) : !query ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="var(--accent-light)" style={{ opacity: 0.35, margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Recherchez des films ou séries pour composer votre catalogue en direct.</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                Cliquez sur une affiche pour l'ajouter instantanément dans la colonne de droite.
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
                      {item.type === 'movie' ? 'Film' : 'Série'}
                    </span>
                    {added && (
                      <span className="card-badge card-badge-added">
                        <Check size={11} style={{ display: 'inline', marginRight: '2px' }} />
                        Ajouté
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800 }}>
            {t('builderTitle')}
          </h3>
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
                {isSeriesMode ? '📺 Séries' : '🎬 Films'}
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
            placeholder="Ex: Collection Harry Potter"
            style={{ minHeight: '38px', fontSize: '0.875rem' }}
          />
        </div>

        {/* Barre d'outils tri & vider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="btn btn-secondary"
            style={{ flex: 1, minHeight: '34px', fontSize: '0.78rem', padding: '0.3rem 0.5rem', cursor: 'pointer' }}
          >
            <option value="manual" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Tri : Manuel</option>
            <option value="year-asc" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Année (Ancien ➔ Récent)</option>
            <option value="year-desc" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Année (Récent ➔ Ancien)</option>
            <option value="alpha" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Ordre alphabétique A-Z</option>
          </select>

          {selectedItems.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Vider la liste en cours ?")) setSelectedItems([]);
              }}
              className="btn btn-danger btn-icon-only"
              style={{ width: '34px', height: '34px', flexShrink: 0 }}
              title="Vider"
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
              <p style={{ fontSize: '0.85rem' }}>Votre catalogue est vide.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>Sélectionnez des titres dans la colonne centrale pour les ajouter.</p>
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
                    title="Monter"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === selectedItems.length - 1}
                    className="btn btn-secondary"
                    style={{ width: '26px', height: '26px', padding: 0 }}
                    title="Descendre"
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger"
                    style={{ width: '26px', height: '26px', padding: 0 }}
                    title="Retirer"
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
            style={{ width: '100%', minHeight: '40px', fontSize: '0.875rem' }}
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Sauvegarde en cours...</span>
              </>
            ) : (
              <span>Enregistrer & Obtenir le lien AIO</span>
            )}
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={() => exportCatalogToJson(catalogName, selectedItems)}
              className="btn btn-secondary"
              style={{ width: '100%', minHeight: '34px', fontSize: '0.78rem' }}
            >
              <Download size={13} />
              <span>Exporter ce catalogue en JSON</span>
            </button>
          )}
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
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>Catalogue prêt pour AIO !</span>
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
                title="Copier le lien AIO"
              >
                {copiedManifest ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <a
              href={resultData.stremioUrl}
              className="btn btn-secondary"
              style={{ width: '100%', minHeight: '30px', fontSize: '0.75rem', padding: '0.25rem' }}
            >
              <ExternalLink size={12} />
              <span>Installer directement dans Stremio 🚀</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
