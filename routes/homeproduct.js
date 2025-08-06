const express = require('express');
const route = express.Router();
const Product = require('../models/product');
const sendMail = require('../utils/sendmail');
const Contact = require('../models/contact');


route.get('/products', async (req, res) => {


    try {
        const products = await Product.find({}).limit(4);

        if (!products) {
            res.status(400).json({ message: "No products available" });

        }

        res.status(201).json({ products });

    }

    catch (err) {
        res.status(500).json({ error: err });

    }


})

route.post('/contact', async (req, res) => {

    try {
        const { name, email, message } = req.body;

        const data = new Contact({ name, email, message });

        await data.save();

        await sendMail(
            email,
            'Message has received',
            `<h3>Thank you for contacting us!</h3>
       <p>We have received your message and will get back to you shortly.</p>`
        );

        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }

})

module.exports = route;
