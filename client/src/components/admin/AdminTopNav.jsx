import React from 'react';
import { Volume2, VolumeX, Menu, Bell, RefreshCw, ExternalLink } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

export default function AdminTopNav({
  title,
  soundEnabled,
  onToggleSound,
  onRefresh,
  onOpenMobileMenu,
  onOpenCustomerView,
  adminUser
}) {
  return (
    <header style={{
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="btn btn-icon"
          style={{ width: '38px', height: '38px', background: 'var(--bg-muted)', display: 'none' }}
        >
          <Menu size={20} />
        </button>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Open Customer Menu in new tab */}
        <button
          type="button"
          onClick={onOpenCustomerView}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          title="Open Customer QR Ordering Menu"
        >
          <ExternalLink size={14} />
          <span>Customer View</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={onToggleSound}
          className="btn btn-sm"
          style={{
            background: soundEnabled ? '#ecfdf5' : '#f1f5f9',
            color: soundEnabled ? '#059669' : '#64748b',
            border: soundEnabled ? '1px solid #a7f3d0' : '1px solid var(--border-subtle)'
          }}
          title={soundEnabled ? 'Kitchen chime sound is ON' : 'Kitchen chime sound is MUTED'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
        </button>

        {/* Refresh Data */}
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-icon"
          style={{ width: '36px', height: '36px', background: 'var(--bg-muted)' }}
          title="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>

        {/* Manager Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '10px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {adminUser?.name ? adminUser.name.charAt(0) : 'M'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {adminUser?.name || 'Restaurant Manager'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Manager Desk
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
