import React, { useState, useEffect } from 'react';
import socket from './utils/socket';
import { soundEffects } from './utils/audio';

// Customer Components
import QrEntryPage from './components/QrEntryPage';
import CustomerHeader from './components/CustomerHeader';
import CustomerMenu from './components/CustomerMenu';
import FoodDetailModal from './components/FoodDetailModal';
import CartModal from './components/CartModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import CallWaiterModal from './components/CallWaiterModal';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminTopNav from './components/admin/AdminTopNav';
import AdminDashboardView from './components/admin/AdminDashboardView';
import AdminOrdersView from './components/admin/AdminOrdersView';
import AdminHelpView from './components/admin/AdminHelpView';
import AdminMenuView from './components/admin/AdminMenuView';
import AdminTablesView from './components/admin/AdminTablesView';
import AdminPaymentsView from './components/admin/AdminPaymentsView';
import AdminReportsView from './components/admin/AdminReportsView';
import AdminSettingsView from './components/admin/AdminSettingsView';

export default function App() {
  // Navigation / Role mode: 'CUSTOMER' or 'ADMIN'
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash.startsWith('#admin') ? 'ADMIN' : 'CUSTOMER';
  });

  // Common Restaurant Profile
  const [restaurant, setRestaurant] = useState(null);

  // -------------------------------------------------------------
  // CUSTOMER STATE
  // -------------------------------------------------------------
  const [confirmedTable, setConfirmedTable] = useState(() => {
    return localStorage.getItem('customer_table_number') || null;
  });
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('customer_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [cartItems, setCartItems] = useState([]);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [recentPlacedOrder, setRecentPlacedOrder] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [sessionHelpRequests, setSessionHelpRequests] = useState([]);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  // -------------------------------------------------------------
  // ADMIN STATE
  // -------------------------------------------------------------
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminTab, setAdminTab] = useState('dashboard');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [adminDashboardStats, setAdminDashboardStats] = useState(null);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminHelpRequests, setAdminHelpRequests] = useState([]);
  const [adminTables, setAdminTables] = useState([]);
  const [adminReports, setAdminReports] = useState(null);

  // Synchronize hash in URL for easy role switching / bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#admin')) {
        setCurrentView('ADMIN');
      } else {
        setCurrentView('CUSTOMER');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial restaurant data, categories, and menu
  const fetchMenuData = async () => {
    try {
      const [restRes, catRes, menuRes] = await Promise.all([
        fetch('/api/restaurant'),
        fetch('/api/categories'),
        fetch('/api/menu')
      ]);

      if (restRes.ok) setRestaurant(await restRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (menuRes.ok) setMenuItems(await menuRes.json());
    } catch (err) {
      console.error('Error fetching initial restaurant data:', err);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Fetch session orders and help requests if session exists
  const fetchSessionData = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/table-sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionOrders(data.orders || []);
        setSessionHelpRequests(data.helpRequests || []);
      }
    } catch (err) {
      console.error('Error fetching session data:', err);
    }
  };

  useEffect(() => {
    if (activeSession?.id) {
      fetchSessionData(activeSession.id);
      socket.emit('join_session', activeSession.id);
      socket.emit('join_table', confirmedTable);
    }
  }, [activeSession, confirmedTable]);

  // Fetch Admin Data
  const fetchAdminData = async () => {
    if (!adminToken) return;
    const headers = { 'Authorization': `Bearer ${adminToken}` };

    try {
      const [dashRes, ordersRes, helpRes, tablesRes, reportsRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/help-requests', { headers }),
        fetch('/api/admin/tables', { headers }),
        fetch('/api/admin/reports', { headers })
      ]);

      if (dashRes.ok) setAdminDashboardStats(await dashRes.json());
      if (ordersRes.ok) setAdminOrders(await ordersRes.json());
      if (helpRes.ok) setAdminHelpRequests(await helpRes.json());
      if (tablesRes.ok) setAdminTables(await tablesRes.json());
      if (reportsRes.ok) setAdminReports(await reportsRes.json());
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'ADMIN' && adminToken) {
      socket.emit('join_admin');
      fetchAdminData();
    }
  }, [currentView, adminToken]);

  // Real-time Socket.io Event Listeners
  useEffect(() => {
    socket.on('new_order', (payload) => {
      soundEffects.playChime();
      setAdminOrders(prev => [payload.order, ...prev.filter(o => o.id !== payload.order.id)]);
      if (adminToken) fetchAdminData();
    });

    socket.on('order_status_updated', (updatedOrder) => {
      // Update in customer view
      setSessionOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      // Update in admin view
      setAdminOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (adminToken) fetchAdminData();
    });

    socket.on('new_help_request', (payload) => {
      soundEffects.playHelpAlert();
      setAdminHelpRequests(prev => [payload.helpRequest, ...prev.filter(h => h.id !== payload.helpRequest.id)]);
      if (adminToken) fetchAdminData();
    });

    socket.on('help_request_updated', (updatedReq) => {
      setSessionHelpRequests(prev => prev.map(h => h.id === updatedReq.id ? updatedReq : h));
      setAdminHelpRequests(prev => prev.map(h => h.id === updatedReq.id ? updatedReq : h));
      if (adminToken) fetchAdminData();
    });

    socket.on('table_updated', () => {
      if (adminToken) fetchAdminData();
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
      socket.off('new_help_request');
      socket.off('help_request_updated');
      socket.off('table_updated');
    };
  }, [adminToken]);

  // -------------------------------------------------------------
  // CUSTOMER ACTION HANDLERS
  // -------------------------------------------------------------
  const handleConfirmTable = async (tableNum) => {
    try {
      const res = await fetch('/api/table-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: tableNum })
      });

      const data = await res.json();
      if (res.ok && data.session) {
        setConfirmedTable(tableNum);
        setActiveSession(data.session);
        localStorage.setItem('customer_table_number', tableNum);
        localStorage.setItem('customer_session', JSON.stringify(data.session));
        fetchSessionData(data.session.id);
      }
    } catch (err) {
      console.error('Session initiation failed:', err);
    }
  };

  const handleAddToCart = (item, quantity, selectedAddons, unitPrice) => {
    const cartItemId = `${item.id}_${selectedAddons.map(a => a.id).sort().join('-')}`;

    setCartItems(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        id: cartItemId,
        item,
        quantity,
        selectedAddons,
        unitPrice
      }];
    });

    soundEffects.playSuccess();
  };

  const handleQuickAdd = (item) => {
    handleAddToCart(item, 1, [], item.price);
  };

  const handleUpdateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
    } else {
      setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const handlePlaceOrder = async ({ items, notes, paymentMethod }) => {
    if (!activeSession) return;
    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          items,
          notes,
          paymentMethod
        })
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setCartItems([]);
        setIsCartOpen(false);
        setRecentPlacedOrder(data.order);
        setSessionOrders(prev => [data.order, ...prev]);
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch (err) {
      alert('Error placing order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSubmitHelpRequest = async (requestType, message) => {
    if (!activeSession) return;
    setIsSubmittingHelp(true);

    try {
      const res = await fetch('/api/help-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          requestType,
          message
        })
      });

      const data = await res.json();
      if (res.ok && data.helpRequest) {
        setSessionHelpRequests(prev => [data.helpRequest, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting help request:', err);
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  // -------------------------------------------------------------
  // ADMIN ACTION HANDLERS
  // -------------------------------------------------------------
  const handleAdminLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    setCurrentView('ADMIN');
    window.location.hash = '#admin';
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminToken(null);
    setAdminUser(null);
    setCurrentView('CUSTOMER');
    window.location.hash = '';
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const data = await res.json();
        setAdminOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleUpdateHelpStatus = async (requestId, status) => {
    try {
      const res = await fetch(`/api/admin/help-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const data = await res.json();
        setAdminHelpRequests(prev => prev.map(h => h.id === requestId ? data.helpRequest : h));
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update help request status:', err);
    }
  };

  const handleSaveMenuItem = async (itemData) => {
    const isEdit = Boolean(itemData.id);
    const url = isEdit ? `/api/admin/menu/${itemData.id}` : '/api/admin/menu';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(itemData)
      });

      if (res.ok) {
        fetchMenuData();
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        fetchMenuData();
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleToggleItemAvailability = async (itemId, isAvailable) => {
    try {
      const res = await fetch(`/api/admin/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ is_available: isAvailable })
      });

      if (res.ok) {
        fetchMenuData();
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleAddCategory = async (name) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchMenuData();
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Cannot delete category');
      } else {
        fetchMenuData();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleAddTable = async (tableNumber, capacity) => {
    try {
      const res = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ table_number: tableNumber, capacity })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Failed to add table:', err);
    }
  };

  const handleUpdateTableStatus = async (tableId, status) => {
    try {
      const res = await fetch(`/api/admin/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Failed to update table status:', err);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Delete this table from the restaurant?')) return;
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Failed to delete table:', err);
    }
  };

  const handleSaveRestaurantSettings = async (settings) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        fetchMenuData();
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // -------------------------------------------------------------
  // RENDER: ADMIN VIEW
  // -------------------------------------------------------------
  if (currentView === 'ADMIN') {
    if (!adminToken) {
      return (
        <div>
          <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
          {/* Quick link back to Customer View */}
          <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 100 }}>
            <button
              type="button"
              onClick={() => {
                setCurrentView('CUSTOMER');
                window.location.hash = '';
              }}
              className="btn btn-secondary btn-sm"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              Switch to Customer View
            </button>
          </div>
        </div>
      );
    }

    const pendingOrdersCount = adminOrders.filter(o => ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status)).length;
    const pendingHelpCount = adminHelpRequests.filter(h => ['PENDING', 'WAITER_INFORMED', 'BEING_HANDLED'].includes(h.status)).length;

    const renderAdminContent = () => {
      switch (adminTab) {
        case 'dashboard':
          return (
            <AdminDashboardView
              dashboardStats={adminDashboardStats}
              currency={restaurant?.currency || '₹'}
              onNavigateTab={(tab) => setAdminTab(tab)}
              orders={adminOrders}
              helpRequests={adminHelpRequests}
            />
          );
        case 'orders':
          return (
            <AdminOrdersView
              orders={adminOrders}
              currency={restaurant?.currency || '₹'}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          );
        case 'help':
          return (
            <AdminHelpView
              helpRequests={adminHelpRequests}
              onUpdateStatus={handleUpdateHelpStatus}
            />
          );
        case 'menu':
          return (
            <AdminMenuView
              categories={categories}
              menuItems={menuItems}
              currency={restaurant?.currency || '₹'}
              onSaveItem={handleSaveMenuItem}
              onDeleteItem={handleDeleteMenuItem}
              onToggleAvailability={handleToggleItemAvailability}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          );
        case 'tables':
          return (
            <AdminTablesView
              tables={adminTables}
              restaurant={restaurant}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              onUpdateTableStatus={handleUpdateTableStatus}
            />
          );
        case 'payments':
          return (
            <AdminPaymentsView
              orders={adminOrders}
              currency={restaurant?.currency || '₹'}
            />
          );
        case 'reports':
          return (
            <AdminReportsView
              reportsData={adminReports}
              currency={restaurant?.currency || '₹'}
            />
          );
        case 'settings':
          return (
            <AdminSettingsView
              restaurant={restaurant}
              onSaveSettings={handleSaveRestaurantSettings}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="admin-container">
        <AdminSidebar
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          onLogout={handleAdminLogout}
          pendingOrdersCount={pendingOrdersCount}
          pendingHelpCount={pendingHelpCount}
          restaurant={restaurant}
        />
        <div className="admin-main">
          <AdminTopNav
            title={
              adminTab === 'dashboard' ? 'Operations Overview' :
              adminTab === 'orders' ? 'Live Table Orders Board' :
              adminTab === 'help' ? 'Customer Table Assistance Desk' :
              adminTab === 'menu' ? 'Menu & Recipe Catalog' :
              adminTab === 'tables' ? 'Tables & QR Standee Studio' :
              adminTab === 'payments' ? 'Billing & Payment Ledger' :
              adminTab === 'reports' ? 'Sales Reports & Analytics' : 'System Configuration'
            }
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundEffects.soundEnabled = next;
            }}
            onRefresh={fetchAdminData}
            onOpenCustomerView={() => {
              setCurrentView('CUSTOMER');
              window.location.hash = '';
            }}
            adminUser={adminUser}
          />
          {renderAdminContent()}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CUSTOMER VIEW
  // -------------------------------------------------------------
  // 1. If table is not confirmed, show QR Welcome & Table Number entry
  if (!confirmedTable || !activeSession) {
    return (
      <div style={{ position: 'relative' }}>
        <QrEntryPage
          restaurant={restaurant}
          onConfirmTable={handleConfirmTable}
        />

        {/* Secret Admin Switcher in footer */}
        <div style={{
          position: 'fixed',
          bottom: '12px',
          right: '12px',
          zIndex: 50
        }}>
          <button
            type="button"
            onClick={() => {
              setCurrentView('ADMIN');
              window.location.hash = '#admin';
            }}
            className="btn btn-secondary btn-sm"
            style={{
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.75rem',
              padding: '6px 10px',
              background: '#ffffff',
              opacity: 0.85
            }}
          >
            Manager Portal 🔐
          </button>
        </div>
      </div>
    );
  }

  // 2. Main Customer Menu & Ordering Session
  const activeOrdersCount = sessionOrders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const activeHelpCount = sessionHelpRequests.filter(h => ['PENDING', 'WAITER_INFORMED', 'BEING_HANDLED'].includes(h.status)).length;

  return (
    <div className="customer-container">
      {/* Sticky Header */}
      <CustomerHeader
        restaurant={restaurant}
        tableNumber={confirmedTable}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        activeOrdersCount={activeOrdersCount}
        activeHelpCount={activeHelpCount}
      />

      {/* Main Menu Feed */}
      <CustomerMenu
        categories={categories}
        menuItems={menuItems}
        currency={restaurant?.currency || '₹'}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenFoodDetail={(item) => setActiveDetailItem(item)}
        onQuickAdd={handleQuickAdd}
      />

      {/* Floating Bottom Action Bar (if Cart has items) */}
      {cartItems.length > 0 && !isCartOpen && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
          zIndex: 35
        }}>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(217, 119, 6, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#ffffff',
                color: 'var(--primary)',
                fontWeight: 900,
                fontSize: '0.82rem',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>View Table Order</span>
            </div>

            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>
              {restaurant?.currency || '₹'}
              {cartItems.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0).toFixed(2)} →
            </span>
          </button>
        </div>
      )}

      {/* Switch Table or Switch to Admin Quick Buttons at Bottom */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setConfirmedTable(null);
              setActiveSession(null);
              localStorage.removeItem('customer_table_number');
              localStorage.removeItem('customer_session');
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Change Table (Currently #{confirmedTable})
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('ADMIN');
              window.location.hash = '#admin';
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Manager Login 🔐
          </button>
        </div>
      </div>

      {/* Food Details Modal */}
      {activeDetailItem && (
        <FoodDetailModal
          item={activeDetailItem}
          currency={restaurant?.currency || '₹'}
          onClose={() => setActiveDetailItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        restaurant={restaurant}
        tableNumber={confirmedTable}
        currency={restaurant?.currency || '₹'}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
        isPlacingOrder={isPlacingOrder}
      />

      {/* Order Confirmation Celebration Modal */}
      {recentPlacedOrder && (
        <OrderConfirmationModal
          order={recentPlacedOrder}
          tableNumber={confirmedTable}
          currency={restaurant?.currency || '₹'}
          onTrackOrder={() => {
            setRecentPlacedOrder(null);
            setIsOrdersModalOpen(true);
          }}
          onContinueOrdering={() => {
            setRecentPlacedOrder(null);
          }}
        />
      )}

      {/* Order Tracking Modal (Multiple orders for Table 12) */}
      <OrderTrackingModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={sessionOrders}
        tableNumber={confirmedTable}
        currency={restaurant?.currency || '₹'}
        onContinueOrdering={() => setIsOrdersModalOpen(false)}
        onOpenHelp={() => {
          setIsOrdersModalOpen(false);
          setIsHelpModalOpen(true);
        }}
      />

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        tableNumber={confirmedTable}
        activeRequests={sessionHelpRequests}
        onSubmitRequest={handleSubmitHelpRequest}
        isSubmitting={isSubmittingHelp}
      />
    </div>
  );
}
