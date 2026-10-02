import React from 'react';
import { ShoppingBag, Bell, Utensils, Clock } from 'lucide-react';

export default function CustomerHeader({ 
  restaurant, 
  tableNumber, 
  cartCount, 
  onOpenCart, 
  onOpenHelp, 
  onOpenOrders, 
  activeOrdersCount = 0,
  activeHelpCount = 0
}) {
  return (
    <header className="glass-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      {/* Brand & Table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {restaurant?.logo ? (
          <img 
            src={restaurant.logo} 
            alt={restaurant.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1.5px solid var(--primary-border)'
            }}
          />
        ) : (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800
          }}>
            RS
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: '1rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2
          }}>
            {restaurant?.name || 'The Royal Saffron'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid var(--primary-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🪑 Table {tableNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Call Waiter */}
        <button
          onClick={onOpenHelp}
          className="btn"
          style={{
            padding: '8px 12px',
            background: activeHelpCount > 0 ? '#fef3c7' : '#ffffff',
            color: activeHelpCount > 0 ? '#b45309' : 'var(--text-secondary)',
            border: activeHelpCount > 0 ? '1.5px solid #f59e0b' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 700,
            position: 'relative'
          }}
          title="Call Waiter"
        >
          <Bell size={16} color={activeHelpCount > 0 ? '#b45309' : 'currentColor'} />
          <span style={{ display: 'none' }}>Call Waiter</span>
          {activeHelpCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#f59e0b',
              border: '2px solid #fff'
            }} className="pulse-alert" />
          )}
        </button>

        {/* My Orders / Tracking */}
        {activeOrdersCount > 0 && (
          <button
            onClick={onOpenOrders}
            className="btn"
            style={{
              padding: '8px 12px',
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} />
            <span>Orders ({activeOrdersCount})</span>
          </button>
        )}

        {/* Cart Button */}
        <button
          onClick={onOpenCart}
          className="btn btn-primary"
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            position: 'relative'
          }}
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && (
            <span style={{
              background: '#ffffff',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '2px'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
