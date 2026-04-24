import { insforge } from "@/lib/insforge"

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

// ── Room Management ──

export async function createRoom(
  personaId: string,
  maxParticipants = 30,
  settings?: Record<string, any>
) {
  const { data, error } = await insforge.functions.invoke("room-manager", {
    method: "POST",
    body: {
      persona_id: personaId,
      max_participants: maxParticipants,
      settings: settings || { allow_voice: true, allow_chat: true, auto_reward: true },
    },
  })
  if (error) throw new Error(error.message || "Failed to create room")
  return data as { room: Room }
}

export async function getRoom(opts: { code?: string; id?: string }) {
  const params = new URLSearchParams()
  if (opts.code) params.set("code", opts.code)
  else if (opts.id) params.set("id", opts.id)

  const { data, error } = await insforge.functions.invoke(
    `room-manager?${params.toString()}`,
    { method: "GET" }
  )
  if (error) throw new Error(error.message || "Failed to get room")
  return data as { room: Room; members: RoomMember[] }
}

export async function listMyRooms() {
  const { data, error } = await insforge.functions.invoke("room-manager", {
    method: "GET",
  })
  if (error) throw new Error(error.message || "Failed to list rooms")
  return data as { rooms: Room[] }
}

export async function listActiveRooms() {
  const { data, error } = await insforge.functions.invoke(
    "room-manager?list_active=true",
    { method: "GET" }
  )
  if (error) throw new Error(error.message || "Failed to list active rooms")
  return data as { rooms: Room[] }
}

// ── Room Join/Leave ──

export async function joinRoom(roomCode: string) {
  const { data, error } = await insforge.functions.invoke("room-join", {
    method: "POST",
    body: { room_code: roomCode.toUpperCase() },
  })
  if (error) throw new Error(error.message || "Failed to join room")
  return data as { message: string; room: Room }
}

export async function leaveRoom(roomId: string) {
  const { data, error } = await insforge.functions.invoke("room-join", {
    method: "DELETE",
    body: { room_id: roomId },
  })
  if (error) throw new Error(error.message || "Failed to leave room")
  return data as { message: string }
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
  const { data, error } = await insforge.functions.invoke("persona-manager", {
    method: "POST",
    body: opts,
  })
  if (error) throw new Error(error.message || "Failed to create persona")
  return data as { persona: Persona }
}

export async function listPublicPersonas(subject?: string) {
  const params = new URLSearchParams({ public: "true" })
  if (subject) params.set("subject", subject)

  const { data, error } = await insforge.functions.invoke(
    `persona-manager?${params.toString()}`,
    { method: "GET" }
  )
  if (error) throw new Error(error.message || "Failed to list personas")
  return data as { personas: Persona[] }
}

export async function getPersona(personaId: string) {
  const { data, error } = await insforge.functions.invoke(
    `persona-manager?id=${personaId}`,
    { method: "GET" }
  )
  if (error) throw new Error(error.message || "Failed to get persona")
  return data as { persona: Persona }
}

export async function forkPersona(personaId: string) {
  const { data, error } = await insforge.functions.invoke("persona-manager", {
    method: "PATCH",
    body: { persona_id: personaId },
  })
  if (error) throw new Error(error.message || "Failed to fork persona")
  return data as { persona: Persona; forked_from: string }
}

// ── Chat ──

export async function sendMessage(roomId: string, message: string) {
  const { data, error } = await insforge.functions.invoke("chat-handler", {
    method: "POST",
    body: { room_id: roomId, message },
  })
  if (error) throw new Error(error.message || "Failed to send message")
  return data as ChatResponse
}

// ── Rewards ──

export async function recordReward(opts: {
  room_id: string
  persona_id: string
  topic: string
  understanding_score?: number
  message?: string
}) {
  const { data, error } = await insforge.functions.invoke("reward-handler", {
    method: "POST",
    body: { understanding_score: 1.0, ...opts },
  })
  if (error) throw new Error(error.message || "Failed to record reward")
  return data as RewardResponse
}

// ── Learning Adapter ──

export async function analyzeLearning(personaId: string) {
  const { data, error } = await insforge.functions.invoke("learning-adapter", {
    method: "POST",
    body: { persona_id: personaId },
  })
  if (error) throw new Error(error.message || "Failed to analyze learning")
  return data
}

// ── Realtime Helpers ──

export async function subscribeToRoom(roomId: string) {
  await insforge.realtime.connect()
  const roomSub = await insforge.realtime.subscribe(`room:${roomId}`)
  const presenceSub = await insforge.realtime.subscribe(`presence:${roomId}`)
  return { roomSub, presenceSub }
}

export function onRoomMessage(event: string, callback: (payload: any) => void) {
  insforge.realtime.on(event, callback)
}

export function offRoomMessage(event: string, callback: (payload: any) => void) {
  insforge.realtime.off(event, callback)
}

export function disconnectRealtime() {
  insforge.realtime.disconnect()
}
