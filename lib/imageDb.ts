import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "memory-app-images";
const STORE_NAME = "images";
const DB_VERSION = 1;

/**
 * IndexedDB を使った画像ストレージ
 * 画像は Blob 形式で保存する
 */

interface ImageRecord {
  id: string;
  blob: Blob;
  type: string;
}

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

/** 画像を保存する */
export async function saveImage(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  const record: ImageRecord = { id, blob, type: blob.type };
  await db.put(STORE_NAME, record);
}

/** 画像を取得する (Blob URL を返す) */
export async function getImageUrl(id: string): Promise<string | null> {
  const db = await getDb();
  const record: ImageRecord | undefined = await db.get(STORE_NAME, id);
  if (!record) return null;
  return URL.createObjectURL(record.blob);
}

/** 画像の Blob を取得する */
export async function getImageBlob(id: string): Promise<Blob | null> {
  const db = await getDb();
  const record: ImageRecord | undefined = await db.get(STORE_NAME, id);
  return record?.blob ?? null;
}

/** 画像を削除する */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/** 全画像を取得する (エクスポート用) */
export async function getAllImages(): Promise<
  { id: string; blob: Blob; type: string }[]
> {
  const db = await getDb();
  const records: ImageRecord[] = await db.getAll(STORE_NAME);
  return records.map((r) => ({ id: r.id, blob: r.blob, type: r.type }));
}

/** 全画像を削除する (インポート時のリセット用) */
export async function clearAllImages(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
