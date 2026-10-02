import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Check, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersView({
  orders = [],
  currency = '₹',
  onUpdateOrderStatus,
  isUpdating
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTable, setSearchTable] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = !searchTable || 
      order.table_number.toLowerCase().includes(searchTable.toLowerCase()) || 
      order.order_number.includes(searchTable);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search Table # or Order #..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                border: filterStatus === st ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: filterStatus === st ? 'var(--primary)' : '#ffffff',
                color: filterStatus === st ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-subtle)'
        }}>
          <ShoppingBag size={42} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No orders matching filter</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>New customer orders placed via QR will appear here in real time.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px'
        }}>
          {filteredOrders.map((order) => {
            const timeAgo = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={order.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: order.status === 'PENDING' ? '2px solid #f87171' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Header with Prominent Table Number */}
                <div style={{
                  padding: '14px 16px',
                  background: order.status === 'PENDING' ? '#fee2e2' : 'var(--bg-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: '8px',
                      letterSpacing: '0.04em',
                      boxShadow: 'var(--shadow-xs)'
                    }}>
                      TABLE {order.table_number}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                        Order #{order.order_number}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {timeAgo}
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div style={{ padding: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {order.items?.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          fontSize: '0.88rem',
                          borderBottom: idx !== order.items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                          paddingBottom: '4px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: '6px' }}>
                            {it.quantity} ×
                          </span>
                          <span style={{ fontWeight: 700 }}>{it.item_name}</span>
                          {it.selected_addons && it.selected_addons.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {it.selected_addons.map(a => a.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {currency}{it.total_price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div style={{
                      background: '#fffbeb',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      marginBottom: '12px'
                    }}>
                      💬 <strong>Kitchen Note:</strong> "{order.notes}"
                    </div>
                  )}

                  {/* Order Total & Payment Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.92rem'
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Pay: <strong>{order.payment_method}</strong> ({order.payment_status})
                    </span>
                    <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.05rem' }}>
                      {currency}{order.total_amount}
                    </span>
                  </div>
                </div>

                {/* Workflow Status Action Buttons */}
                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: '#fafafa',
                  display: 'flex',
                  gap: '8px'
                }}>
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'ACCEPTED')}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, padding: '8px', fontWeight: 800 }}
                      >
                        <Check size={14} />
                        <span>Accept Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '8px 12px' }}
                        title="Reject Order"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'PREPARING')}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', padding: '8px', background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
                    >
                      <ChefHat size={14} />
                      <span>Mark Preparing</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'READY')}
                      className="btn btn-sm"
                      style={{ width: '100%', padding: '8px', background: '#eab308', color: '#713f12', fontWeight: 800 }}
                    >
                      <Clock size={14} />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'SERVED')}
                      className="btn btn-success btn-sm"
                      style={{ width: '100%', padding: '8px', fontWeight: 800 }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Served to Table</span>
                    </button>
                  )}

                  {order.status === 'SERVED' && (
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'COMPLETED')}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                    >
                      <span>Complete & Archive</span>
                    </button>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div style={{ width: '100%', textAlign: 'center', fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Order Completed & Paid
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div style={{ width: '100%', textAlign: 'center', fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                      ✕ Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
