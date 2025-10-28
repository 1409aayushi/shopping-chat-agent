import Chat from "@/components/Chat";
export default function Page() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Shopping Chat Agent — Mobiles</h1>
      <Chat />
      <p className="text-xs text-gray-500 mt-4">Specs/Prices are from a demo dataset. I won’t guess missing data.</p>
    </main>
  );
}
