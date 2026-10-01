import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  PlusCircle,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
  Film,
  ArrowUpDown,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import SortDropdown from './SortDropdown';

export default function BuilderScreen({
  catalogName,
  setCatalogName,
  items,
  setItems,
  sortOption = 'manual',
  setSortOption,
  onSortChange,
  onAddMoreItems,
  onPublish,
  isPublishing,
  resultData,
  onReset,
  onBackToHub,
  editingCollectionPath
}) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Move item up
  const moveUp = (index) => {
    if (index === 0) return;
    setItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    if (onSortChange) onSortChange('manual');
    else setSortOption?.('manual');
  };

  // Move item down
  const moveDown = (index) => {
    if (index === items.length - 1) return;
    setItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    if (onSortChange) onSortChange('manual');
    else setSortOption?.('manual');
  };

  // Remove item
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Handle Sort Change
  const handleSortChange = (newVal) => {
    if (onSortChange) {
      onSortChange(newVal);
    }
  };

  // Copy manifest URL
  const copyManifestUrl = () => {
    if (!resultData?.jsDelivrUrl) return;
    navigator.clipboard.writeText(resultData.jsDelivrUrl);
    setCopied(true);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm(t('clearConfirm'))) {
      setItems([]);
      setCatalogName('');
      onReset();
    }
  };

  return (
    <div className="builder-layout">
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button onClick={onBackToHub} className="btn btn-secondary" style={{ minHeight: '38px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>{t('backToHub')}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {items.length > 0 && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-light)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {(items[0]?.type === 'series' || items[0]?.type === 'tv') ? '📺 ' + t('catalogTypeSeries') : '🎬 ' + t('catalogTypeMovie')}
            </span>
          )}
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            {items.length} {t('selectedCount')}
          </span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
            {t('builderTitle')}
          </h2>
          {editingCollectionPath && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.72rem',
              color: 'var(--accent-light)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              padding: '0.15rem 0.45rem',
              fontWeight: 600
            }}>
              <Sparkles size={11} />
              {t('editingModeBadge')}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {t('builderSubtitle')}
        </p>

        {/* Catalog Name Field */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">{t('catalogNameLabel')}</label>
          <input
            type="text"
            className="glass-input"
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
            placeholder={t('catalogNamePlaceholder')}
          />
        </div>

        {/* Action Buttons Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={onAddMoreItems}
            className="btn btn-primary"
            style={{ flex: 1, minHeight: '42px', fontSize: '0.875rem' }}
          >
            <PlusCircle size={16} />
            <span>{(items[0]?.type === 'series' || items[0]?.type === 'tv') ? t('addMoreSeries') : (items[0]?.type === 'movie' ? t('addMoreMovies') : t('addMoreItems'))}</span>
          </button>

          {/* Quick Sort Dropdown */}
          <SortDropdown value={sortOption} onChange={handleSortChange} />

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="btn btn-danger btn-icon-only"
              style={{ width: '42px', height: '42px' }}
              title={t('clearList')}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Natural Scroll List of Titles */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Film size={40} color="var(--accent-light)" style={{ opacity: 0.4, margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#fff', marginBottom: '0.35rem', fontSize: '1.1rem' }}>{t('emptyBuilder')}</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>{t('emptyBuilderAction')}</p>
            <button onClick={onAddMoreItems} className="btn btn-primary" style={{ width: '100%', maxWidth: '240px', margin: '0 auto' }}>
              <PlusCircle size={16} />
              <span>{t('addMoreItems')}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="builder-item"
                style={{
                  borderLeft: `3px solid ${item.type === 'movie' ? 'var(--accent)' : 'var(--cyan)'}`
                }}
              >
                <img
                  src={item.poster}
                  alt={item.title}
                  className="builder-item-poster"
                />

                <div className="builder-item-info">
                  <div className="builder-item-title">{item.title}</div>
                  <div className="builder-item-meta">
                    <span style={{ textTransform: 'capitalize' }}>
                      {item.type === 'movie' ? t('movies') : t('series')}
                    </span>
                    {' • '}
                    <span>{item.year}</span>
                  </div>
                </div>

                {/* Arrow up/down controls */}
                <div className="builder-item-actions">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="btn btn-secondary btn-icon-only"
                    style={{ width: '36px', height: '36px' }}
                    title={t('moveUp')}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="btn btn-secondary btn-icon-only"
                    style={{ width: '36px', height: '36px' }}
                    title={t('moveDown')}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger btn-icon-only"
                    style={{ width: '36px', height: '36px', marginLeft: '0.2rem' }}
                    title={t('removeItem')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button: Publish to GitHub / Update */}
        {items.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <button
              onClick={onPublish}
              disabled={isPublishing || items.length === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '0.95rem',
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
                <span>{t('updatingOnGithub')}</span>
              ) : editingCollectionPath ? (
                <>
                  <UploadCloud size={18} />
                  <span>{t('updateCatalogBtn')}</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>{t('publishToGithub')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Result Card when manifest is generated */}
      {resultData && resultData.jsDelivrUrl && (
        <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.12))',
          borderColor: 'var(--accent)',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Check size={20} color="var(--emerald)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
              {t('manifestReady')}
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            {t('manifestUrlLabel')}
          </p>

          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <input
              type="text"
              readOnly
              value={resultData.jsDelivrUrl}
              className="glass-input"
              style={{ flex: 1, color: 'var(--accent-light)', borderColor: 'var(--accent)', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
            />
            <button
              onClick={copyManifestUrl}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.85rem', flexShrink: 0 }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45
          }}>
            {t('aioHelpTip')}
          </div>

          {resultData.isUpdate && (
            <div style={{
              marginTop: '0.65rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              color: '#fbbf24',
              lineHeight: 1.4
            }}>
              {t('reinstallNotice')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
