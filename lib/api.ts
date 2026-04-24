import { getRealtimeClient, resetRealtimeClient } from "@/lib/insforge"

// ── Types ──

export interface Persona {
  id: string
  creator_id: string
  name: string
  subject: string
  system_prompt: string
  personality_traits: Record<string, any>
  teaching_style: {
    approach?: string
    detail_level?: string
    encouragement?: boolean
  }
  is_public: boolean
  total_rewards: number
  times_used: number
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  room_code: string
  host_id: string
  persona_id: string
  status: "active" | "archived" | "ended"
  max_participants: number
  settings: Record<string, any>
  personas?: Partial<Persona>
  created_at: string
  updated_at: string
}

export interface RoomMember {
  user_id: string
  role: "host" | "student"
  joined_at: string
  display_name?: string
}

export interface ChatResponse {
  response: string
  reward_granted: boolean
  sources: { title: string; url: string }[]
}

export interface RewardResponse {
  reward: Record<string, any>
  message: string
}

// ── Internal: API route fetch helper ──

async function callFunction<T = any>(
  fn: string,
  opts: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: any; query?: Record<string, string> } = {}
): Promise<T> {
  const { method = "GET", body, query } = opts
  const qs = query ? `?${new URLSearchParams(query).toString()}` : ""
  const res = await fetch(`/api/functions/${fn}${qs}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`)
  }
  return data as T
}

// ── Room Management ──

export async function createRoom(
  personaId: string,
  maxParticipants = 30,
  settings?: Record<string, any>
) {
  return callFunction<{ room: Room }>("room-manager", {
    method: "POST",
    body: {
      persona_id: personaId,
      max_participants: maxParticipants,
      settings: settings || { allow_voice: true, allow_chat: true, auto_reward: true },
    },
  })
}

export async function getRoom(opts: { code?: string; id?: string }) {
  const query: Record<string, string> = {}
  if (opts.code) query.code = opts.code
  else if (opts.id) query.id = opts.id

  return callFunction<{ room: Room; members: RoomMember[] }>("room-manager", {
    method: "GET",
    query,
  })
}

export async function listMyRooms() {
  return callFunction<{ rooms: Room[] }>("room-manager", { method: "GET" })
}

export async function listActiveRooms() {
  return callFunction<{ rooms: Room[] }>("room-manager", {
    method: "GET",
    query: { list_active: "true" },
  })
}

// ── Room Join/Leave ──

export async function joinRoom(roomCode: string) {
  return callFunction<{ message: string; room: Room }>("room-join", {
    method: "POST",
    body: { room_code: roomCode.toUpperCase() },
  })
}

export async function leaveRoom(roomId: string) {
  return callFunction<{ message: string }>("room-join", {
    method: "DELETE",
    body: { room_id: roomId },
  })
}

// ── Persona Management ──

export async function createPersona(opts: {
  name: string
  subject: string
  system_prompt: string
  personality_traits?: Record<string, any>
  teaching_style?: Record<string, any>
  is_public?: boolean
}) {
  return callFunction<{ persona: Persona }>("persona-manager", {
    method: "POST",
    body: opts,
  })
}

export async function listPublicPersonas(subject?: string) {
  const query: Record<string, string> = { public: "true" }
  if (subject) query.subject = subject
  return callFunction<{ personas: Persona[] }>("persona-manager", {
    method: "GET",
    query,
  })
}

export async function getPersona(personaId: string) {
  return callFunction<{ persona: Persona }>("persona-manager", {
    method: "GET",
    query: { id: personaId },
  })
}

export async function forkPersona(personaId: string) {
  return callFunction<{ persona: Persona; forked_from: string }>("persona-manager", {
    method: "PATCH",
    body: { persona_id: personaId },
  })
}

// ── Chat ──

export async function sendMessage(roomId: string, message: string) {
  return callFunction<ChatResponse>("chat-handler", {
    method: "POST",
    body: { room_id: roomId, message },
  })
}

// ── Rewards ──

export async function recordReward(opts: {
  room_id: string
  persona_id: string
  topic: string
  understanding_score?: number
  message?: string
}) {
  return callFunction<RewardResponse>("reward-handler", {
    method: "POST",
    body: { understanding_score: 1.0, ...opts },
  })
}

// ── Learning Adapter ──

export async function analyzeLearning(personaId: string) {
  return callFunction("learning-adapter", {
    method: "POST",
    body: { persona_id: personaId },
  })
}

// ── Realtime Helpers ──

export async function subscribeToRoom(roomId: string) {
  const client = await getRealtimeClient()
  await client.realtime.connect()
  const roomSub = await client.realtime.subscribe(`room:${roomId}`)
  const presenceSub = await client.realtime.subscribe(`presence:${roomId}`)
  return { roomSub, presenceSub }
}

export async function onRoomMessage(event: string, callback: (payload: any) => void) {
  const client = await getRealtimeClient()
  client.realtime.on(event, callback)
}

export async function offRoomMessage(event: string, callback: (payload: any) => void) {
  const client = await getRealtimeClient()
  client.realtime.off(event, callback)
}

export function disconnectRealtime() {
  resetRealtimeClient()
}
