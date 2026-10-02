import React, { useState } from 'react';
import { X, Star, Plus, Minus, Check, Sparkles } from 'lucide-react';

export default function FoodDetailModal({ item, currency = '₹', onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  if (!item) return null;

  const handleToggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const singleUnitPrice = item.price + addonTotal;
  const totalPrice = singleUnitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedAddons, singleUnitPrice);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-icon"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}
        >
          <X size={20} />
        </button>

        {/* Large Food Image */}
        <div style={{ position: 'relative', width: '100%', height: '240px', background: '#e2e8f0' }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }} />
          
          {/* Dietary Badge */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className={item.dietary === 'VEG' ? 'veg-indicator' : 'non-veg-indicator'} />
            <span style={{
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {item.dietary === 'VEG' ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            </span>
          </div>

          {/* Rating Badge */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            background: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 800,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{item.rating || 4.8}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3 }}>
              {item.name}
            </h2>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--primary)',
              whiteSpace: 'nowrap'
            }}>
              {currency}{item.price}
            </div>
          </div>

          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '20px'
          }}>
            {item.description}
          </p>

          {/* Optional Add-ons */}
          {item.addons && item.addons.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '10px'
              }}>
                <Sparkles size={16} color="var(--primary)" />
                <span>Customize / Add-ons</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Optional)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isChecked ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isChecked ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isChecked ? 'none' : '1.5px solid var(--border-medium)',
                          background: isChecked ? 'var(--primary)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff'
                        }}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {addon.name}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: addon.price > 0 ? 'var(--primary)' : '#16a34a'
                      }}>
                        {addon.price > 0 ? `+${currency}${addon.price}` : 'Free'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls & Add to Cart CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {/* Quantity Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-icon"
                style={{ width: '36px', height: '36px', background: '#ffffff', color: 'var(--text-primary)' }}
              >
                <Minus size={16} />
              </button>
              <span style={{
                width: '38px',
                textAlign: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'var(--font-heading)'
              }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="btn btn-icon"
                style={{ width: '36px', height: '36px', background: '#ffffff', color: 'var(--text-primary)' }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAdd}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800
              }}
            >
              ADD TO CART — {currency}{totalPrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
