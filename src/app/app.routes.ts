import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { HomeComponent } from './pages/home/home.component';
import { CommandesComponent } from './pages/commandes/commandes.component';
import { FavorisComponent } from './pages/favoris/favoris.component';
import { CentreAssistanceComponent } from './pages/centre-assistance/centre-assistance.component';
import { CommentCommanderComponent } from './pages/comment-commander/comment-commander.component';
import { CommentPayerComponent } from './pages/comment-payer/comment-payer.component';
import { BoutiqueCocodyComponent } from './pages/boutique-cocody/boutique-cocody.component';
import { ChatComponent } from './pages/chat/chat.component';
import { PanierComponent } from './pages/panier/panier.component';
import { RechercheComponent } from './pages/recherche/recherche.component';
import { NouveauxProduitsComponent } from './pages/nouveaux-produits/nouveaux-produits.component';
import { DetailsProduitComponent } from './pages/details-produit/details-produit.component';
import { CategorieComponent } from './pages/categorie/categorie.component';
import { ProduitsComponent } from './pages/produits/produits.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { MonCompteComponent } from './pages/mon-compte/mon-compte.component';
import { DetailsCommandeComponent } from './pages/details-commande/details-commande.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { MesAdressesComponent } from './pages/mes-adresses/mes-adresses.component';
import { BonsAchatsComponent } from './pages/bons-achats/bons-achats.component';
import { BoiteReceptionComponent } from './pages/boite-reception/boite-reception.component';
import { AdminLoginComponent } from "./admin/components/admin-login/admin-login.component";

// Admin Imports
import { AdminLayoutComponent } from './admin/layouts/admin-layout.component';
import { AdminDashboardComponent } from './admin/pages/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './admin/pages/product-list/product-list.component';
import { ProductFormComponent } from './admin/pages/product-form/product-form.component';
import { OrderListComponent } from './admin/pages/order-list/order-list.component';
import { CategoryManagementComponent } from './admin/pages/category-management/category-management.component';
import { PromoManagementComponent } from './admin/pages/promo-management/promo-management.component';
import { CustomersComponent } from './admin/pages/customers/customers.component';
import { AdminGuard } from './admin/guards/admin.guard';

export const routes: Routes = [

  // 🔹 Layout principal (avec header + footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'categorie/:slug', component: CategorieComponent },
      { path: 'mon-compte', component: MonCompteComponent },
      { path: 'commandes', component: CommandesComponent },
      { path: 'details-commande/:id', component: DetailsCommandeComponent },
      { path: 'favoris', component: FavorisComponent },
      { path: 'bons-achats', component: BonsAchatsComponent },
      { path: 'boite-reception', component: BoiteReceptionComponent },
      { path: 'mes-adresses', component: MesAdressesComponent },
      { path: 'nouveaux-produits', component: NouveauxProduitsComponent },
      { path: 'details-produit/:id', component: DetailsProduitComponent },
      { path: 'produits', component: ProduitsComponent },
      { path: 'centre-assistance', component: CentreAssistanceComponent },
      { path: 'comment-commander', component: CommentCommanderComponent },
      { path: 'comment-payer', component: CommentPayerComponent },
      { path: 'boutique-cocody', component: BoutiqueCocodyComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'panier', component: PanierComponent },
      { path: 'recherche', component: RechercheComponent },
      { path: 'checkout', component: CheckoutComponent },
    ],
  },

  // 🔹 Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'promos', component: PromoManagementComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'customers', component: CustomersComponent },
    ]
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },

  // 🔹 Page connexion (SANS header / footer)
  {
    path: 'connexion',
    component: ConnexionComponent,
  },

  // 🔹 Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
