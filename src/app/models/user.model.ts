export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  lastLogin?: string;
  addresses?: any[];
  address?: string;
  city?: string;
  district?: string;
  token?: string;
}
