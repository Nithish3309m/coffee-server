
const express = require('express');
const User = require('../models/users');
const authmiddleware = require('../middleware/authmiddleware');
const upload=require('../middleware/upload');
const bcrypt = require('bcryptjs');


const route = express.Router();

route.get('/profile', authmiddleware, async (req, res) => {

    const user = await User.findById(req.userId).select('-password');
    res.status(201).json({ success: true, user });


});

route.post('/profile/update', authmiddleware,upload.single('profilePic'), async (req, res) => {
    try {


        const userId = req.userId;

        const { name, email, phone, profilePic, street, city, state, pincode, country, currentPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ✅ Handle password update
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'Please fill all password fields' });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New passwords do not match' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // ✅ Update fields if provided
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.street = street || user.street;
        user.city = city || user.city;
        user.state = state || user.state;
        user.pincode = pincode || user.pincode;
        user.country = country || user.country;

        // ✅ Handle profile image
        if (req.file) {
            user.profilePic = req.file.filename;
        }

        await user.save();

        res.json({success:true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: 'Server error' });
    }


})



module.exports = route;