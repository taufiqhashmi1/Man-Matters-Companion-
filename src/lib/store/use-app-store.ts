import { create } from "zustand";
import {
  AppStateData,
  ChatMessage,
  JournalEntry,
  JournalPhoto,
  Product,
  RoutineItem,
  RoutineLog,
  UserProfile,
} from "@/types/domain";
import { generateSeedData } from "@/lib/storage/seed";
import { clearAllPhotos, deletePhotoBlob } from "@/lib/storage/indexed-db";
import { getTodayDateString } from "@/lib/dates";

const STORAGE_KEY = "mm-companion:v1:state";

interface AppStateStore extends AppStateData {
  isHydrated: boolean;
  hydrate: () => void;

  // Profile actions
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Product actions
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductStatus: (id: string) => void;
  deleteProduct: (id: string) => void;

  // Routine actions
  addRoutineItem: (item: Omit<RoutineItem, "id" | "sortOrder">) => RoutineItem;
  updateRoutineItem: (id: string, updates: Partial<RoutineItem>) => void;
  toggleRoutineItemActive: (id: string) => void;
  deleteRoutineItem: (id: string) => void;
  reorderRoutineItems: (routineId: string, orderedIds: string[]) => void;

  // Routine Log actions
  toggleCompleteItem: (routineItemId: string, dateStr?: string) => void;
  isItemCompletedOnDate: (routineItemId: string, dateStr?: string) => boolean;

  // Journal actions
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => JournalEntry;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  addJournalPhoto: (photo: JournalPhoto) => void;

  // AI Chat actions
  addChatMessage: (msg: Omit<ChatMessage, "id" | "createdAt">) => ChatMessage;
  clearChatMessages: () => void;

  // Global system actions
  resetDemoData: () => void;
  clearAllData: () => Promise<void>;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => { success: boolean; error?: string };
}

