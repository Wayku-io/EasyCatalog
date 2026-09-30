import React, { useState } from 'react';
import { Shield, Scale, FileText, CheckCircle2, ExternalLink, X, Lock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LegalModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('legal'); // 'legal' | 'privacy' | 'disclaimer'

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 1200 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald)'
            }}>
              <Scale size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Mentions Légales & Confidentialité</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Conformité RGPD, Propriété Intellectuelle & Conditions d'utilisation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          margin: '0.85rem 0'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'legal' ? 600 : 400,
              background: activeTab === 'legal' ? 'var(--emerald)' : 'transparent',
              color: activeTab === 'legal' ? '#041e15' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Scale size={13} />
            <span>Mentions Légales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'privacy' ? 600 : 400,
              background: activeTab === 'privacy' ? 'var(--emerald)' : 'transparent',
              color: activeTab === 'privacy' ? '#041e15' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Lock size={13} />
            <span>Confidentialité & RGPD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'disclaimer' ? 600 : 400,
              background: activeTab === 'disclaimer' ? 'var(--emerald)' : 'transparent',
              color: activeTab === 'disclaimer' ? '#041e15' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <AlertTriangle size={13} />
            <span>Avertissement & TMDB</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {activeTab === 'legal' && (
            <>
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Scale size={15} color="var(--emerald)" />
                  1. Éditeur de l'application
                </h3>
                <p style={{ margin: 0 }}>
                  <strong>EasyCatalog</strong> est un projet logiciel open-source développé à des fins personnelles et communautaires par <strong>Wayku</strong>.
                  <br />
                  Le code source public est accessible sur le dépôt officiel :{' '}
                  <a
                    href="https://github.com/Wayku-io/EasyCatalog"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--emerald)', textDecoration: 'none' }}
                  >
                    github.com/Wayku-io/EasyCatalog
                  </a>.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={15} color="var(--emerald)" />
                  2. Hébergement
                </h3>
                <p style={{ margin: 0 }}>
                  Le site web et les fonctions d'authentification sont hébergés par :
                  <br />
                  <strong>Vercel Inc.</strong>
                  <br />
                  440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
                  <br />
                  Site officiel :{' '}
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald)' }}>
                    https://vercel.com
                  </a>
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} color="var(--emerald)" />
                  3. Nature du service
                </h3>
                <p style={{ margin: 0 }}>
                  EasyCatalog est un outil technique exécuté côté client dans le navigateur de l'utilisateur. Il permet de générer des fichiers de configuration au format JSON (manifestes Stremio) indexant des métadonnées publiques pour organiser des collections personnelles.
                </p>
              </div>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>
                  Zéro cookie tiers, zéro tracking publicitaire, zéro collecte de données personnelles.
                </span>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  1. Stockage 100 % Local (LocalStorage)
                </h3>
                <p style={{ margin: 0 }}>
                  Toutes vos clés d'accès (clé TMDB, token GitHub) et préférences de langue sont stockées <strong>exclusivement sur votre machine locale</strong> dans le <code>localStorage</code> de votre propre navigateur. Elles ne transitent jamais sur nos serveurs et ne sont jamais enregistrées dans une base de données tierce.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  2. Authentification OAuth GitHub
                </h3>
                <p style={{ margin: 0 }}>
                  La fonction relais <code>/api/auth</code> sert uniquement à échanger de manière sécurisée et éphémère le code d'autorisation contre un token d'accès officiel GitHub. Aucun token, mot de passe ou donnée utilisateur n'est persisté sur le serveur Vercel.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  3. Services tiers sollicités
                </h3>
                <p style={{ margin: 0 }}>
                  Dans le cadre strict du fonctionnement de l'application, des requêtes directes sont effectuées vers :
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', marginBottom: 0 }}>
                  <li><strong>The Movie Database (TMDB)</strong> : pour la recherche et l'affichage des affiches et résumés.</li>
                  <li><strong>GitHub API</strong> : pour publier vos catalogues sur votre propre dépôt GitHub.</li>
                  <li><strong>jsDelivr</strong> : pour distribuer vos manifestes JSON publiquement et gratuitement.</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'disclaimer' && (
            <>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                color: '#fde68a',
                fontSize: '0.82rem',
                lineHeight: 1.5
              }}>
                <strong>⚠️ Avertissement Légal Important :</strong>
                <br />
                EasyCatalog n'héberge, ne diffuse, ne transmet et ne stocke <strong>AUCUN fichier vidéo, aucun flux de streaming ni aucun contenu multimédia protégé par des droits d'auteur</strong>.
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  1. Attribution obligatoire TMDB
                </h3>
                <p style={{ margin: 0 }}>
                  Ce produit utilise l'API TMDB mais n'est ni certifié, ni sponsorisé, ni approuvé par The Movie Database (TMDB).
                  <br />
                  Toutes les métadonnées (titres, résumés, dates) et affiches de films/séries proviennent de la base communautaire TMDB.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  2. Marques et Décharge
                </h3>
                <p style={{ margin: 0 }}>
                  Stremio, Nuvio, TMDB et GitHub sont des marques déposées et la propriété exclusive de leurs détenteurs respectifs. EasyCatalog est un outil tiers indépendant sans lien capitalistique ni commercial avec ces entités.
                </p>
              </div>

              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  3. Responsabilité de l'utilisateur
                </h3>
                <p style={{ margin: 0 }}>
                  L'utilisateur est seul et unique responsable des listes, catalogues et métadonnées qu'il choisit de créer, compiler ou publier sur son propre compte GitHub.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.8rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            EasyCatalog © 2026 • Projet Open-Source par Wayku
          </span>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
