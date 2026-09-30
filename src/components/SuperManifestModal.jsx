import React, { useState } from 'react';
import { Zap, X, Loader2, Check, Copy, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';
import { compileSuperManifest, parseRepoString } from '../services/github';

export default function SuperManifestModal({ isOpen, onClose, config }) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { owner, repo } = parseRepoString(config.githubRepo);
      const res = await compileSuperManifest(owner, repo, config.githubToken);
      setResult(res);
      addToast(t('superManifestReady'), 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.jsDelivrUrl) return;
    navigator.clipboard.writeText(result.jsDelivrUrl);
    setCopied(true);
    addToast(t('copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Zap size={22} color="#fbbf24" />
            <h2 className="modal-title">{t('superManifestModalTitle')}</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {t('superManifestModalDesc')}
        </p>

        {!result ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span>{t('compilingSuperManifest')}</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>{t('startSuperManifest')}</span>
              </>
            )}
          </button>
        ) : (
          <div className="result-banner" style={{ marginTop: '0', borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Check size={20} color="var(--emerald)" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
                {t('superManifestReady')}
              </h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('manifestUrlLabel')}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                readOnly
                value={result.jsDelivrUrl}
                className="glass-input"
                style={{ flex: 1, color: '#fbbf24', borderColor: '#f59e0b' }}
              />
              <button onClick={handleCopy} className="btn btn-primary" style={{ background: '#f59e0b' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {result.isUpdate && (
              <div style={{
                marginBottom: '1rem',
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

            <a
              href={result.stremioUrl}
              className="btn btn-secondary"
              style={{
                width: '100%',
                background: 'rgba(245, 158, 11, 0.2)',
                borderColor: '#f59e0b',
                color: '#fff',
                fontWeight: 700
              }}
            >
              <ExternalLink size={18} />
              {t('installStremio')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
