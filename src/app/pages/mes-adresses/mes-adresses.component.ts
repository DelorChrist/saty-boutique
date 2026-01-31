import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  commune: string;
  city: string;
  isDefault?: boolean;
  isAccountAddress?: boolean;
}

@Component({
  selector: 'app-mes-adresses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mes-adresses.component.html',
  styleUrls: ['./mes-adresses.component.scss'],
})
export class MesAdressesComponent implements OnInit {
  addresses: Address[] = [];
  redirectUrl: string | null = null;

  // formulaire (création / édition)
  newAddress: Address = {
    id: '',
    fullName: '',
    phone: '',
    address: '',
    commune: '',
    city: 'Abidjan',
    isDefault: false,
  };

  editingAddressId: string | null = null;

  communes = [
    'Abobo',
    'Adjamé',
    'Attécoubé',
    'Cocody',
    'Koumassi',
    'Marcory',
    'Plateau',
    'Port-Bouët',
    'Treichville',
    'Yopougon',
    'Bingerville',
    'Songon',
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // récupérer le redirect (/paiement)
    this.route.queryParamMap.subscribe(params => {
      this.redirectUrl = params.get('redirect');
    });

    // charger les adresses sauvegardées (hors adresse de compte)
    const stored = localStorage.getItem('saty_addresses');
    if (stored) {
      try {
        this.addresses = JSON.parse(stored);
      } catch {
        this.addresses = [];
      }
    }

    // construire l'adresse du compte en premier si possible
    const accountAddress = this.buildAccountAddress();
    if (accountAddress) {
      const already = this.addresses.find(a => a.isAccountAddress);
      if (!already) {
        this.addresses = [accountAddress, ...this.addresses];
      } else {
        this.addresses = [
          already,
          ...this.addresses.filter(a => !a.isAccountAddress),
        ];
      }
    }
  }

  private buildAccountAddress(): Address | null {
    const currentUserRaw = localStorage.getItem('saty_current_user');
    if (!currentUserRaw) return null;

    try {
      const user = JSON.parse(currentUserRaw);
      const fullName =
        user.fullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email;
      const phone = user.phone || '';
      const address = user.address || '';
      const commune = user.commune || '';
      const city = user.city || 'Abidjan';

      if (!fullName && !phone && !address) {
        return null;
      }

      const accountAddress: Address = {
        id: 'account-address',
        fullName,
        phone,
        address,
        commune,
        city,
        isDefault: true,
        isAccountAddress: true,
      };

      return accountAddress;
    } catch {
      return null;
    }
  }

  private saveAddresses(): void {
    const toSave = this.addresses.filter(a => !a.isAccountAddress);
    localStorage.setItem('saty_addresses', JSON.stringify(toSave));
  }

  onSelectAddress(address: Address): void {
    localStorage.setItem('saty_selected_address', JSON.stringify(address));

    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  // création / édition

  startEditAddress(address: Address): void {
    if (address.isAccountAddress) {
      alert("Vous ne pouvez pas modifier l'adresse issue de votre compte ici.");
      return;
    }
    this.editingAddressId = address.id;
    this.newAddress = { ...address };
  }

  cancelEdit(): void {
    this.editingAddressId = null;
    this.newAddress = {
      id: '',
      fullName: '',
      phone: '',
      address: '',
      commune: '',
      city: 'Abidjan',
      isDefault: false,
    };
  }

  onSaveAddress(): void {
    if (!this.isNewAddressValid()) {
      alert('Veuillez remplir tous les champs obligatoires pour cette adresse.');
      return;
    }

    if (this.editingAddressId) {
      // édition
      this.addresses = this.addresses.map(a =>
        a.id === this.editingAddressId
          ? { ...a, ...this.newAddress, isAccountAddress: false }
          : a,
      );
    } else {
      // création
      const newAddr: Address = {
        ...this.newAddress,
        id: 'addr_' + Date.now(),
        isAccountAddress: false,
      };
      this.addresses.push(newAddr);
    }

    this.saveAddresses();
    this.cancelEdit();
  }

  private isNewAddressValid(): boolean {
    return !!(
      this.newAddress.fullName.trim() &&
      this.newAddress.phone.trim() &&
      this.newAddress.address.trim() &&
      this.newAddress.commune.trim() &&
      this.newAddress.city.trim()
    );
  }
}
