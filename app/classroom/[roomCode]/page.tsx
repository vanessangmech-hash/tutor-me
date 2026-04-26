"use client";

import { use, useEffect, useMemo, useState } from "react";
import { ClassroomRoot } from "@/components/ClassroomRoot";
import { createPartyNetwork } from "@/lib/partyNetwork";

export default function ClassroomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const [name, setName] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // Stable network instance — created once per page mount so ClassroomRoot's
  // useEffect deps don't trigger a leave/rejoin on every render.
  const network = useMemo(() => createPartyNetwork(), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("classroom-name");
      if (stored) setName(stored);
    } catch {}
  }, []);

  if (!name) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-black to-emerald-900 text-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = draft.trim();
            if (!v) return;
            try { localStorage.setItem("classroom-name", v); } catch {}
            setName(v);
          }}
          className="w-full max-w-sm rounded-2xl bg-black/50 p-6 backdrop-blur"
        >
          <h1 className="mb-1 text-xl font-semibold">Joining room {roomCode}</h1>
          <p className="mb-4 text-sm opacity-70">What should we call you?</p>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your name"
            className="mb-3 w-full rounded-md bg-white/10 px-3 py-2 outline-none placeholder:opacity-50 focus:bg-white/20"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-amber-400 px-3 py-2 font-medium text-black hover:bg-amber-300"
          >
            Enter classroom
          </button>
        </form>
      </div>
    );
  }

  return <ClassroomRoot roomCode={roomCode.toUpperCase()} selfName={name} network={network} />;
}
