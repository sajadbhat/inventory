const express = require('express');
const router = express.Router();
const { db, recordStockChange } = require('../database/db');

/**
 * Generate a random unique SKU helper
 */
function generateSKU(categoryName = 'PRD') {
  const prefix = (categoryName.replace(/[^a-zA-Z]/g, '').slice(0, 3) || 'PRD').toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

/**
 * GET /api/products
 * Filter, search, and list products with joined categories and suppliers
 */
router.get('/', (req, res) => {
  try {
    const { search, category_id, supplier_id, status, sort_by = 'name', sort_order = 'asc' } = req.query;

    let query = `
      SELECT
        p.id,
        p.sku,
        p.name,
        p.category_id,
        p.supplier_id,
        p.description,
        p.unit,
        p.cost_price,
        p.selling_price,
        p.quantity,
        p.min_threshold,
        p.location,
        p.barcode,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        s.name AS supplier_name,
        ROUND((p.quantity * p.cost_price), 2) AS total_cost_value,
        ROUND((p.quantity * p.selling_price), 2) AS total_retail_value,
        ROUND(CASE WHEN p.cost_price > 0 THEN ((p.selling_price - p.cost_price) / p.cost_price) * 100 ELSE 0 END, 1) AS margin_percent,
        CASE
          WHEN p.quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN p.quantity <= p.min_threshold THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by search text
    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.location LIKE ? OR p.barcode LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    // Filter by category
    if (category_id && category_id !== 'all') {
      query += ` AND p.category_id = ?`;
      params.push(parseInt(category_id, 10));
    }

    // Filter by supplier
    if (supplier_id && supplier_id !== 'all') {
      query += ` AND p.supplier_id = ?`;
      params.push(parseInt(supplier_id, 10));
    }

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'out_of_stock') {
        query += ` AND p.quantity = 0`;
      } else if (status === 'low_stock') {
        query += ` AND p.quantity > 0 AND p.quantity <= p.min_threshold`;
      } else if (status === 'in_stock') {
        query += ` AND p.quantity > p.min_threshold`;
      }
    }

    // Sorting safe whitelist
    const validSortCols = {
      name: 'p.name',
      sku: 'p.sku',
      quantity: 'p.quantity',
      cost_price: 'p.cost_price',
      selling_price: 'p.selling_price',
      created_at: 'p.created_at',
      stock_status: 'p.quantity'
    };

    const sortColumn = validSortCols[sort_by] || 'p.name';
    const direction = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const products = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/products/:id
 * Single product with full details and movement history
 */
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const productQuery = `
      SELECT
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        s.email AS supplier_email,
        s.phone AS supplier_phone,
        ROUND((p.quantity * p.cost_price), 2) AS total_cost_value,
        ROUND((p.quantity * p.selling_price), 2) AS total_retail_value,
        ROUND(CASE WHEN p.cost_price > 0 THEN ((p.selling_price - p.cost_price) / p.cost_price) * 100 ELSE 0 END, 1) AS margin_percent,
        CASE
          WHEN p.quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN p.quantity <= p.min_threshold THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `;

    const product = db.prepare(productQuery).get(id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Fetch recent movements for this product
    const movements = db.prepare(`
      SELECT * FROM stock_movements
      WHERE product_id = ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 25
    `).all(id);

    res.json({
      success: true,
      data: {
        ...product,
        movements
      }
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/products
 * Create a new product and optionally log initial stock
 */
router.post('/', (req, res) => {
  try {
    let {
      sku,
      name,
      category_id,
      supplier_id,
      description = '',
      unit = 'pcs',
      cost_price = 0,
      selling_price = 0,
      quantity = 0,
      min_threshold = 5,
      location = '',
      barcode = ''
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }

    // If SKU is not provided, generate one
    if (!sku || sku.trim() === '') {
      let catName = 'PRD';
      if (category_id) {
        const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(category_id);
        if (cat) catName = cat.name;
      }
      sku = generateSKU(catName);
    } else {
      sku = sku.trim().toUpperCase();
    }

    // Check SKU uniqueness
    const existingSku = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
    if (existingSku) {
      return res.status(400).json({ success: false, error: `SKU "${sku}" is already in use.` });
    }

    const costNum = Math.max(0, parseFloat(cost_price) || 0);
    const sellingNum = Math.max(0, parseFloat(selling_price) || 0);
    const qtyNum = Math.max(0, parseInt(quantity, 10) || 0);
    const thresholdNum = Math.max(0, parseInt(min_threshold, 10) || 0);

    const insertStmt = db.prepare(`
      INSERT INTO products (
        sku, name, category_id, supplier_id, description, unit,
        cost_price, selling_price, quantity, min_threshold, location, barcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      sku,
      name.trim(),
      category_id ? parseInt(category_id, 10) : null,
      supplier_id ? parseInt(supplier_id, 10) : null,
      description ? description.trim() : '',
      unit || 'pcs',
      costNum,
      sellingNum,
      qtyNum,
      thresholdNum,
      location ? location.trim() : '',
      barcode ? barcode.trim() : ''
    );

    const newProductId = Number(result.lastInsertRowid);

    // If initial stock is greater than 0, record initial stock movement
    if (qtyNum > 0) {
      db.prepare(`
        INSERT INTO stock_movements (
          product_id, type, quantity, previous_quantity, new_quantity,
          unit_price, reason, reference_no, performed_by
        ) VALUES (?, 'IN', ?, 0, ?, ?, 'Initial Stock Intake', 'SETUP', 'Admin')
      `).run(newProductId, qtyNum, qtyNum, costNum);
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: newProductId,
        sku,
        name: name.trim(),
        quantity: qtyNum
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/products/:id
 * Update product information
 */
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const {
      sku,
      name,
      category_id,
      supplier_id,
      description,
      unit,
      cost_price,
      selling_price,
      quantity,
      min_threshold,
      location,
      barcode,
      adjust_reason
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Product name cannot be empty.' });
    }

    const newSku = (sku || existing.sku).trim().toUpperCase();

    // Verify SKU uniqueness if changed
    if (newSku !== existing.sku) {
      const skuConflict = db.prepare('SELECT id FROM products WHERE sku = ? AND id != ?').get(newSku, id);
      if (skuConflict) {
        return res.status(400).json({ success: false, error: `SKU "${newSku}" is already taken.` });
      }
    }

    const costNum = cost_price !== undefined ? Math.max(0, parseFloat(cost_price) || 0) : existing.cost_price;
    const sellingNum = selling_price !== undefined ? Math.max(0, parseFloat(selling_price) || 0) : existing.selling_price;
    const thresholdNum = min_threshold !== undefined ? Math.max(0, parseInt(min_threshold, 10) || 0) : existing.min_threshold;
    const targetQty = quantity !== undefined ? Math.max(0, parseInt(quantity, 10) || 0) : existing.quantity;

    // Check if quantity changed directly through edit form
    if (targetQty !== existing.quantity) {
      recordStockChange({
        productId: id,
        type: 'ADJUST',
        quantity: targetQty,
        reason: adjust_reason || 'Product Details Edit Adjustment',
        referenceNo: 'EDIT-ADJUST',
        performedBy: 'Admin'
      });
    }

    const updateStmt = db.prepare(`
      UPDATE products SET
        sku = ?,
        name = ?,
        category_id = ?,
        supplier_id = ?,
        description = ?,
        unit = ?,
        cost_price = ?,
        selling_price = ?,
        min_threshold = ?,
        location = ?,
        barcode = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      newSku,
      name.trim(),
      category_id ? parseInt(category_id, 10) : null,
      supplier_id ? parseInt(supplier_id, 10) : null,
      description !== undefined ? description : existing.description,
      unit || existing.unit,
      costNum,
      sellingNum,
      thresholdNum,
      location !== undefined ? location : existing.location,
      barcode !== undefined ? barcode : existing.barcode,
      id
    );

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT id, name FROM products WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Delete movements first or rely on cascade
    db.prepare('DELETE FROM stock_movements WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Product "${existing.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/products/:id/adjust
 * Rapid stock adjustment (Receive, Dispatch, or Physical Count Adjustment)
 */
router.post('/:id/adjust', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type, quantity, reason, reference_no, performed_by } = req.body;

    if (!type || !['IN', 'OUT', 'ADJUST'].includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'Invalid adjustment type. Must be IN, OUT, or ADJUST.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, error: 'Quantity must be a valid positive integer.' });
    }

    const result = recordStockChange({
      productId: id,
      type: type.toUpperCase(),
      quantity: qty,
      reason: reason || (type === 'IN' ? 'Stock Intake' : (type === 'OUT' ? 'Stock Out' : 'Inventory Count')),
      referenceNo: reference_no,
      performedBy: performed_by || 'Admin'
    });

    res.json({
      success: true,
      message: `Stock successfully adjusted for product ID ${id}.`,
      data: result
    });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
