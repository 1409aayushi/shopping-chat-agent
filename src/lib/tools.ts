import { z } from "zod";

export const QueryIntent = z.object({
  task: z.enum(["discover", "compare", "explain", "details", "filter"]).default("discover"),
  budgetInr: z.number().int().positive().nullable().optional(),
  brands: z.array(z.string()).default([]),
  hardFilters: z.object({
    os: z.enum(["Android", "iOS"]).nullable().optional(),
    maxPrice: z.number().int().positive().nullable().optional(),
    minBatteryMah: z.number().int().positive().nullable().optional(),
    needsOis: z.boolean().nullable().optional(),
    compact: z.boolean().nullable().optional()
  }).default({}),
  compareModels: z.array(z.string()).max(3).default([]),
  topic: z.string().nullable().optional()
});
export type TQueryIntent = z.infer<typeof QueryIntent>;

export const PhoneOut = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  price: z.number(),
  highlights: z.array(z.string()).default([]),
  score: z.number().min(0).max(100)
});
export type TPhoneOut = z.infer<typeof PhoneOut>;

export function fallbackIntentFromText(message: string) {
  const m = message.toLowerCase();
  // budget: supports 25,000 | 25000 | 25k | ₹25k | 2.5l | 2.5 lakh
  let budget: number | null = null;
  // Prefer k/lakh formats first so "₹40k" doesn't get captured as 40
  const numK = m.match(/(?:rs|inr|₹|rupees|under|below)?\s*₹?\s*([0-9]+)\s*k\b/i);
  const numLakh = m.match(/(?:rs|inr|₹|rupees|under|below)?\s*₹?\s*([0-9]+(?:\.[0-9]+)?)\s*(l|lakh)\b/i);
  const numComma = m.match(/(?:rs|inr|₹|rupees|under|below)\s*₹?\s*([0-9][0-9,]+)/i);
  if (numK) budget = Number(numK[1]) * 1000;
  else if (numLakh) budget = Math.round(parseFloat(numLakh[1]) * 100000);
  else if (numComma) budget = Number(numComma[1].replace(/,/g, ""));
  const brands: string[] = [];
  const known = ["samsung","oneplus","google","pixel","redmi","xiaomi","realme","motorola","apple","iphone","iqoo","vivo","oppo","nothing"]; 
  for (const b of known) if (m.includes(b)) brands.push(b);
  // normalize aliases
  if (brands.includes("pixel") && !brands.includes("google")) brands.push("google");
  if (brands.includes("iphone") && !brands.includes("apple")) brands.push("apple");
  const needsOis = /\bois\b|stabiliz/i.test(m) ? true : null;
  const compact = /compact|small|6\.1|6\.0|under\s*6\.2/i.test(m) ? true : null;
  const wantsExplain = /(explain|what is|difference)/.test(m);
  const wantsCompare = /\b(compare|vs|versus)\b/.test(m);
  const wantsDetails = /tell me more|details|specs/.test(m);
  let task: "discover"|"compare"|"explain"|"details"|"filter" = "discover";
  if (wantsExplain) task = "explain"; else if (wantsCompare) task = "compare"; else if (wantsDetails) task = "details"; else task = "discover";
  const topic = task === "explain" ? message.trim() : null;
  // compare model extraction
  let compareModels: string[] = [];
  if (task === "compare") {
    const match = message.match(/compare\s+(.+?)\s+(?:vs|versus)\s+(.+?)(?:[?.!]|$)/i) || message.match(/(.+?)\s+(?:vs|versus)\s+(.+?)(?:[?.!]|$)/i);
    if (match) {
      const a = match[1].trim();
      const b = match[2].trim();
      if (a) compareModels.push(a);
      if (b) compareModels.push(b);
    }
  }
  return QueryIntent.parse({
    task,
    budgetInr: budget,
    brands,
    hardFilters: { os: null, maxPrice: budget, minBatteryMah: null, needsOis, compact },
    compareModels,
    topic
  });
}


