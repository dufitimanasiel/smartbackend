const express = require('express');
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
router.use(isAuthenticated);

// INSERT - Add new employee
router.post('/', async (req, res) => {
  try {
    const { employeeNumber, FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode } = req.body;
    
    if (!employeeNumber || !FirstName || !LastName || !Position) {
      return res.status(400).json({ error: 'employeeNumber, FirstName, LastName, and Position are required' });
    }

    await db.query(
      `INSERT INTO Employee (employeeNumber, FirstName, LastName, Position, Address, Telephone, Gender, hiredDate, DepartmentCode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeNumber, FirstName, LastName, Position, Address || null, Telephone || null, Gender || null, hiredDate || null, DepartmentCode || null]
    );

    res.status(201).json({ success: true, message: 'Employee added successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Employee number already exists' });
    }
    console.error('Add employee error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Retrieve all employees (for dropdowns and display)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, d.DepartmentName 
       FROM Employee e 
       LEFT JOIN Department d ON e.DepartmentCode = d.DepartmentCode 
       ORDER BY e.LastName`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
