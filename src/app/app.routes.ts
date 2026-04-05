import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AdminGuard } from './admin/guards/admin.guard';

export const routes: Routes = [

  // Layout principal (avec header + footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' },
      { path: 'categorie/:slug', loadComponent: () => import('./pages/categorie/categorie.component').then(m => m.CategorieComponent) },
      { path: 'mon-compte', loadComponent: () => import('./pages/mon-compte/mon-compte.component').then(m => m.MonCompteComponent) },
      { path: 'commandes', loadComponent: () => import('./pages/commandes/commandes.component').then(m => m.CommandesComponent) },
      { path: 'details-commande/:id', loadComponent: () => import('./pages/details-commande/details-commande.component').then(m => m.DetailsCommandeComponent) },
      { path: 'favoris', loadComponent: () => import('./pages/favoris/favoris.component').then(m => m.FavorisComponent) },
      { path: 'bons-achats', loadComponent: () => import('./pages/bons-achats/bons-achats.component').then(m => m.BonsAchatsComponent) },
      { path: 'boite-reception', loadComponent: () => import('./pages/boite-reception/boite-reception.component').then(m => m.BoiteReceptionComponent) },
      { path: 'mes-adresses', loadComponent: () => import('./pages/mes-adresses/mes-adresses.component').then(m => m.MesAdressesComponent) },
      { path: 'nouveaux-produits', loadComponent: () => import('./pages/nouveaux-produits/nouveaux-produits.component').then(m => m.NouveauxProduitsComponent) },
      { path: 'details-produit/:id', loadComponent: () => import('./pages/details-produit/details-produit.component').then(m => m.DetailsProduitComponent) },
      { path: 'produits', loadComponent: () => import('./pages/produits/produits.component').then(m => m.ProduitsComponent) },
      { path: 'centre-assistance', loadComponent: () => import('./pages/centre-assistance/centre-assistance.component').then(m => m.CentreAssistanceComponent) },
      { path: 'comment-commander', loadComponent: () => import('./pages/comment-commander/comment-commander.component').then(m => m.CommentCommanderComponent) },
      { path: 'comment-payer', loadComponent: () => import('./pages/comment-payer/comment-payer.component').then(m => m.CommentPayerComponent) },
      { path: 'boutique-cocody', loadComponent: () => import('./pages/boutique-cocody/boutique-cocody.component').then(m => m.BoutiqueCocodyComponent) },
      { path: 'chat', loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'panier', loadComponent: () => import('./pages/panier/panier.component').then(m => m.PanierComponent) },
      { path: 'recherche', loadComponent: () => import('./pages/recherche/recherche.component').then(m => m.RechercheComponent) },
      { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
    ],
  },

  // Admin Routes (lazy loaded)
  {
    path: 'admin',
    loadComponent: () => import('./admin/layouts/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./admin/pages/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'products/new', loadComponent: () => import('./admin/pages/product-form/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/edit/:id', loadComponent: () => import('./admin/pages/product-form/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'categories', loadComponent: () => import('./admin/pages/category-management/category-management.component').then(m => m.CategoryManagementComponent) },
      { path: 'promos', loadComponent: () => import('./admin/pages/promo-management/promo-management.component').then(m => m.PromoManagementComponent) },
      { path: 'orders', loadComponent: () => import('./admin/pages/order-list/order-list.component').then(m => m.OrderListComponent) },
      { path: 'customers', loadComponent: () => import('./admin/pages/customers/customers.component').then(m => m.CustomersComponent) },
    ]
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/components/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },

  // Page connexion (SANS header / footer)
  {
    path: 'connexion',
    loadComponent: () => import('./pages/connexion/connexion.component').then(m => m.ConnexionComponent),
  },

  // Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
