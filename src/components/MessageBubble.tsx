import React from "react";

export function MessageBubble({ role, children }: { role: "user"|"assistant"; children: React.ReactNode }) {
  const me = role === "user";
  return (
    <div className={`w-full flex ${me?"justify-end":"justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 my-2 text-sm shadow ${me?"bg-gray-900 text-white":"bg-gray-100"}`}>
        {children}
      </div>
    </div>
  );
}


