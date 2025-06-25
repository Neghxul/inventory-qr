"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiPlay } from "react-icons/fi";

export default function NewSessionPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const createSession = async () => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/inventory-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const session = await res.json();
      toast.success("Session started");
      router.push(`/inventory/${session.id}`);
    } catch {
      toast.error("Failed to create session");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-xl">
        <h1 className="text-xl font-bold mb-4 text-center">Start New Inventory Session</h1>
        <input
          type="text"
          placeholder="Session name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-900 border border-gray-700 text-white"
        />
        <button
          onClick={createSession}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          <FiPlay /> Start Session
        </button>
      </div>
    </main>
  );
}
