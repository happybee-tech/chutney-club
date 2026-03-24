export type DailySalad = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  kcal: number;
  proteinG: number;
  price: number;
  trialPrice: number;
  tags: string[];
  prepTimeMinutes: number;
  cutoffTime: string;
  slot: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  frequency: string;
  monthlyPrice: number;
  savingsLabel: string;
  highlights: string[];
};

const CATALOG: DailySalad[] = [
  {
    id: 'sprouts-power-bowl',
    name: 'Sprouts Power Bowl',
    subtitle: 'Moong sprouts, cucumber, carrots, mint-lemon dressing',
    image: '/sprouts-mix.png',
    kcal: 280,
    proteinG: 18,
    price: 189,
    trialPrice: 149,
    tags: ['High Protein', 'Fresh Prep'],
    prepTimeMinutes: 25,
    cutoffTime: '10:30 AM',
    slot: '12:00 PM - 2:00 PM',
  },
  {
    id: 'rainbow-crunch',
    name: 'Rainbow Crunch Salad',
    subtitle: 'Seasonal veggies, seeds, citrus-herb dressing',
    image: '/gut-health.jpg',
    kcal: 320,
    proteinG: 12,
    price: 209,
    trialPrice: 159,
    tags: ['Fibre Rich', 'Gut Friendly'],
    prepTimeMinutes: 30,
    cutoffTime: '11:00 AM',
    slot: '1:00 PM - 3:00 PM',
  },
  {
    id: 'protein-nuts-salad',
    name: 'Protein Nuts Salad',
    subtitle: 'Nuts, sprouts, roasted seeds, masala crunch',
    image: '/nuts-seeds-mix.png',
    kcal: 390,
    proteinG: 22,
    price: 229,
    trialPrice: 179,
    tags: ['Energy Dense', 'Post Workout'],
    prepTimeMinutes: 20,
    cutoffTime: '10:00 AM',
    slot: '12:00 PM - 2:00 PM',
  },
  {
    id: 'daily-green-bowl',
    name: 'Daily Green Bowl',
    subtitle: 'Leafy greens, detox veggies, cold-pressed oil drizzle',
    image: '/smoothie-mix-powder.jpg',
    kcal: 260,
    proteinG: 14,
    price: 179,
    trialPrice: 139,
    tags: ['Detox', 'Low Cal'],
    prepTimeMinutes: 20,
    cutoffTime: '10:30 AM',
    slot: '12:30 PM - 2:30 PM',
  },
];

const DAY_MENUS: Record<number, DailySalad[]> = {
  0: [CATALOG[0], CATALOG[1], CATALOG[3]],
  1: [CATALOG[1], CATALOG[2], CATALOG[0]],
  2: [CATALOG[3], CATALOG[2], CATALOG[1]],
  3: [CATALOG[0], CATALOG[2], CATALOG[3]],
  4: [CATALOG[1], CATALOG[0], CATALOG[2]],
  5: [CATALOG[2], CATALOG[3], CATALOG[1]],
  6: [CATALOG[0], CATALOG[1], CATALOG[2]],
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'weekday-lite',
    name: 'Weekday Lite',
    frequency: '1 salad / weekday',
    monthlyPrice: 2999,
    savingsLabel: 'Save 12%',
    highlights: ['Pause anytime', 'Skip any date', 'One delivery address'],
  },
  {
    id: 'weekday-power',
    name: 'Weekday Power',
    frequency: '2 salads / weekday',
    monthlyPrice: 5499,
    savingsLabel: 'Save 18%',
    highlights: ['Best for couples', 'Priority prep slot', 'Nutrition tracking'],
  },
  {
    id: 'team-pack',
    name: 'Team Pack',
    frequency: '10+ bowls / delivery',
    monthlyPrice: 0,
    savingsLabel: 'Custom quote',
    highlights: ['Office or society', 'Single drop address', 'Brand-specific bulk'],
  },
];

export function getNextSevenDays() {
  const formatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      offset: index,
      date,
      label: index === 0 ? 'Today' : formatter.format(date),
    };
  });
}

export function getMenuForOffset(offset: number) {
  return DAY_MENUS[offset] ?? CATALOG;
}
