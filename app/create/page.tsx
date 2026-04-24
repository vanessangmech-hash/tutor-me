"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  Users,
  Sparkles,
  ArrowRight,
  Palette,
  Brain,
  Wand2,
  School,
} from "lucide-react"

// Floating particles component
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-accent/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

const CLASSROOM_NAME_KEY = "classroom-name"

export default function CreatePage() {
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLASSROOM_NAME_KEY)
      if (stored) setDisplayName(stored)
    } catch {
      /* ignore */
    }
  }, [])

  const handleJoinClassroom = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const raw = classCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
    if (!raw) {
      setFormError("Enter a room code.")
      return
    }
    const name = displayName.trim()
    if (!name) {
      setFormError("Enter the name others will see in the classroom.")
      return
    }
    try {
      localStorage.setItem(CLASSROOM_NAME_KEY, name)
    } catch {
      setFormError("Could not save your name in this browser (storage blocked).")
      return
    }
    router.push(`/classroom/${raw}`)
  }

  const features = [
    { icon: Palette, title: "Custom Personas", desc: "Design your tutor's personality" },
    { icon: Brain, title: "Adaptive AI", desc: "Learns how you learn" },
    { icon: Users, title: "Invite Friends", desc: "Study together in real-time" },
    { icon: Wand2, title: "3D Classroom", desc: "Voice, chat, and whiteboard with your professor" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
            >
              Create
            </motion.span>
            <motion.h1
              className="mt-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {"Your Learning Space".split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg text-muted-foreground"
            >
              Enter a room code and your name to open the 3D classroom—no account required.
            </motion.p>
          </motion.div>

          {/* Join 3D classroom (same flow as /classroom/[roomCode]: code + display name) */}
          <div className="mb-16 mx-auto max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
              className="group relative overflow-hidden rounded-3xl bg-foreground p-8 text-card"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <FloatingParticles />
              <motion.div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-card/10" />

              <div className="relative">
                <motion.div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"
                  whileHover={{ rotate: -6 }}
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  <School className="h-8 w-8 text-accent-foreground" />
                </motion.div>

                <h3 className="text-2xl font-bold">Join a classroom</h3>
                <p className="mt-2 mb-6 text-card/70">
                  Use the room code you were given, then choose how you appear to others in chat and voice.
                </p>

                <form onSubmit={handleJoinClassroom} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-card/60">
                      Room code
                    </label>
                    <Input
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="e.g. ABC125"
                      value={classCode}
                      onChange={(e) =>
                        setClassCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                      }
                      className="h-12 rounded-xl border-0 bg-card/15 font-mono text-lg tracking-widest text-card placeholder:text-card/40 focus-visible:ring-accent"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-card/60">
                      Your name
                    </label>
                    <Input
                      placeholder="How should we call you?"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12 rounded-xl border-0 bg-card/15 text-card placeholder:text-card/40 focus-visible:ring-accent"
                      maxLength={64}
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-300" role="alert">
                      {formError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-card text-base font-medium text-foreground hover:bg-card/90"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enter classroom
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-card/50">
                  TutorMe account rooms live on{" "}
                  <Link href="/rooms" className="underline underline-offset-2 hover:text-card">
                    Learning Rooms
                  </Link>
                  .
                </p>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.h2
              className="mb-8 text-center text-2xl font-bold text-foreground"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              What you can do in your room
            </motion.h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)"
                  }}
                  className="group rounded-2xl border border-border bg-card p-6"
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                >
                  <motion.div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent"
                    animate={{ 
                      y: [0, -3, 0],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2.5 + i * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    <feature.icon className="h-6 w-6 text-accent-foreground" />
                  </motion.div>
                  <motion.h3 
                    className="font-semibold text-foreground"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA for non-logged in users */}
          {!isLoggedIn && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16"
            >
              <div className="relative overflow-hidden rounded-3xl bg-accent p-8 text-center">
                <motion.div
                  className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-foreground/10"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ repeat: Infinity, duration: 8 }}
                />
                <div className="relative">
                  <motion.div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-foreground/20"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Sparkles className="h-7 w-7 text-accent-foreground" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-accent-foreground">Ready to start learning?</h3>
                  <p className="mt-2 text-accent-foreground/70">
                    Sign up now to create and join learning rooms with AI tutors
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 rounded-full bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                    onClick={() => setShowAuth(true)}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
