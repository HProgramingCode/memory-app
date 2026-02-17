# テストフィクスチャ

テスト実装時に使用するダミーデータの定義。

## ファイル一覧

| ファイル | 内容 |
|----------|------|
| `card.ts` | カードのフィクスチャ（初回・復習済み・定着済み・easeFactor 下限付近・明日 due） |
| `deck.ts` | デッキのフィクスチャ（基本・空） |
| `study-record.ts` | 学習記録のフィクスチャ（空・復習済み・自由学習含む） |

## 使い方

### ユニットテスト（Vitest/Jest）

```typescript
import { baseCard, createCard } from "@testcase/fixtures/card";

describe("calculateNextReview", () => {
  it("again で intervalDays が 1 になる", () => {
    const card = createCard({ intervalDays: 0, easeFactor: 2.5 });
    const result = calculateNextReview(card, "again");
    expect(result.intervalDays).toBe(1);
  });
});
```

### E2E テスト（Playwright）

E2E では API 経由でデータを作成するか、シードデータを使用する。  
フィクスチャの値を参照して期待値を検証する場合に使用。

```typescript
import { baseCard } from "@testcase/fixtures/card";

test("カード作成後に一覧に表示される", async ({ page }) => {
  // ... カード作成操作 ...
  await expect(page.getByText(baseCard.frontText)).toBeVisible();
});
```

## 日付の扱い

フィクスチャ内の日付は `2026-02-18` で固定されている。  
テスト実行時は `vi.useFakeTimers()` や `jest.useFakeTimers()` で日付を固定することを推奨。

```typescript
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-02-18T00:00:00.000Z") });
});

afterEach(() => {
  vi.useRealTimers();
});
```
