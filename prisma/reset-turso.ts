/**
 * Turso データ削除スクリプト
 *
 * 使い方:
 *   npx tsx prisma/reset-turso.ts
 *
 * 前提:
 *   - .env に TURSO_DATABASE_URL と TURSO_AUTH_TOKEN が設定されていること
 *
 * 注意:
 *   - 全データが削除されます（テーブル構造は残ります）
 */

import { prisma } from "../lib/prisma";

async function main() {
  console.log("Turso データ削除を開始...");

  // 接続先の確認
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (!tursoUrl) {
    console.error("Error: TURSO_DATABASE_URL が設定されていません。");
    process.exit(1);
  }
  console.log(`接続先: ${tursoUrl}`);

  // 確認プロンプト（CI環境では FORCE=1 でスキップ可能）
  if (process.env.FORCE !== "1") {
    console.log("\n⚠️  警告: 全データが削除されます。");
    console.log("続行するには Ctrl+C で中断するか、3秒待ってください...\n");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // 外部キー制約の順序を考慮して削除
  // 子テーブル → 親テーブル の順で削除

  console.log("Deleting StudyRecord...");
  const studyRecords = await prisma.studyRecord.deleteMany();
  console.log(`  Deleted ${studyRecords.count} records`);

  console.log("Deleting Card...");
  const cards = await prisma.card.deleteMany();
  console.log(`  Deleted ${cards.count} records`);

  console.log("Deleting Deck...");
  const decks = await prisma.deck.deleteMany();
  console.log(`  Deleted ${decks.count} records`);

  console.log("Deleting Session...");
  const sessions = await prisma.session.deleteMany();
  console.log(`  Deleted ${sessions.count} records`);

  console.log("Deleting Account...");
  const accounts = await prisma.account.deleteMany();
  console.log(`  Deleted ${accounts.count} records`);

  console.log("Deleting VerificationToken...");
  const tokens = await prisma.verificationToken.deleteMany();
  console.log(`  Deleted ${tokens.count} records`);

  console.log("Deleting User...");
  const users = await prisma.user.deleteMany();
  console.log(`  Deleted ${users.count} records`);

  console.log("\n✅ Turso データ削除完了!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
