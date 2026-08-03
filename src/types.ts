export type DayOfWeek = 'all' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 'cn';

export type DishCategory = 
  | 'daily_main' 
  | 'ready_made' 
  | 'sticky_rice_bread' 
  | 'cereal_cake';

export interface DishItem {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  category: DishCategory;
  availableDays: DayOfWeek[]; // ['all'] means available every day of the week
  image: string;
  isAvailableToday: boolean;
  soldOutNote?: string; // e.g. "Hết sớm lúc 10:30" or "Tạm hết trong ngày"
  tags: string[];
  prepTime: string;
  isFeatured?: boolean;
}

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  contactPerson: string;
  openHours: string;
  slogan: string;
  badgeText?: string;
  notice?: string;
  zaloUrl?: string;
  features: string[];
}

export interface DayConfig {
  id: DayOfWeek;
  label: string;
  shortLabel: string;
  description: string;
}

export interface CategoryConfig {
  id: DishCategory | 'all_categories';
  label: string;
  iconName: string;
  colorClass: string;
}
