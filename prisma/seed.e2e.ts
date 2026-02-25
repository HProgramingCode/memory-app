/**
 * E2E テスト用シード
 *
 * 既存の先頭ユーザー向けにデッキ・カード・学習記録を削除し、
 * 今日が due のカードを含む固定データを作り直す。
 * 実行前にログイン済みユーザーが 1 人以上いること。
 *
 * 使用 DB: DATABASE_URL 未設定時は prisma/dev.db（アプリ lib/prisma.ts と同じ）
 * 別 DB で試す場合: DATABASE_URL=file:./prisma/test.db npm run seed:e2e
 */
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { writeFileSync } from "fs";
import { resolve } from "path";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

const today = () => new Date().toISOString().split("T")[0];

async function main() {
  console.log("E2E seed: using", connectionString);

  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error(
      "ユーザーが存在しません。先にアプリで Google ログインしてください。"
    );
  }
  const userId = user.id;
  console.log(`User: ${user.name ?? user.email} (${userId})`);

  await prisma.studyRecord.deleteMany({ where: { userId } });
  await prisma.card.deleteMany({ where: { deck: { userId } } });
  await prisma.deck.deleteMany({ where: { userId } });

  const deck1 = await prisma.deck.create({
    data: { userId, name: "E2E用デッキ1" },
  });
  const deck2 = await prisma.deck.create({
    data: { userId, name: "E2E用デッキ2" },
  });

  await prisma.card.createMany({
    data: [
      {
        userId,
        deckId: deck1.id,
        frontText: "E2E カード1 表面",
        backText: "E2E カード1 裏面",
        nextReviewDate: today(),
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck1.id,
        frontText: "E2E カード2 表面",
        backText: "E2E カード2 裏面",
        nextReviewDate: today(),
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck1.id,
        frontText: "E2E カード3 表面",
        backText: "E2E カード3 裏面",
        nextReviewDate: today(),
        intervalDays: 0,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
      {
        userId,
        deckId: deck2.id,
        frontText: "E2E デッキ2 カード",
        backText: "裏",
        nextReviewDate: today(),
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
      },
    ],
  });

  await prisma.studyRecord.upsert({
    where: { userId_date: { userId, date: today() } },
    update: { reviewedCount: 0, freeStudyCount: 0, againCount: 0, hardCount: 0, goodCount: 0 },
    create: {
      userId,
      date: today(),
      reviewedCount: 0,
      freeStudyCount: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
    },
  });

  // シードしたユーザー情報をファイルに出力（デバッグ用）
  const seedInfo = {
    userId,
    userEmail: user.email,
    userName: user.name,
    dbPath: connectionString,
    seedDate: today(),
    decks: [deck1.id, deck2.id],
    cardCount: 4,
  };
  const seedInfoPath = resolve(__dirname, "../tests/.seed-info.json");
  writeFileSync(seedInfoPath, JSON.stringify(seedInfo, null, 2));
  console.log(`E2E seed: info written to ${seedInfoPath}`);

  console.log("E2E seed: finished. 2 decks, 4 cards (all due today).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
