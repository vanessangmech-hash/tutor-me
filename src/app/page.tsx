"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function makeRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += letters[Math.floor(Math.random() * letters.length)];
  return s;
}

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-indigo-900 via-black to-emerald-900 p-8 text-white">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">
          Virtual Classroom
        </h1>
        <p className="mb-8 text-sm opacity-80">
          Drop into a 3D room with a voice-powered AI professor. Create a
          persona once — reuse it across rooms.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => router.push(`/classroom/${makeRoomCode()}`)}
            className="rounded-2xl bg-amber-400 px-5 py-6 text-left text-black shadow-lg transition hover:bg-amber-300"
          >
            <div className="text-lg font-semibold">Create a room</div>
            <div className="text-sm opacity-70">
              Start a new session and pick a professor persona.
            </div>
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const c = code.trim().toUpperCase();
              if (c) router.push(`/classroom/${c}`);
            }}
            className="rounded-2xl bg-white/10 p-5 backdrop-blur"
          >
            <label className="mb-2 block text-sm opacity-80">Join with code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCDE"
              maxLength={8}
              className="mb-3 w-full rounded-md bg-black/40 px-3 py-2 font-mono tracking-widest outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-white/20 px-3 py-2 font-medium hover:bg-white/30"
            >
              Join
            </button>
          </form>
        </div>

        <div className="mt-8 text-xs opacity-60">
          Controls: <kbd>WASD</kbd> to move · <kbd>Shift</kbd> to run · <kbd>T</kbd> to
          chat · click to look around · mic button to speak.
        </div>
      </div>
    </div>
  );
}
