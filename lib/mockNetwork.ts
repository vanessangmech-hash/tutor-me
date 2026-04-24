// A BroadcastChannel-backed ClassroomNetwork. Works across tabs/windows
// on the same origin in the same browser, which is enough to demo the
// multiplayer feel locally. For true multi-device sync the backend team
// implements ClassroomNetwork against Insforge/Wundergraph/Redis and
// passes their impl into <ClassroomRoot network={...} />.

import type {
  ChatMessage,
  ClassroomNetwork,
  PersonaConfig,
  PlayerState,
  WhiteboardState,
} from "@/types/classroom";
import { synthesizeWhiteboard } from "@/lib/whiteboardSynth";

type Listener<T> = (v: T) => void;

// Wire format for the BroadcastChannel.
type Wire =
  | { kind: "hello"; from: string }
  | { kind: "state"; player: PlayerState }
  | { kind: "chat"; msg: ChatMessage }
  | { kind: "leave"; id: string }
  | { kind: "persona"; persona: PersonaConfig }
  | { kind: "whiteboard"; whiteboard: WhiteboardState };

const PLAYER_COLORS = [
  "#fbbf24", "#60a5fa", "#f472b6", "#34d399", "#f87171",
  "#a78bfa", "#22d3ee", "#fb923c", "#84cc16", "#e879f9",
];

// Stale remote players get pruned after this window.
const STALE_MS = 4000;

