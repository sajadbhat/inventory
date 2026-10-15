const express = require('express');
const router = express.Router();
const { db, recordStockChange } = require('../database/db');

/**
 * GET /api/movements
 * List audit movements with filters
 */
router.get('/', (req, res) => {
  try {
    const { product_id, type, search, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        m.id,
        m.product_id,
        m.type,
        m.quantity,
        m.previous_quantity,
        m.new_quantity,
        m.unit_price,
        ROUND((m.quantity * m.unit_price), 2) AS total_amount,
        m.reason,
        m.reference_no,
        m.performed_by,
        m.timestamp,
        p.name AS product_name,
        p.sku AS product_sku,
        p.unit AS product_unit,
        c.name AS category_name
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (product_id) {
      query += ` AND m.product_id = ?`;
      params.push(parseInt(product_id, 10));
    }

    if (type && type !== 'all') {
      query += ` AND m.type = ?`;
      params.push(type.toUpperCase());
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR m.reason LIKE ? OR m.reference_no LIKE ? OR m.performed_by LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY m.timestamp DESC, m.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10) || 100, parseInt(offset, 10) || 0);

    const movements = db.prepare(query).all(...params);

    // Also get overall counts of movements
    const summary = db.prepare(`
      SELECT
        COUNT(*) AS total_records,
        SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) AS total_in_units,
        SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS total_out_units
      FROM stock_movements
    `).get();

    res.json({
      success: true,
      summary,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/movements
 * Create a movement (used by Receive or Dispatch workflow)
 */
router.post('/', (req, res) => {
  try {
    const { product_id, type, quantity, reason, reference_no, unit_price, performed_by } = req.body;

    if (!product_id || !type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: product_id, type, and quantity.'
      });
    }

    const result = recordStockChange({
      productId: parseInt(product_id, 10),
      type: type.toUpperCase(),
      quantity: parseInt(quantity, 10),
      reason: reason || (type.toUpperCase() === 'IN' ? 'Stock Intake' : 'Stock Dispatch'),
      referenceNo: reference_no,
      unitPrice: unit_price,
      performedBy: performed_by || 'Admin'
    });

    res.status(201).json({
      success: true,
      message: 'Movement recorded successfully',
      data: result
    });
  } catch (error) {
    console.error('Error recording movement:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
