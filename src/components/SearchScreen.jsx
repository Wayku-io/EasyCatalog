import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Check, Plus, ArrowRight, ArrowLeft, Loader2, X, Sparkles, Lock, Ban } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import { searchTMDB } from '../services/tmdb';

export default function SearchScreen({
  apiKey,
  selectedItems,
  lockedType,
  onToggleItem,
  onGoToBuilder,
  onBack,
  hasExistingCollection,
  onOpenSettings
}) {
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  
  // Normalized locked state: 'series' or 'movie' or null
  const normalizedLockedType = lockedType === 'tv' || lockedType === 'series' ? 'series' : (lockedType === 'movie' ? 'movie' : null);
  const isSeriesMode = normalizedLockedType === 'series';
  const isMovieMode = normalizedLockedType === 'movie';

  const [mediaType, setMediaType] = useState(() => (isSeriesMode ? 'series' : 'movie'));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Sync mediaType if lockedType changes
  useEffect(() => {
    if (normalizedLockedType && mediaType !== normalizedLockedType) {
      setMediaType(normalizedLockedType);
    }
  }, [normalizedLockedType]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchTMDB(query, mediaType, apiKey, language);
        setResults(res);
      } catch (err) {
        console.error('TMDB Search error', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, mediaType, apiKey, language]);

  const isSelected = (itemId) => {
    return selectedItems.some(i => i.id === itemId);
  };

  const handlePillClick = (type) => {
    if (normalizedLockedType && type !== normalizedLockedType) {
      addToast(t('cannotMixTypesError'), 'error');
      return;
    }
    setMediaType(type);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header Panel */}
      <div className="glass-panel search-header-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ minHeight: '38px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} />
            <span>{hasExistingCollection ? t('backToBuilder') : t('backToHub')}</span>
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, textAlign: 'right' }}>
            {t('searchTitle')}
          </h2>
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="glass-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
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
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters: ONLY Films and Séries */}
        <div className="type-filter-group">
          <button
            className={`type-pill ${mediaType === 'movie' ? 'active' : ''} ${isSeriesMode ? 'disabled-locked' : ''}`}
            onClick={() => handlePillClick('movie')}
            style={isSeriesMode ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
            title={isSeriesMode ? t('typeLockedNoticeSeries') : undefined}
          >
            <Film size={14} />
            <span>{t('movies')}</span>
            {isSeriesMode && <Lock size={12} style={{ marginLeft: '4px' }} />}
          </button>

          <button
            className={`type-pill ${mediaType === 'series' ? 'active' : ''} ${isMovieMode ? 'disabled-locked' : ''}`}
            onClick={() => handlePillClick('series')}
            style={isMovieMode ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
            title={isMovieMode ? t('typeLockedNoticeMovie') : undefined}
          >
            <Tv size={14} />
            <span>{t('series')}</span>
            {isMovieMode && <Lock size={12} style={{ marginLeft: '4px' }} />}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {!apiKey ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
          <Film size={40} color="var(--accent-light)" style={{ opacity: 0.5, margin: '0 auto 0.75rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.35rem', fontSize: '1.15rem' }}>{t('tmdbKeyRequiredTitle')}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {t('tmdbKeyRequiredDesc')}
          </p>
          <button onClick={onOpenSettings} className="btn btn-primary" style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
            {t('configureTmdbBtn')}
          </button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>{t('searching')}</p>
        </div>
      ) : query && results.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1rem' }}>{t('noResults')}</p>
        </div>
      ) : !query ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-secondary)' }}>
          <Sparkles size={40} color="var(--accent-light)" style={{ opacity: 0.4, margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.95rem' }}>{t('typeToSearch')}</p>
        </div>
      ) : (
        <div className="movie-grid">
          {results.map((item) => {
            const added = isSelected(item.id);
            const isTypeIncompatible = normalizedLockedType && (
              isSeriesMode ? (item.type !== 'series' && item.type !== 'tv') : item.type !== 'movie'
            );
            return (
              <div
                key={item.id}
                className="movie-card"
                onClick={() => onToggleItem(item)}
                style={isTypeIncompatible ? { opacity: 0.45, filter: 'grayscale(0.6)' } : {}}
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
                {isTypeIncompatible && (
                  <span className="card-badge" style={{
                    top: 'auto',
                    bottom: '3.2rem',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    zIndex: 2
                  }}>
                    <Ban size={10} />
                    Incompatible
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

      {/* Floating Bottom Bar: Single arrow and clean "Suivant" */}
      {selectedItems.length > 0 && (
        <div className="floating-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: '#fff',
              fontWeight: 800,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px var(--accent-glow)'
            }}>
              {selectedItems.length}
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {t('selectedCount')}
            </span>
          </div>

          <button
            onClick={onGoToBuilder}
            className="btn btn-primary"
            style={{ minHeight: '40px', padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}
          >
            <span>{t('goToBuilder')}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
