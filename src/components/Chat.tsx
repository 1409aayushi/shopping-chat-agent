'use client';
import React, { useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ProductCard } from "./ProductCard";
import { CompareTable } from "./CompareTable";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role:"user"|"assistant"; text:string}[]>([]);
  const [results, setResults] = useState<any>(null);

  function findDetailsTarget(query: string): string | null {
    const q = query.toLowerCase();
    const wantsDetails = /(tell me more|more details|show details|details|specs|tell me about)/i.test(q);
    if (!wantsDetails) return null;
    const items: any[] = results?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) return null;
    // Try to match by model or brand+model in the text
    for (const it of items) {
      const title = `${it.brand ?? ""} ${it.model ?? it.title ?? ""}`.trim().toLowerCase();
      const modelOnly = (it.model ?? it.title ?? "").toLowerCase();
      if (title && q.includes(title)) return it.id;
      if (modelOnly && q.includes(modelOnly)) return it.id;
    }
    // Fallback: if generic "tell me more" and we have recommendations, pick first
    if (/tell me more|more details|show details|details/i.test(q)) {
      return items[0]?.id ?? null;
    }
    return null;
  }

  async function send() {
  if (!input.trim()) return;

  const text = input.trim();
  setMessages(m => [...m, { role: "user", text }]);
  setInput("");

  try {
    // Only try details intent if we already have results
    if (results?.mode === 'recommend' && Array.isArray(results.items) && results.items.length > 0) {
      const detailsId = findDetailsTarget(text);
      if (detailsId) {
        await onMore(detailsId);
        return;
      }
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      throw new Error(`Chat API failed: ${res.status}`);
    }

    const data = await res.json();

    if (!data || !data.type) {
      throw new Error("Invalid response from chat API");
    }

    if (data.type === 'refusal' || data.type === 'error') {
      setMessages(m => [...m, { role: 'assistant', text: data.reply ?? 'Something went wrong.' }]);
      setResults(null);
      return;
    }

    if (data.type === 'explain') {
      setMessages(m => [
        ...m,
        { role: 'assistant', text: `**${data.explain.title}**\n\n${data.explain.body}` }
      ]);
      setResults(null);
      return;
    }

    if (data.type === 'compare') {
      setMessages(m => [...m, { role: 'assistant', text: `Here’s a side-by-side comparison.` }]);
      setResults({ mode: 'compare', items: data.items ?? [] });
      return;
    }

    if (data.type === 'recommend') {
      if (!Array.isArray(data.items) || data.items.length === 0) {
        const note = data.note || 'I couldn’t find matches. Try adjusting the filters.';
        setMessages(m => [...m, { role: 'assistant', text: note }]);
        setResults({ mode: 'recommend', items: [], note });
      } else {
        setMessages(m => [...m, { role: 'assistant', text: `Here are some options I recommend:` }]);
        setResults({ mode: 'recommend', items: data.items });
      }
      return;
    }

    // Fallback
    setMessages(m => [...m, { role: 'assistant', text: 'I did not understand that request.' }]);
    setResults(null);

  } catch (err) {
    console.error(err);
    setMessages(m => [...m, { role: 'assistant', text: 'Something went wrong. Please try again.' }]);
    setResults(null);
  }
}

async function onMore(id: string) {
  try {
    const res = await fetch(`/api/details?id=${id}`);

    if (!res.ok) {
      throw new Error(`Details API failed: ${res.status}`);
    }

    const data = await res.json();
    const p = data.item;

    if (!p) {
      throw new Error("No product data returned");
    }

    setMessages(m => [
      ...m,
      {
        role: 'assistant',
        text: `**${p.brand} ${p.model}** — ₹${p.price.toLocaleString('en-IN')}

Key specs:
• Camera: ${p.camera?.mainMp ?? '—'}MP${p.camera?.ois ? ' (OIS)' : ''}
• Battery: ${p.battery?.capacityMah ?? '—'}mAh
• Display: ${p.display?.sizeInches ?? '—'}" ${p.display?.panel ?? ''} ${p.display?.refreshHz ? p.display.refreshHz + 'Hz' : ''}`
      }
    ]);
  } catch (err) {
    console.error(err);
    setMessages(m => [...m, { role: 'assistant', text: 'Unable to load details.' }]);
  }
}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border rounded-2xl p-4 h-[75vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.map((m,i)=>(
            <MessageBubble key={i} role={m.role}>
              <span className="whitespace-pre-wrap">{m.text}</span>
            </MessageBubble>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)}onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
            }}
            placeholder="Ask: Best camera under ₹30k?" className="flex-1 border rounded-xl px-3 py-2" />
          <button onClick={send} className="px-4 py-2 rounded-xl bg-gray-900 text-white">Send</button>
        </div>
      </div>
      <div className="border rounded-2xl p-4 h-[75vh] overflow-y-auto">
        {!results && <p className="text-sm text-gray-600">Results will appear here.</p>}
        {results?.mode==='recommend' && (
          results.items?.length ? (
            <div className="grid gap-3">{results.items.map((it:any)=>(<ProductCard key={it.id} item={it} onMore={onMore} />))}</div>
          ) : (
            <p className="text-sm text-gray-600">{results.note ?? 'No matches found. Try adjusting your filters.'}</p>
          )
        )}
        {results?.mode==='compare' && <CompareTable items={results.items} />}
      </div>
    </div>
  );
}


