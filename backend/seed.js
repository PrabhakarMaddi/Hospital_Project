const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@hospital.com',
            password: 'admin123',
            role: 'admin',
        });

        if (admin) {
            console.log('Admin user created successfully');
            console.log('Email: admin@hospital.com');
            console.log('Password: admin123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
