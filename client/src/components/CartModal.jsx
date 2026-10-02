import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, CreditCard, Banknote } from 'lucide-react';

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  restaurant,
  tableNumber,
  currency = '₹',
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isPlacingOrder
}) {
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH or ONLINE

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
  const taxRate = restaurant?.tax_rate || 5.0;
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const handleOrderSubmit = () => {
    onPlaceOrder({
      items: cartItems.map(item => ({
        menu_item_id: item.item.id,
        quantity: item.quantity,
        selected_addons: item.selectedAddons || []
      })),
      notes,
      paymentMethod
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Your Order Cart</h2>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid var(--primary-border)'
              }}>
                Table {tableNumber}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {restaurant?.name || 'The Royal Saffron'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ width: '36px', height: '36px', background: 'var(--bg-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Items Area */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛒</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
                Explore our delicious menu items and add them to your table order.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-md)', padding: '10px 20px' }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {cartItems.map((cartItem) => (
                  <div
                    key={cartItem.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {cartItem.item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(cartItem.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Addons display */}
                      {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {cartItem.selectedAddons.map(a => `+ ${a.name} (${currency}${a.price})`).join(', ')}
                        </div>
                      )}

                      {/* Line price and quantity controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px'
                      }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {currency}{cartItem.unitPrice * cartItem.quantity}
                        </span>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#ffffff',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px'
                        }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity - 1)}
                            style={{
                              width: '26px',
                              height: '26px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ width: '26px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                            style={{
                              width: '26px',
                              height: '26px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kitchen Instructions / Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Kitchen Cooking Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra lemon on side"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.88rem', padding: '10px 12px' }}
                />
              </div>

              {/* Payment Mode Preference */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                  Payment Preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'CASH' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === 'CASH' ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <Banknote size={18} />
                    <span>Pay at Restaurant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMethod === 'ONLINE' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: paymentMethod === 'ONLINE' ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: paymentMethod === 'ONLINE' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <CreditCard size={18} />
                    <span>Pay Online (UPI)</span>
                  </button>
                </div>
              </div>

              {/* Bill Breakdown */}
              <div style={{
                background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Item Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST & Taxes ({taxRate}%)</span>
                  <span style={{ fontWeight: 600 }}>{currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '1.05rem',
                  fontWeight: 800
                }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>{currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={handleOrderSubmit}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                opacity: isPlacingOrder ? 0.6 : 1
              }}
            >
              {isPlacingOrder ? 'Sending Order to Kitchen...' : `PLACE ORDER — ${currency}${grandTotal.toFixed(2)}`}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={16} />
              <span>Continue Ordering</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
