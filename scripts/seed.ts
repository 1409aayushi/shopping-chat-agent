import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
async function main() {
  const file = path.join(process.cwd(), "data", "phones.json");
  const raw = fs.readFileSync(file, "utf-8");
  const rows = JSON.parse(raw);
  await prisma.phone.deleteMany();
  for (const r of rows) {
    await prisma.phone.create({
      data: {
        brand: r.brand,
        model: r.model,
        os: r.os,
        price: r.price,
        displayJson: JSON.stringify(r.display ?? null),
        cameraJson: JSON.stringify(r.camera ?? null),
        batteryJson: JSON.stringify(r.battery ?? null),
        soc: r.soc,
        ramGb: r.ramGb,
        storageGb: r.storageGb,
        weightG: r.weightG ?? null,
        dimsMm: r.dimsMm ?? null,
        releaseDate: r.releaseDate ? new Date(r.releaseDate) : null,
        imagesJson: JSON.stringify(r.images ?? []),
        highlightsJson: JSON.stringify(r.highlights ?? [])
      }
    });
  }
  console.log(`Seeded ${rows.length} phones`);
}
main().finally(() => prisma.$disconnect());


