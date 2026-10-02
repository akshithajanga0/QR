import React, { useState } from 'react';
import { Search, Star, Plus, Flame, Sparkles, AlertCircle } from 'lucide-react';

export default function CustomerMenu({
  categories = [],
  menuItems = [],
  currency = '₹',
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenFoodDetail,
  onQuickAdd
}) {
  // Filter items
  const specials = menuItems.filter(item => item.is_special && item.is_available);
  const popular = menuItems.filter(item => item.is_popular && item.is_available);

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search menu items, ingredients, biryani..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field"
          style={{
            paddingLeft: '42px',
            borderRadius: 'var(--radius-lg)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills (Horizontally Scrollable) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            border: selectedCategory === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
            background: selectedCategory === 'all' ? 'var(--primary)' : '#ffffff',
            color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.86rem',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Today's Specials (Horizontal Carousel if All is selected and no search) */}
      {selectedCategory === 'all' && !searchQuery && specials.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Chef's Today's Specials</h3>
          </div>

          <div style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none'
          }}>
            {specials.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenFoodDetail(item)}
                style={{
                  minWidth: '220px',
                  maxWidth: '220px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div style={{ position: 'relative', height: '125px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    ⭐ CHEF PICK
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px'
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {currency}{item.price}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(item);
                      }}
                      className="btn btn-subtle btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Menu Grid / Grouped Sections */}
      <div>
        {categories
          .filter(cat => selectedCategory === 'all' || selectedCategory === cat.id)
          .map((cat) => {
            const catItems = menuItems.filter(i => i.category_id === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} style={{ marginBottom: '28px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  borderBottom: '2px solid var(--border-subtle)',
                  paddingBottom: '6px'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {catItems.length} items
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {catItems.map((item) => {
                    const isSoldOut = !item.is_available;

                    return (
                      <div
                        key={item.id}
                        onClick={() => !isSoldOut && onOpenFoodDetail(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          background: '#ffffff',
                          borderRadius: 'var(--radius-lg)',
                          padding: '14px',
                          border: '1px solid var(--border-subtle)',
                          boxShadow: 'var(--shadow-xs)',
                          cursor: isSoldOut ? 'default' : 'pointer',
                          opacity: isSoldOut ? 0.65 : 1,
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Food Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Veg/Non-Veg & Rating */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className={item.dietary === 'VEG' ? 'veg-indicator' : 'non-veg-indicator'} />
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#b45309'
                            }}>
                              <Star size={12} fill="#f59e0b" color="#f59e0b" />
                              <span>{item.rating || 4.8}</span>
                            </div>
                            {item.is_popular ? (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                background: '#fef3c7',
                                color: '#b45309',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                🔥 POPULAR
                              </span>
                            ) : null}
                          </div>

                          {/* Food Name */}
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            lineHeight: 1.3,
                            color: 'var(--text-primary)',
                            marginBottom: '4px'
                          }}>
                            {item.name}
                          </h4>

                          {/* Short Description */}
                          <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.4,
                            marginBottom: '10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {item.description}
                          </p>

                          {/* Price */}
                          <div style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: 'var(--primary)',
                            fontFamily: 'var(--font-heading)'
                          }}>
                            {currency}{item.price}
                          </div>
                        </div>

                        {/* Food Image and + Add Button Container */}
                        <div style={{
                          position: 'relative',
                          width: '105px',
                          height: '105px',
                          flexShrink: 0,
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />

                          {/* SOLD OUT Overlay or ADD Button */}
                          {isSoldOut ? (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(15, 23, 42, 0.75)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              letterSpacing: '0.05em'
                            }}>
                              SOLD OUT
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickAdd(item);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{
                                position: 'absolute',
                                bottom: '6px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '4px 14px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                borderRadius: 'var(--radius-full)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Plus size={13} strokeWidth={3} />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {menuItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🍽️</div>
          <h3>No menu items found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try searching with a different keyword.</p>
        </div>
      )}
    </div>
  );
}
