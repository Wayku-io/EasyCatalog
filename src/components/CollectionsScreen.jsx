import React, { useState, useEffect } from 'react';
import {
  Folder,
  ArrowLeft,
  Edit3,
  Copy,
  Check,
  Trash2,
  Package,
  Zap,
  Loader2,
  PlusCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import {
  fetchExistingCollections,
  loadCollectionData,
  deleteCollectionFromGithub,
  compileSuperManifest,
  fetchSuperManifestInfo,
  parseRepoString
} from '../services/github';

export default function CollectionsScreen({
  config,
  onBack,
  onOpenEditorWithData,
  onCreateNew,
  onOpenSettings
}) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);

  // Super manifest / Complete Pack state
  const [isCompilingPack, setIsCompilingPack] = useState(false);
  const [packResult, setPackResult] = useState(null);
  const [copiedPack, setCopiedPack] = useState(false);

  useEffect(() => {
    if (config?.githubToken && config?.githubRepo) {
      loadCollections();
    }
  }, [config]);

  const loadCollections = async () => {
    setLoading(true);
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
      onOpenEditorWithData(data);
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

  return (
    <div className="mobile-page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button onClick={onBack} className="btn btn-secondary mobile-touch-btn" style={{ padding: '0.5rem 0.9rem' }}>
          <ArrowLeft size={18} />
          <span>{t('backToHub')}</span>
        </button>
        <button onClick={onCreateNew} className="btn btn-primary mobile-touch-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
          <PlusCircle size={16} />
          <span>{t('newCatalogShort')}</span>
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>
          {t('collectionsTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          {t('collectionsSubtitle')}
        </p>
      </div>

      {/* GitHub missing check */}
      {!config?.githubToken || !config?.githubRepo ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.25rem', marginBottom: '1.5rem' }}>
          <Folder size={40} color="var(--cyan)" style={{ opacity: 0.6, margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.15rem' }}>{t('configureRepoNotice')}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {t('configureRepoNotice')}
          </p>
          <button onClick={onOpenSettings} className="btn btn-primary" style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
            {t('settings')} ⚙️
          </button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p>{t('collectionsLoading')}</p>
        </div>
      ) : (
        <>
          {/* PACK COMPLET (All-In-One Pack) */}
          {collections.length > 0 && (
            <div className="glass-panel" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.12))',
              borderColor: 'rgba(245, 158, 11, 0.35)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <Package size={22} color="#fbbf24" />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  {t('allInOnePackTitle')}
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {t('allInOnePackDesc')}
              </p>

              {!packResult ? (
                <button
                  onClick={handleCompilePack}
                  disabled={isCompilingPack}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    padding: '0.75rem',
                    fontSize: '0.9rem'
                  }}
                >
                  {isCompilingPack ? (
                    <>
                      <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{t('compilingPack')}</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>{t('compilePackBtn')}</span>
                    </>
                  )}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      readOnly
                      value={packResult.jsDelivrUrl}
                      className="glass-input"
                      style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', color: '#fbbf24', borderColor: '#f59e0b' }}
                    />
                    <button
                      onClick={handleCopyPack}
                      className="btn btn-primary"
                      style={{ background: '#f59e0b', padding: '0.5rem 0.85rem' }}
                    >
                      {copiedPack ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={handleCompilePack}
                    disabled={isCompilingPack || collections.length === 0}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      color: '#fbbf24',
                      borderColor: 'rgba(245, 158, 11, 0.4)'
                    }}
                    title={t('updatePackBtn')}
                  >
                    <RefreshCw size={13} className={isCompilingPack ? 'spinner' : ''} />
                    <span>{isCompilingPack ? t('updatingPack') : t('updatePackBtn')}</span>
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                    {t('aioHelpTip')}
                  </span>
                  {packResult.isUpdate && (
                    <div style={{
                      marginTop: '0.2rem',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.65rem',
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
          )}

          {/* LISTE DES CATALOGUES */}
          {collections.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Folder size={44} color="var(--accent-light)" style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', marginBottom: '0.4rem', fontSize: '1.15rem' }}>{t('noCollectionsFound')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {t('createFirstColNotice')}
              </p>
              <button onClick={onCreateNew} className="btn btn-primary" style={{ width: '100%', maxWidth: '260px', margin: '0 auto' }}>
                <PlusCircle size={16} />
                <span>{t('newCollectionBtn')}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {collections.map(col => (
                <div
                  key={col.path}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-light)',
                      flexShrink: 0
                    }}>
                      <Folder size={20} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.displayName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {col.name}
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action tactiles bien espacés */}
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', width: '100%' }}>
                    <button
                      onClick={() => handleOpen(col)}
                      disabled={loadingId === col.path}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '0.6rem 0.65rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {loadingId === col.path ? (
                        <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <Edit3 size={15} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t('editBtn')}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleCopy(col, e)}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        flexShrink: 0
                      }}
                      title={t('copyDirectLink')}
                    >
                      {copiedPath === col.path ? (
                        <Check size={15} color="var(--emerald)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Copy size={15} style={{ flexShrink: 0 }} />
                      )}
                      <span>{copiedPath === col.path ? t('copied') : t('copyBtnShort')}</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(col, e)}
                      className="btn btn-danger btn-icon-only"
                      style={{
                        width: '38px',
                        height: '38px',
                        minHeight: '38px',
                        padding: 0,
                        flexShrink: 0,
                        borderRadius: 'var(--radius-md)'
                      }}
                      title={t('deleteCollection')}
                      aria-label={t('deleteCollection')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
