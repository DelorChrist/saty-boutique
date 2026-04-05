// Script pour débugger le token JWT stocké en localStorage
// Ouvrez la console du navigateur (F12) et collez ce code

console.log('🔍 === DEBUG TOKEN JWT ===');

// Récupérer le token
const token = localStorage.getItem('saty_auth_token');
const user = localStorage.getItem('saty_current_user');

if (!token) {
    console.error('❌ Aucun token trouvé dans localStorage');
} else {
    console.log('✅ Token trouvé:', token);
    
    // Décoder le token (sans vérification de signature)
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        console.log('📦 Contenu du token décodé:', payload);
        console.log('👤 Email:', payload.email);
        console.log('🎭 Rôle:', payload.role);
        console.log('🆔 ID:', payload.id);
        console.log('⏰ Expiration:', new Date(payload.exp * 1000).toLocaleString());
        
        if (payload.role !== 'admin') {
            console.error('❌ PROBLÈME: Le rôle n\'est pas "admin" mais "' + payload.role + '"');
            console.log('💡 Solution: Reconnectez-vous avec les identifiants admin');
        } else {
            console.log('✅ Rôle admin confirmé dans le token');
        }
    } catch (e) {
        console.error('❌ Erreur lors du décodage du token:', e);
    }
}

if (!user) {
    console.warn('⚠️ Aucun utilisateur trouvé dans localStorage');
} else {
    console.log('👤 Utilisateur stocké:', JSON.parse(user));
}

console.log('\n💡 Si le rôle n\'est pas "admin", déconnectez-vous et reconnectez-vous avec:');
console.log('   Email: admin@satyboutique.com');
console.log('   Password: admin123');
