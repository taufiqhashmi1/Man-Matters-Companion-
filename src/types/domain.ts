export type ProductCategory = "hair" | "skin" | "nutrition" | "wellness" | "other";

export type ProductStatus = "active" | "paused" | "completed";

export type TimeOfDay = "morning" | "evening" | "custom";

export type RoutineFrequency = "daily" | "selected-days" | "as-entered";

export interface UserProfile {
  id: string;
  displayName: string;
  preferences: {
    preferredReminderPeriod?: "morning" | "evening";
  };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  status: ProductStatus;
  startDate?: string;
  instructionText?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  isActive: boolean;
}

export interface RoutineItem {
  id: string;
  routineId: string;
  productId?: string;
  title: string;
  instruction?: string;
  frequency: RoutineFrequency;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  sortOrder: number;
  isActive: boolean;
}

export interface RoutineLog {
  id: string;
  routineItemId: string;
  localDate: string; // YYYY-MM-DD
  completedAt?: string; // ISO string
  status: "completed" | "skipped";
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: ProductCategory | string;
  observation: string;
  tags: string[];
  photoIds: string[];
  createdAt: string;
}

export interface JournalPhoto {
  id: string;
  indexedDbKey: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: ProductCategory | string;
  content: string;
  sourceName: string;
  sourceUrl?: string;
  reviewedAt: string;
  status: "verified" | "draft";
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: string;
  relatedSourceIds?: string[];
  isFallback?: boolean;
}

export interface AppMeta {
  schemaVersion: number;
  seededAt: string;
  lastUpdatedAt: string;
}

export interface AppStateData {
  meta: AppMeta;
  profile: UserProfile;
  products: Product[];
  routines: Routine[];
  routineItems: RoutineItem[];
  routineLogs: RoutineLog[];
  journalEntries: JournalEntry[];
  journalPhotos: JournalPhoto[];
  chatMessages: ChatMessage[];
}
