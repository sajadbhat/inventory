const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/suppliers
 * List all suppliers with stats
 */
router.get('/', (req, res) => {
  try {
    const query = `
      SELECT
        s.*,
        COUNT(p.id) AS product_count,
        COALESCE(SUM(p.quantity), 0) AS total_units_supplied
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `;
    const suppliers = db.prepare(query).all();

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/suppliers
 * Create a new supplier
 */
router.post('/', (req, res) => {
  try {
    const { name, contact_person = '', email = '', phone = '', address = '' } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Supplier company name is required' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO suppliers (name, contact_person, email, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      contact_person ? contact_person.trim() : '',
      email ? email.trim() : '',
      phone ? phone.trim() : '',
      address ? address.trim() : ''
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: {
        id: Number(result.lastInsertRowid),
        name: name.trim()
      }
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/suppliers/:id
 * Edit supplier
 */
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, contact_person, email, phone, address } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Supplier company name is required' });
    }

    const updateStmt = db.prepare(`
      UPDATE suppliers SET
        name = ?,
        contact_person = ?,
        email = ?,
        phone = ?,
        address = ?
      WHERE id = ?
    `);

    updateStmt.run(
      name.trim(),
      contact_person !== undefined ? contact_person.trim() : '',
      email !== undefined ? email.trim() : '',
      phone !== undefined ? phone.trim() : '',
      address !== undefined ? address.trim() : '',
      id
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/suppliers/:id
 * Delete supplier
 */
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Unlink products
    db.prepare('UPDATE products SET supplier_id = NULL WHERE supplier_id = ?').run(id);
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
