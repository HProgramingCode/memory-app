import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  // 1. ユーザーの取得または作成
  // 既存のユーザーがいればそれを使う（Googleログイン済みのユーザーを想定）
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log("No user found. Creating dummy user...");
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        image: "https://avatars.githubusercontent.com/u/12345678?v=4",
      },
    });
  }

  if (!user) throw new Error("User could not be determined");
  const userId = user.id;
  console.log(`Using user: ${user.name} (${userId})`);

  // 既存データのクリア (Option: コメントアウトすれば追記になるが、重複エラー避けるため一旦消すか、そのまま追加するか)
  // 今回は追加のみとするが、Deck名が重複する可能性あり。
  // まっさらにしたい場合は deleteMany を使う。
  // await prisma.studyRecord.deleteMany({ where: { userId } });
  // await prisma.card.deleteMany({ where: { deck: { userId } } });
  // await prisma.deck.deleteMany({ where: { userId } });

  // 2. デッキの作成
  const deck1 = await prisma.deck.create({
    data: {
      userId,
      name: "基本英単語",
    },
  });

  const deck2 = await prisma.deck.create({
    data: {
      userId,
      name: "IT用語",
    },
  });

  // 3. カードの作成 (基本英単語)
  await prisma.card.createMany({
    data: [
      {
        userId,
        deckId: deck1.id,
        frontText: "Apple",
        backText: "りんご",
        nextReviewDate: new Date().toISOString().split("T")[0], // 今日
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck1.id,
        frontText: "Dog",
        backText: "犬",
        nextReviewDate: new Date().toISOString().split("T")[0],
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck1.id,
        frontText: "Cat",
        backText: "猫",
        nextReviewDate: new Date().toISOString().split("T")[0],
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck1.id,
        frontText: "Book",
        backText: "本",
        nextReviewDate: "2023-01-01", // 過去（要復習）
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
    ],
  });

  // 3. カードの作成 (IT用語)
  await prisma.card.createMany({
    data: [
      {
        userId,
        deckId: deck2.id,
        frontText: "API",
        backText: "Application Programming Interface",
        nextReviewDate: new Date().toISOString().split("T")[0],
      },
      {
        userId,
        deckId: deck2.id,
        frontText: "HTTP",
        backText: "HyperText Transfer Protocol",
        nextReviewDate: new Date().toISOString().split("T")[0],
      },
      {
        userId,
        deckId: deck2.id,
        frontText: "JSON",
        backText: "JavaScript Object Notation",
        nextReviewDate: new Date().toISOString().split("T")[0],
      },
    ],
  });

  // 4. 学習記録の作成 (直近1週間のデータ)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // ランダムな学習回数
    const reviewedCount = Math.floor(Math.random() * 10);
    const freeStudyCount = Math.floor(Math.random() * 5);

    if (reviewedCount + freeStudyCount > 0) {
      await prisma.studyRecord.upsert({
        where: {
          userId_date: {
            userId,
            date: dateStr,
          },
        },
        update: {
          reviewedCount,
          freeStudyCount,
          againCount: Math.floor(reviewedCount * 0.1),
          hardCount: Math.floor(reviewedCount * 0.2),
          goodCount: Math.floor(reviewedCount * 0.7),
        },
        create: {
          userId,
          date: dateStr,
          reviewedCount,
          freeStudyCount,
          againCount: Math.floor(reviewedCount * 0.1),
          hardCount: Math.floor(reviewedCount * 0.2),
          goodCount: Math.floor(reviewedCount * 0.7),
        },
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
