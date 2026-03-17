import type { ExportData, DeckExportData, Deck, Card } from "@/types";
import { getAllImages, clearAllImages, saveImage } from "@/lib/imageDb";

/**
 * 全データをJSON形式でエクスポートする
 * サーバーからDB上のデータを取得し、クライアント側の画像データと統合する
 */
export async function exportAllData(): Promise<string> {
  // サーバーからデッキ・カード・学習記録を取得
  const res = await fetch("/api/export");
  if (!res.ok) throw new Error("Failed to export data from server");
  const serverData = await res.json();

  // IndexedDB から全画像を取得し、Base64に変換
  const images = await getAllImages();
  const imageData: ExportData["images"] = [];

  for (const img of images) {
    const arrayBuffer = await img.blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    imageData.push({ id: img.id, data: base64, type: img.type });
  }

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    decks: serverData.decks,
    cards: serverData.cards,
    studyRecords: serverData.studyRecords,
    images: imageData,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 特定デッキのみをJSON形式でエクスポートする
 * サーバーから対象デッキとカードを取得し、クライアント側の画像データと統合する
 */
export async function exportDeckData(deckId: string): Promise<string> {
  const res = await fetch(`/api/decks/${deckId}/export`);
  if (!res.ok) throw new Error("Failed to export deck from server");
  const serverData: { deck: Deck; cards: Card[] } = await res.json();

  const images = await getAllImages();
  const imageData: DeckExportData["images"] = [];
  const imageIdSet = new Set<string>();

  const relevantImageIds = new Set(
    serverData.cards
      .flatMap((c) => [c.frontImageId, c.backImageId])
      .filter((id): id is string => !!id)
  );

  for (const img of images) {
    if (!relevantImageIds.has(img.id)) continue;
    if (imageIdSet.has(img.id)) continue;
    const arrayBuffer = await img.blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    imageIdSet.add(img.id);
    imageData.push({ id: img.id, data: base64, type: img.type });
  }

  const exportData: DeckExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    deck: serverData.deck,
    cards: serverData.cards,
    images: imageData,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * JSONファイルをダウンロードする
 */
export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * JSONファイルからデータをインポートする
 * サーバーのDBデータを完全置換し、画像をIndexedDBに復元する
 */
export async function importAllData(json: string): Promise<{
  decks: ExportData["decks"];
  cards: ExportData["cards"];
  studyRecords: ExportData["studyRecords"];
}> {
  const data: ExportData = JSON.parse(json);

  if (data.version !== 1) {
    throw new Error("サポートされていないデータバージョンです");
  }

  // サーバーにインポートデータを送信（DBデータの置換）
  const res = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      decks: data.decks,
      cards: data.cards,
      studyRecords: data.studyRecords,
    }),
  });
  if (!res.ok) throw new Error("Failed to import data to server");

  // 画像をIndexedDBに復元
  await clearAllImages();
  for (const img of data.images) {
    const binary = atob(img.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: img.type });
    await saveImage(img.id, blob);
  }

  return {
    decks: data.decks,
    cards: data.cards,
    studyRecords: data.studyRecords,
  };
}

/**
 * デッキ単位でJSONからデータをインポートする
 * サーバー側で対象デッキのカードを置換し、画像をIndexedDBに復元する
 */
export async function importDeckData(
  deckId: string,
  json: string
): Promise<{
  deckId: string;
}> {
  const data: DeckExportData = JSON.parse(json);

  if (data.version !== 1) {
    throw new Error("サポートされていないデータバージョンです");
  }

  const res = await fetch(`/api/decks/${deckId}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cards: data.cards,
    }),
  });
  if (!res.ok) throw new Error("Failed to import deck to server");

  for (const img of data.images) {
    const binary = atob(img.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: img.type });
    await saveImage(img.id, blob);
  }

  return { deckId };
}
