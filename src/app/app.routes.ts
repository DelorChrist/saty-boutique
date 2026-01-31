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

  // 🔹 Page connexion (SANS header / footer)
  {
    path: 'connexion',
    component: ConnexionComponent,
  },

  // 🔹 Wildcard
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
