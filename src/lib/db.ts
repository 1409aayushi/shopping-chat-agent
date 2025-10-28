import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export type PhoneRow = {
  id: string;
  brand: string;
  model: string;
  os: string;
  price: number;
  displayJson: string | null;
  cameraJson: string | null;
  batteryJson: string | null;
  soc: string;
  ramGb: number;
  storageGb: number;
  weightG: number | null;
  dimsMm: string | null;
  releaseDate: Date | null;
  imagesJson: string | null;
  highlightsJson: string | null;
};

export function hydratePhone(row: any) {
  return {
    ...row,
    display: safeParseJson(row.displayJson) ?? {},
    camera: safeParseJson(row.cameraJson) ?? {},
    battery: safeParseJson(row.batteryJson) ?? {},
    images: safeParseJson(row.imagesJson) ?? [],
    highlights: safeParseJson(row.highlightsJson) ?? []
  };
}

function safeParseJson(text?: string | null) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}


