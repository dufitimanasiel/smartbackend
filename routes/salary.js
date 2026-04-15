const express = require('express');
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.use(isAuthenticated);

// INSERT - Add new salary record
router.post('/', async (req, res) => {
  try {
    const { employeeNumber, GrossSalary, TotalDeduction, NetSalary, month } = req.body;
    
    if (!employeeNumber || GrossSalary === undefined || TotalDeduction === undefined || !month) {
      return res.status(400).json({ error: 'employeeNumber, GrossSalary, TotalDeduction, and month are required' });
    }

    const net = NetSalary !== undefined ? NetSalary : (parseFloat(GrossSalary) - parseFloat(TotalDeduction));

    await db.query(
      'INSERT INTO Salary (employeeNumber, GrossSalary, TotalDeduction, NetSalary, month) VALUES (?, ?, ?, ?, ?)',
      [employeeNumber, GrossSalary, TotalDeduction, net, month]
    );

    res.status(201).json({ success: true, message: 'Salary record added successfully' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid employee number' });
    }
    console.error('Add salary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// RETRIEVE - Get all salary records
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, e.FirstName, e.LastName, e.Position, d.DepartmentName 
       FROM Salary s 
       JOIN Employee e ON s.employeeNumber = e.employeeNumber 
       LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode 
       ORDER BY s.month DESC, e.LastName`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get salaries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// RETRIEVE - Get single salary by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, e.FirstName, e.LastName, e.Position, d.DepartmentName 
       FROM Salary s 
       JOIN Employee e ON s.employeeNumber = e.employeeNumber 
       LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode 
       WHERE s.salaryId = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Salary record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get salary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE - Update salary record
router.put('/:id', async (req, res) => {
  try {
    const { GrossSalary, TotalDeduction, NetSalary, month } = req.body;
    const id = req.params.id;

    const updates = [];
    const values = [];
    if (GrossSalary !== undefined) { updates.push('GrossSalary = ?'); values.push(GrossSalary); }
    if (TotalDeduction !== undefined) { updates.push('TotalDeduction = ?'); values.push(TotalDeduction); }
    if (NetSalary !== undefined) { updates.push('NetSalary = ?'); values.push(NetSalary); }
    if (month !== undefined) { updates.push('month = ?'); values.push(month); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await db.query(
      `UPDATE Salary SET ${updates.join(', ')} WHERE salaryId = ?`,
      values
    );

    res.json({ success: true, message: 'Salary record updated successfully' });
  } catch (err) {
    console.error('Update salary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - Delete salary record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Salary WHERE salaryId = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Salary record not found' });
    }
    res.json({ success: true, message: 'Salary record deleted successfully' });
  } catch (err) {
    console.error('Delete salary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
