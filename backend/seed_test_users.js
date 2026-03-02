const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const seedTestUsers = async () => {
    try {
        // Create Doctor
        const doctorExists = await User.findOne({ email: 'doctor@hospital.com' });
        if (!doctorExists) {
            await User.create({
                name: 'Dr. Smith',
                email: 'doctor@hospital.com',
                password: 'doctor123',
                role: 'doctor',
                department: 'General Medicine',
                phone: '9876543210'
            });
            console.log('Doctor user created: doctor@hospital.com / doctor123');
        } else {
            console.log('Doctor user already exists');
        }

        // Create Receptionist
        const receptionistExists = await User.findOne({ email: 'reception@hospital.com' });
        if (!receptionistExists) {
            await User.create({
                name: 'Receptionist Sarah',
                email: 'reception@hospital.com',
                password: 'reception123',
                role: 'receptionist',
                phone: '1234567890'
            });
            console.log('Receptionist user created: reception@hospital.com / reception123');
        } else {
            console.log('Receptionist user already exists');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedTestUsers();
