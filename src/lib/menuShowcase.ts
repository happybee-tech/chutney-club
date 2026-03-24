export type MenuShowcaseItem = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  tags: string[];
  calories: number;
  price: number;
  comingSoon?: boolean;
  lookupNames?: string[];
};

export const MENU_SHOWCASE_ITEMS: MenuShowcaseItem[] = [
  {
    id: 'sprouts-salad',
    name: 'Sprouts Salad',
    subtitle: 'Fresh sprouts with seasonal veggies and herbs.',
    image: '/sprouts-mix.png',
    tags: ['High Protein', 'Perishable', 'Fresh Daily'],
    calories: 220,
    price: 180,
    lookupNames: ['sprouts salad'],
  },
  {
    id: 'veggie-salad',
    name: 'Veggie Salad',
    subtitle: 'Crunchy greens, colorful veggies, and house dressing.',
    image: '/hero-image-2.png',
    tags: ['High Fibre', 'Detox', 'Lunch Friendly'],
    calories: 190,
    price: 170,
    lookupNames: ['veggie salad', 'veg salad', 'vegetable salad', 'veggie bowl', 'veggie salad bowl'],
  },
  {
    id: 'paneer-power-bowl',
    name: 'Paneer Power Bowl',
    subtitle: 'Coming soon',
    image: '/banner-1.jpg',
    tags: ['Protein', 'Indianized'],
    calories: 340,
    price: 249,
    comingSoon: true,
  },
  {
    id: 'mediterranean-bowl',
    name: 'Mediterranean Bowl',
    subtitle: 'Coming soon',
    image: '/banner-2.jpg',
    tags: ['Gut Friendly', 'Balanced'],
    calories: 290,
    price: 239,
    comingSoon: true,
  },
  {
    id: 'detox-crunch-bowl',
    name: 'Detox Crunch Bowl',
    subtitle: 'Coming soon',
    image: '/banner-3.jpg',
    tags: ['Low Calorie', 'Hydrating'],
    calories: 170,
    price: 199,
    comingSoon: true,
  },
  {
    id: 'rainbow-nutri-bowl',
    name: 'Rainbow Nutri Bowl',
    subtitle: 'Coming soon',
    image: '/hero-background.jpg',
    tags: ['Micronutrient Rich', 'Fiber Packed'],
    calories: 260,
    price: 229,
    comingSoon: true,
  },
];
