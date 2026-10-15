const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * Helper to escape CSV values
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * GET /api/export/products/csv
 * Export inventory catalog as CSV
 */
router.get('/products/csv', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT
        p.sku,
        p.name,
        COALESCE(c.name, 'N/A') AS category,
        COALESCE(s.name, 'N/A') AS supplier,
        p.unit,
        p.cost_price,
        p.selling_price,
        p.quantity,
        p.min_threshold,
        ROUND(p.quantity * p.cost_price, 2) AS total_cost_value,
        ROUND(p.quantity * p.selling_price, 2) AS total_retail_value,
        p.location,
        p.barcode,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC
    `).all();

    const headers = [
      'SKU', 'Product Name', 'Category', 'Supplier', 'Unit',
      'Cost Price', 'Selling Price', 'In Stock', 'Min Threshold',
      'Total Cost Value', 'Total Retail Value', 'Location', 'Barcode', 'Created At'
    ];

    let csvContent = headers.map(escapeCSV).join(',') + '\r\n';

    for (const p of products) {
      const row = [
        p.sku, p.name, p.category, p.supplier, p.unit,
        p.cost_price, p.selling_price, p.quantity, p.min_threshold,
        p.total_cost_value, p.total_retail_value, p.location || '', p.barcode || '', p.created_at
      ];
      csvContent += row.map(escapeCSV).join(',') + '\r\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting products CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/export/movements/csv
 * Export movements audit log as CSV
 */
router.get('/movements/csv', (req, res) => {
  try {
    const movements = db.prepare(`
      SELECT
        m.id,
        m.timestamp,
        m.type,
        p.sku,
        p.name AS product_name,
        m.quantity,
        m.previous_quantity,
        m.new_quantity,
        m.unit_price,
        ROUND(m.quantity * m.unit_price, 2) AS total_amount,
        m.reason,
        m.reference_no,
        m.performed_by
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.timestamp DESC, m.id DESC
    `).all();

    const headers = [
      'Movement ID', 'Timestamp', 'Type', 'SKU', 'Product Name',
      'Qty Change', 'Prev Qty', 'New Qty', 'Unit Price', 'Total Amount',
      'Reason / Notes', 'Reference #', 'Performed By'
    ];

    let csvContent = headers.map(escapeCSV).join(',') + '\r\n';

    for (const m of movements) {
      const row = [
        m.id, m.timestamp, m.type, m.sku, m.product_name,
        m.quantity, m.previous_quantity, m.new_quantity, m.unit_price, m.total_amount,
        m.reason, m.reference_no || '', m.performed_by || ''
      ];
      csvContent += row.map(escapeCSV).join(',') + '\r\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="stock-movements-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting movements CSV:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/export/reset-demo
 * Reset database to default sample state
 */
router.post('/reset-demo', (req, res) => {
  try {
    db.exec(`
      DELETE FROM stock_movements;
      DELETE FROM products;
      DELETE FROM suppliers;
      DELETE FROM categories;
      DELETE FROM sqlite_sequence WHERE name IN ('stock_movements', 'products', 'suppliers', 'categories');
    `);

    const { seedDefaultData } = require('../database/db');
    seedDefaultData();

    res.json({
      success: true,
      message: 'Database reset to demo sample data successfully.'
    });
  } catch (error) {
    console.error('Error resetting demo data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
