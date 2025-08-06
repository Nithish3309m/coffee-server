const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const authMiddleware = require('../middleware/authmiddleware');
const sendMail = require('../utils/sendmail');
const User = require('../models/users');
const Product = require('../models/product');
const cart = require('../models/cart');
const adminMiddleware = require('../middleware/adminmiddleware');

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { address, paymentMethod } = req.body;

        // 1. Get user
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // 2. Get cart items
        const cartItems = await cart.find({ user: req.userId }).populate('product');
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // 3. Prepare order products
        const products = cartItems.map(item => ({
            productId: item.product._id,
            productname: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
        }));

        const totalAmount = products.reduce((sum, item) => sum + item.quantity * item.price, 0);

        for (const item of cartItems) {
            const product = item.product;
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        const newOrder = new Order({
            userId: req.userId,
            products,
            address,
            paymentMethod,
            totalAmount,
        });

        await newOrder.save();

        await cart.deleteMany({ user: req.userId });

        await sendMail(
            user.email,
            'Order Placed Successfully!',
            `<h3>Thank you for your order!</h3>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Total:</strong> ₹${totalAmount}</p>
            <p><strong>Shipping Address:</strong><br/>
              ${address.fullName}<br/>
              ${address.street}<br/>
              ${address.city} - ${address.postalCode}<br/>
              ${address.country}
            </p>`
        );

        res.status(201).json({ message: 'Order placed successfully' });

    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ error: 'Order creation failed' });
    }
});




router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = req.userId;
        const orders = await Order.find({ userId: user });
        if (!orders) {
            return res.status(400).json({ error: "order is empty" })
        }

        res.status(201).json({ orders });

    }
    catch (err) {
        res.status(500).json({ error: 'Order fetch failed' });

    }
})


router.get('/orders', adminMiddleware, async (req, res) => {

    try {
        const orders = await Order.find({}).populate('userId', 'name email');;
        res.status(200).json({ orders });
    }
    catch (error) {
        res.status(500).json({ error: 'Order fetch failed' });

    }

})

router.put('/updatestatus/:id', adminMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        

        res.status(200).json({ message: 'Order status updated', order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
