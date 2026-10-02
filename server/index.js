const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, initializeDatabase } = require('./db');
const { generateAdminToken, verifyAdminToken } = require('./auth');

// Initialize database schema and seed data
initializeDatabase();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Attach io to requests if needed
app.set('io', io);

// Socket.io connection setup
io.on('connection', (socket) => {
  // Join admin room
  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  // Join table/session room for customer real-time updates
  socket.on('join_table', (tableNumber) => {
    socket.join(`table_${tableNumber}`);
  });

  socket.on('join_session', (sessionId) => {
    socket.join(`session_${sessionId}`);
  });
});

// ==========================================
// 1. PUBLIC / CUSTOMER APIs
// ==========================================

// Get restaurant profile and settings
app.get('/api/restaurant', (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants LIMIT 1').get();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate Table Number
app.post('/api/tables/validate', (req, res) => {
  try {
    const { tableNumber } = req.body;
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }

    const table = db.prepare('SELECT * FROM tables WHERE table_number = ?').get(String(tableNumber).trim());

    if (!table) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid table number. Please enter the table number shown above the QR code.'
      });
    }

    res.json({
      valid: true,
      table: {
        id: table.id,
        table_number: table.table_number,
        status: table.status,
        capacity: table.capacity
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start or Resume Table Session
app.post('/api/table-sessions', (req, res) => {
  try {
    const { tableNumber } = req.body;
    if (!tableNumber) {
      return res.status(400).json({ error: 'Table number is required' });
    }

    const restaurant = db.prepare('SELECT id FROM restaurants LIMIT 1').get();
    const table = db.prepare('SELECT * FROM tables WHERE table_number = ?').get(String(tableNumber).trim());

    if (!table) {
      return res.status(404).json({ error: 'Invalid table number. Table not found.' });
    }

    // Check for existing ACTIVE session for this table
    let session = db.prepare(`
      SELECT * FROM table_sessions 
      WHERE table_id = ? AND status = 'ACTIVE' 
      ORDER BY started_at DESC LIMIT 1
    `).get(table.id);

    if (!session) {
      const sessionId = 'sess_' + uuidv4().substring(0, 8);
      const sessionToken = 'tok_' + uuidv4().replace(/-/g, '');
      db.prepare(`
        INSERT INTO table_sessions (id, restaurant_id, table_id, table_number, session_token, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `).run(sessionId, restaurant.id, table.id, table.table_number, sessionToken);

      // Update table status to ORDERING
      db.prepare("UPDATE tables SET status = 'ORDERING' WHERE id = ?").run(table.id);

      session = db.prepare('SELECT * FROM table_sessions WHERE id = ?').get(sessionId);
    }

    res.json({
      session,
      table
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Table Session Data (Session info, orders, and active help requests)
app.get('/api/table-sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = db.prepare('SELECT * FROM table_sessions WHERE id = ?').get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const orders = db.prepare(`
      SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC
    `).all(sessionId);

    // Fetch items for each order
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    for (const ord of orders) {
      ord.items = getItems.all(ord.id).map(item => ({
        ...item,
        selected_addons: item.selected_addons ? JSON.parse(item.selected_addons) : []
      }));
    }

    const helpRequests = db.prepare(`
      SELECT * FROM help_requests WHERE session_id = ? ORDER BY created_at DESC
    `).all(sessionId);

    res.json({
      session,
      orders,
      helpRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Menu (with category grouping and add-ons)
app.get('/api/menu', (req, res) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category_id = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY is_special DESC, is_popular DESC, name ASC';

    const items = db.prepare(query).all(...params);

    const getAddons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?');
    for (const it of items) {
      it.addons = getAddons.all(it.id);
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (Multiple orders per table session supported!)
app.post('/api/orders', (req, res) => {
  try {
    const { sessionId, items, notes, paymentMethod } = req.body;

    if (!sessionId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Valid session ID and at least one item are required' });
    }

    const session = db.prepare('SELECT * FROM table_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Dining session not found. Please re-scan QR code.' });
    }

    const restaurant = db.prepare('SELECT * FROM restaurants LIMIT 1').get();
    const taxRate = restaurant ? restaurant.tax_rate : 5.0;

    // Secure server-side calculation of order prices
    let subtotal = 0;
    const validatedItems = [];

    for (const it of items) {
      const dbItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(it.menu_item_id);
      if (!dbItem) {
        return res.status(400).json({ error: `Menu item with id ${it.menu_item_id} not found.` });
      }
      if (!dbItem.is_available) {
        return res.status(400).json({ error: `"${dbItem.name}" is currently sold out.` });
      }

      const qty = parseInt(it.quantity) || 1;
      let unitPrice = dbItem.price;
      let itemAddonPrice = 0;

      const chosenAddons = [];
      if (it.selected_addons && Array.isArray(it.selected_addons)) {
        for (const ad of it.selected_addons) {
          const dbAddon = db.prepare('SELECT * FROM menu_item_addons WHERE id = ? AND menu_item_id = ?').get(ad.id, dbItem.id);
          if (dbAddon) {
            itemAddonPrice += dbAddon.price;
            chosenAddons.push({
              id: dbAddon.id,
              name: dbAddon.name,
              price: dbAddon.price
            });
          }
        }
      }

      const lineTotal = (unitPrice + itemAddonPrice) * qty;
      subtotal += lineTotal;

      validatedItems.push({
        menu_item_id: dbItem.id,
        item_name: dbItem.name,
        unit_price: unitPrice + itemAddonPrice,
        quantity: qty,
        selected_addons: JSON.stringify(chosenAddons),
        total_price: lineTotal
      });
    }

    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    // Generate readable order number: count of orders + 1040
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const orderNumber = String(1040 + orderCount + 1);

    const orderId = 'ord_' + uuidv4().substring(0, 8);

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, order_number, restaurant_id, table_id, table_number, 
        session_id, status, subtotal, tax_amount, total_amount, 
        notes, payment_method, payment_status, estimated_prep_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, 20)
    `);

    insertOrder.run(
      orderId,
      orderNumber,
      session.restaurant_id,
      session.table_id,
      session.table_number,
      session.id,
      subtotal,
      taxAmount,
      grandTotal,
      notes || '',
      paymentMethod || 'CASH',
      paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING'
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, selected_addons, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const vItem of validatedItems) {
      insertItem.run(
        'oi_' + uuidv4().substring(0, 8),
        orderId,
        vItem.menu_item_id,
        vItem.item_name,
        vItem.unit_price,
        vItem.quantity,
        vItem.selected_addons,
        vItem.total_price
      );
    }

    // Set table status to ORDERING
    db.prepare("UPDATE tables SET status = 'ORDERING' WHERE id = ?").run(session.table_id);

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    createdOrder.items = validatedItems.map(it => ({
      ...it,
      selected_addons: JSON.parse(it.selected_addons)
    }));

    // Real-time broadcast to Admin room
    io.to('admin_room').emit('new_order', {
      order: createdOrder,
      tableNumber: session.table_number,
      sound: true
    });

    // Real-time broadcast to customer session
    io.to(`session_${session.id}`).emit('order_created', createdOrder);

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Single Order details
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    order.items = items.map(it => ({
      ...it,
      selected_addons: it.selected_addons ? JSON.parse(it.selected_addons) : []
    }));

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Call Waiter / Create Help Request
app.post('/api/help-requests', (req, res) => {
  try {
    const { sessionId, requestType, message } = req.body;

    if (!sessionId || !requestType) {
      return res.status(400).json({ error: 'Session ID and Request Type are required' });
    }

    const session = db.prepare('SELECT * FROM table_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Dining session not found.' });
    }

    const requestId = 'hr_' + uuidv4().substring(0, 8);
    const insertReq = db.prepare(`
      INSERT INTO help_requests (id, restaurant_id, table_id, table_number, session_id, request_type, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    insertReq.run(
      requestId,
      session.restaurant_id,
      session.table_id,
      session.table_number,
      session.id,
      requestType,
      message || ''
    );

    const createdReq = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);

    // Broadcast to Admin room with audio chime indicator
    io.to('admin_room').emit('new_help_request', {
      helpRequest: createdReq,
      tableNumber: session.table_number,
      sound: true
    });

    // Broadcast to customer room
    io.to(`session_${session.id}`).emit('help_request_created', createdReq);

    res.status(201).json({
      success: true,
      helpRequest: createdReq
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process Payment simulation
app.post('/api/payments', (req, res) => {
  try {
    const { sessionId, orderId, amount, paymentMethod } = req.body;
    const paymentId = 'pay_' + uuidv4().substring(0, 8);
    const ref = 'TXN_' + Date.now();

    db.prepare(`
      INSERT INTO payments (id, order_id, session_id, amount, payment_method, payment_status, transaction_reference)
      VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)
    `).run(paymentId, orderId || null, sessionId, amount, paymentMethod || 'UPI', ref);

    if (orderId) {
      db.prepare("UPDATE orders SET payment_status = 'PAID' WHERE id = ?").run(orderId);
    }

    io.to('admin_room').emit('payment_received', {
      paymentId,
      sessionId,
      amount,
      paymentMethod,
      ref
    });

    res.json({
      success: true,
      transactionReference: ref,
      amount,
      status: 'SUCCESS'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ADMIN APIs (Secured)
// ==========================================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateAdminToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current Admin Info
app.get('/api/admin/me', verifyAdminToken, (req, res) => {
  res.json({ admin: req.admin });
});

// Admin Dashboard Summary Cards
app.get('/api/admin/dashboard', verifyAdminToken, (req, res) => {
  try {
    // Today's Sales
    const salesRow = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as todaySales 
      FROM orders 
      WHERE DATE(created_at) = DATE('now') AND status != 'CANCELLED'
    `).get();

    // Pending Orders
    const pendingOrdersCount = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE status IN ('PENDING', 'ACCEPTED', 'PREPARING')
    `).get().count;

    // Active Tables
    const activeTablesCount = db.prepare(`
      SELECT COUNT(*) as count FROM tables WHERE status IN ('ORDERING', 'OCCUPIED')
    `).get().count;

    // Pending Help Requests
    const pendingHelpCount = db.prepare(`
      SELECT COUNT(*) as count FROM help_requests WHERE status IN ('PENDING', 'WAITER_INFORMED', 'BEING_HANDLED')
    `).get().count;

    // Recent 5 Orders
    const recentOrders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 5
    `).all();

    // Recent 5 Help Requests
    const recentHelp = db.prepare(`
      SELECT * FROM help_requests ORDER BY created_at DESC LIMIT 5
    `).all();

    res.json({
      todaySales: salesRow.todaySales,
      pendingOrders: pendingOrdersCount,
      activeTables: activeTablesCount,
      pendingHelpRequests: pendingHelpCount,
      recentOrders,
      recentHelp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders List (with filters)
app.get('/api/admin/orders', verifyAdminToken, (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'ALL') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const orders = db.prepare(query).all(...params);

    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    for (const ord of orders) {
      ord.items = getItems.all(ord.id).map(item => ({
        ...item,
        selected_addons: item.selected_addons ? JSON.parse(item.selected_addons) : []
      }));
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Order Status
// PENDING -> ACCEPTED -> PREPARING -> READY -> SERVED -> COMPLETED (or CANCELLED)
app.patch('/api/admin/orders/:id/status', verifyAdminToken, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status transition' });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    db.prepare(`
      UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, req.params.id);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(updatedOrder.id);
    updatedOrder.items = items.map(it => ({
      ...it,
      selected_addons: it.selected_addons ? JSON.parse(it.selected_addons) : []
    }));

    // If order is completed or served, check table
    if (status === 'COMPLETED') {
      // If no other active orders on table, table can be available
      const activeOrdCount = db.prepare(`
        SELECT COUNT(*) as count FROM orders 
        WHERE table_id = ? AND status NOT IN ('COMPLETED', 'CANCELLED')
      `).get(order.table_id).count;

      if (activeOrdCount === 0) {
        db.prepare("UPDATE tables SET status = 'AVAILABLE' WHERE id = ?").run(order.table_id);
        io.to('admin_room').emit('table_updated', { tableId: order.table_id, status: 'AVAILABLE' });
      }
    }

    // Broadcast status change to customer session & table
    io.to(`session_${order.session_id}`).emit('order_status_updated', updatedOrder);
    io.to('admin_room').emit('order_status_updated', updatedOrder);

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Help Requests List
app.get('/api/admin/help-requests', verifyAdminToken, (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT * FROM help_requests ORDER BY 
        CASE status 
          WHEN 'PENDING' THEN 1 
          WHEN 'WAITER_INFORMED' THEN 2 
          WHEN 'BEING_HANDLED' THEN 3 
          ELSE 4 
        END, 
        created_at DESC
    `).all();

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Help Request Status (Workflow: PENDING -> WAITER_INFORMED -> BEING_HANDLED -> COMPLETED)
app.patch('/api/admin/help-requests/:id/status', verifyAdminToken, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'WAITER_INFORMED', 'BEING_HANDLED', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid help request status' });
    }

    const hr = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(req.params.id);
    if (!hr) return res.status(404).json({ error: 'Help request not found' });

    let completedAt = null;
    if (status === 'COMPLETED') {
      completedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE help_requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP, completed_at = ? 
      WHERE id = ?
    `).run(status, completedAt, req.params.id);

    const updatedHr = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(req.params.id);

    // Broadcast to customer and admin
    io.to(`session_${hr.session_id}`).emit('help_request_updated', updatedHr);
    io.to('admin_room').emit('help_request_updated', updatedHr);

    res.json({ success: true, helpRequest: updatedHr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Menu Management - Create Item
app.post('/api/admin/menu', verifyAdminToken, (req, res) => {
  try {
    const { category_id, name, description, price, image, is_available, is_special, is_popular, dietary, addons } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ error: 'Category, name, and price are required' });
    }

    const restaurant = db.prepare('SELECT id FROM restaurants LIMIT 1').get();
    const itemId = 'item_' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO menu_items (
        id, restaurant_id, category_id, name, description, price, 
        image, is_available, is_special, is_popular, rating, dietary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, ?)
    `).run(
      itemId,
      restaurant.id,
      category_id,
      name,
      description || '',
      parseFloat(price),
      image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      is_available !== undefined ? (is_available ? 1 : 0) : 1,
      is_special ? 1 : 0,
      is_popular ? 1 : 0,
      dietary || 'VEG'
    );

    if (addons && Array.isArray(addons)) {
      const insertAddon = db.prepare(`
        INSERT INTO menu_item_addons (id, menu_item_id, name, price, is_required)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const ad of addons) {
        if (ad.name) {
          insertAddon.run('addon_' + uuidv4().substring(0, 8), itemId, ad.name, parseFloat(ad.price || 0), 0);
        }
      }
    }

    res.status(201).json({ success: true, itemId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Menu Management - Update Item
app.put('/api/admin/menu/:id', verifyAdminToken, (req, res) => {
  try {
    const { category_id, name, description, price, image, is_available, is_special, is_popular, dietary, addons } = req.body;

    db.prepare(`
      UPDATE menu_items 
      SET category_id = ?, name = ?, description = ?, price = ?, 
          image = ?, is_available = ?, is_special = ?, is_popular = ?, dietary = ?
      WHERE id = ?
    `).run(
      category_id,
      name,
      description,
      parseFloat(price),
      image,
      is_available ? 1 : 0,
      is_special ? 1 : 0,
      is_popular ? 1 : 0,
      dietary,
      req.params.id
    );

    // Replace addons
    if (addons && Array.isArray(addons)) {
      db.prepare('DELETE FROM menu_item_addons WHERE menu_item_id = ?').run(req.params.id);
      const insertAddon = db.prepare(`
        INSERT INTO menu_item_addons (id, menu_item_id, name, price, is_required)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const ad of addons) {
        if (ad.name) {
          insertAddon.run('addon_' + uuidv4().substring(0, 8), req.params.id, ad.name, parseFloat(ad.price || 0), 0);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Menu Management - Quick Toggle Availability (Available / Sold Out)
app.patch('/api/admin/menu/:id/availability', verifyAdminToken, (req, res) => {
  try {
    const { is_available } = req.body;
    db.prepare('UPDATE menu_items SET is_available = ? WHERE id = ?').run(is_available ? 1 : 0, req.params.id);
    res.json({ success: true, is_available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Menu Management - Delete Item
app.delete('/api/admin/menu/:id', verifyAdminToken, (req, res) => {
  try {
    db.prepare('DELETE FROM menu_item_addons WHERE menu_item_id = ?').run(req.params.id);
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Category Management
app.post('/api/admin/categories', verifyAdminToken, (req, res) => {
  try {
    const { name, display_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const restaurant = db.prepare('SELECT id FROM restaurants LIMIT 1').get();
    const id = 'cat_' + uuidv4().substring(0, 8);

    db.prepare(`
      INSERT INTO categories (id, restaurant_id, name, display_order)
      VALUES (?, ?, ?, ?)
    `).run(id, restaurant.id, name.trim(), display_order || 0);

    res.status(201).json({ success: true, category: { id, name, display_order } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', verifyAdminToken, (req, res) => {
  try {
    // Check if items exist in category
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?').get(req.params.id).count;
    if (itemCount > 0) {
      return res.status(400).json({ error: `Cannot delete category containing ${itemCount} food items. Move or delete the items first.` });
    }
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Table Management
app.get('/api/admin/tables', verifyAdminToken, (req, res) => {
  try {
    const tables = db.prepare('SELECT * FROM tables ORDER BY CAST(table_number AS INTEGER) ASC, table_number ASC').all();

    // Attach active session info if table is occupied or ordering
    for (const tbl of tables) {
      tbl.activeSession = db.prepare(`
        SELECT * FROM table_sessions WHERE table_id = ? AND status = 'ACTIVE' LIMIT 1
      `).get(tbl.id) || null;

      if (tbl.activeSession) {
        tbl.activeOrdersCount = db.prepare(`
          SELECT COUNT(*) as count FROM orders 
          WHERE session_id = ? AND status NOT IN ('COMPLETED', 'CANCELLED')
        `).get(tbl.activeSession.id).count;
      } else {
        tbl.activeOrdersCount = 0;
      }
    }

    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tables', verifyAdminToken, (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    if (!table_number) return res.status(400).json({ error: 'Table number is required' });

    const restaurant = db.prepare('SELECT id FROM restaurants LIMIT 1').get();

    // Check duplicate
    const exists = db.prepare('SELECT id FROM tables WHERE table_number = ?').get(String(table_number).trim());
    if (exists) return res.status(400).json({ error: 'Table number already exists' });

    const id = 'tbl_' + uuidv4().substring(0, 8);
    db.prepare(`
      INSERT INTO tables (id, restaurant_id, table_number, capacity, status)
      VALUES (?, ?, ?, ?, 'AVAILABLE')
    `).run(id, restaurant.id, String(table_number).trim(), parseInt(capacity) || 4);

    res.status(201).json({ success: true, table: { id, table_number, capacity, status: 'AVAILABLE' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/tables/:id/status', verifyAdminToken, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, req.params.id);
    io.to('admin_room').emit('table_updated', { tableId: req.params.id, status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/tables/:id', verifyAdminToken, (req, res) => {
  try {
    db.prepare('DELETE FROM tables WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reports & Analytics
app.get('/api/admin/reports', verifyAdminToken, (req, res) => {
  try {
    // Total Revenue & Orders
    const overall = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedOrders,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledOrders
      FROM orders
    `).get();

    // Today's stats
    const today = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as todaySales,
        COUNT(*) as todayOrders
      FROM orders
      WHERE DATE(created_at) = DATE('now') AND status != 'CANCELLED'
    `).get();

    // Popular Items Ranking
    const popularItems = db.prepare(`
      SELECT 
        oi.item_name,
        SUM(oi.quantity) as totalSold,
        SUM(oi.total_price) as totalEarnings
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
      GROUP BY oi.item_name
      ORDER BY totalSold DESC
      LIMIT 6
    `).all();

    // Table usage metrics
    const tableUsage = db.prepare(`
      SELECT 
        table_number,
        COUNT(*) as totalOrdersAtTable,
        COALESCE(SUM(total_amount), 0) as totalTableRevenue
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY table_number
      ORDER BY totalOrdersAtTable DESC
      LIMIT 8
    `).all();

    // Help Request Metrics
    const helpMetrics = db.prepare(`
      SELECT 
        COUNT(*) as totalHelpRequests,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedHelpRequests,
        request_type,
        COUNT(*) as countByType
      FROM help_requests
      GROUP BY request_type
    `).all();

    res.json({
      overall,
      today,
      popularItems,
      tableUsage,
      helpMetrics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Settings
app.get('/api/admin/settings', verifyAdminToken, (req, res) => {
  try {
    const restaurant = db.prepare('SELECT * FROM restaurants LIMIT 1').get();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', verifyAdminToken, (req, res) => {
  try {
    const { name, tagline, logo, address, phone, currency, tax_rate, online_payment_enabled } = req.body;
    const rest = db.prepare('SELECT id FROM restaurants LIMIT 1').get();

    db.prepare(`
      UPDATE restaurants 
      SET name = ?, tagline = ?, logo = ?, address = ?, phone = ?, currency = ?, tax_rate = ?, online_payment_enabled = ?
      WHERE id = ?
    `).run(
      name,
      tagline,
      logo,
      address,
      phone,
      currency || '₹',
      parseFloat(tax_rate) || 5.0,
      online_payment_enabled ? 1 : 0,
      rest.id
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static built frontend from client/dist if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Restaurant API & Socket.io server running at http://localhost:${PORT}`);
});

