const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authmiddleware'); // verify token middleware







router.get('/products', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const cartItems = await Cart.find({ user: userId }).populate('product');

        // Map to the structure expected by frontend
        const items = cartItems.map(item => ({
            _id: item._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            qty: item.quantity,
            stock: item.product.stock
        }));

        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});



router.get('/count', authMiddleware, async (req, res) => {
    try {
        const cartItems = await Cart.find({ user: req.userId });
        const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Cart count failed' });
    }
});





// Add to cart
router.post('/add', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if already in cart → update quantity
        let existingItem = await Cart.findOne({ user: req.userId, product: productId });
        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
            return res.json({ message: 'Cart updated' });
        }

        // Else create new
        const cartItem = new Cart({
            user: req.userId,
            product: productId,
            quantity,
        });

        await cartItem.save();
        res.status(201).json({ message: 'Added to cart' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const updatedCart = await Cart.findOneAndUpdate(
            { _id: cartItemId, user: req.userId },
            { quantity },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Quantity updated', updatedCart });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


router.delete('/remove/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const cartItemId = req.params.id;

        const deletedItem = await Cart.findOneAndDelete({
            _id: cartItemId,
            user: userId,
        });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart', deletedItem });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});






module.exports = router;
