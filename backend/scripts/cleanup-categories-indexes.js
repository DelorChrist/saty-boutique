// Script pour nettoyer les index en trop dans la table Categories
require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanupIndexes() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '1234',
        database: process.env.DB_NAME || 'saty_boutique'
    });

    try {
        console.log('Vérification des index sur la table Categories...');

        // Récupérer tous les index
        const [indexes] = await connection.query(`
            SELECT DISTINCT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Categories' AND INDEX_NAME != 'PRIMARY'
        `, [process.env.DB_NAME || 'saty_boutique']);

        console.log(`📊 ${indexes.length} index trouvés (hors PRIMARY KEY):`);
        indexes.forEach(idx => console.log(`   - ${idx.INDEX_NAME}`));

        // Supprimer tous les index sauf PRIMARY
        for (const index of indexes) {
            try {
                console.log(`🗑️  Suppression de l'index: ${index.INDEX_NAME}`);
                await connection.query(`ALTER TABLE Categories DROP INDEX ??`, [index.INDEX_NAME]);
                console.log(`${index.INDEX_NAME} supprimé`);
            } catch (err) {
                console.log(`Erreur lors de la suppression de ${index.INDEX_NAME}:`, err.message);
            }
        }

        // Recréer uniquement l'index unique sur slug
        console.log('🔧 Création de l\'index unique sur slug...');
        try {
            await connection.query(`ALTER TABLE Categories ADD UNIQUE INDEX slug (slug)`);
            console.log('Index unique créé sur slug');
        } catch (err) {
            console.log('Index slug existe déjà ou erreur:', err.message);
        }

        console.log('\n✨ Nettoyage terminé ! Vous pouvez maintenant redémarrer le serveur backend.');

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

cleanupIndexes();
