import { NextRequest, NextResponse } from "next/server";
import { extractIntent } from "@/lib/llm";
import { fallbackIntentFromText } from "@/lib/tools";
import { refusalIfAny, refusalMessage } from "@/lib/safety";
import { parseBudgetNear } from "@/lib/parsers";
import { prisma, hydratePhone } from "@/lib/db";
import { scorePhone } from "@/lib/ranking";
import { explainConcept } from "@/lib/explain";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const refusal = refusalIfAny(message);
  if (refusal) return NextResponse.json({ type: "refusal", reply: refusalMessage(refusal.reason) });

  // Parse intent (LLM optional) with robust fallback
  const fallback = (()=>{ try { return fallbackIntentFromText(message); } catch { return null; } })();
  let intent = fallback ?? { task: "discover", budgetInr: null, brands: [], hardFilters: {}, compareModels: [], topic: null } as any;
  if (process.env.USE_LLM === 'true' && process.env.GEMINI_API_KEY) {
    try {
      const llmIntent: any = await extractIntent(message);
      // If fallback deduced a specific task (not discover), prefer it
      const merged = mergeIntents(intent, llmIntent);
      intent = intent.task !== "discover" ? intent : merged;
    } catch {
      // keep fallback intent
    }
  }

  // Routes by task
  if (intent.task === "explain" && intent.topic) {
    const expl = explainConcept(intent.topic);
    if (expl) return NextResponse.json({ type: "explain", explain: expl });
    return NextResponse.json({ type: "explain", explain: { title: intent.topic, body: "I have a concise explanation for common phone terms like OIS/EIS, fast charging, etc." } });
  }

  if (intent.task === "compare" && intent.compareModels.length >= 2) {
    const all = (await prisma.phone.findMany()).map(hydratePhone);
    const items = all.filter((p:any) => intent.compareModels.some(m => `${p.brand} ${p.model}`.toLowerCase() === m.toLowerCase() || p.model.toLowerCase() === m.toLowerCase()));
    return NextResponse.json({ type: "compare", items });
  }

  // discover/filter/details → search + rank
  const { maxPrice, softCeil } = parseBudgetNear(intent.budgetInr ?? intent.hardFilters.maxPrice ?? null);
  const all = (await prisma.phone.findMany()).map(hydratePhone);

  function passes(p: any, limit?: number | null) {
    if (intent.brands.length && !intent.brands.map(b=>b.toLowerCase()).includes(p.brand.toLowerCase())) return false;
    if (intent.hardFilters.os && p.os !== intent.hardFilters.os) return false;
    if (limit && p.price > limit) return false;
    if (intent.hardFilters.needsOis && !(p.camera as any)?.ois) return false;
    if (intent.hardFilters.compact && ((p.display as any)?.sizeInches ?? 7) >= 6.2) return false;
    if (intent.hardFilters.minBatteryMah && ((p.battery as any)?.capacityMah ?? 0) < intent.hardFilters.minBatteryMah) return false;
    return true;
  }

  let filtered = all.filter(p => passes(p, maxPrice ?? null));
  if (filtered.length === 0 && softCeil && (!maxPrice || softCeil > maxPrice)) {
    filtered = all.filter(p => passes(p, softCeil));
  }

  // scoring
  const scored = filtered.map(p => ({ ...p, __score: scorePhone(p as any, {
    compact: intent.hardFilters.compact ?? undefined,
    needsOis: intent.hardFilters.needsOis ?? undefined,
    minBatteryMah: intent.hardFilters.minBatteryMah ?? undefined,
  })})).sort((a,b)=> b.__score - a.__score);

  // rationale
  const top = scored.slice(0, 3).map(p => ({
    id: p.id,
    title: `${p.brand} ${p.model}`,
    price: p.price,
    highlights: p.highlights as any,
    why: buildWhy(p)
  }));

  if (top.length === 0) {
    const hints: string[] = [];
    if (intent.brands.length) hints.push(`brand: ${intent.brands.join(", ")}`);
    if (maxPrice) hints.push(`budget: ₹${maxPrice.toLocaleString("en-IN")}`);
    return NextResponse.json({ type: "recommend", items: [], note: `I couldn’t find matches${hints.length?` for (${hints.join(", ")})`:''}. Try raising budget or removing strict filters.` });
  }

  return NextResponse.json({ type: "recommend", items: top });
}

function mergeIntents(base: any, llm: any) {
  const pickTask = llm.task && llm.task !== "discover" ? llm.task : base.task;
  const topic = pickTask === "explain" ? (llm.topic ?? base.topic ?? null) : null;
  const compareModels = pickTask === "compare" ? (llm.compareModels?.length ? llm.compareModels : base.compareModels) : [];
  const brands = [...new Set([...(base.brands||[]), ...(llm.brands||[])])];
  const maxPrice = llm.hardFilters?.maxPrice ?? base.hardFilters?.maxPrice ?? base.budgetInr ?? null;
  const hardFilters = {
    os: llm.hardFilters?.os ?? base.hardFilters?.os ?? null,
    maxPrice,
    minBatteryMah: llm.hardFilters?.minBatteryMah ?? base.hardFilters?.minBatteryMah ?? null,
    needsOis: llm.hardFilters?.needsOis ?? base.hardFilters?.needsOis ?? null,
    compact: llm.hardFilters?.compact ?? base.hardFilters?.compact ?? null
  };
  return { task: pickTask, topic, compareModels, brands, hardFilters, budgetInr: base.budgetInr ?? null };
}

function buildWhy(p: any) {
  const bits = [] as string[];
  const cam = p.camera || {}; const bat = p.battery || {}; const disp = p.display || {};
  if (cam.ois) bits.push("OIS on main camera");
  if (cam.mainMp) bits.push(`${cam.mainMp}MP main sensor`);
  if (bat.capacityMah) bits.push(`${bat.capacityMah} mAh battery`);
  if (bat.chargingW) bits.push(`${bat.chargingW}W charging`);
  if (disp.refreshHz) bits.push(`${disp.refreshHz}Hz display`);
  if (disp.sizeInches && disp.sizeInches < 6.2) bits.push("compact display");
  return `Chosen for ${bits.slice(0,3).join(", ")}.`;
}


