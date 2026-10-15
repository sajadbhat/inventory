const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/categories
 * List all categories with product counts and inventory values
 */
router.get('/', (req, res) => {
  try {
    const query = `
      SELECT
        c.*,
        COUNT(p.id) AS product_count,
        COALESCE(SUM(p.quantity), 0) AS total_units,
        COALESCE(ROUND(SUM(p.quantity * p.selling_price), 2), 0) AS total_value
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const categories = db.prepare(query).all();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/categories
 * Add a new category
 */
router.post('/', (req, res) => {
  try {
    const { name, description = '' } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const trimmed = name.trim();
    const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(trimmed);
    if (existing) {
      return res.status(400).json({ success: false, error: `Category "${trimmed}" already exists.` });
    }

    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(trimmed, description.trim());

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: Number(result.lastInsertRowid),
        name: trimmed,
        description: description.trim()
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/categories/:id
 * Edit category
 */
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const trimmed = name.trim();
    const existing = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?').get(trimmed, id);
    if (existing) {
      return res.status(400).json({ success: false, error: `Another category with name "${trimmed}" already exists.` });
    }

    db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(
      trimmed,
      description !== undefined ? description.trim() : '',
      id
    );

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Unlink products before deleting
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
