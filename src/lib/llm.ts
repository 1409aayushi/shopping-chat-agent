import { GoogleGenerativeAI } from "@google/generative-ai";
import { QueryIntent } from "./tools";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM = `You are a shopping assistant for mobile phones in India.
- Parse user requests into a strict JSON object following the schema I provide.
- Do not include any text besides the JSON. No comments, no markdown.
- Never guess: when unsure, use nulls or empty arrays.
`;

export async function extractIntent(message: string) {
  const schemaHint = `Schema (TypeScript):
  {
    task: "discover"|"compare"|"explain"|"details"|"filter",
    budgetInr: number|null,
    brands: string[],
    hardFilters: {
      os: "Android"|"iOS"|null,
      maxPrice: number|null,
      minBatteryMah: number|null,
      needsOis: boolean|null,
      compact: boolean|null
    },
    compareModels: string[],
    topic: string|null
  }`;

  const prompt = `${SYSTEM}\n${schemaHint}\nUser: ${message}\nReturn JSON only.`;
  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  const text = res.response.text().trim();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // try to salvage JSON from text
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      try { json = JSON.parse(slice); } catch { throw new Error("Intent parse failed: not JSON"); }
    } else {
      throw new Error("Intent parse failed: not JSON");
    }
  }
  const parsed = QueryIntent.parse(json);
  return parsed;
}


