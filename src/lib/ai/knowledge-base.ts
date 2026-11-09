import { KnowledgeDocument } from "@/types/domain";

export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "kb-minoxidil-usage",
    title: "Minoxidil 5% Topical Solution — Application & Usage",
    category: "hair",
    content: "Apply 1 ml twice daily (morning and evening) directly onto the clean, dry scalp in the hair loss or thinning area. Spread evenly with clean fingertips. Wash hands thoroughly with soap immediately after application. Allow to dry completely for at least 2 to 4 hours before washing, swimming, wearing headwear, or going to bed. Do not apply more than 1 ml per dose or exceed twice daily.",
    sourceName: "Official Product Label Instructions",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-15",
    status: "verified",
    keywords: ["minoxidil", "serum", "hair", "scalp", "apply", "dosage", "frequency", "wash", "morning", "evening", "solution"],
  },
  {
    id: "kb-minoxidil-safety",
    title: "Minoxidil 5% — Safety, Missed Doses & Precautions",
    category: "hair",
    content: "If you miss an application of Minoxidil, do not apply a double dose to make up for it. Continue with your next scheduled application as planned. Initial mild shedding during weeks 2 to 6 is common as resting hairs make way for new growth; however, if you experience severe redness, persistent burning, chest pain, dizziness, or facial swelling, discontinue use immediately and seek medical evaluation. Do not apply to irritated, sunburned, or broken scalp skin.",
    sourceName: "Clinical & Product Safety Advisory",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-15",
    status: "verified",
    keywords: ["missed", "double", "safety", "shedding", "irritation", "swelling", "side effects", "reaction", "warning", "precautions"],
  },
  {
    id: "kb-shampoo-usage",
    title: "Anti-Hair Fall Shampoo — Usage & Frequency",
    category: "hair",
    content: "Wet hair and scalp thoroughly with lukewarm water. Apply adequate quantity and massage gently onto scalp for 2 to 3 minutes to allow nourishing and DHT-blocking actives to contact follicles. Rinse thoroughly. Recommended usage is 3 times per week. Over-washing may strip natural sebum, while under-washing can cause residue buildup.",
    sourceName: "Verified Usage Guide",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-10",
    status: "verified",
    keywords: ["shampoo", "wash", "hair fall", "cleanse", "scalp", "frequency", "minutes", "water"],
  },
  {
    id: "kb-biotin-usage",
    title: "Biotin Gummies for Hair & Beard — Dietary Directions",
    category: "nutrition",
    content: "Chew one gummy completely once per day, preferably after breakfast or lunch. Do not swallow whole. Consistent daily consumption alongside balanced dietary intake provides optimal micronutrient support for keratin infrastructure. Not intended to replace a balanced diet.",
    sourceName: "Nutritional Facts & Usage",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-12",
    status: "verified",
    keywords: ["biotin", "gummy", "gummies", "chew", "nutrition", "beard", "hair", "breakfast", "vitamin"],
  },
  {
    id: "kb-salicylic-facewash",
    title: "Salicylic Acid 2% Face Wash — Dermatological Instructions",
    category: "skin",
    content: "Pump a small amount onto damp palms, create a gentle lather, and massage onto the face in circular motions for 30 to 45 seconds, avoiding the delicate eye area and lips. Rinse thoroughly with cool or lukewarm water and pat dry with a clean towel. Use morning and night. If dryness or light peeling occurs, reduce usage to once daily or alternate days. Follow with a non-comedogenic moisturizer and daytime sunscreen.",
    sourceName: "Dermatological Usage Guide",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-14",
    status: "verified",
    keywords: ["salicylic", "face wash", "skin", "acne", "cleanser", "pores", "face", "lather", "dryness"],
  },
  {
    id: "kb-consistency-expectations",
    title: "Wellness Consistency & Observable Timelines",
    category: "wellness",
    content: "Personal care and wellness routines operate on biological hair and skin renewal cycles. Skin epidermal turnover typically takes 28 to 40 days, while hair follicle transition cycles require 3 to 6 months of consistent daily adherence before noticeable changes appear. Tracking subjective observations in your journal helps observe trends over time rather than day-to-day fluctuations.",
    sourceName: "Dermatology & Trichology Educational Foundations",
    sourceUrl: "https://manmatters.com",
    reviewedAt: "2026-10-01",
    status: "verified",
    keywords: ["results", "timeline", "consistency", "expectation", "weeks", "months", "progress", "growth", "routine"],
  },
];

export function retrieveRelevantKnowledge(query: string, categoryFilter?: string): KnowledgeDocument[] {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/[\s,?.!]+/).filter((t) => t.length > 2);

  const scored = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;

    if (categoryFilter && doc.category.toLowerCase() === categoryFilter.toLowerCase()) {
      score += 2;
    }

    // Match keywords
    for (const kw of doc.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 3;
      }
    }

    // Match title words
    for (const token of queryTokens) {
      if (doc.title.toLowerCase().includes(token)) {
        score += 2;
      }
      if (doc.content.toLowerCase().includes(token)) {
        score += 1;
      }
    }

    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.doc);
}
