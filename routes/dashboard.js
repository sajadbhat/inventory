const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

/**
 * GET /api/dashboard/stats
 * Return overall KPI metrics, low-stock alerts, category breakdown, and recent activity
 */
router.get('/stats', (req, res) => {
  try {
    // 1. Core KPIs
    const kpiQuery = `
      SELECT
        COUNT(*) AS total_products,
        COALESCE(SUM(quantity), 0) AS total_units,
        COALESCE(SUM(quantity * cost_price), 0) AS total_cost_value,
        COALESCE(SUM(quantity * selling_price), 0) AS total_retail_value,
        COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_count,
        COALESCE(SUM(CASE WHEN quantity > 0 AND quantity <= min_threshold THEN 1 ELSE 0 END), 0) AS low_stock_count,
        COALESCE(SUM(CASE WHEN quantity > min_threshold THEN 1 ELSE 0 END), 0) AS healthy_stock_count
      FROM products
    `;
    const kpis = db.prepare(kpiQuery).get();

    // 2. Counts for categories and suppliers
    const catCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
    const supCount = db.prepare('SELECT COUNT(*) AS count FROM suppliers').get().count;

    // 3. Low stock and out-of-stock alert items
    const alertsQuery = `
      SELECT
        p.id, p.sku, p.name, p.quantity, p.min_threshold, p.unit, p.location,
        c.name AS category_name,
        s.name AS supplier_name,
        CASE
          WHEN p.quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN p.quantity <= p.min_threshold THEN 'LOW_STOCK'
          ELSE 'HEALTHY'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.quantity <= p.min_threshold
      ORDER BY p.quantity ASC, p.name ASC
    `;
    const lowStockAlerts = db.prepare(alertsQuery).all();

    // 4. Category breakdown (for charts & distribution)
    const categoryBreakdownQuery = `
      SELECT
        COALESCE(c.name, 'Uncategorized') AS category_name,
        COUNT(p.id) AS product_count,
        COALESCE(SUM(p.quantity), 0) AS total_quantity,
        COALESCE(SUM(p.quantity * p.selling_price), 0) AS total_value,
        COALESCE(SUM(p.quantity * p.cost_price), 0) AS total_cost
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY p.category_id
      ORDER BY total_value DESC
    `;
    const categoryBreakdown = db.prepare(categoryBreakdownQuery).all();

    // 5. Recent stock movements
    const recentMovementsQuery = `
      SELECT
        m.id, m.product_id, m.type, m.quantity, m.previous_quantity, m.new_quantity,
        m.unit_price, m.reason, m.reference_no, m.performed_by, m.timestamp,
        p.name AS product_name, p.sku AS product_sku, p.unit AS product_unit
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.timestamp DESC, m.id DESC
      LIMIT 10
    `;
    const recentMovements = db.prepare(recentMovementsQuery).all();

    // 6. Movement aggregates (Last 7 days stock in vs out)
    const movementTrendsQuery = `
      SELECT
        date(timestamp) AS move_date,
        SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) AS total_in,
        SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS total_out
      FROM stock_movements
      WHERE timestamp >= datetime('now', '-14 days')
      GROUP BY date(timestamp)
      ORDER BY move_date ASC
    `;
    const movementTrends = db.prepare(movementTrendsQuery).all();

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: kpis.total_products,
          totalUnits: kpis.total_units,
          totalCostValue: Math.round(kpis.total_cost_value * 100) / 100,
          totalRetailValue: Math.round(kpis.total_retail_value * 100) / 100,
          projectedProfit: Math.round((kpis.total_retail_value - kpis.total_cost_value) * 100) / 100,
          outOfStockCount: kpis.out_of_stock_count,
          lowStockCount: kpis.low_stock_count,
          healthyStockCount: kpis.healthy_stock_count,
          totalCategories: catCount,
          totalSuppliers: supCount
        },
        lowStockAlerts,
        categoryBreakdown,
        recentMovements,
        movementTrends
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
