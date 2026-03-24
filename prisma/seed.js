const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Upsert brands
  const existingChutney = await prisma.brand.findFirst({ where: { name: 'The Chutney Club' } });
  const chutney = existingChutney
    ? await prisma.brand.update({
        where: { id: existingChutney.id },
        data: {
          description: 'Artisan chutneys and fresh salad blends',
          minBulkQty: 10,
          minBulkValue: '1000',
          bulkEnabled: true,
          bulkPricing: {
            slabs: [
              { min: 10, max: 19, discountPct: 5 },
              { min: 20, max: 49, discountPct: 10 },
              { min: 50, discountPct: 15 },
            ],
          },
          isActive: true,
        },
      })
    : await prisma.brand.create({
        data: {
          name: 'The Chutney Club',
          description: 'Artisan chutneys and fresh salad blends',
          minBulkQty: 10,
          minBulkValue: '1000',
          bulkEnabled: true,
          bulkPricing: {
            slabs: [
              { min: 10, max: 19, discountPct: 5 },
              { min: 20, max: 49, discountPct: 10 },
              { min: 50, discountPct: 15 },
            ],
          },
          isActive: true,
        },
      });

  const existingUrthwise = await prisma.brand.findFirst({ where: { name: 'Urthwise' } });
  const urthwise = existingUrthwise
    ? await prisma.brand.update({
        where: { id: existingUrthwise.id },
        data: {
          description: 'Wood-pressed oils and wholesome nut mixes',
          minBulkQty: 10,
          minBulkValue: '1500',
          bulkEnabled: true,
          bulkPricing: {
            slabs: [
              { min: 10, max: 19, discountPct: 4 },
              { min: 20, max: 49, discountPct: 8 },
              { min: 50, discountPct: 12 },
            ],
          },
          isActive: true,
        },
      })
    : await prisma.brand.create({
        data: {
          name: 'Urthwise',
          description: 'Wood-pressed oils and wholesome nut mixes',
          minBulkQty: 10,
          minBulkValue: '1500',
          bulkEnabled: true,
          bulkPricing: {
            slabs: [
              { min: 10, max: 19, discountPct: 4 },
              { min: 20, max: 49, discountPct: 8 },
              { min: 50, discountPct: 12 },
            ],
          },
          isActive: true,
        },
      });

  // Clear existing products for these brands to keep seed idempotent
  await prisma.product.deleteMany({
    where: { brandId: { in: [chutney.id, urthwise.id] } },
  });

  // Brand-scoped categories
  const categories = [
    { brandId: chutney.id, name: 'Salads', slug: 'salads', description: 'Fresh and healthy salad bowls' },
    { brandId: chutney.id, name: 'Sprouts', slug: 'sprouts', description: 'Sprouted grains and mixes' },
    { brandId: urthwise.id, name: 'Nuts', slug: 'nuts', description: 'Roasted and flavored nuts' },
    { brandId: urthwise.id, name: 'Oils', slug: 'oils', description: 'Woodpressed and cold-pressed oils' },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { brandId: cat.brandId, slug: cat.slug } });
    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { name: cat.name, description: cat.description, isActive: true },
      });
    } else {
      await prisma.category.create({ data: cat });
    }
  }

  const saladsCategory = await prisma.category.findFirst({ where: { brandId: chutney.id, slug: 'salads' } });
  const sproutsCategory = await prisma.category.findFirst({ where: { brandId: chutney.id, slug: 'sprouts' } });
  const nutsCategory = await prisma.category.findFirst({ where: { brandId: urthwise.id, slug: 'nuts' } });
  const oilsCategory = await prisma.category.findFirst({ where: { brandId: urthwise.id, slug: 'oils' } });

  // Brand: The Chutney Club - Sprouts Salad (perishable)
  const sproutsSalad = await prisma.product.create({
    data: {
      brandId: chutney.id,
      name: 'Sprouts Salad',
      description: 'Fresh sprouts with seasonal veggies and herbs',
      isPerishable: true,
      categories: {
        create: [
          { categoryId: saladsCategory.id },
          { categoryId: sproutsCategory.id },
        ],
      },
      variants: {
        create: [
          { name: '250g Bowl', price: '180', sku: 'TCC-SS-250' },
          { name: '500g Bowl', price: '320', sku: 'TCC-SS-500' },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/600x400?text=Sprouts+Salad', sortOrder: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  // Brand: Urthwise - Nuts Masala Mix (non-perishable)
  const nutsMasala = await prisma.product.create({
    data: {
      brandId: urthwise.id,
      name: 'Nuts Masala Mix',
      description: 'Roasted nuts with bold Indian masala spices',
      isPerishable: false,
      categories: {
        create: [{ categoryId: nutsCategory.id }],
      },
      variants: {
        create: [
          { name: '200g Pack', price: '240', sku: 'UR-NMM-200' },
          { name: '500g Pack', price: '520', sku: 'UR-NMM-500' },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/600x400?text=Nuts+Masala+Mix', sortOrder: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  // Brand: Urthwise - Woodpressed Oils (non-perishable)
  const woodpressedOil = await prisma.product.create({
    data: {
      brandId: urthwise.id,
      name: 'Woodpressed Oils',
      description: 'Cold extraction for pure, aromatic oils',
      isPerishable: false,
      categories: {
        create: [{ categoryId: oilsCategory.id }],
      },
      variants: {
        create: [
          { name: 'Sesame Oil 500ml', price: '360', sku: 'UR-WPO-SES-500' },
          { name: 'Groundnut Oil 1L', price: '650', sku: 'UR-WPO-GN-1L' },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/600x400?text=Woodpressed+Oils', sortOrder: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  // Inventory for variants
  const allVariants = [
    ...sproutsSalad.variants,
    ...nutsMasala.variants,
    ...woodpressedOil.variants,
  ];

  for (const variant of allVariants) {
    const brandId = [sproutsSalad, nutsMasala, woodpressedOil]
      .find((p) => p.variants.some((v) => v.id === variant.id)).brandId;

    await prisma.inventoryItem.create({
      data: {
        variantId: variant.id,
        brandId,
        quantityAvailable: 50,
        quantityReserved: 0,
      },
    });
  }

  // Delivery slots (next 7 days, 2 slots/day)
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);

  await prisma.deliverySlot.deleteMany({
    where: {
      slotDate: {
        gte: new Date(now.toDateString()),
        lt: new Date(end.toDateString()),
      },
    },
  });

  const slots = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const morningStart = new Date(day);
    morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(day);
    morningEnd.setHours(11, 0, 0, 0);
    const eveningStart = new Date(day);
    eveningStart.setHours(17, 0, 0, 0);
    const eveningEnd = new Date(day);
    eveningEnd.setHours(19, 0, 0, 0);

    const cutoffMorning = new Date(day);
    cutoffMorning.setHours(7, 0, 0, 0);
    const cutoffEvening = new Date(day);
    cutoffEvening.setHours(15, 0, 0, 0);

    slots.push({
      slotDate: new Date(day.toDateString()),
      startTime: morningStart,
      endTime: morningEnd,
      category: 'both',
      cutoffTime: cutoffMorning,
      capacity: 50,
    });
    slots.push({
      slotDate: new Date(day.toDateString()),
      startTime: eveningStart,
      endTime: eveningEnd,
      category: 'both',
      cutoffTime: cutoffEvening,
      capacity: 50,
    });
  }

  for (const slot of slots) {
    await prisma.deliverySlot.create({ data: slot });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
