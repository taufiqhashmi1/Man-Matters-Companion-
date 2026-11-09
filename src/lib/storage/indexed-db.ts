// Browser IndexedDB for storing progress journal photo blobs safely
// Keeps LocalStorage lean and responsive while preserving full-resolution progress photos

const DB_NAME = "mm_companion_photos_db";
const DB_VERSION = 1;
const STORE_NAME = "photos";

function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoBlob(id: string, blob: Blob): Promise<string> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const item = { id, blob, createdAt: new Date().toISOString() };
    const request = store.put(item);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getPhotoBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.blob || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to load photo blob from IndexedDB:", err);
    return null;
  }
}

export async function getPhotoDataUrl(id: string): Promise<string | null> {
  const blob = await getPhotoBlob(id);
  if (!blob) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

export async function deletePhotoBlob(id: string): Promise<void> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to delete photo from IndexedDB:", err);
  }
}

export async function clearAllPhotos(): Promise<void> {
  try {
    const db = await openPhotoDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to clear photos from IndexedDB:", err);
  }
}
