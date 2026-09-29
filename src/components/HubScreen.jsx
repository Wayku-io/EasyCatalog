import React from 'react';
import { Film, FolderOpen, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function HubScreen({ onCreateNew, onOpenCollections, currentRepo, onOpenSettings }) {
  const { t } = useLanguage();

  return (
    <div style={{ width: '100%' }}>
      <div className="hub-hero">
        <h1 style={{
          background: 'linear-gradient(135deg, #ffffff 50%, var(--accent-light) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t('hubGreeting')}
        </h1>
        <p>{t('hubSubtitle')}</p>
      </div>

      <div className="hub-cards-grid">
        {/* Card 1: Create New Collection */}
        <div className="hub-action-card" onClick={onCreateNew}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="card-icon-bubble">
              <Film size={26} />
            </div>
            <div>
              <h3>{t('newCollectionTitle')}</h3>
              <p>{t('newCollectionDesc')}</p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
            <PlusCircle size={18} />
            <span>{t('newCollectionBtn')}</span>
          </button>
        </div>

        {/* Card 2: My Collections */}
        <div className="hub-action-card" onClick={onOpenCollections}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="card-icon-bubble" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.28)', color: 'var(--accent-light)' }}>
              <FolderOpen size={26} />
            </div>
            <div>
              <h3>{t('myCollectionsTitle')}</h3>
              <p>{t('myCollectionsDesc')}</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.25rem' }}>
            <FolderOpen size={18} />
            <span>{t('myCollectionsBtn')}</span>
          </button>
        </div>
      </div>

      {/* Connected repo footer */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <ShieldCheck size={18} color="var(--emerald)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('connectedRepo')} <strong style={{ color: '#ffffff' }}>{currentRepo || 'Non configuré'}</strong>
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary"
          style={{ fontSize: '0.775rem', minHeight: '34px', padding: '0.3rem 0.65rem' }}
        >
          {t('settings')} ⚙️
        </button>
      </div>
    </div>
  );
}
