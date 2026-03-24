const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.findFirst();
  if (!brand) {
    console.log('No brand found! Cannot create survey.');
    return;
  }

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  // Check if survey already exists
  const existing = await prisma.survey.findFirst({ where: { name: 'Initial Survey Demo' } });
  if (existing) {
    console.log('Survey already exists!');
    return;
  }

  const survey = await prisma.survey.create({
    data: {
      brandId: brand.id,
      name: 'Initial Survey Demo',
      linkTitle: 'Rate Your Recent Order 🥗',
      description: 'Your feedback helps us tailor our salads directly to your taste!',
      isActive: true,
      startDate: now,
      endDate: nextMonth,
      questions: {
        create: [
          { question: 'How would you rate the freshness of our daily salads?', sortOrder: 0 },
          { question: 'How easy was it to navigate our website and place an order?', sortOrder: 1 },
          { question: 'How satisfied are you with our delivery timings and reliability?', sortOrder: 2 },
          { question: 'Overall, how likely are you to recommend Happybee to a friend?', sortOrder: 3 },
        ]
      }
    }
  });

  console.log('Successfully seeded demo survey:', survey.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