export function createMockNetwork(opts?: {
  persona?: PersonaConfig;
}): ClassroomNetwork {
  const chatListeners = new Set<Listener<ChatMessage>>();
  const playerListeners = new Set<Listener<PlayerState[]>>();
  const personaListeners = new Set<Listener<PersonaConfig>>();
  const whiteboardListeners = new Set<Listener<WhiteboardState>>();
  let lastWhiteboard: WhiteboardState | null = null;

  // Remote players indexed by id, plus last-seen timestamp for pruning.
  const remotes = new Map<string, { state: PlayerState; ts: number }>();

  // When VAPI voice is active, the real agent produces transcripts that
  // land in chat; the mock's canned reply becomes noise. VoiceControl
  // toggles this via setAutoReplyEnabled.
  let autoReplyEnabled = true;

  const persona: PersonaConfig = opts?.persona ?? {
    id: "demo-chem-prof",
    name: "Dr. Chen",
    subject: "Chemistry",
    systemPrompt:
      "You are Dr. Chen, an engaging chemistry professor. Adapt to the learner's style. Ask Socratic questions. Celebrate understanding.",
    avatarColor: "#a78bfa",
    rewardScore: 0,
  };

  let selfId = "";
  let selfName = "";
  let selfColor = "#fbbf24";
  let channel: BroadcastChannel | null = null;
  let pruneTimer: ReturnType<typeof setInterval> | null = null;
  // Latest pose we've broadcast — resent on "hello" so new joiners see us.
  let lastPose: PlayerState | null = null;

  const emitRemotes = () => {
    const list = Array.from(remotes.values()).map((v) => v.state);
    playerListeners.forEach((cb) => cb(list));
  };

  const post = (w: Wire) => {
    try {
      channel?.postMessage(w);
    } catch {
      // BroadcastChannel is unavailable (e.g. SSR/older browser) — no-op.
    }
  };

  const onMessage = (ev: MessageEvent<Wire>) => {
    const w = ev.data;
    if (!w || typeof w !== "object") return;

    if (w.kind === "hello") {
      // Another tab joined. Re-announce ourselves so they see us.
      if (w.from === selfId) return;
      if (lastPose) post({ kind: "state", player: lastPose });
      post({ kind: "persona", persona });
      if (lastWhiteboard) post({ kind: "whiteboard", whiteboard: lastWhiteboard });
      return;
    }

    if (w.kind === "state") {
      if (w.player.id === selfId) return;
      remotes.set(w.player.id, { state: w.player, ts: Date.now() });
      emitRemotes();
      return;
    }

    if (w.kind === "chat") {
      // Relay to local listeners — sender already emitted locally.
      if (w.msg.authorId === selfId) return;
      chatListeners.forEach((cb) => cb(w.msg));
      return;
    }

    if (w.kind === "leave") {
      if (remotes.delete(w.id)) emitRemotes();
      return;
    }

    if (w.kind === "persona") {
      personaListeners.forEach((cb) => cb(w.persona));
      return;
    }

    if (w.kind === "whiteboard") {
      lastWhiteboard = w.whiteboard;
      whiteboardListeners.forEach((cb) => cb(w.whiteboard));
      return;
    }
  };

  return {
    async join(roomCode, name) {
      selfId = "u-" + Math.random().toString(36).slice(2, 8);
      selfName = name;
      // Deterministic color-from-name so identity persists across refreshes.
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      selfColor = PLAYER_COLORS[h % PLAYER_COLORS.length];

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel(`classroom:${roomCode}`);
        channel.addEventListener("message", onMessage);
      }

      // Prune stale remotes every second.
      pruneTimer = setInterval(() => {
        const now = Date.now();
        let changed = false;
        for (const [id, v] of remotes) {
          if (now - v.ts > STALE_MS) {
            remotes.delete(id);
            changed = true;
          }
        }
        if (changed) emitRemotes();
      }, 1000);

      // Clean up on tab close.
      if (typeof window !== "undefined") {
        window.addEventListener("pagehide", () => post({ kind: "leave", id: selfId }));
      }

      // Kick things off once listeners are attached.
      setTimeout(() => {
        post({ kind: "hello", from: selfId });
        personaListeners.forEach((cb) => cb(persona));
        chatListeners.forEach((cb) =>
          cb({
            id: "welcome-" + selfId,
            authorId: "system",
            authorName: "System",
            text: `Welcome ${name}. ${persona.name} is here to teach ${persona.subject}.`,
            ts: Date.now(),
            kind: "system",
          }),
        );
      }, 50);

      return { selfId };
    },

    leave() {
      post({ kind: "leave", id: selfId });
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      channel = null;
      if (pruneTimer) clearInterval(pruneTimer);
      pruneTimer = null;
      remotes.clear();
      chatListeners.clear();
      playerListeners.clear();
      personaListeners.clear();
      lastPose = null;
    },

    sendPlayerState(state) {
      const player: PlayerState = {
        id: selfId,
        name: selfName,
        position: state.position,
        rotationY: state.rotationY,
        anim: state.anim,
        color: selfColor,
      };
      lastPose = player;
      post({ kind: "state", player });
    },

    sendChat(text) {
      if (!selfId) return;
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        authorId: selfId,
        authorName: selfName || "Student",
        text,
        ts: Date.now(),
        kind: "user",
      };
      // Echo locally for the sender.
      chatListeners.forEach((cb) => cb(msg));
      // Broadcast to other tabs.
      post({ kind: "chat", msg });

      // Fake a professor reply so chat feels alive even when VAPI voice
      // isn't active. (During a voice call, the real VAPI agent's
      // transcript lands in chat instead — the professor will respond
      // to typed messages via vapi.send(add-message); see ChatBox.)
      // Only the sender generates the reply so we don't get duplicates
      // across tabs.
      if (!autoReplyEnabled) return;
      setTimeout(() => {
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          authorId: "professor",
          authorName: persona.name,
          text: mockProfessorReply(text, persona),
          ts: Date.now(),
          kind: "professor",
        };
        chatListeners.forEach((cb) => cb(reply));
        post({ kind: "chat", msg: reply });
      }, 700);

      // Demo-only: synthesize a plausible whiteboard from the user's
      // question so the structured UI has something to render before
      // VAPI is wired in. Shared with the VAPI path for consistency.
      setTimeout(() => {
        const wb = synthesizeWhiteboard(text, persona.subject);
        if (wb && wb.title !== lastWhiteboard?.title) {
          lastWhiteboard = wb;
          whiteboardListeners.forEach((cb) => cb(wb));
          post({ kind: "whiteboard", whiteboard: wb });
        }
      }, 1100);
    },

    sendWhiteboard(wb) {
      lastWhiteboard = wb;
      post({ kind: "whiteboard", whiteboard: wb });
    },

    sendReward(amount, reason) {
      // eslint-disable-next-line no-console
      console.log("[mockNetwork] reward", amount, reason);
    },

    setAutoReplyEnabled(enabled: boolean) {
      autoReplyEnabled = enabled;
    },

    onRemotePlayers(cb) {
      playerListeners.add(cb);
      return () => {
        playerListeners.delete(cb);
      };
    },
    onChat(cb) {
      chatListeners.add(cb);
      return () => {
        chatListeners.delete(cb);
      };
    },
    onPersona(cb) {
      personaListeners.add(cb);
      return () => {
        personaListeners.delete(cb);
      };
    },
    onWhiteboard(cb) {
      whiteboardListeners.add(cb);
      // Replay latest for late subscribers.
      if (lastWhiteboard) setTimeout(() => cb(lastWhiteboard!), 0);
      return () => {
        whiteboardListeners.delete(cb);
      };
    },
  };
}

