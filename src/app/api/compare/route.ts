import { NextRequest, NextResponse } from "next/server";
import { prisma, hydratePhone } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { models = [] } = await req.json();
  if (!Array.isArray(models) || models.length < 2) {
    return NextResponse.json({ error: "Provide 2–3 model names" }, { status: 400 });
  }
  const all = (await prisma.phone.findMany()).map(hydratePhone);
  const matched = all.filter(p => models.some((m:string)=> `${p.brand} ${p.model}`.toLowerCase() === m.toLowerCase() || p.model.toLowerCase() === m.toLowerCase()));
  return NextResponse.json({ items: matched });
}


