import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, Utensils, ArrowRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function OrderConfirmationModal({
  order,
  tableNumber,
  currency = '₹',
  onTrackOrder,
  onContinueOrdering
}) {
  if (!order) return null;

  useEffect(() => {
    // Trigger celebration chime and confetti
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-content" 
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          maxWidth: '400px'
        }}
      >
        {/* Animated Checkmark */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          background: '#dcfce7',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 8px 20px rgba(22, 163, 74, 0.25)'
        }}>
          <CheckCircle2 size={46} strokeWidth={2.5} />
        </div>

        <span style={{
          background: '#dcfce7',
          color: '#15803d',
          fontWeight: 800,
          fontSize: '0.82rem',
          letterSpacing: '0.08em',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          ✓ ORDER PLACED!
        </span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          Order #{order.order_number}
        </h2>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.88rem',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          🪑 Table {tableNumber}
        </div>

        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '20px'
        }}>
          Your order has been sent to the restaurant kitchen. Our chefs are preparing your meal!
        </p>

        {/* Estimated Prep Time Card */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Clock size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Preparation</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ~{order.estimated_prep_minutes || 20} mins
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
              {currency}{order.total_amount}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={onTrackOrder}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}
          >
            <span>Track Order Status</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={onContinueOrdering}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
          >
            Continue Ordering
          </button>
        </div>
      </div>
    </div>
  );
}
