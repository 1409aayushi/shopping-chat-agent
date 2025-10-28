import { NextRequest, NextResponse } from "next/server";
import { prisma, hydratePhone } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const phoneRaw = await prisma.phone.findUnique({ where: { id } });
  const phone = phoneRaw ? hydratePhone(phoneRaw) : null;
  if (!phone) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ item: phone });
}


