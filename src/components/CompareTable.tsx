import React from "react";

export function CompareTable({ items }: { items: any[] }) {
  const fields = [
    { key: "price", label: "Price (₹)", render: (p:any)=>p.price?.toLocaleString("en-IN") },
    { key: "display.sizeInches", label: "Display", render: (p:any)=> `${p.display?.sizeInches ?? "—"}" ${p.display?.panel ?? ""} ${p.display?.refreshHz? p.display.refreshHz+"Hz":""}` },
    { key: "camera", label: "Camera", render: (p:any)=> `${p.camera?.mainMp ?? "—"}MP ${p.camera?.ois?"+ OIS":""}` },
    { key: "battery", label: "Battery", render: (p:any)=> `${p.battery?.capacityMah ?? "—"} mAh, ${p.battery?.chargingW ?? "—"}W` },
    { key: "soc", label: "Chipset", render: (p:any)=> p.soc },
    { key: "ramGb", label: "RAM/Storage", render: (p:any)=> `${p.ramGb} / ${p.storageGb} GB` },
  ];
  return (
    <div className="overflow-x-auto border rounded-2xl">
      <table className="min-w-[700px] w-full text-sm">
        <thead>
          <tr>
            <th className="p-3 text-left">Spec</th>
            {items.map((p,i)=>(<th key={i} className="p-3 text-left">{p.brand} {p.model}</th>))}
          </tr>
        </thead>
        <tbody>
          {fields.map((f)=> (
            <tr key={f.key} className="border-t">
              <td className="p-3 font-medium">{f.label}</td>
              {items.map((p,i)=>(<td key={i} className="p-3">{f.render(p)}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


