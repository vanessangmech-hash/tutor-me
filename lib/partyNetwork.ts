"use client";

import PartySocket from "partysocket";
import type {
  ChatMessage,
  ClassroomNetwork,
  PersonaConfig,
  PlayerState,
  WhiteboardState,
} from "@/types/classroom";

type Listener<T> = (v: T) => void;

// Must match party/index.ts
type Wire =
  | { kind: "hello"; from: string; name: string; color: string }
  | { kind: "state"; player: PlayerState }
  | { kind: "chat"; msg: ChatMessage }
  | { kind: "leave"; id: string }
  | { kind: "persona"; persona: PersonaConfig }
  | { kind: "whiteboard"; whiteboard: WhiteboardState }
  | {
      kind: "snapshot";
      players: PlayerState[];
      persona?: PersonaConfig;
      whiteboard?: WhiteboardState;
    };

const DEFAULT_PERSONA = {
  id: "demo-chem-prof",
  name: "Dr. Chen",
  subject: "Chemistry",
  systemPrompt:
    "You are Dr. Chen, an engaging chemistry professor. Adapt to the learner's style. Ask Socratic questions. Celebrate understanding.",
  avatarColor: "#a78bfa",
  rewardScore: 0,
};

const PLAYER_COLORS = [
  "#fbbf24", "#60a5fa", "#f472b6", "#34d399", "#f87171",
  "#a78bfa", "#22d3ee", "#fb923c", "#84cc16", "#e879f9",
];

function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PLAYER_COLORS[h % PLAYER_COLORS.length];
}

export function createPartyNetwork(): ClassroomNetwork {
  const chatListeners = new Set<Listener<ChatMessage>>();
  const playerListeners = new Set<Listener<PlayerState[]>>();
  const personaListeners = new Set<Listener<PersonaConfig>>();
  const whiteboardListeners = new Set<Listener<WhiteboardState>>();

  // Remote players keyed by their id.
  const remotes = new Map<string, PlayerState>();

  let socket: PartySocket | null = null;
  let selfId = "";
  let selfName = "";
  let selfColor = "";
  let currentRoom = "";

  const emitRemotes = () =>
    playerListeners.forEach((cb) => cb(Array.from(remotes.values())));

  const send = (msg: Wire) => socket?.send(JSON.stringify(msg));

  const handleMessage = (evt: MessageEvent) => {
    let msg: Wire;
    try {
      msg = JSON.parse(evt.data as string);
    } catch {
      return;
    }

    switch (msg.kind) {
      case "snapshot": {
        // Server sends this on connect — populate existing room state.
        remotes.clear();
        for (const p of msg.players) {
          if (p.id !== selfId) remotes.set(p.id, p);
        }
        emitRemotes();

        // If the room already has a persona use it; otherwise check localStorage
        // (set by the creator before navigating here) and broadcast it.
        if (msg.persona) {
          personaListeners.forEach((cb) => cb(msg.persona!));
        } else {
          let resolved: PersonaConfig = DEFAULT_PERSONA;
          try {
            const stored = localStorage.getItem(`room-persona-${currentRoom}`);
            if (stored) {
              const parsed = JSON.parse(stored) as PersonaConfig;
              resolved = parsed;
              // Broadcast so late-joiners get the persona via the server.
              send({ kind: "persona", persona: resolved });
            }
          } catch {}
          personaListeners.forEach((cb) => cb(resolved));
        }

        if (msg.whiteboard)
          whiteboardListeners.forEach((cb) => cb(msg.whiteboard!));

        // Announce ourselves so existing players know we joined.
        send({ kind: "hello", from: selfId, name: selfName, color: selfColor });
        break;
      }

      case "state": {
        if (msg.player.id === selfId) break;
        remotes.set(msg.player.id, msg.player);
        emitRemotes();
        break;
      }

      case "chat": {
        if (msg.msg.authorId === selfId) break;
        chatListeners.forEach((cb) => cb(msg.msg));
        break;
      }

      case "leave": {
        if (remotes.delete(msg.id)) emitRemotes();
        break;
      }

      case "persona":
        personaListeners.forEach((cb) => cb(msg.persona));
        break;

      case "whiteboard":
        whiteboardListeners.forEach((cb) => cb(msg.whiteboard));
        break;
    }
  };

  return {
    async join(roomCode, name) {
      selfId = "u-" + Math.random().toString(36).slice(2, 8);
      selfName = name;
      selfColor = colorForName(name);
      currentRoom = roomCode.toUpperCase();

      const host =
        process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";

      socket = new PartySocket({
        host,
        room: roomCode.toUpperCase(),
        // Use selfId as the connection id so the server can map
        // onClose(conn.id) → player id without extra bookkeeping.
        id: selfId,
      });

      socket.addEventListener("message", handleMessage);

      // Resolve immediately — listeners are already attached by ClassroomRoot
      // before join() is called, so they'll receive the snapshot when it
      // arrives from the server.
      return { selfId };
    },

    leave() {
      send({ kind: "leave", id: selfId });
      socket?.removeEventListener("message", handleMessage);
      socket?.close();
      socket = null;
      remotes.clear();
      chatListeners.clear();
      playerListeners.clear();
      personaListeners.clear();
      whiteboardListeners.clear();
    },

    sendPlayerState(state) {
      const player: PlayerState = {
        id: selfId,
        name: selfName,
        color: selfColor,
        ...state,
      };
      send({ kind: "state", player });
    },

    sendChat(text) {
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        authorId: selfId,
        authorName: selfName,
        text,
        ts: Date.now(),
        kind: "user",
      };
      // Echo locally for the sender.
      chatListeners.forEach((cb) => cb(msg));
      send({ kind: "chat", msg });
    },

    sendWhiteboard(wb) {
      send({ kind: "whiteboard", whiteboard: wb });
    },

    sendReward(amount, reason) {
      // No-op in the real network — rewards are handled server-side via VAPI.
      console.log("[partyNetwork] reward", amount, reason);
    },

    onRemotePlayers(cb) {
      playerListeners.add(cb);
      return () => playerListeners.delete(cb);
    },
    onChat(cb) {
      chatListeners.add(cb);
      return () => chatListeners.delete(cb);
    },
    onPersona(cb) {
      personaListeners.add(cb);
      return () => personaListeners.delete(cb);
    },
    onWhiteboard(cb) {
      whiteboardListeners.add(cb);
      return () => whiteboardListeners.delete(cb);
    },
  };
}
