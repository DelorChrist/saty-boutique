export type CategorySlug =
  | 'boubous-hommes'
  | 'boubous-femmes'
  | 'chaussures'
  | 'tuniques'
  | 'chapeaux'
  | 'accessoires';

export interface Product {
  id: string;
  slug: string;           
  name: string;
  description: string;
  priceFcfa: number;
  category: CategorySlug;
  images: string[];
  isFeatured?: boolean;   
  isNew?: boolean;        
}
