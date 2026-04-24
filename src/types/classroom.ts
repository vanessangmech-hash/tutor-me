// Shared types used across the classroom module.
// Backend team: these are the shapes the 3D/voice client expects.

export type Vec3 = [number, number, number];

export interface PlayerState {
  id: string;
  name: string;
  // World position (meters) and y-rotation (radians).
  position: Vec3;
  rotationY: number;
  // Animation hint: idle | walking | running
  anim?: "idle" | "walk" | "run";
  // Display color for the avatar.
  color?: string;
}

export interface ChatMessage {
  id: string;
  // Who sent it. "professor" is reserved for the AI persona.
  authorId: string;
  authorName: string;
  text: string;
  // Unix ms
  ts: number;
  // Optional: marks AI messages so we can style them + trigger TTS.
  kind?: "user" | "professor" | "system";
}

// Structured classroom board state. The agent populates this via a
// function call ("update_whiteboard") whenever the lesson topic changes.
// UI-only concern: the board stays put until a new update arrives.
export interface WhiteboardState {
  // Current headline topic, e.g. "Molarity".
  title: string;
  // Ordered sub-steps / agenda for this topic.
  steps?: string[];
  // Optional formula to render in a highlighted box (LaTeX or plain text).
  formula?: string;
  // Key takeaways; shown in the Notes Summary panel next to chat.
  summary?: string[];
  // Unix ms of when this state was produced; used to animate transitions.
  ts: number;
}

export interface PersonaConfig {
  // Unique persona id (shared across rooms).
  id: string;
  // Display name shown in-world, e.g. "Dr. Chen".
  name: string;
  // Subject being taught, e.g. "Chemistry".
  subject: string;
  // System prompt that defines the professor's behavior.
  systemPrompt: string;
  // VAPI voice id (ElevenLabs/PlayHT etc).
  voiceId?: string;
  // Optional avatar model / color.
  avatarColor?: string;
  // RL stats (read-only from this client).
  rewardScore?: number;
  // Free-form learner profile the persona has adapted to.
  learnerProfile?: Record<string, unknown>;
}

// Networking seam. The backend team implements this and passes it in.
// Everything the 3D client needs to send/receive, behind one interface.
export interface ClassroomNetwork {
  // Local player joins; returns their assigned id.
  join(roomCode: string, name: string): Promise<{ selfId: string }>;
  leave(): void;

  // Local player position/animation updates.
  sendPlayerState(state: Omit<PlayerState, "id" | "name">): void;

  // Send a chat message from the local user.
  sendChat(text: string): void;

  // Subscribe to remote updates.
  onRemotePlayers(cb: (players: PlayerState[]) => void): () => void;
  onChat(cb: (msg: ChatMessage) => void): () => void;
  onPersona(cb: (persona: PersonaConfig) => void): () => void;
  onWhiteboard(cb: (wb: WhiteboardState) => void): () => void;

  // Push whiteboard updates (e.g. a client-side tool call from VAPI
  // should fan out to other clients via the backend).
  sendWhiteboard(wb: WhiteboardState): void;

  // Reward signal for RL when the user indicates understanding.
  sendReward(amount: number, reason?: string): void;

  // Optional: suppress the network's own auto-replies to chat (used by
  // the mock network so VAPI's real transcripts don't collide with the
  // canned professor fallback). Real backend impls can ignore this.
  setAutoReplyEnabled?(enabled: boolean): void;
}
