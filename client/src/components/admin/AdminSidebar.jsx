import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Bell, 
  UtensilsCrossed, 
  QrCode, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar({ 
  currentTab, 
  onSelectTab, 
  onLogout, 
  pendingOrdersCount = 0, 
  pendingHelpCount = 0,
  restaurant
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: '#ef4444' },
    { id: 'help', label: 'Help Requests', icon: Bell, badge: pendingHelpCount, badgeColor: '#f59e0b' },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'tables', label: 'Tables & QR Standee', icon: QrCode },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="admin-sidebar" style={{
      background: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #1e293b'
    }}>
      {/* Brand Profile */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {restaurant?.logo ? (
          <img
            src={restaurant.logo}
            alt="Logo"
            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}>
            RS
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
            {restaurant?.name || 'The Royal Saffron'}
          </h2>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span>Admin Operations</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span style={{
                  background: item.badgeColor || '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            fontWeight: 600,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
