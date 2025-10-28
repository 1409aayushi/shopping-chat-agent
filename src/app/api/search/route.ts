import { NextRequest, NextResponse } from "next/server";
import { prisma, hydratePhone } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { brands = [], os = null, maxPrice = null, needsOis = null, compact = null, minBatteryMah = null } = body ?? {};

  const all = (await prisma.phone.findMany()).map(hydratePhone);
  let rows = all.filter(p => {
    if (brands.length && !brands.map((b:string)=>b.toLowerCase()).includes(p.brand.toLowerCase())) return false;
    if (os && p.os !== os) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (needsOis === true && !(p.camera as any)?.ois) return false;
    if (compact === true && ((p.display as any)?.sizeInches ?? 7) >= 6.2) return false;
    if (minBatteryMah && ((p.battery as any)?.capacityMah ?? 0) < minBatteryMah) return false;
    return true;
  });

  return NextResponse.json({ items: rows });
}


