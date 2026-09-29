import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, Wifi, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from './Toast';

export default function MobileModal({ isOpen, onClose, localIp = '192.168.1.16', port = '5173' }) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Lock body scroll when open
  React.useEffect(() => {
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

  if (!isOpen) return null;

  const mobileUrl = `http://${localIp}:${port}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(mobileUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    addToast("Lien mobile copié !", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className="modal-header" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Smartphone size={22} color="var(--accent-light)" />
            <h2 className="modal-title" style={{ fontSize: '1.35rem' }}>Tester sur mobile / iPhone</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label={t('close')}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Scannez simplement ce QR code avec l'appareil photo de votre iPhone pour ouvrir <strong>EasyCatalog</strong>.
        </p>

        {/* QR Code Container */}
        <div style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          display: 'inline-block',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          marginBottom: '1.25rem'
        }}>
          <img
            src={qrUrl}
            alt="QR Code EasyCatalog"
            width={220}
            height={220}
            style={{ display: 'block', borderRadius: '4px' }}
          />
        </div>

        {/* IP Address Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          marginBottom: '1.25rem'
        }}>
          <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--accent-light)', flex: 1, textAlign: 'left' }}>
            {mobileUrl}
          </span>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-icon-only"
            style={{ padding: '0.4rem' }}
            title="Copier l'adresse"
          >
            {copied ? <Check size={16} color="var(--emerald)" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Wi-Fi notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          textAlign: 'left'
        }}>
          <Wifi size={18} color="var(--cyan)" style={{ flexShrink: 0 }} />
          <span>Votre iPhone et votre ordinateur doivent être connectés au <strong>même réseau Wi-Fi</strong>.</span>
        </div>
      </div>
    </div>
  );
}
