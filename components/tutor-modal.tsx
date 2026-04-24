"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { type Tutor } from "@/lib/tutors-data"
import { createRoom, createPersona, forkPersona } from "@/lib/api"
import { X, Star, Users, Heart, Play, Loader2, GitFork } from "lucide-react"

interface TutorModalProps {
  tutor: Tutor | null
  onClose: () => void
}

export function TutorModal({ tutor, onClose }: TutorModalProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isForking, setIsForking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (tutor) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [tutor, onClose])

  const handleStartLearning = async () => {
    if (!tutor) return
    setIsCreating(true)
    setError(null)

    try {
      let personaId = tutor.id

      // If the tutor ID is a short numeric ID (from static data), create a backend persona first
      if (tutor.id.length < 10) {
        const res = await createPersona({
          name: tutor.name,
          subject: tutor.subject,
          system_prompt: `You are ${tutor.name}, a ${tutor.subject} professor. ${tutor.personality} ${tutor.description}`,
          personality_traits: {
            persona_label: tutor.persona,
            personality: tutor.personality,
            thumbnail: tutor.thumbnail,
            videoPreview: tutor.videoPreview,
            category: tutor.category,
          },
          teaching_style: { approach: "adaptive", detail_level: "moderate", encouragement: true },
          is_public: true,
        })
        personaId = res.persona.id
      }

      const roomRes = await createRoom(personaId)
      onClose()
      router.push(`/rooms/${roomRes.room.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleFork = async () => {
    if (!tutor || tutor.id.length < 10) return
    setIsForking(true)
    setError(null)

    try {
      const res = await forkPersona(tutor.id)
      const forkedRoom = await createRoom(res.persona.id)
      onClose()
      router.push(`/rooms/${forkedRoom.room.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to fork persona")
    } finally {
      setIsForking(false)
    }
  }

  return (
    <AnimatePresence>
      {tutor && (
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 z-50 mx-auto my-auto max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-card shadow-2xl lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 text-card backdrop-blur-sm transition-all hover:scale-110 hover:bg-foreground/40"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-72 w-full overflow-hidden">
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${tutor.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/30 to-transparent" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-6"
              >
                <span className="rounded-full bg-accent px-4 py-2 text-lg font-bold text-accent-foreground">
                  {tutor.subject}
                </span>
              </motion.div>
            </div>

            <div className="overflow-y-auto p-6 lg:p-8" style={{ maxHeight: "calc(90vh - 18rem)" }}>
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {tutor.name}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {tutor.tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-bold text-foreground">{tutor.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{tutor.sessions.toLocaleString()}</span>
                  <span className="text-muted-foreground">sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{tutor.saves.toLocaleString()}</span>
                  <span className="text-muted-foreground">saves</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-6 rounded-2xl bg-accent/10 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                    {tutor.persona}
                  </span>
                  <span className="text-sm text-muted-foreground">Persona</span>
                </div>
                <p className="italic text-foreground">
                  &ldquo;{tutor.personality}&rdquo;
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 leading-relaxed text-muted-foreground"
              >
                {tutor.description}
              </motion.p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button
                  size="lg"
                  className="flex-1 gap-2 rounded-full"
                  onClick={handleStartLearning}
                  disabled={isCreating || isForking}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isCreating ? "Creating Room..." : "Start Learning"}
                </Button>
                {tutor.id.length >= 10 && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 rounded-full"
                    onClick={handleFork}
                    disabled={isCreating || isForking}
                  >
                    {isForking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GitFork className="h-4 w-4" />
                    )}
                    Fork
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
