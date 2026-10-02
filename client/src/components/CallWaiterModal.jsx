import React, { useState } from 'react';
import { X, Bell, Droplets, UtensilsCrossed, Receipt, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { soundEffects } from '../utils/audio';

const HELP_OPTIONS = [
  { id: 'Water', label: 'Drinking Water', icon: '💧', desc: 'Fresh / chilled water glasses' },
  { id: 'Extra Plates', label: 'Extra Plates', icon: '🍽️', desc: 'Quarter / main dining plates' },
  { id: 'Extra Cutlery', label: 'Extra Cutlery', icon: '🍴', desc: 'Spoons, forks & butter knives' },
  { id: 'Napkins', label: 'Tissue / Napkins', icon: '🧻', desc: 'Paper napkins & wet wipes' },
  { id: 'Bill', label: 'Request the Bill', icon: '🧾', desc: 'Print bill & invoice for table' },
  { id: 'General Assistance', label: 'General Assistance', icon: '🙋', desc: 'Assistance from table captain' }
];

export default function CallWaiterModal({
  isOpen,
  onClose,
  tableNumber,
  activeRequests = [],
  onSubmitRequest,
  isSubmitting
}) {
  const [selectedType, setSelectedType] = useState('Water');
  const [message, setMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    await onSubmitRequest(selectedType, message);
    setSubmittedSuccess(true);
    setMessage('');
    soundEffects.playHelpAlert();
    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITER_INFORMED':
        return <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>🟡 Waiter Informed</span>;
      case 'BEING_HANDLED':
        return <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>🔵 Being Handled</span>;
      case 'COMPLETED':
        return <span className="badge" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>🟢 Completed</span>;
      default:
        return <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>🔴 Pending Admin</span>;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Request Table Help</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Assistance for <strong>Table {tableNumber}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '34px', height: '34px', background: 'var(--bg-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Active Requests Status Banner */}
          {activeRequests.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Active Help Requests for Table {tableNumber}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                        {req.request_type}
                      </div>
                      {req.message && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          "{req.message}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submittedSuccess && (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              border: '1px solid #86efac'
            }}>
              <CheckCircle2 size={18} />
              <span>Help request sent! Restaurant manager has been notified.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
              What do you need?
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
              {HELP_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedType(opt.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{opt.icon}</div>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)'
                    }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Message */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Additional Message (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please bring two glasses of warm water"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.88rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedType}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              <Bell size={18} />
              <span>{isSubmitting ? 'Sending Request...' : 'SEND REQUEST'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
