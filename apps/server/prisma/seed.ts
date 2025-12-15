import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'host@example.com';
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create or get host user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  // Remove existing sample quiz (because title is NOT unique)
  await prisma.quiz.deleteMany({
    where: {
      ownerId: user.id,
      title: 'Sample Vibe Quiz',
    },
  });

  // Create sample quiz
  const quiz = await prisma.quiz.create({
    data: {
      ownerId: user.id,
      title: 'Sample Vibe Quiz',
      description: 'Seeded quiz with five questions',
      isPublished: true,
      questions: {
        create: Array.from({ length: 5 }).map((_, idx) => ({
          text: `Question ${idx + 1}?`,
          durationSec: 20,
          order: idx,
          choices: {
            create: [
              { text: 'A', isCorrect: idx % 2 === 0 },
              { text: 'B', isCorrect: idx % 2 !== 0 },
              { text: 'C', isCorrect: false },
              { text: 'D', isCorrect: false },
            ],
          },
        })),
      },
    },
  });

  console.log(`Seed complete. User: ${email}, Quiz: ${quiz.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
