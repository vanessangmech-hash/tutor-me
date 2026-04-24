"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  ClassroomNetwork,
  PersonaConfig,
  PlayerState,
  WhiteboardState,
} from "@/types/classroom";

interface ClassroomStore {
  // Identity
  selfId: string;
  selfName: string;

  // Remote state
  remotePlayers: PlayerState[];
  messages: ChatMessage[];
  persona: PersonaConfig | null;
  whiteboard: WhiteboardState | null;

  // Voice state (driven by VAPI client).
  voice: {
    active: boolean;
    speaking: "user" | "professor" | null;
    volume: number; // 0..1
  };

  // Network handle (set once on mount).
  net: ClassroomNetwork | null;

  // --- mutations
  setIdentity(id: string, name: string): void;
  setNetwork(net: ClassroomNetwork | null): void;
  setRemotePlayers(p: PlayerState[]): void;
  pushMessage(m: ChatMessage): void;
  setPersona(p: PersonaConfig): void;
  setWhiteboard(wb: WhiteboardState): void;
  setVoice(v: Partial<ClassroomStore["voice"]>): void;
  reset(): void;
}

export const useClassroomStore = create<ClassroomStore>((set) => ({
  selfId: "",
  selfName: "",
  remotePlayers: [],
  messages: [],
  persona: null,
  whiteboard: null,
  voice: { active: false, speaking: null, volume: 0 },
  net: null,

  setIdentity: (id, name) => set({ selfId: id, selfName: name }),
  setNetwork: (net) => set({ net }),
  setRemotePlayers: (p) => set({ remotePlayers: p }),
  pushMessage: (m) =>
    set((s) => ({ messages: [...s.messages.slice(-199), m] })),
  setPersona: (p) => set({ persona: p }),
  setWhiteboard: (wb) => set({ whiteboard: wb }),
  setVoice: (v) => set((s) => ({ voice: { ...s.voice, ...v } })),
  reset: () =>
    set({
      selfId: "",
      selfName: "",
      remotePlayers: [],
      messages: [],
      persona: null,
      whiteboard: null,
      voice: { active: false, speaking: null, volume: 0 },
      net: null,
    }),
}));
