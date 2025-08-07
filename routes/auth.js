const express = require('express');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const route = express.Router();


route.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password not match" });
        }

        const isexist = await User.findOne({ email });

        if (isexist) {
            return res.status(400).json({ success: false, message: "Email already exist" });
        }

        const hashpass = await bcrypt.hash(password, 10);

        const user = new User({
            name, email, password: hashpass
        });

        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ message: 'Server error' });
    }

});


route.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User account was not found" });
        }
        if (user.status === 'Blocked') {
            return res.status(403).json({ success: false, message: "Your account has been blocked by the admin." });
        }
         if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: "Your account is admin cannot login here." });
        }


        const check = await bcrypt.compare(password, user.password);

        if (!check) {
            return res.status(400).json({ success: false, message: "Password invalid" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SERCET_KEY, { expiresIn: '1h' });

        res.status(201).json({ success: true, message: "login success", token });


    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }

})






module.exports = route;