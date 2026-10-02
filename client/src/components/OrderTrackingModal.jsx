import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Bell, ChevronDown, ChevronUp, ChefHat, Sparkles } from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Received', icon: '📝' },
  { key: 'ACCEPTED', label: 'Accepted', icon: '👍' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'READY', label: 'Ready for Table', icon: '🛎️' },
  { key: 'SERVED', label: 'Served', icon: '🍽️' }
];

export default function OrderTrackingModal({
  isOpen,
  onClose,
  orders = [],
  tableNumber,
  currency = '₹',
  onContinueOrdering,
  onOpenHelp
}) {
  const [expandedOrderIds, setExpandedOrderIds] = useState({});

  if (!isOpen) return null;

  const toggleExpand = (id) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStepIndex = (status) => {
    if (status === 'COMPLETED' || status === 'SERVED') return 4;
    if (status === 'READY') return 3;
    if (status === 'PREPARING') return 2;
    if (status === 'ACCEPTED') return 1;
    return 0; // PENDING
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
        {/* Modal Header */}
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
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Table Dining Orders</h2>
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
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed in this session
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

        {/* Orders List */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <p>No orders placed yet for this table session.</p>
            </div>
          ) : (
            orders.map((order, orderIdx) => {
              const currentStepIdx = getStepIndex(order.status);
              const isExpanded = expandedOrderIds[order.id] !== false; // expanded by default

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Order Card Top Banner */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--bg-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-medium)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        #{order.order_number}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                          Order #{order.order_number}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '16px' }}>
                      {/* Step Progress Stepper */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        marginBottom: '20px',
                        marginTop: '4px'
                      }}>
                        {/* Connecting track */}
                        <div style={{
                          position: 'absolute',
                          top: '14px',
                          left: '12px',
                          right: '12px',
                          height: '3px',
                          background: 'var(--border-subtle)',
                          zIndex: 0
                        }}>
                          <div style={{
                            height: '100%',
                            background: 'var(--primary)',
                            width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 100}%`,
                            transition: 'width 0.4s ease'
                          }} />
                        </div>

                        {ORDER_STEPS.map((step, sIdx) => {
                          const isDone = sIdx <= currentStepIdx;
                          const isCurrent = sIdx === currentStepIdx;

                          return (
                            <div
                              key={step.key}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 1
                              }}
                            >
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isDone ? 'var(--primary)' : '#ffffff',
                                color: isDone ? '#ffffff' : 'var(--text-muted)',
                                border: isCurrent ? '3px solid var(--primary-border)' : (isDone ? 'none' : '2px solid var(--border-medium)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                boxShadow: isCurrent ? '0 0 10px rgba(217, 119, 6, 0.4)' : 'none'
                              }}>
                                {isDone ? '✓' : (sIdx + 1)}
                              </div>
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: isCurrent ? 800 : 600,
                                color: isCurrent ? 'var(--primary)' : (isDone ? 'var(--text-primary)' : 'var(--text-muted)'),
                                marginTop: '6px',
                                textAlign: 'center',
                                whiteSpace: 'nowrap'
                              }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Itemized Order List */}
                      <div style={{
                        background: 'var(--bg-muted)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        marginBottom: '14px'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                          ORDERED ITEMS
                        </div>
                        {order.items?.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.86rem',
                              padding: '4px 0',
                              borderBottom: iIdx !== order.items.length - 1 ? '1px dashed var(--border-subtle)' : 'none'
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 700 }}>{item.quantity} × </span>
                              <span>{item.item_name}</span>
                              {item.selected_addons && item.selected_addons.length > 0 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                  {item.selected_addons.map(a => a.name).join(', ')}
                                </div>
                              )}
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {currency}{item.total_price}
                            </span>
                          </div>
                        ))}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.92rem',
                          fontWeight: 800
                        }}>
                          <span>Order Total</span>
                          <span style={{ color: 'var(--primary)' }}>{currency}{order.total_amount}</span>
                        </div>
                      </div>

                      {/* Estimated Prep status text */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <Clock size={14} color="var(--primary)" />
                        <span>
                          {order.status === 'SERVED' || order.status === 'COMPLETED'
                            ? 'Delivered to Table ' + tableNumber
                            : `Estimated preparation: ~${order.estimated_prep_minutes} mins`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: '#ffffff',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onContinueOrdering}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            Continue Ordering
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <Bell size={16} />
            <span>Call Waiter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
