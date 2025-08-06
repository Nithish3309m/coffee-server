const express = require('express');
const router = express.Router();
const User = require('../models/users');


// GET /api/admin/customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' }).sort({ registered: -1 });
        res.json(customers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET single customer by ID
router.get('/customers/:id', async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT block a customer
router.put('/customers/:id', async (req, res) => {
    try {
        const customer = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'Blocked' },
            { new: true }
        );
        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ status: 'Blocked', user: customer });
    } catch (err) {
        console.error('Error blocking user:', err); // 🔥 add this
        res.status(500).json({ message: 'Server error' });
    }
});

// Unblock a customer by ID
router.put('/customers/unblock/:id', async (req, res) => {
    try {
        const customer = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'Active' },
            { new: true }
        );
        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ status: 'Active', user: customer });
    } catch (err) {
        console.error('Error unblocking user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});



// DELETE a customer
router.delete('/customers/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
