import React, { useState, useEffect } from 'react';
import { Folder, X, Trash2, Copy, Check, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import {
  fetchExistingCollections,
  loadCollectionData,
  deleteCollectionFromGithub,
  parseRepoString
} from '../services/github';

export default function LoadModal({
  isOpen,
  onClose,
  config,
  onSelectCollection,
  onOpenSettings
}) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);

  useEffect(() => {
    if (isOpen && config?.githubToken && config?.githubRepo) {
      loadCollectionsList();
    }
  }, [isOpen, config]);

  const loadCollectionsList = async () => {
    setLoading(true);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const list = await fetchExistingCollections(owner, repo, config.githubToken);
      setCollections(list);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (col) => {
    setLoadingId(col.path);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const data = await loadCollectionData(owner, repo, config.githubToken, col.path);
      onSelectCollection(data);
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopy = (col, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(col.manifestUrl);
    setCopiedPath(col.path);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDelete = async (col, e) => {
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Folder size={22} color="var(--cyan)" />
            <h2 className="modal-title">{t('collectionsModalTitle')}</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        {!config?.githubToken || !config?.githubRepo ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
            <Folder size={40} color="var(--cyan)" style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Configuration GitHub requise</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Pour synchroniser, charger et modifier vos collections en ligne, veuillez renseigner votre token GitHub et votre dépôt dans les paramètres.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenSettings) onOpenSettings();
              }}
              className="btn btn-primary"
            >
              Ouvrir les Paramètres ⚙️
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
            <p>{t('collectionsLoading')}</p>
          </div>
        ) : collections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{t('noCollectionsFound')}</p>
            <p style={{ fontSize: '0.85rem' }}>Dépôt : {config?.githubRepo}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.35rem' }}>
            {collections.map(col => (
              <div
                key={col.path}
                className="builder-item"
                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                onClick={() => handleOpen(col)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan)',
                    flexShrink: 0
                  }}>
                    <Folder size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.975rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {col.displayName}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {col.name}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <button
                    onClick={(e) => handleCopy(col, e)}
                    className="btn btn-secondary btn-icon-only"
                    style={{ padding: '0.4rem' }}
                    title={t('copyDirectLink')}
                  >
                    {copiedPath === col.path ? <Check size={16} color="var(--emerald)" /> : <Copy size={16} />}
                  </button>

                  <button
                    onClick={(e) => handleDelete(col, e)}
                    className="btn btn-danger btn-icon-only"
                    style={{ padding: '0.4rem' }}
                    title={t('deleteCollection')}
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                  >
                    {loadingId === col.path ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <span>{t('openInEditor')}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
