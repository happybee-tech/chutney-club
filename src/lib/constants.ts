// Happybee Brand Colors
export const COLORS = {
  primaryYellow: '#F7B933',
  primaryOrange: '#5B821F',
  mainBackground: '#FFF4E9',
  cardBackground: '#FFFFFF',
  headingPurple: '#4B2E83',
  bodyText: '#2E2E2E',
  accentGreen: '#7BAE8E',
} as const;

// Brand Data
export const BRANDS = [
  {
    id: 'the-chutney-club',
    name: 'The Chutney Club',
    tagline: 'Artisan chutneys & spreads',
    category: 'Condiments',
    description: 'Handmade, fermented chutneys from fresh ingredients',
    color: '#E8D5B7',
  },
  {
    id: 'urthwise',
    name: 'Urthwise',
    tagline: 'Cold-pressed oils & seeds',
    category: 'Oils & Seeds',
    description: 'Organic, cold-pressed oils and premium seed mixes',
    color: '#D4E4D4',
  },
  {
    id: 'leafy-greens',
    name: 'Leafy Greens',
    tagline: 'Fresh salad mixes',
    category: 'Salads',
    description: 'Farm-fresh, locally sourced salad boxes',
    color: '#C8E6C9',
  },
  {
    id: 'sprout-power',
    name: 'Sprout Power',
    tagline: 'Sprouted grains & legumes',
    category: 'Sprouts',
    description: 'Nutrient-dense sprouted snacks',
    color: '#F0E68C',
  },
  {
    id: 'nutty-bites',
    name: 'Nutty Bites',
    tagline: 'Premium nut mixes',
    category: 'Nuts & Mixes',
    description: 'Carefully curated, roasted nut blends',
    color: '#D2B48C',
  },
  {
    id: 'whole-grain-co',
    name: 'Whole Grain Co',
    tagline: 'Ancient grain flours',
    category: 'Flours',
    description: 'Stone-ground, organic flours',
    color: '#F5DEB3',
  },
] as const;

export const FEATURED_ITEMS = [
  {
    id: 'item-1',
    name: 'Kale & Quinoa Salad',
    brand: 'Leafy Greens',
    calories: 280,
    ingredients: 'Kale, Quinoa, Tahini, Lemon, Olive Oil',
    image: '🥗',
  },
  {
    id: 'item-2',
    name: 'Mixed Nut Clusters',
    brand: 'Nutty Bites',
    calories: 180,
    ingredients: 'Almonds, Cashews, Walnuts, Honey',
    image: '🥜',
  },
  {
    id: 'item-3',
    name: 'Ginger Turmeric Oil',
    brand: 'Urthwise',
    calories: 120,
    ingredients: 'Cold-Pressed Sesame Oil, Ginger, Turmeric',
    image: '🫒',
  },
  {
    id: 'item-4',
    name: 'Mango Habanero Chutney',
    brand: 'The Chutney Club',
    calories: 45,
    ingredients: 'Mango, Habanero, Mustard Seeds, Salt',
    image: '🥘',
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: 'Select a brand',
    description: 'Browse trusted health-focused brands',
    icon: '🎯',
  },
  {
    number: 2,
    title: 'Choose items',
    description: 'Pick items from their curated menu',
    icon: '✏️',
  },
  {
    number: 3,
    title: 'Preorder by cutoff',
    description: 'Order before Friday 6 PM or Saturday 6 PM',
    icon: '⏰',
  },
  {
    number: 4,
    title: 'Receive delivery',
    description: 'Get fresh items on weekend at community drop-off',
    icon: '📦',
  },
] as const;

export const PREORDER_RULES = [
  {
    day: 'Saturday Delivery',
    cutoff: 'Order by Friday 6 PM',
    icon: '📅',
  },
  {
    day: 'Sunday Delivery',
    cutoff: 'Order by Saturday 6 PM',
    icon: '📅',
  },
] as const;

export const COMMUNITY_VALUES = [
  {
    title: 'Fresh Preparation',
    description: 'Items are prepared fresh just before delivery',
    icon: '✨',
  },
  {
    title: 'Reduced Food Waste',
    description: 'Preorder model minimizes overstock and waste',
    icon: '♻️',
  },
  {
    title: 'Community First',
    description: 'Shared drop-offs build healthier neighborhoods',
    icon: '👥',
  },
  {
    title: 'Healthier Together',
    description: 'Join a community committed to wellness',
    icon: '💚',
  },
] as const;
