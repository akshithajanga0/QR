const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

// Enable Foreign Keys & WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      logo TEXT,
      address TEXT,
      phone TEXT,
      currency TEXT DEFAULT '₹',
      tax_rate REAL DEFAULT 5.0,
      online_payment_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      capacity INTEGER DEFAULT 4,
      status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, ORDERING, OCCUPIED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(restaurant_id, table_number),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      is_available INTEGER DEFAULT 1,
      is_special INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      dietary TEXT DEFAULT 'NON_VEG', -- VEG, NON_VEG, VEGAN
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS menu_item_addons (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      is_required INTEGER DEFAULT 0,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS table_sessions (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      restaurant_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      session_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      notes TEXT,
      payment_method TEXT DEFAULT 'CASH', -- UPI, CARD, CASH
      payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID
      estimated_prep_minutes INTEGER DEFAULT 20,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (session_id) REFERENCES table_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      selected_addons TEXT, -- JSON array of selected add-on objects
      total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );

    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      session_id TEXT NOT NULL,
      request_type TEXT NOT NULL, -- Water, Extra Plates, Extra Cutlery, Napkins, Bill, General Assistance
      message TEXT,
      status TEXT DEFAULT 'PENDING', -- PENDING, WAITER_INFORMED, BEING_HANDLED, COMPLETED, CANCELLED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (session_id) REFERENCES table_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      session_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL, -- UPI, CARD, CASH
      payment_status TEXT DEFAULT 'SUCCESS', -- PENDING, SUCCESS, FAILED
      transaction_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES table_sessions(id)
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const restCount = db.prepare('SELECT COUNT(*) as count FROM restaurants').get().count;
  if (restCount > 0) return;

  console.log('🌱 Seeding initial restaurant database...');

  const restaurantId = 'rest_01';
  db.prepare(`
    INSERT INTO restaurants (id, name, tagline, logo, address, phone, currency, tax_rate, online_payment_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    restaurantId,
    'The Royal Saffron & Grill',
    'Authentic Flavors, Grand Culinary Tradition',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80',
    '42 Heritage Boulevard, Gourmet District',
    '+91 98765 43210',
    '₹',
    5.0,
    1
  );

  // Seed Admin user (Email: admin@royalspice.com, Password: admin123)
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (id, restaurant_id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('user_admin', restaurantId, 'Chef Vikram Malhotra (Manager)', 'admin@royalspice.com', passwordHash, 'ADMIN');

  // Seed Tables (Table 1 through 15)
  const insertTable = db.prepare(`
    INSERT INTO tables (id, restaurant_id, table_number, capacity, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let i = 1; i <= 15; i++) {
    const status = i === 12 ? 'ORDERING' : (i === 4 || i === 7 ? 'OCCUPIED' : 'AVAILABLE');
    insertTable.run(`tbl_${i}`, restaurantId, String(i), i <= 4 ? 2 : (i <= 10 ? 4 : 6), status);
  }

  // Seed Categories
  const categories = [
    { id: 'cat_starters', name: 'Starters', order: 1 },
    { id: 'cat_main', name: 'Main Course', order: 2 },
    { id: 'cat_biryani', name: 'Biryani & Rice', order: 3 },
    { id: 'cat_breads', name: 'Tandoori Breads', order: 4 },
    { id: 'cat_drinks', name: 'Drinks & Mocktails', order: 5 },
    { id: 'cat_desserts', name: 'Desserts', order: 6 },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, restaurant_id, name, display_order)
    VALUES (?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCategory.run(cat.id, restaurantId, cat.name, cat.order);
  }

  // Seed Menu Items with High-Res mouth-watering photos
  const menuItems = [
    // Biryani
    {
      id: 'item_cbiryani',
      category_id: 'cat_biryani',
      name: 'Hyderabadi Dum Chicken Biryani',
      description: 'Slow-cooked fragrant basmati rice layered with tender marinated chicken, saffron strands, and hand-ground spices in sealed handi.',
      price: 249,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.9,
      dietary: 'NON_VEG',
      addons: [
        { name: 'Extra Chicken Piece (Succulent Leg)', price: 80 },
        { name: 'Creamy Spiced Cucumber Raita', price: 25 },
        { name: 'Mirchi Ka Salan Gravy', price: 30 },
        { name: 'Extra Spicy Fire Flavour', price: 0 }
      ]
    },
    {
      id: 'item_mbiryani',
      category_id: 'cat_biryani',
      name: 'Lucknowi Mutton Dum Biryani',
      description: 'Awadhi style aromatic kachi gosht mutton layered with aged long grain basmati rice, rose water, and caramelised onions.',
      price: 369,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.8,
      dietary: 'NON_VEG',
      addons: [
        { name: 'Extra Tender Gosht Cut', price: 110 },
        { name: 'Boiled Egg', price: 20 },
        { name: 'Special Mint Raita', price: 25 }
      ]
    },
    {
      id: 'item_pbiryani',
      category_id: 'cat_biryani',
      name: 'Paneer Makhani Biryani',
      description: 'Smoked paneer cubes tossed in rich makhani gravy, layered with mint and saffron basmati rice.',
      price: 219,
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      rating: 4.7,
      dietary: 'VEG',
      addons: [
        { name: 'Extra Grilled Paneer', price: 50 },
        { name: 'Cucumber Raita', price: 20 }
      ]
    },

    // Starters
    {
      id: 'item_ptikka',
      category_id: 'cat_starters',
      name: 'Amritsari Paneer Tikka',
      description: 'Fresh malai paneer marinated in ajwain, mustard oil, hung curd, and chargrilled in clay tandoor with bell peppers.',
      price: 229,
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 1,
      rating: 4.8,
      dietary: 'VEG',
      addons: [
        { name: 'Extra Mint Chutney & Laccha Onion', price: 15 },
        { name: 'Grated Amul Cheese Melt', price: 35 }
      ]
    },
    {
      id: 'item_tchicken',
      category_id: 'cat_starters',
      name: 'Tandoori Murgh (Half / Full)',
      description: 'Classic spring chicken steeped in Kashmiri red chili, crushed coriander seeds, yogurt, and roasted in hot tandoor.',
      price: 289,
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.9,
      dietary: 'NON_VEG',
      addons: [
        { name: 'Lemon Butter Glaze', price: 25 },
        { name: 'Green Salad Platter', price: 30 }
      ]
    },
    {
      id: 'item_chara',
      category_id: 'cat_starters',
      name: 'Crispy Hara Bhara Kebab',
      description: 'Golden spiced patties of spinach, green peas, mashed potatoes, and cashew core with tangy mint sauce.',
      price: 189,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      rating: 4.6,
      dietary: 'VEG',
      addons: [
        { name: 'Sweet Tamarind Dip', price: 15 }
      ]
    },
    {
      id: 'item_chilli_chicken',
      category_id: 'cat_starters',
      name: 'Indo-Chinese Crispy Chilli Chicken',
      description: 'Wok-tossed battered chicken chunks with crisp bell peppers, scallions, roasted garlic, and fiery chilli sauce.',
      price: 249,
      image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80',
      is_available: 0, // SOLD OUT demo
      is_special: 0,
      is_popular: 1,
      rating: 4.7,
      dietary: 'NON_VEG',
      addons: []
    },

    // Main Course
    {
      id: 'item_butter_chicken',
      category_id: 'cat_main',
      name: 'Grand Butter Chicken (Murgh Makhani)',
      description: 'Pulled smoked tandoori chicken simmered in creamy velvety tomato makhani gravy enriched with butter and kasuri methi.',
      price: 319,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 5.0,
      dietary: 'NON_VEG',
      addons: [
        { name: 'Extra Dollop of White Butter', price: 20 },
        { name: 'Fresh Cream Swirl', price: 15 },
        { name: 'Mild / Sweet Style', price: 0 }
      ]
    },
    {
      id: 'item_dal_makhani',
      category_id: 'cat_main',
      name: 'Signature 24-Hr Dal Makhani',
      description: 'Slow-simmered whole black urad lentils and kidney beans cooked overnight with tomatoes, butter, and fragrant ginger.',
      price: 229,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.9,
      dietary: 'VEG',
      addons: [
        { name: 'Extra Makhani Butter', price: 20 }
      ]
    },
    {
      id: 'item_kadai_paneer',
      category_id: 'cat_main',
      name: 'Dhaba Kadai Paneer',
      description: 'Cottage cheese cubes tossed with freshly pounded coriander seeds, dry red chillies, crunchy capsicum, and chunky gravy.',
      price: 259,
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      rating: 4.7,
      dietary: 'VEG',
      addons: [
        { name: 'Extra Paneer', price: 45 }
      ]
    },

    // Breads
    {
      id: 'item_butter_naan',
      category_id: 'cat_breads',
      name: 'Butter Garlic Naan',
      description: 'Traditional leavened flatbread brushed with crushed roasted garlic, fresh cilantro, and salted butter.',
      price: 65,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 1,
      rating: 4.8,
      dietary: 'VEG',
      addons: [
        { name: 'Cheese Stuffed Upgrade', price: 40 }
      ]
    },
    {
      id: 'item_tandoori_roti',
      category_id: 'cat_breads',
      name: 'Crispy Butter Tandoori Roti',
      description: 'Whole wheat flour flatbread freshly baked on the clay wall of tandoor with salted butter.',
      price: 35,
      image: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      rating: 4.6,
      dietary: 'VEG',
      addons: []
    },

    // Drinks
    {
      id: 'item_mango_lassi',
      category_id: 'cat_drinks',
      name: 'Kesariya Mango Lassi',
      description: 'Thick churned sweet yogurt blended with Alphonso mango pulp, saffron, cardamom, and sliced pistachios.',
      price: 119,
      image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.9,
      dietary: 'VEG',
      addons: [
        { name: 'Scoop of Vanilla Ice Cream', price: 35 },
        { name: 'Crushed Dry Fruits Topping', price: 20 }
      ]
    },
    {
      id: 'item_masala_coke',
      category_id: 'cat_drinks',
      name: 'Desi Masala Thums Up / Coke',
      description: 'Chilled cola spiced with roasted jeera powder, black salt, chat masala, and freshly squeezed lemon juice.',
      price: 79,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 1,
      rating: 4.7,
      dietary: 'VEG',
      addons: []
    },
    {
      id: 'item_fresh_lime',
      category_id: 'cat_drinks',
      name: 'Fresh Mint Lime Soda (Sweet & Salt)',
      description: 'Sparkling soda stirred with fresh lime juice, crushed garden mint, rock salt, and simple syrup.',
      price: 89,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 0,
      rating: 4.8,
      dietary: 'VEG',
      addons: []
    },

    // Desserts
    {
      id: 'item_gulab_jamun',
      category_id: 'cat_desserts',
      name: 'Warm Shahi Gulab Jamun (2 Pcs)',
      description: 'Soft khoya dumplings deep fried and soaked in warm rose water, cardamom, and saffron syrup.',
      price: 99,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 0,
      is_popular: 1,
      rating: 4.9,
      dietary: 'VEG',
      addons: [
        { name: 'Add Vanilla Ice Cream', price: 35 }
      ]
    },
    {
      id: 'item_rasmalai',
      category_id: 'cat_desserts',
      name: 'Angoori Rasmalai (2 Pcs)',
      description: 'Delicate cottage cheese patties immersed in chilled condensed milk infused with saffron and slivered almonds.',
      price: 129,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      is_available: 1,
      is_special: 1,
      is_popular: 1,
      rating: 4.9,
      dietary: 'VEG',
      addons: [
        { name: 'Extra Saffron Rabdi', price: 35 }
      ]
    }
  ];

  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image, is_available, is_special, is_popular, rating, dietary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAddon = db.prepare(`
    INSERT INTO menu_item_addons (id, menu_item_id, name, price, is_required)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of menuItems) {
    insertMenuItem.run(
      item.id,
      restaurantId,
      item.category_id,
      item.name,
      item.description,
      item.price,
      item.image,
      item.is_available,
      item.is_special,
      item.is_popular,
      item.rating,
      item.dietary
    );

    if (item.addons && item.addons.length > 0) {
      item.addons.forEach((addon, idx) => {
        insertAddon.run(`addon_${item.id}_${idx}`, item.id, addon.name, addon.price, 0);
      });
    }
  }

  // Seed an initial dining session on Table 12 with sample order and sample help request
  const sessionId = 'session_t12_demo';
  db.prepare(`
    INSERT INTO table_sessions (id, restaurant_id, table_id, table_number, session_token, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sessionId, restaurantId, 'tbl_12', '12', 'token_table12_session', 'ACTIVE');

  // Seed sample order #1042
  const orderId = 'order_1042';
  db.prepare(`
    INSERT INTO orders (id, order_number, restaurant_id, table_id, table_number, session_id, status, subtotal, tax_amount, total_amount, notes, payment_method, payment_status, estimated_prep_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId,
    '1042',
    restaurantId,
    'tbl_12',
    '12',
    sessionId,
    'PREPARING',
    498,
    24.9,
    522.9,
    'Please make it medium spicy',
    'CASH',
    'PENDING',
    18
  );

  db.prepare(`
    INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, selected_addons, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'oi_1',
    orderId,
    'item_cbiryani',
    'Hyderabadi Dum Chicken Biryani',
    249,
    2,
    JSON.stringify([{ name: 'Extra Chicken Piece (Succulent Leg)', price: 80 }]),
    658
  );

  // Seed sample Help Request from Table 12
  db.prepare(`
    INSERT INTO help_requests (id, restaurant_id, table_id, table_number, session_id, request_type, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'hr_101',
    restaurantId,
    'tbl_12',
    '12',
    sessionId,
    'Water',
    'Please bring two glasses of chilled water.',
    'PENDING'
  );

  console.log('✅ Database seeded successfully!');
}

module.exports = {
  db,
  initializeDatabase
};
