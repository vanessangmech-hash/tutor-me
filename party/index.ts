import type * as Party from "partykit/server";
import type {
  PlayerState,
  PersonaConfig,
  WhiteboardState,
  ChatMessage,
} from "../types/classroom";

// Wire format — identical to the client side so both ends agree.
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

export default class ClassroomServer implements Party.Server {
  // In-memory room state — persists as long as there are active connections.
  players = new Map<string, PlayerState>();
  persona?: PersonaConfig;
  whiteboard?: WhiteboardState;

  constructor(readonly room: Party.Room) {}

  // HTTP GET /parties/tutor-me-classroom/{roomCode} — used by the join flow
  // to check whether a room has at least one active participant.
  async onRequest(req: Party.Request): Promise<Response> {
    const connections = [...this.room.getConnections()];
    return Response.json(
      { active: connections.length > 0, connections: connections.length },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }

  // Send the current snapshot to every new joiner so they immediately see
  // existing players, the active persona, and the latest whiteboard.
  onConnect(conn: Party.Connection) {
    const snapshot: Wire = {
      kind: "snapshot",
      players: Array.from(this.players.values()),
      ...(this.persona ? { persona: this.persona } : {}),
      ...(this.whiteboard ? { whiteboard: this.whiteboard } : {}),
    };
    conn.send(JSON.stringify(snapshot));
  }

  onMessage(message: string | ArrayBuffer, sender: Party.Connection) {
    if (typeof message !== "string") return;

    let msg: Wire;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    // Update server-side state for late-joiner snapshots.
    switch (msg.kind) {
      case "state":
        this.players.set(msg.player.id, msg.player);
        break;
      case "leave":
        this.players.delete(msg.id);
        break;
      case "persona":
        this.persona = msg.persona;
        break;
      case "whiteboard":
        this.whiteboard = msg.whiteboard;
        break;
    }

    // Fan out to every other connection in the room.
    this.room.broadcast(message, [sender.id]);
  }

  // Handle abrupt disconnects (browser close, network drop) — the client
  // won't get a chance to send a "leave" message itself.
  onClose(conn: Party.Connection) {
    if (!this.players.has(conn.id)) return;
    this.players.delete(conn.id);
    const leave: Wire = { kind: "leave", id: conn.id };
    this.room.broadcast(JSON.stringify(leave), [conn.id]);
  }
}
