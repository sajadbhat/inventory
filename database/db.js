const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'inventory.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Initialize Tables
 */
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      description TEXT,
      unit TEXT DEFAULT 'pcs',
      cost_price REAL NOT NULL DEFAULT 0.0,
      selling_price REAL NOT NULL DEFAULT 0.0,
      quantity INTEGER NOT NULL DEFAULT 0,
      min_threshold INTEGER NOT NULL DEFAULT 5,
      location TEXT,
      barcode TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('IN', 'OUT', 'ADJUST')),
      quantity INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      unit_price REAL DEFAULT 0.0,
      reason TEXT NOT NULL,
      reference_no TEXT,
      performed_by TEXT DEFAULT 'Admin',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_movements_timestamp ON stock_movements(timestamp);
  `);

  seedDefaultData();
}

/**
 * Seed initial sample data if empty
 */
function seedDefaultData() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial inventory database...');

  // Categories
  const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  insertCat.run('Electronics & Gadgets', 'Laptops, peripherals, screens, cables and accessories');
  insertCat.run('Office Furniture', 'Desks, ergonomic chairs, monitor arms, footrests');
  insertCat.run('Stationery & Supplies', 'Paper, notebooks, pens, packaging and shipping supplies');
  insertCat.run('Pantry & Consumables', 'Coffee beans, snacks, disposable cups and sanitizers');

  // Suppliers
  const insertSup = db.prepare('INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)');
  insertSup.run('Apex Global Tech', 'David Miller', 'sales@apextech.com', '+1 (555) 234-5678', '101 Silicon Valley Blvd, San Jose, CA');
  insertSup.run('ErgoSpace Solutions', 'Sarah Jenkins', 'orders@ergospace.com', '+1 (555) 345-6789', '450 Industrial Parkway, Chicago, IL');
  insertSup.run('OfficeMax Wholesale', 'Carlos Rivera', 'carlos@officemax-dist.com', '+1 (555) 456-7890', '789 Logistics Way, Dallas, TX');
  insertSup.run('Evergreen Pantry Goods', 'Amara Patel', 'hello@evergreenpantry.com', '+1 (555) 567-8901', '32 Artisan Lane, Seattle, WA');

  // Sample Products: [sku, name, cat_id, sup_id, desc, unit, cost_price, selling_price, quantity, min_threshold, location, barcode]
  const initialProducts = [
    ['TECH-001', 'Dell XPS 15 Laptop (32GB, 1TB SSD)', 1, 1, 'High performance laptop for development & design', 'pcs', 1450.00, 1899.99, 14, 5, 'Aisle A-01', '789100101'],
    ['TECH-002', 'Logitech MX Master 3S Wireless Mouse', 1, 1, 'Ergonomic precision mouse with quiet clicks', 'pcs', 65.00, 99.99, 32, 10, 'Aisle A-02', '789100102'],
    ['TECH-003', 'Keychron Q1 Pro Mechanical Keyboard', 1, 1, 'Wireless custom mechanical keyboard, RGB, Hot-swappable', 'pcs', 130.00, 199.99, 8, 5, 'Aisle A-03', '789100103'],
    ['TECH-004', 'LG UltraWide 34-Inch Curved Monitor', 1, 1, 'WQHD IPS display with HDR400 and USB-C hub', 'pcs', 380.00, 549.99, 4, 6, 'Aisle A-04', '789100104'], // Low stock
    ['TECH-005', 'Anker 100W USB-C Fast Charger & Cable', 1, 1, 'GaN compact charger with dual USB-C ports', 'pcs', 28.00, 49.99, 65, 15, 'Aisle A-05', '789100105'],
    ['TECH-006', 'Sony WH-1000XM5 Noise Cancelling Headphones', 1, 1, 'Industry-leading noise cancellation headset', 'pcs', 260.00, 398.00, 0, 5, 'Aisle A-06', '789100106'], // Out of stock!
    ['FURN-101', 'Ergonomic Mesh Task Chair', 2, 2, 'Adjustable lumbar support with 3D armrests', 'pcs', 180.00, 289.00, 12, 5, 'Bay B-01', '789200101'],
    ['FURN-102', 'Electric Dual-Motor Standing Desk (60x30)', 2, 2, 'Height adjustable solid bamboo desktop', 'pcs', 290.00, 449.00, 6, 4, 'Bay B-02', '789200102'],
    ['FURN-103', 'Heavy Duty Dual Monitor Gas Arm', 2, 2, 'Full motion 360 degree desk mount up to 32 inches', 'pcs', 45.00, 79.99, 2, 8, 'Bay B-03', '789200103'], // Low stock
    ['STAT-201', 'Premium Copy Paper A4 (5 Ream Box)', 3, 3, '80gsm high brightness multipurpose paper', 'box', 18.50, 32.00, 45, 10, 'Aisle C-01', '789300101'],
    ['STAT-202', 'Pilot G2 Gel Pens 0.7mm (Pack of 12)', 3, 3, 'Smooth writing black ink refillable pens', 'pack', 9.00, 16.50, 80, 20, 'Aisle C-02', '789300102'],
    ['STAT-203', 'Heavy Duty Shipping Tape (Pack of 6)', 3, 3, 'Clear packing adhesive tape for carton sealing', 'pack', 11.00, 22.00, 18, 15, 'Aisle C-03', '789300103'],
    ['PNTR-301', 'Organic Dark Roast Coffee Beans (1kg)', 4, 4, 'Fair-trade 100% Arabica artisanal roast', 'kg', 14.00, 24.99, 25, 8, 'Pantry Room', '789400101'],
    ['PNTR-302', 'Oat Milk Barista Edition (Case of 6)', 4, 4, 'Plant-based creamer for espresso and tea', 'box', 15.00, 26.50, 3, 6, 'Pantry Room', '789400102'], // Low stock
    ['PNTR-303', 'Eco-friendly Compostable Paper Cups (500ct)', 4, 4, 'Biodegradable 12oz hot drink cups', 'box', 22.00, 39.00, 11, 5, 'Pantry Room', '789400103']
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (sku, name, category_id, supplier_id, description, unit, cost_price, selling_price, quantity, min_threshold, location, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMove = db.prepare(`
    INSERT INTO stock_movements (product_id, type, quantity, previous_quantity, new_quantity, unit_price, reason, reference_no, performed_by, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  initialProducts.forEach((p, idx) => {
    const res = insertProd.run(...p);
    const prodId = Number(res.lastInsertRowid);
    const qty = p[8];
    const cost = p[6];

    // Record initial stock entry
    if (qty > 0) {
      insertMove.run(prodId, 'IN', qty, 0, qty, cost, 'Initial Inventory Setup', 'PO-INITIAL', 'System Admin', `-${10 - (idx % 8)} days`);
    } else {
      // For out of stock item, record an IN and then an OUT to show history
      insertMove.run(prodId, 'IN', 15, 0, 15, cost, 'Supplier Delivery', 'PO-7701', 'David Miller', '-7 days');
      insertMove.run(prodId, 'OUT', 15, 15, 0, p[7], 'Customer Order Full Fulfillment', 'INV-8890', 'Order Dispatch', '-1 days');
    }
  });

  // Add some realistic recent movements
  insertMove.run(2, 'OUT', 5, 37, 32, 99.99, 'Direct Customer Order', 'INV-9021', 'Sales Rep', '-3 hours');
  insertMove.run(5, 'IN', 25, 40, 65, 28.00, 'Batch Restock from Supplier', 'PO-8812', 'Warehouse Staff', '-5 hours');
  insertMove.run(4, 'OUT', 2, 6, 4, 549.99, 'Office Floor Deployment', 'REQ-104', 'IT Dept', '-1 days');

  console.log('Database seeded successfully with categories, suppliers, products, and movements.');
}

