import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Utensils, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

export default function QrEntryPage({ restaurant, onConfirmTable }) {
  const [tableInput, setTableInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validTableData, setValidTableData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if URL has ?table= query parameter to prefill for quick testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    if (tbl) {
      setTableInput(tbl);
    }
  }, []);

  const handleValidateTable = async (e) => {
    if (e) e.preventDefault();
    const cleanNum = tableInput.trim();
    if (!cleanNum) {
      setErrorMessage('Please enter your table number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/tables/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: cleanNum })
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setErrorMessage(data.error || 'Invalid table number. Please enter the table number shown above the QR code.');
        setValidTableData(null);
      } else {
        setValidTableData(data.table);
        setShowConfirmModal(true);
      }
    } catch (err) {
      setErrorMessage('Unable to connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (validTableData) {
      onConfirmTable(validTableData.table_number);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setValidTableData(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(180deg, #fffbeb 0%, #f8fafc 100%)'
    }}>
      {/* Physical QR Standee Visual Representation */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        padding: '28px 24px',
        border: '1px solid rgba(254, 215, 170, 0.4)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Subtle decorative standee label */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '16px'
        }}>
          <span>Table Standee Setup</span>
        </div>

        {/* Restaurant Header */}
        <div style={{ marginBottom: '20px' }}>
          {restaurant?.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                margin: '0 auto 12px',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-md)',
                border: '2px solid var(--primary-border)'
              }}
            />
          )}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Welcome to {restaurant?.name || 'The Royal Saffron'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {restaurant?.tagline || 'Authentic Flavors, Grand Culinary Tradition'}
          </p>
        </div>

        {/* Physical QR Representation Example */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          margin: '0 auto 24px',
          border: '1px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
            background: '#ffffff',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            TABLE {tableInput || '12'}
          </div>

          <div style={{
            background: '#ffffff',
            padding: '10px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <QRCodeSVG
              value={window.location.origin + window.location.pathname}
              size={110}
              level="M"
              fgColor="#1e293b"
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            [ COMMON RESTAURANT QR CODE ]
            <br />
            Scan to Order
          </div>
        </div>

        {/* Table Number Entry Form */}
        <form onSubmit={handleValidateTable} style={{ textAlign: 'left' }}>
          <label style={{
            display: 'block',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            Enter your table number
          </label>

          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 12"
              value={tableInput}
              onChange={(e) => {
                setTableInput(e.target.value);
                setErrorMessage('');
              }}
              className="input-field"
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '0.1em',
                padding: '14px 16px'
              }}
              autoFocus
            />
          </div>

          {/* Helper Text */}
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '18px',
            lineHeight: 1.4
          }}>
            💡 <strong>Note:</strong> Your table number is printed prominently above the QR code on your table standee.
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '18px',
              border: '1px solid #fca5a5'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Continue CTA */}
          <button
            type="submit"
            disabled={loading || !tableInput.trim()}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-md)',
              opacity: loading || !tableInput.trim() ? 0.6 : 1
            }}
          >
            {loading ? (
              <span>Validating Table...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Table Selectors for convenience */}
        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
            Quick Sample Tables:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['1', '4', '12', '15'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setTableInput(num);
                  setErrorMessage('');
                }}
                style={{
                  background: tableInput === num ? 'var(--primary)' : 'var(--bg-muted)',
                  color: tableInput === num ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Table {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Confirmation Modal */}
      {showConfirmModal && validTableData && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '28px 24px', textAlign: 'center', maxWidth: '380px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              Are you sitting at Table {validTableData.table_number}?
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Please confirm so your food and service requests are routed directly to this table.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancelConfirm}
                className="btn btn-secondary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <RotateCcw size={16} />
                <span>Change</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <span>Confirm</span>
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
