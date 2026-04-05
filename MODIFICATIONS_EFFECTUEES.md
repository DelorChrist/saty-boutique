# Modifications Effectuées - Saty Boutique

## ✅ 1. Popup de Code Promo à la Connexion

**Modifications apportées :**
- Le popup s'affiche maintenant à **chaque connexion** et **à chaque reconnexion** (plus de limite "une fois par jour")
- Délai d'affichage réduit à **300ms** (au lieu de 1 seconde) pour une meilleure réactivité
- Le popup ne s'affiche que pour les **clients** (pas les admins)

**Fichiers modifiés :**
- `src/app/services/auth.service.ts`
  - Constructor : charge les promos au rechargement de page
  - Méthode `login()` : charge les promos après connexion
- `src/app/components/promo-popup/promo-popup.component.ts`
  - `ngOnInit()` : suppression de la vérification "hasSeenPromosToday"
  - `show()` : délai réduit à 300ms
  - `close()` : suppression de markPromosSeen()

## ✅ 2. Correction Erreur Autorisation Admin

**Diagnostic et Solution :**

L'erreur "Accès refusé. Autorisation insuffisante" peut avoir plusieurs causes :

### Vérifications à effectuer :

1. **Vérifier votre compte admin dans la base de données :**
   ```sql
   USE saty_boutique;
   SELECT id, email, role, status FROM Users WHERE role = 'admin';
   ```
   Le compte admin doit avoir :
   - `role` = 'admin'
   - `status` = 'active'

2. **Si aucun compte admin n'existe, créez-en un :**
   ```bash
   cd backend
   node seed-admin.js
   ```
   Cela créera un compte admin avec les identifiants définis dans `.env` :
   - Email : `ADMIN_EMAIL` (par défaut: admin@satyboutique.com)
   - Mot de passe : `ADMIN_PASSWORD`

3. **Vérifier le fichier `.env` du backend :**
   ```env
   ADMIN_EMAIL=admin@satyboutique.com
   ADMIN_PASSWORD=votre_mot_de_passe_securise
   JWT_SECRET=votre_secret_jwt
   ```

4. **Se reconnecter après avoir créé le compte admin :**
   - Déconnectez-vous de l'interface admin
   - Reconnectez-vous avec les identifiants admin
   - Le nouveau token JWT contiendra le rôle 'admin'

### Amélioration ajoutée :
- Logs de débogage améliorés dans `backend/src/middlewares/auth.js`
- Vérifiez la console du serveur backend pour voir les détails de l'autorisation

**Commandes utiles :**
```bash
# Vérifier les logs du serveur
cd backend
npm run dev
# Les logs afficheront: [AUTH] Authorization check - Required roles: admin, User: {...}
```

## ✅ 3. Champ Code Promo au Checkout

**Fonctionnalités ajoutées :**

### Interface utilisateur :
- **Champ de saisie** pour entrer le code promo
- **Bouton "Appliquer"** avec état de chargement
- **Badge vert** après validation réussie du code
- **Bouton de suppression** (✕) pour retirer le code
- **Messages d'erreur** en cas de code invalide

### Logique de validation :
- Vérification en temps réel via l'API `/api/promos/validate`
- Contrôles automatiques :
  - Code existe et est actif
  - Code non expiré
  - Montant minimum de commande atteint
- Calcul automatique de la réduction (pourcentage ou fixe)

### Affichage dans le récapitulatif :
- Ligne "Réduction" affichée en vert
- Total mis à jour : `Subtotal + Frais de livraison - Réduction`

**Fichiers modifiés :**

### Frontend :
- `src/app/pages/checkout/checkout.component.ts`
  - Import de `PromoService`
  - Propriétés : `promoCode`, `appliedPromo`, `isValidatingPromo`, `promoError`
  - Getter `discount()` : calcul de la réduction
  - Getter `total()` : soustraction de la réduction
  - Méthodes `applyPromoCode()` et `removePromo()`
  - Envoi du code promo avec la commande

- `src/app/pages/checkout/checkout.component.html`
  - Section `.summary__promo` avec champ de saisie
  - Badge de code appliqué avec détails
  - Ligne de réduction dans les totaux

- `src/app/pages/checkout/checkout.component.scss`
  - Styles `.promo-input` pour le champ et bouton
  - Styles `.promo-applied` pour le badge de confirmation
  - Styles `.summary__row--discount` pour la ligne de réduction

### Backend :
- `src/app/services/orders.service.ts`
  - Paramètre `promoCode` ajouté à `createOrder()`
  - Le code promo est envoyé au backend avec la commande

### Utilisation :

1. Le client accède à la page de checkout
2. Il saisit son code promo (ex: "PROMO20")
3. Il clique sur "Appliquer"
4. Si valide :
   - Badge vert avec le code
   - Réduction affichée
   - Total mis à jour
5. Il peut retirer le code avec le bouton ✕
6. Le code est enregistré avec la commande

## 📋 Backend - Endpoints Code Promo

Les endpoints suivants sont déjà configurés :

- `POST /api/promos/validate` : Valider un code promo
  ```json
  {
    "code": "PROMO20",
    "amount": 50000
  }
  ```
  Retourne :
  ```json
  {
    "id": "uuid",
    "code": "PROMO20",
    "type": "percentage",
    "discount": 20,
    "minOrderAmount": 30000,
    "expiryDate": "2026-12-31"
  }
  ```

- `GET /api/promos/active` : Liste des codes actifs (pour le popup)

## 🧪 Tests Recommandés

### Popup Promo :
1. Se déconnecter
2. Se reconnecter → popup doit apparaître après 300ms
3. Fermer le popup
4. Recharger la page → popup doit réapparaître

### Code Promo au Checkout :
1. Ajouter des articles au panier
2. Aller au checkout
3. Essayer un code invalide → erreur affichée
4. Essayer un code valide (créé dans l'admin)
5. Vérifier que la réduction s'applique
6. Retirer le code → réduction supprimée
7. Réappliquer et valider la commande
8. Vérifier dans l'admin que la commande a le bon montant

### Autorisation Admin :
1. Se connecter avec le compte admin
2. Aller dans Produits → Modifier un produit
3. Si erreur 403 :
   - Vérifier les logs du backend
   - Vérifier le compte admin dans la BDD
   - Recréer le compte avec `node seed-admin.js`
   - Se reconnecter
4. La modification doit fonctionner

## 📝 Notes Importantes

- **Popup Promo** : S'affiche uniquement pour les clients (role='customer')
- **Code Promo** : La validation se fait côté serveur pour éviter les manipulations
- **Admin** : Le token JWT doit contenir le role 'admin' pour modifier les produits
- **Sécurité** : Les codes promo sont validés à chaque utilisation (expiration, montant minimum)

---

**Date des modifications** : 8 février 2026
**Version** : 1.0
