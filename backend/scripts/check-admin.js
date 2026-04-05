const { User } = require('./src/models');
const { connectDB } = require('./src/config/db');

async function checkAdmin() {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL || 'admin@satyboutique.com';
        const admin = await User.findOne({ where: { email } });

        if (!admin) {
            console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
        } else {
            console.log('\n✅ Utilisateur trouvé:');
            console.log('ID:', admin.id);
            console.log('Email:', admin.email);
            console.log('Nom:', admin.firstName, admin.lastName);
            console.log('Role:', admin.role);
            console.log('Status:', admin.status);
            console.log('');
            
            if (admin.role !== 'admin') {
                console.log(`⚠️  ATTENTION: Le role est "${admin.role}" au lieu de "admin"`);
                console.log('Pour corriger, exécutez: node fix-admin-role.js');
            } else {
                console.log('✅ Le compte admin est correctement configuré.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
}

checkAdmin();