// Intent-aware canned replies used when VAPI isn't active. We prefer
// topic-grounded responses when the synth recognizes a subject from the
// library, and otherwise vary the generic replies so the demo never
// feels like the same sentence on loop. When a voice call is active the
// real agent reply supersedes this (see VoiceControl + ChatBox).
const replyRotation = { i: 0 };
function rotate(options: string[]): string {
  const pick = options[replyRotation.i % options.length];
  replyRotation.i++;
  return pick;
}

function mockProfessorReply(text: string, persona: PersonaConfig): string {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const topic = synthesizeWhiteboard(trimmed);

  if (topic) {
    const step = topic.steps?.[0];
    const formulaLine = topic.formula ? ` The key relation is ${topic.formula}.` : "";
    return rotate([
      `Great — let's dig into ${topic.title}. ${step ? `We'll start with ${step.toLowerCase()}.` : ""}${formulaLine} What part do you want to unpack first?`,
      `${topic.title} is a great topic.${formulaLine} ${step ? `A good entry point is ${step.toLowerCase()}.` : ""} Tell me what you already know.`,
      `Love this — ${topic.title} comes up a lot.${formulaLine} Shall we walk through ${step ? step.toLowerCase() : "the fundamentals"} together?`,
    ]);
  }

  // Greetings
  if (/^(hi|hey|hello|yo|sup|howdy)\b/.test(lower)) {
    return rotate([
      `Hi there. I'm ${persona.name}. What do you want to learn about ${persona.subject} today?`,
      `Hey! Glad you're here. Anything particular in ${persona.subject} on your mind?`,
      `Hello — ready when you are. Pick a topic in ${persona.subject} and we'll start.`,
    ]);
  }

  // Affirmations of understanding
  if (/\b(got it|makes sense|i (?:get|understand)|thanks|ok cool)\b/.test(lower)) {
    return rotate([
      `Awesome. Want me to pick a harder example, or move on to the next idea?`,
      `Nice. Shall we try a quick problem to lock it in?`,
      `Good. What concept should we look at next?`,
    ]);
  }

  // Explicit help requests
  if (/\b(help|stuck|confused|don'?t (?:get|understand)|lost)\b/.test(lower)) {
    return rotate([
      `No problem — tell me which part is fuzzy and we'll slow it down.`,
      `Totally fine. Point me at the exact concept and we'll rebuild it from scratch.`,
      `Let's back up. What's the last thing that made sense?`,
    ]);
  }

  // Statements of existing knowledge ("I know about X")
  if (/\b(i know|i've seen|i've heard|i learned|i studied)\b/.test(lower)) {
    return rotate([
      `Nice foundation. Can you give me a quick summary in your own words?`,
      `Good — let's stress-test that. What would happen in an edge case?`,
      `Perfect starting point. How would you explain it to a classmate?`,
    ]);
  }

  // Questions
  if (/\?$/.test(trimmed) || /^(what|why|how|when|where|is|are|do|does|can)\b/.test(lower)) {
    return rotate([
      `Good question. Before I answer — what's your current best guess?`,
      `That's worth unpacking. Which part of the question feels most unclear?`,
      `Let's work through that together. What do you already know that might be related?`,
    ]);
  }

  // Fallback — engage without parroting the user's words as a topic.
  return rotate([
    `Interesting. What made you curious about that?`,
    `Tell me a bit more about what you're trying to figure out.`,
    `I want to make sure I answer the right question — what's the context?`,
  ]);
}
