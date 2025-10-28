export type PhoneRecord = {
  id: string; brand: string; model: string; price: number;
  display: { sizeInches?: number; panel?: string; refreshHz?: number };
  camera: { mainMp?: number; ois?: boolean; eis?: boolean; ultrawideMp?: number; telephotoMp?: number };
  battery: { capacityMah?: number; chargingW?: number };
  soc: string; ramGb: number; storageGb: number; releaseDate?: string | Date | null;
  highlights: string[];
};

export function scorePhone(p: PhoneRecord, intent: { compact?: boolean; needsOis?: boolean; minBatteryMah?: number }) {
  let score = 0;
  // Camera weighting
  const cam = (p.camera.mainMp ?? 0) / 2 + (p.camera.ois ? 25 : 0) + (p.camera.ultrawideMp ? 5 : 0) + (p.camera.telephotoMp ? 10 : 0);
  score += Math.min(cam, 45);
  // Battery & charging
  const bat = Math.min((p.battery.capacityMah ?? 0) / 100, 30) + Math.min((p.battery.chargingW ?? 0) / 5, 10);
  score += Math.min(bat, 35);
  // Compact bonus
  if (intent.compact && (p.display.sizeInches ?? 7) < 6.2) score += 10;
  // OIS requirement
  if (intent.needsOis && !p.camera.ois) score -= 15;
  // Min battery requirement
  if ((intent.minBatteryMah ?? 0) > 0 && (p.battery.capacityMah ?? 0) < (intent.minBatteryMah ?? 0)) score -= 10;
  // Small recency nudge via price proxy (skip if unknown)
  score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function sortByScore(a: any, b: any) { return b.__score - a.__score; }


