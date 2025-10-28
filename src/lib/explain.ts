export function explainConcept(topic: string): { title: string; body: string } | null {
  const t = topic.toLowerCase();
  if (/(ois.*eis|ois vs eis|ois|eis)/.test(t)) {
    return {
      title: "OIS vs EIS (camera stabilization)",
      body: `**OIS (Optical Image Stabilization):** Hardware moves lens/sensor to counter hand shake. Helps low‑light photos and steadier video.
**EIS (Electronic Image Stabilization):** Software crops/warps frames to reduce jitter. Works best in bright light; can introduce a slight crop.
**Takeaway:** OIS improves still photos and low‑light video; EIS helps smooth video, especially when combined with OIS.`
    };
  }
  return null;
}