/**
 * Execute a stock change transaction
 */
function recordStockChange({ productId, type, quantity, reason, referenceNo, unitPrice, performedBy = 'Admin' }) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Quantity must be a positive integer');
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const prevQty = product.quantity;
  let newQty = prevQty;

  if (type === 'IN') {
    newQty = prevQty + qty;
  } else if (type === 'OUT') {
    if (prevQty < qty) {
      throw new Error(`Insufficient stock. Available: ${prevQty}, requested to dispatch: ${qty}`);
    }
    newQty = prevQty - qty;
  } else if (type === 'ADJUST') {
    newQty = qty; // For direct adjust, quantity is the target new quantity
  } else {
    throw new Error(`Invalid movement type: ${type}`);
  }

  const effectiveUnitCost = unitPrice !== undefined && unitPrice !== null ? Number(unitPrice) : product.cost_price;

  // Use a transaction
  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Update product quantity & updated_at
    db.prepare('UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQty, productId);

    // 2. Insert movement audit record
    const moveRes = db.prepare(`
      INSERT INTO stock_movements (product_id, type, quantity, previous_quantity, new_quantity, unit_price, reason, reference_no, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      type,
      type === 'ADJUST' ? Math.abs(newQty - prevQty) : qty,
      prevQty,
      newQty,
      effectiveUnitCost,
      reason || (type === 'IN' ? 'Stock Receipt' : (type === 'OUT' ? 'Stock Dispatch' : 'Stock Adjustment')),
      referenceNo || null,
      performedBy
    );

    db.exec('COMMIT;');

    return {
      success: true,
      productId,
      previousQuantity: prevQty,
      newQuantity: newQty,
      movementId: Number(moveRes.lastInsertRowid)
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// Initialize on module load
initializeDatabase();

module.exports = {
  db,
  initializeDatabase,
  seedDefaultData,
  recordStockChange
};
