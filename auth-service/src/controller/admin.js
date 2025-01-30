const mongoose = require('mongoose');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');

async function initializeAdminUser() {
    try {
        const existingUser = await User.findOne({ role: 2 });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash('admin', 10); 
            const adminUser = new User({
                username: 'admin',
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 2,    
                registeredAt: new Date(),
                registrationToken: null
            });

            await adminUser.save();
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
}

module.exports = initializeAdminUser;
