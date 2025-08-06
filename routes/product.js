const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const upload = require('../middleware/upload');
const adminMiddleware = require('../middleware/adminmiddleware');
const fs = require('fs');
const path = require('path');

// POST /api/admin/products (protected)
router.post('/products', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new Product({ name, description, price, stock, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Product creation failed' });
  }
});


router.put('/products/:id', adminMiddleware, upload.single('image'), async (req, res) => {

  try {
    const id = req.params.id;
    const { name, description, price, stock, image } = req.body;
    const updateData = {
      name,
      description,
      price,
      stock
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product: product });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optional: remove the image file from server
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', product.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn('Image deletion failed:', err);
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// GET /api/admin/products (open or protect as needed)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
