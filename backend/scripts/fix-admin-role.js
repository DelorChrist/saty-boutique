const { User } = require('./src/models');
const { connectDB } = require('./src/config/db');

async function fixAdminRole() {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL || 'admin@satyboutique.com';
        const admin = await User.findOne({ where: { email } });

        if (!admin) {
            console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
            process.exit(1);
        }

        console.log(`Mise à jour du role pour: ${admin.email}`);
        console.log(`Role actuel: ${admin.role}`);

        await admin.update({
            role: 'admin',
            status: 'active'
        });

        console.log('✅ Role mis à jour avec succès!');
        console.log(`Nouveau role: admin`);
        console.log(`Status: active`);

        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
}

fixAdminRole();
