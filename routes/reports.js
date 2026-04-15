const express = require('express');
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.use(isAuthenticated);

// Monthly Payroll Report - FirstName, LastName, Position, Department, Net Salary
router.get('/monthly-payroll', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ error: 'Month parameter required (e.g., 2025-02)' });
    }

    const [rows] = await db.query(
      `SELECT e.FirstName, e.LastName, e.Position, d.DepartmentName AS Department, s.NetSalary
       FROM Salary s
       JOIN Employee e ON s.employeeNumber = e.employeeNumber
       LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode
       WHERE s.month = ?
       ORDER BY d.DepartmentName, e.LastName`,
      [month]
    );

    res.json(rows);
  } catch (err) {
    console.error('Monthly payroll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available months for report
router.get('/months', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT month FROM Salary ORDER BY month DESC'
    );
    res.json(rows.map(r => r.month));
  } catch (err) {
    console.error('Get months error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