function persistState(state: AppStateData) {
  if (typeof window === "undefined") return;
  try {
    const dataToStore: AppStateData = {
      meta: {
        ...state.meta,
        lastUpdatedAt: new Date().toISOString(),
      },
      profile: state.profile,
      products: state.products,
      routines: state.routines,
      routineItems: state.routineItems,
      routineLogs: state.routineLogs,
      journalEntries: state.journalEntries,
      journalPhotos: state.journalPhotos,
      chatMessages: state.chatMessages,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (err) {
    console.error("Failed to persist state to LocalStorage:", err);
  }
}

export const useAppStore = create<AppStateStore>((set, get) => ({
  ...generateSeedData(),
  isHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.meta?.schemaVersion === 1 && parsed?.profile) {
          set({
            ...parsed,
            isHydrated: true,
          });
          return;
        }
      }

      // First time initialization: seed data
      const seed = generateSeedData();
      persistState(seed);
      set({
        ...seed,
        isHydrated: true,
      });
    } catch (err) {
      console.warn("Recovering from corrupted local storage. Re-seeding demo state.", err);
      const seed = generateSeedData();
      persistState(seed);
      set({
        ...seed,
        isHydrated: true,
      });
    }
  },

  updateProfile: (updates) => {
    set((state) => {
      const nextProfile = { ...state.profile, ...updates };
      const next = { ...state, profile: nextProfile };
      persistState(next);
      return { profile: nextProfile };
    });
  },

  addProduct: (productData) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const nextProducts = [newProduct, ...state.products];
      const next = { ...state, products: nextProducts };
      persistState(next);
      return { products: nextProducts };
    });

    return newProduct;
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const nextProducts = state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      const next = { ...state, products: nextProducts };
      persistState(next);
      return { products: nextProducts };
    });
  },

  toggleProductStatus: (id) => {
    set((state) => {
      const nextProducts = state.products.map((p) => {
        if (p.id !== id) return p;
        const newStatus = p.status === "active" ? "paused" : "active";
        return { ...p, status: newStatus as any, updatedAt: new Date().toISOString() };
      });
      const next = { ...state, products: nextProducts };
      persistState(next);
      return { products: nextProducts };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const nextProducts = state.products.filter((p) => p.id !== id);
      // Detach productId from routine items instead of erasing routines or journal
      const nextRoutineItems = state.routineItems.map((item) =>
        item.productId === id ? { ...item, productId: undefined } : item
      );
      const next = {
        ...state,
        products: nextProducts,
        routineItems: nextRoutineItems,
      };
      persistState(next);
      return {
        products: nextProducts,
        routineItems: nextRoutineItems,
      };
    });
  },

  addRoutineItem: (itemData) => {
    const state = get();
    const itemsInRoutine = state.routineItems.filter((i) => i.routineId === itemData.routineId);
    const maxOrder = itemsInRoutine.reduce((max, i) => Math.max(max, i.sortOrder), 0);

    const newItem: RoutineItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sortOrder: maxOrder + 1,
    };

    set((curr) => {
      const nextItems = [...curr.routineItems, newItem];
      const next = { ...curr, routineItems: nextItems };
      persistState(next);
      return { routineItems: nextItems };
    });

    return newItem;
  },

  updateRoutineItem: (id, updates) => {
    set((state) => {
      const nextItems = state.routineItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      const next = { ...state, routineItems: nextItems };
      persistState(next);
      return { routineItems: nextItems };
    });
  },

  toggleRoutineItemActive: (id) => {
    set((state) => {
      const nextItems = state.routineItems.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      );
      const next = { ...state, routineItems: nextItems };
      persistState(next);
      return { routineItems: nextItems };
    });
  },

  deleteRoutineItem: (id) => {
    set((state) => {
      const nextItems = state.routineItems.filter((item) => item.id !== id);
      const next = { ...state, routineItems: nextItems };
      persistState(next);
      return { routineItems: nextItems };
    });
  },

  reorderRoutineItems: (routineId, orderedIds) => {
    set((state) => {
      const otherItems = state.routineItems.filter((item) => item.routineId !== routineId);
      const reordered = orderedIds
        .map((id, index) => {
          const found = state.routineItems.find((i) => i.id === id);
          return found ? { ...found, sortOrder: index + 1 } : null;
        })
        .filter(Boolean) as RoutineItem[];

      const nextItems = [...otherItems, ...reordered];
      const next = { ...state, routineItems: nextItems };
      persistState(next);
      return { routineItems: nextItems };
    });
  },

  toggleCompleteItem: (routineItemId, targetDate) => {
    const dateStr = targetDate || getTodayDateString();

    set((state) => {
      const existingIndex = state.routineLogs.findIndex(
        (log) => log.routineItemId === routineItemId && log.localDate === dateStr
      );

      let nextLogs: RoutineLog[];
      if (existingIndex >= 0) {
        // Toggle off if already completed
        nextLogs = state.routineLogs.filter((_, idx) => idx !== existingIndex);
      } else {
        // Add completion log with timestamp
        const newLog: RoutineLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          routineItemId,
          localDate: dateStr,
          completedAt: new Date().toISOString(),
          status: "completed",
        };
        nextLogs = [newLog, ...state.routineLogs];
      }

      const next = { ...state, routineLogs: nextLogs };
      persistState(next);
      return { routineLogs: nextLogs };
    });
  },

  isItemCompletedOnDate: (routineItemId, targetDate) => {
    const dateStr = targetDate || getTodayDateString();
    const state = get();
    return state.routineLogs.some(
      (log) =>
        log.routineItemId === routineItemId &&
        log.localDate === dateStr &&
        log.status === "completed"
    );
  },

  addJournalEntry: (entryData) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const nextEntries = [newEntry, ...state.journalEntries];
      const next = { ...state, journalEntries: nextEntries };
      persistState(next);
      return { journalEntries: nextEntries };
    });

    return newEntry;
  },

  updateJournalEntry: (id, updates) => {
    set((state) => {
      const nextEntries = state.journalEntries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      );
      const next = { ...state, journalEntries: nextEntries };
      persistState(next);
      return { journalEntries: nextEntries };
    });
  },

  deleteJournalEntry: (id) => {
    set((state) => {
      const entryToDelete = state.journalEntries.find((e) => e.id === id);
      if (entryToDelete && entryToDelete.photoIds) {
        // Clean up associated photo blobs in IndexedDB
        for (const photoId of entryToDelete.photoIds) {
          deletePhotoBlob(photoId);
        }
      }

      const nextEntries = state.journalEntries.filter((e) => e.id !== id);
      const nextPhotos = state.journalPhotos.filter((p) =>
        entryToDelete ? !entryToDelete.photoIds.includes(p.id) : true
      );

      const next = {
        ...state,
        journalEntries: nextEntries,
        journalPhotos: nextPhotos,
      };
      persistState(next);
      return {
        journalEntries: nextEntries,
        journalPhotos: nextPhotos,
      };
    });
  },

  addJournalPhoto: (photo) => {
    set((state) => {
      const nextPhotos = [...state.journalPhotos, photo];
      const next = { ...state, journalPhotos: nextPhotos };
      persistState(next);
      return { journalPhotos: nextPhotos };
    });
  },

  addChatMessage: (msgData) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const nextMessages = [...state.chatMessages, newMsg];
      const next = { ...state, chatMessages: nextMessages };
      persistState(next);
      return { chatMessages: nextMessages };
    });

    return newMsg;
  },

  clearChatMessages: () => {
    set((state) => {
      const welcomeMsg: ChatMessage = {
        id: `chat-init-${Date.now()}`,
        role: "assistant",
        text: `Chat cleared. Hello ${state.profile.displayName}! How can I help with your routine or verified product guidelines?`,
        createdAt: new Date().toISOString(),
      };
      const next = { ...state, chatMessages: [welcomeMsg] };
      persistState(next);
      return { chatMessages: [welcomeMsg] };
    });
  },

  resetDemoData: () => {
    clearAllPhotos();
    const freshSeed = generateSeedData();
    persistState(freshSeed);
    set({
      ...freshSeed,
      isHydrated: true,
    });
  },

  clearAllData: async () => {
    await clearAllPhotos();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    const emptyState: AppStateData = {
      meta: {
        schemaVersion: 1,
        seededAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      },
      profile: {
        id: "custom-user",
        displayName: "User",
        preferences: {},
        createdAt: new Date().toISOString(),
      },
      products: [],
      routines: [
        { id: "routine-morning", name: "Morning Routine", timeOfDay: "morning", isActive: true },
        { id: "routine-evening", name: "Evening Routine", timeOfDay: "evening", isActive: true },
      ],
      routineItems: [],
      routineLogs: [],
      journalEntries: [],
      journalPhotos: [],
      chatMessages: [],
    };
    persistState(emptyState);
    set({
      ...emptyState,
      isHydrated: true,
    });
  },

  exportDataJson: () => {
    const state = get();
    const exportPayload = {
      meta: state.meta,
      profile: state.profile,
      products: state.products,
      routines: state.routines,
      routineItems: state.routineItems,
      routineLogs: state.routineLogs,
      journalEntries: state.journalEntries,
      journalPhotos: state.journalPhotos,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  importDataJson: (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed?.profile || !Array.isArray(parsed?.products)) {
        return { success: false, error: "Invalid backup file structure." };
      }

      const importedState: AppStateData = {
        meta: parsed.meta || {
          schemaVersion: 1,
          seededAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        },
        profile: parsed.profile,
        products: parsed.products || [],
        routines: parsed.routines || [],
        routineItems: parsed.routineItems || [],
        routineLogs: parsed.routineLogs || [],
        journalEntries: parsed.journalEntries || [],
        journalPhotos: parsed.journalPhotos || [],
        chatMessages: [
          {
            id: `chat-imported-${Date.now()}`,
            role: "assistant",
            text: "Data restored successfully from backup. How can I assist you with your routine?",
            createdAt: new Date().toISOString(),
          },
        ],
      };

      persistState(importedState);
      set({
        ...importedState,
        isHydrated: true,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to parse JSON backup." };
    }
  },
}));
