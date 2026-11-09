import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveRelevantKnowledge } from "@/lib/ai/knowledge-base";

const requestSchema = z.object({
  message: z.string().trim().min(1, "Question cannot be empty").max(1500, "Question is too long"),
  context: z.object({
    products: z
      .array(
        z.object({
          name: z.string(),
          category: z.string(),
          instructionText: z.string().optional(),
          sourceLabel: z.string().optional(),
        })
      )
      .max(10),
    routineSummary: z.string().max(3000),
    journalSummary: z.string().max(2000).optional(),
    completionRate: z.number().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, context } = parsed.data;

    // Retrieve curated verified facts from local knowledge base
    const relevantDocs = retrieveRelevantKnowledge(message);
    const relatedSourceIds = relevantDocs.map((doc) => doc.id);

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if key is available; if not, return high-quality verified local fallback
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      return handleLocalFallback(message, relevantDocs, context, "API key not configured");
    }

    const systemInstruction = `
You are an educational product and routine assistant inside the Man Matters Companion independent prototype.
You are not a doctor or medical professional.
- Do NOT diagnose, prescribe, or recommend altering medical treatments.
- Use ONLY verified product facts supplied in context or retrieved knowledge for product-specific claims.
- If a product instruction, dosage, or fact is missing or not provided, explicitly admit that you do not have that verified information, and advise the user to check their physical product packaging or consult a qualified professional.
- NEVER invent dosage, frequency, clinical efficacy, growth guarantees, or timelines.
- Treat journal notes as subjective self-observations, never as clinical evidence.
- For severe redness, burning, swelling, chest pain, or allergic symptoms, advise immediate qualified medical attention.
- Do not claim access to Man Matters internal systems, accounts, or order histories.
- Be concise, supportive, calm, and practical.
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
      });

      const promptContext = {
        userQuestion: message,
        savedUserProducts: context.products,
        currentRoutine: context.routineSummary,
        recentSubjectiveJournalNotes: context.journalSummary || "No recent journal notes.",
        recentWeeklyCompletionRate: context.completionRate ? `${context.completionRate}%` : "Not computed",
        verifiedKnowledgeBaseMatches: relevantDocs.map((d) => ({
          title: d.title,
          category: d.category,
          verifiedGuideline: d.content,
          source: d.sourceName,
        })),
      };

      const result = await model.generateContent(JSON.stringify(promptContext));
      const answer = result.response.text();

      return NextResponse.json({
        answer: answer.trim(),
        sources: relevantDocs.map((d) => ({
          id: d.id,
          title: d.title,
          sourceName: d.sourceName,
          sourceUrl: d.sourceUrl,
        })),
        isFallback: false,
      });
    } catch (aiErr: any) {
      console.warn("Gemini API call failed, falling back to verified local knowledge base:", aiErr);
      return handleLocalFallback(message, relevantDocs, context, aiErr?.message || "Service unavailable");
    }
  } catch (error: any) {
    console.error("Unhandled error in /api/companion:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing assistant query." },
      { status: 500 }
    );
  }
}

function handleLocalFallback(
  message: string,
  relevantDocs: ReturnType<typeof retrieveRelevantKnowledge>,
  context: z.infer<typeof requestSchema>["context"],
  reason: string
) {
  let answer = "";

  if (relevantDocs.length > 0) {
    const topDoc = relevantDocs[0];
    answer = `[Local Verified Guidance — ${topDoc.sourceName}]\n\n${topDoc.content}\n\n`;

    if (context.products.length > 0) {
      const matchedProd = context.products.find((p) =>
        topDoc.title.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
      );
      if (matchedProd && matchedProd.instructionText) {
        answer += `Your saved instructions for ${matchedProd.name}:\n"${matchedProd.instructionText}"\n\n`;
      }
    }

    answer += `(Note: Live Gemini model is currently in local verified fallback mode. Verified local knowledge is shown above.)`;
  } else {
    answer = `I do not have a verified product instruction matching your query in the local knowledge base.

To ensure your safety:
1. Please refer directly to the verified directions printed on your physical product package.
2. If you are experiencing symptoms, unusual reactions, or require dosage changes, please consult a qualified healthcare professional.

(Note: Live Gemini model is currently in local verified fallback mode.)`;
  }

  return NextResponse.json({
    answer,
    sources: relevantDocs.map((d) => ({
      id: d.id,
      title: d.title,
      sourceName: d.sourceName,
      sourceUrl: d.sourceUrl,
    })),
    isFallback: true,
    fallbackReason: reason,
  });
}
