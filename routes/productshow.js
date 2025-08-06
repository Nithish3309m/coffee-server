const express = require('express');
const router = express.Router();
const Product = require('../models/product');



router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const id=req.params.id;
    const products = await Product.findById(id);
    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports=router;