// Script de test pour vérifier l'authentification admin
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simuler un token comme celui généré lors du login
const testToken = jwt.sign(
    { 
        id: 1, 
        email: 'admin@satyboutique.com', 
        role: 'admin',
        status: 'active'
    },
    process.env.JWT_SECRET || 'change_this_secret',
    { expiresIn: '7d' }
);

console.log('\n========== TOKEN DE TEST ==========');
console.log('Token généré:', testToken);
console.log('\n========== DÉCODAGE DU TOKEN ==========');

const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'change_this_secret');
console.log('Payload décodé:', decoded);
console.log('\nEmail:', decoded.email);
console.log('Role:', decoded.role);
console.log('Type du role:', typeof decoded.role);
console.log('Role === "admin"?', decoded.role === 'admin');

console.log('\n========== VÉRIFICATION ==========');
const roles = ['admin'];
console.log('Roles requis:', roles);
console.log('roles.includes(decoded.role):', roles.includes(decoded.role));

console.log('\n========== TESTEZ AVEC CE TOKEN ==========');
console.log('Copiez ce token et utilisez-le dans Postman ou votre navigateur:');
console.log(testToken);
console.log('\nPour tester dans le navigateur, ouvrez la console (F12) et exécutez:');
console.log(`localStorage.setItem('saty_auth_token', '${testToken}');`);
console.log(`localStorage.setItem('saty_current_user', '${JSON.stringify({ id: 1, email: 'admin@satyboutique.com', role: 'admin', firstName: 'Admin', lastName: 'User' })}');`);
console.log('\nPuis rechargez la page.');
