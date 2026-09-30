import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowUpDown, Clock, ArrowDownAZ, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function SortDropdown({ value, onChange }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { id: 'manual', label: t('sortManual') || 'Tri : Manuel', icon: SlidersHorizontal },
    { id: 'year-asc', label: t('sortYearAsc') || 'Année (Ancien ➔ Récent)', icon: Clock },
    { id: 'year-desc', label: t('sortYearDesc') || 'Année (Récent ➔ Ancien)', icon: Clock },
    { id: 'alpha', label: t('sortAlpha') || 'Ordre alphabétique A-Z', icon: ArrowDownAZ }
  ];

  const currentOption = sortOptions.find(o => o.id === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: '170px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        style={{
          width: '100%',
          minHeight: '34px',
          padding: '0.35rem 0.65rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.45rem',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)'
        }}
        title="Changer l'ordre de tri"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, overflow: 'hidden' }}>
          <ArrowUpDown size={13} color="var(--emerald)" style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentOption.label}
          </span>
        </div>
        <ChevronDown
          size={13}
          style={{
            opacity: 0.7,
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '220px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--panel-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            zIndex: 1100,
            boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {sortOptions.map((opt) => {
            const isSelected = opt.id === value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--emerald)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Icon size={13} style={{ opacity: isSelected ? 1 : 0.6 }} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={13} color="var(--emerald)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
