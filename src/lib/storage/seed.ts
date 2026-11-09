import { AppStateData } from "@/types/domain";
import { getPastDates, getTodayDateString } from "@/lib/dates";

export function generateSeedData(): AppStateData {
  const today = getTodayDateString();
  const past7Days = getPastDates(7); // e.g. [today-6, ..., today]

  return {
    meta: {
      schemaVersion: 1,
      seededAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    },
    profile: {
      id: "demo-user-alex",
      displayName: "Alex",
      preferences: {
        preferredReminderPeriod: "morning",
      },
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    products: [
      {
        id: "prod-minoxidil-5",
        name: "Minoxidil 5% Topical Solution",
        brand: "Man Matters",
        category: "hair",
        status: "active",
        startDate: past7Days[0],
        instructionText:
          "Apply 1 ml twice daily (morning and evening) directly onto clean, dry scalp in the hair loss area. Spread evenly with fingertips. Wash hands immediately after. Allow to dry completely for at least 2 to 4 hours before washing.",
        sourceLabel: "Official Product Label Instructions",
        sourceUrl: "https://manmatters.com",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "prod-hair-shampoo",
        name: "Anti-Hair Fall Shampoo",
        brand: "Man Matters",
        category: "hair",
        status: "active",
        startDate: past7Days[0],
        instructionText:
          "Apply adequate quantity to wet scalp and hair. Gently massage for 2-3 minutes to allow active ingredients to absorb. Rinse thoroughly with lukewarm water. Use 3 times weekly.",
        sourceLabel: "Verified Usage Guide",
        sourceUrl: "https://manmatters.com",
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "prod-biotin-gummies",
        name: "Biotin Gummies for Hair & Beard",
        brand: "Man Matters",
        category: "nutrition",
        status: "active",
        startDate: past7Days[0],
        instructionText:
          "Chew one gummy daily after breakfast or lunch. Do not swallow whole. Consistent daily intake alongside balanced meals is recommended.",
        sourceLabel: "Nutritional Facts & Usage",
        sourceUrl: "https://manmatters.com",
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: "prod-salicylic-facewash",
        name: "Salicylic Acid 2% Face Wash",
        brand: "Man Matters",
        category: "skin",
        status: "active",
        startDate: past7Days[0],
        instructionText:
          "Pump small amount onto wet palms, work into a gentle lather, and massage over face for 30-45 seconds avoiding the eye area. Rinse thoroughly with cool water. Use morning and night.",
        sourceLabel: "Dermatological Usage Guide",
        sourceUrl: "https://manmatters.com",
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ],
    routines: [
      {
        id: "routine-morning",
        name: "Morning Wellness Routine",
        timeOfDay: "morning",
        isActive: true,
      },
      {
        id: "routine-evening",
        name: "Evening Care Routine",
        timeOfDay: "evening",
        isActive: true,
      },
    ],
    routineItems: [
      {
        id: "item-morning-facewash",
        routineId: "routine-morning",
        productId: "prod-salicylic-facewash",
        title: "Salicylic Face Wash",
        instruction: "Lather with water for 30s, rinse cool.",
        frequency: "daily",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "item-morning-minoxidil",
        routineId: "routine-morning",
        productId: "prod-minoxidil-5",
        title: "Minoxidil 5% Application",
        instruction: "Apply 1 ml to clean, dry scalp with dropper.",
        frequency: "daily",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: "item-morning-biotin",
        routineId: "routine-morning",
        productId: "prod-biotin-gummies",
        title: "Biotin Gummy",
        instruction: "1 chewable gummy after morning meal.",
        frequency: "daily",
        sortOrder: 3,
        isActive: true,
      },
      {
        id: "item-evening-facewash",
        routineId: "routine-evening",
        productId: "prod-salicylic-facewash",
        title: "Evening Cleanse",
        instruction: "Gently remove daily dust and oil buildup.",
        frequency: "daily",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "item-evening-minoxidil",
        routineId: "routine-evening",
        productId: "prod-minoxidil-5",
        title: "Minoxidil 5% Night Dose",
        instruction: "1 ml application before sleep (let dry 2 hrs).",
        frequency: "daily",
        sortOrder: 2,
        isActive: true,
      },
    ],
    routineLogs: [
      // Day -6
      { id: "log-d6-1", routineItemId: "item-morning-facewash", localDate: past7Days[0], completedAt: `${past7Days[0]}T08:15:00Z`, status: "completed" },
      { id: "log-d6-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[0], completedAt: `${past7Days[0]}T08:20:00Z`, status: "completed" },
      { id: "log-d6-3", routineItemId: "item-morning-biotin", localDate: past7Days[0], completedAt: `${past7Days[0]}T08:45:00Z`, status: "completed" },
      { id: "log-d6-4", routineItemId: "item-evening-facewash", localDate: past7Days[0], completedAt: `${past7Days[0]}T22:10:00Z`, status: "completed" },
      { id: "log-d6-5", routineItemId: "item-evening-minoxidil", localDate: past7Days[0], completedAt: `${past7Days[0]}T22:20:00Z`, status: "completed" },

      // Day -5
      { id: "log-d5-1", routineItemId: "item-morning-facewash", localDate: past7Days[1], completedAt: `${past7Days[1]}T08:30:00Z`, status: "completed" },
      { id: "log-d5-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[1], completedAt: `${past7Days[1]}T08:35:00Z`, status: "completed" },
      { id: "log-d5-3", routineItemId: "item-morning-biotin", localDate: past7Days[1], completedAt: `${past7Days[1]}T09:00:00Z`, status: "completed" },
      { id: "log-d5-4", routineItemId: "item-evening-facewash", localDate: past7Days[1], completedAt: `${past7Days[1]}T22:30:00Z`, status: "completed" },

      // Day -4
      { id: "log-d4-1", routineItemId: "item-morning-facewash", localDate: past7Days[2], completedAt: `${past7Days[2]}T07:45:00Z`, status: "completed" },
      { id: "log-d4-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[2], completedAt: `${past7Days[2]}T07:50:00Z`, status: "completed" },
      { id: "log-d4-3", routineItemId: "item-morning-biotin", localDate: past7Days[2], completedAt: `${past7Days[2]}T08:15:00Z`, status: "completed" },
      { id: "log-d4-4", routineItemId: "item-evening-facewash", localDate: past7Days[2], completedAt: `${past7Days[2]}T23:00:00Z`, status: "completed" },
      { id: "log-d4-5", routineItemId: "item-evening-minoxidil", localDate: past7Days[2], completedAt: `${past7Days[2]}T23:05:00Z`, status: "completed" },

      // Day -3
      { id: "log-d3-1", routineItemId: "item-morning-facewash", localDate: past7Days[3], completedAt: `${past7Days[3]}T08:00:00Z`, status: "completed" },
      { id: "log-d3-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[3], completedAt: `${past7Days[3]}T08:05:00Z`, status: "completed" },
      { id: "log-d3-3", routineItemId: "item-morning-biotin", localDate: past7Days[3], completedAt: `${past7Days[3]}T08:30:00Z`, status: "completed" },

      // Day -2
      { id: "log-d2-1", routineItemId: "item-morning-facewash", localDate: past7Days[4], completedAt: `${past7Days[4]}T08:10:00Z`, status: "completed" },
      { id: "log-d2-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[4], completedAt: `${past7Days[4]}T08:15:00Z`, status: "completed" },
      { id: "log-d2-3", routineItemId: "item-morning-biotin", localDate: past7Days[4], completedAt: `${past7Days[4]}T08:40:00Z`, status: "completed" },
      { id: "log-d2-4", routineItemId: "item-evening-facewash", localDate: past7Days[4], completedAt: `${past7Days[4]}T22:15:00Z`, status: "completed" },
      { id: "log-d2-5", routineItemId: "item-evening-minoxidil", localDate: past7Days[4], completedAt: `${past7Days[4]}T22:20:00Z`, status: "completed" },

      // Yesterday
      { id: "log-d1-1", routineItemId: "item-morning-facewash", localDate: past7Days[5], completedAt: `${past7Days[5]}T08:00:00Z`, status: "completed" },
      { id: "log-d1-2", routineItemId: "item-morning-minoxidil", localDate: past7Days[5], completedAt: `${past7Days[5]}T08:05:00Z`, status: "completed" },
      { id: "log-d1-3", routineItemId: "item-morning-biotin", localDate: past7Days[5], completedAt: `${past7Days[5]}T08:20:00Z`, status: "completed" },
      { id: "log-d1-4", routineItemId: "item-evening-facewash", localDate: past7Days[5], completedAt: `${past7Days[5]}T22:00:00Z`, status: "completed" },

      // Today (morning partially checked off for realistic live state)
      { id: "log-d0-1", routineItemId: "item-morning-facewash", localDate: today, completedAt: `${today}T08:15:00Z`, status: "completed" },
      { id: "log-d0-2", routineItemId: "item-morning-minoxidil", localDate: today, completedAt: `${today}T08:20:00Z`, status: "completed" },
    ],
    journalEntries: [
      {
        id: "entry-1",
        date: past7Days[2],
        category: "hair",
        observation:
          "Noticed some mild hair shedding when applying the solution today. Reminded myself that initial shedding is a normal part of the follicle renewal cycle during early weeks.",
        tags: ["minoxidil", "scalp", "shedding-check"],
        photoIds: [],
        createdAt: `${past7Days[2]}T19:30:00Z`,
      },
      {
        id: "entry-2",
        date: past7Days[4],
        category: "skin",
        observation:
          "Face wash routine feels refreshing. T-zone feels much less greasy by late afternoon without excessive dryness around the cheeks.",
        tags: ["skincare", "facewash", "texture"],
        photoIds: [],
        createdAt: `${past7Days[4]}T21:40:00Z`,
      },
    ],
    journalPhotos: [],
    chatMessages: [
      {
        id: "chat-welcome",
        role: "assistant",
        text: "Hello Alex! I am your Man Matters Companion assistant. I can answer questions about your saved products, explain verified label instructions, or summarize your recent routine consistency. What would you like to review today?",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
