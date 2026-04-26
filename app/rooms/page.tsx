"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  listPublicPersonas,
  type Persona,
} from "@/lib/api"
import type { PersonaConfig } from "@/types/classroom"

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

function storeRoomPersona(code: string, persona: PersonaConfig) {
  try {
    localStorage.setItem(`room-persona-${code}`, JSON.stringify(persona))
    const existing: string[] = JSON.parse(localStorage.getItem("created-rooms") || "[]")
    if (!existing.includes(code)) {
      localStorage.setItem("created-rooms", JSON.stringify([...existing, code]))
    }
  } catch {}
}

async function checkRoomActive(code: string): Promise<boolean> {
  try {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999"
    const protocol = host.startsWith("localhost") ? "http" : "https"
    const res = await fetch(`${protocol}://${host}/parties/main/${code}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return false
    const data = await res.json()
    return data.active === true
  } catch {
    return false
  }
}
import {
  Plus,
  Users,
  Play,
  ArrowRight,
  Radio,
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Loader2,
} from "lucide-react"

function RoomsLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  )
}

function LocalRoomCard({ code, persona, index }: { code: string; persona: PersonaConfig | null; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/classroom/${code}`}
        className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl"
      >
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-accent/40" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </motion.div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground">
            {persona?.name || "AI Tutor"} Room
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {persona?.subject || "General"}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground font-mono">
              {code}
            </span>
            <motion.div
              whileHover={{ x: 5 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-card"
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const DR_CHEN_DEFAULT: Persona = {
  id: "demo-dr-chen",
  creator_id: "system",
  name: "Dr. Chen",
  subject: "Chemistry",
  system_prompt:
    "You are Dr. Chen, an engaging chemistry professor. Adapt to the learner's style. Ask Socratic questions. Celebrate understanding.",
  personality_traits: {
    persona_label: "Engaging Professor",
    personality: "Warm, encouraging, and methodical",
  },
  teaching_style: { approach: "socratic", detail_level: "moderate", encouragement: true },
  is_public: true,
  total_rewards: 0,
  times_used: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function PersonaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (persona: Persona) => void
}) {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    listPublicPersonas()
      .then((res) => setPersonas(res.personas || []))
      .catch(() => setPersonas([]))
      .finally(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const allPersonas = personas.some((p) => p.id === DR_CHEN_DEFAULT.id)
    ? personas
    : [DR_CHEN_DEFAULT, ...personas]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div className="max-h-[80vh] overflow-hidden rounded-3xl bg-card shadow-2xl">
          <div className="border-b border-border p-6">
            <h2 className="text-xl font-bold text-foreground">Choose a Tutor Persona</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a persona for your AI professor
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {allPersonas.map((p) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(p)}
                    className="rounded-2xl border border-border p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted/50"
                  >
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.subject}</p>
                    {p.id === DR_CHEN_DEFAULT.id ? (
                      <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                        Default
                      </span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-foreground">
                        {p.total_rewards} rewards
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<RoomsLoadingFallback />}>
      <RoomsPageContent />
    </Suspense>
  )
}

function RoomsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [joinCode, setJoinCode] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const [showPersonaPicker, setShowPersonaPicker] = useState(false)
  const [localRooms, setLocalRooms] = useState<{ code: string; persona: PersonaConfig | null }[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn, isLoading } = useAuth()

  const loadLocalRooms = useCallback(() => {
    try {
      const codes: string[] = JSON.parse(localStorage.getItem("created-rooms") || "[]")
      const rooms = codes.map((code) => {
        try {
          const stored = localStorage.getItem(`room-persona-${code}`)
          return { code, persona: stored ? (JSON.parse(stored) as PersonaConfig) : null }
        } catch {
          return { code, persona: null }
        }
      })
      setLocalRooms(rooms.reverse())
    } catch {
      setLocalRooms([])
    }
  }, [])

  useEffect(() => {
    loadLocalRooms()
  }, [loadLocalRooms])

  useEffect(() => {
    if (searchParams.get("action") === "create" && isLoggedIn) {
      setShowPersonaPicker(true)
    }
  }, [searchParams, isLoggedIn])

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      setShowAuth(true)
      return
    }
    setShowPersonaPicker(true)
  }

  const handlePersonaSelected = (persona: Persona) => {
    setShowPersonaPicker(false)
    setIsCreating(true)
    setError(null)
    try {
      const code = generateRoomCode()
      const personaConfig: PersonaConfig = {
        id: persona.id,
        name: persona.name,
        subject: persona.subject,
        systemPrompt: persona.system_prompt,
        avatarColor: "#a78bfa",
      }
      storeRoomPersona(code, personaConfig)
      router.push(`/classroom/${code}`)
    } catch (err: any) {
      setError(err.message || "Failed to create room")
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    if (!isLoggedIn) {
      setShowAuth(true)
      return
    }
    setIsJoining(true)
    setError(null)
    const active = await checkRoomActive(code)
    if (!active) {
      setError("Room not found. Ask the host for the correct code.")
      setIsJoining(false)
      return
    }
    router.push(`/classroom/${code}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <PersonaPickerModal
        isOpen={showPersonaPicker}
        onClose={() => setShowPersonaPicker(false)}
        onSelect={handlePersonaSelected}
      />

      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Learning Rooms
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join live sessions or create your own collaborative space
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-8 max-w-xl rounded-2xl bg-destructive/10 px-6 py-4 text-center text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          <div className="relative mb-16">
            <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl bg-foreground p-8 text-card"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 transition-transform group-hover:scale-150" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-card/10" />

              <div className="relative">
                <motion.div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="h-7 w-7 text-accent-foreground" />
                </motion.div>
                <h3 className="text-2xl font-bold">Create a Room</h3>
                <p className="mb-6 mt-2 text-card/70">
                  Start a new learning session with an AI tutor and invite friends
                </p>
                <Button
                  className="rounded-full bg-card text-foreground hover:bg-card/90"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-muted/50 transition-transform group-hover:scale-150" />

              <div className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Play className="ml-0.5 h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Join a Room</h3>
                <p className="mb-6 mt-2 text-muted-foreground">
                  Enter a room code to join an existing session
                </p>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter room code..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                    className="h-12 rounded-full border-0 bg-muted/50 font-mono uppercase"
                    maxLength={8}
                  />
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-foreground/20 px-6"
                    onClick={handleJoinRoom}
                    disabled={isJoining || !joinCode.trim()}
                  >
                    {isJoining ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    {isJoining ? "Checking..." : "Join"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

            {!isLoading && !isLoggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl bg-background/75 backdrop-blur-md"
              >
                <p className="text-xl font-semibold text-foreground">Sign in to continue</p>
                <Button onClick={() => setShowAuth(true)} className="rounded-full px-8">
                  Sign in
                </Button>
              </motion.div>
            )}
          </div>

          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">Live Now</h2>
                <span className="flex h-3 w-3 animate-pulse rounded-full bg-red-500" />
              </div>
              <Button variant="ghost" className="gap-2 rounded-full text-muted-foreground">
                <Search className="h-4 w-4" />
                Browse all
              </Button>
            </motion.div>

            {localRooms.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {localRooms.map((room, i) => (
                  <LocalRoomCard key={room.code} code={room.code} persona={room.persona} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border-2 border-dashed border-border p-12 text-center"
              >
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground">No live rooms yet</h3>
                <p className="mt-1 text-muted-foreground">
                  Be the first to create a learning room!
                </p>
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
