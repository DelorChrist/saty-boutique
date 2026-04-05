const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { connectDB, sequelize } = require('./src/config/db');

async function seedAdmin() {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL || 'admin@satyboutique.com';
        const password = process.env.ADMIN_PASSWORD;
        if (!password) {
            throw new Error('Missing ADMIN_PASSWORD in environment. Set it in backend/.env before seeding.');
        }
        const existingAdmin = await User.findOne({ where: { email } });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            firstName: 'Admin',
            lastName: 'Principal',
            email: email,
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        console.log('Admin user created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
