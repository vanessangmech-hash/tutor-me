"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Classroom } from "@/components/classroom/Classroom";
import { ChatBox } from "@/components/ui/ChatBox";
import { NotesPanel } from "@/components/ui/NotesPanel";
import { VoiceControl } from "@/components/ui/VoiceControl";
import { useClassroomStore } from "@/lib/useClassroomStore";
import { createMockNetwork } from "@/lib/mockNetwork";
import type { ClassroomNetwork } from "@/types/classroom";

// Top-level mount for the classroom experience. Wires up network
// subscriptions → zustand store, and renders the scene + UI overlays.

interface Props {
  roomCode: string;
  selfName: string;
  // If the outer app already has a real ClassroomNetwork, pass it in.
  // Otherwise we fall back to a mock so this feature is self-demoable.
  network?: ClassroomNetwork;
}

export function ClassroomRoot({ roomCode, selfName, network }: Props) {
  const setIdentity = useClassroomStore((s) => s.setIdentity);
  const setNetwork = useClassroomStore((s) => s.setNetwork);
  const setRemotePlayers = useClassroomStore((s) => s.setRemotePlayers);
  const pushMessage = useClassroomStore((s) => s.pushMessage);
  const setPersona = useClassroomStore((s) => s.setPersona);
  const setWhiteboard = useClassroomStore((s) => s.setWhiteboard);
  const reset = useClassroomStore((s) => s.reset);

  const [chatFocused, setChatFocused] = useState(false);

  useEffect(() => {
    const net = network ?? createMockNetwork();
    setNetwork(net);

    let cancelled = false;

    const offPlayers = net.onRemotePlayers((p) => setRemotePlayers(p));
    const offChat = net.onChat((m) => pushMessage(m));
    const offPersona = net.onPersona((p) => setPersona(p));
    const offWhiteboard = net.onWhiteboard((wb) => setWhiteboard(wb));

    net.join(roomCode, selfName).then(({ selfId }) => {
      if (!cancelled) setIdentity(selfId, selfName);
    });

    return () => {
      cancelled = true;
      offPlayers();
      offChat();
      offPersona();
      offWhiteboard();
      net.leave();
      reset();
    };
  }, [roomCode, selfName, network, setIdentity, setNetwork, setRemotePlayers, pushMessage, setPersona, setWhiteboard, reset]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Classroom chatInputFocused={chatFocused} />

      {/* Top-left: back button + room code */}
      <div className="absolute left-4 top-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-xs text-white backdrop-blur transition-colors hover:bg-black/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </Link>
        <div className="pointer-events-none rounded-md bg-black/60 px-3 py-2 text-xs text-white backdrop-blur">
          <div className="font-mono tracking-wider">ROOM {roomCode}</div>
        </div>
      </div>

      {/* Top-right: mic */}
      <div className="absolute right-4 top-4">
        <VoiceControl />
      </div>

      {/* Bottom: Notes (left) + Chat (right) side-by-side */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
        <NotesPanel />
        <ChatBox onFocusChange={setChatFocused} />
      </div>
    </div>
  );
}
