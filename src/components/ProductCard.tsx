import React from "react";

export function ProductCard({ item, onMore }: { item: { id: string; title: string; price: number; highlights: string[]; why?: string }, onMore: (id: string)=>void }) {
  return (
    <div className="border rounded-2xl p-4 shadow-sm hover:shadow transition">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-lg">{item.title}</h3>
        <span className="text-gray-700">₹{item.price.toLocaleString("en-IN")}</span>
      </div>
      {item.why && <p className="text-sm text-gray-600 mt-1">{item.why}</p>}
      <ul className="text-sm mt-2 list-disc pl-4 text-gray-700">
        {item.highlights.slice(0,3).map((h,i)=>(<li key={i}>{h}</li>))}
      </ul>
      <div className="mt-3">
        <button className="text-sm underline" onClick={()=>onMore(item.id)}>Tell me more →</button>
      </div>
    </div>
  );
}


