import React from 'react';
import { DollarSign, ShoppingBag, Users, Bell, ArrowRight, Clock, ChefHat, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardView({
  dashboardStats,
  currency = '₹',
  onNavigateTab,
  orders = [],
  helpRequests = []
}) {
  const pendingOrders = orders.filter(o => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status));
  const activeHelp = helpRequests.filter(h => ['PENDING', 'WAITER_INFORMED', 'BEING_HANDLED'].includes(h.status));

  return (
    <div style={{ padding: '24px' }}>
      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '28px'
      }}>
        {/* Today's Sales */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Today's Sales
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '4px',
              fontFamily: 'var(--font-heading)'
            }}>
              {currency}{Number(dashboardStats?.todaySales || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
              ● Live orders tally
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: pendingOrders.length > 0 ? '1.5px solid #fecaca' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Kitchen Orders
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: pendingOrders.length > 0 ? '#dc2626' : 'var(--text-primary)',
              marginTop: '4px',
              fontFamily: 'var(--font-heading)'
            }}>
              {pendingOrders.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Requires kitchen action
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: pendingOrders.length > 0 ? '#fee2e2' : 'var(--bg-muted)',
            color: pendingOrders.length > 0 ? '#dc2626' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className={pendingOrders.length > 0 ? 'pulse-alert' : ''}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Active Tables */}
        <div
          onClick={() => onNavigateTab('tables')}
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Tables
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '4px',
              fontFamily: 'var(--font-heading)'
            }}>
              {dashboardStats?.activeTables || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
              Dining & Ordering
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
        </div>

        {/* Help Requests */}
        <div
          onClick={() => onNavigateTab('help')}
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: activeHelp.length > 0 ? '1.5px solid #fde68a' : '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Help Requests
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: activeHelp.length > 0 ? '#b45309' : 'var(--text-primary)',
              marginTop: '4px',
              fontFamily: 'var(--font-heading)'
            }}>
              {activeHelp.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Customer calls
            </div>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: activeHelp.length > 0 ? '#fef3c7' : 'var(--bg-muted)',
            color: activeHelp.length > 0 ? '#b45309' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className={activeHelp.length > 0 ? 'pulse-alert' : ''}>
            <Bell size={24} />
          </div>
        </div>
      </div>

      {/* Main Two Columns: Active Help Requests & Live Incoming Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Urgent Help Requests Desk */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Active Table Help Requests</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('help')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All Desk <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeHelp.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 600 }}>All table requests are attended to!</p>
              </div>
            ) : (
              activeHelp.slice(0, 4).map((hr) => (
                <div
                  key={hr.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: hr.status === 'PENDING' ? '#fffbeb' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        TABLE {hr.table_number}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {hr.request_type}
                      </span>
                    </div>
                    {hr.message && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        "{hr.message}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('help')}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Handle Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Orders Feed */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Customer Orders</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Order Board <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <p>No orders yet today.</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--primary-border)'
                    }}>
                      TABLE {order.table_number}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                        Order #{order.order_number}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {order.items?.length || 1} items • {currency}{order.total_amount}
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
