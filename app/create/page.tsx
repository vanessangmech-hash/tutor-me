"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { joinRoom } from "@/lib/api"
import { 
  Plus, 
  Users, 
  Sparkles, 
  Zap,
  Lock,
  ArrowRight,
  Palette,
  Brain,
  Wand2,
  Play,
  Loader2
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

export default function CreatePage() {
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const { isLoggedIn } = useAuth()

  const handleJoinRoom = async () => {
    if (!joinCode.trim() || !isLoggedIn) return
    setIsJoining(true)
    setJoinError(null)
    try {
      const res = await joinRoom(joinCode)
      router.push(`/rooms/${res.room.id}`)
    } catch (err: any) {
      setJoinError(err.message || "Failed to join room")
      setIsJoining(false)
    }
  }

  const features = [
    { icon: Palette, title: "Custom Personas", desc: "Design your tutor's personality" },
    { icon: Brain, title: "Adaptive AI", desc: "Learns how you learn" },
    { icon: Users, title: "Invite Friends", desc: "Study together in real-time" },
    { icon: Wand2, title: "Create Your Tutor", desc: "Build your perfect study buddy" },
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
              Create or join a room to start learning with AI tutors
            </motion.p>
          </motion.div>

          {/* Main Cards */}
          <div className="mb-16 grid gap-8 md:grid-cols-2">
            {/* Create Room Card */}
            <motion.div
              initial={{ opacity: 0, x: -30, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={isLoggedIn ? { 
                scale: 1.02, 
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              } : {}}
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
                  whileHover={{ rotate: 90 }}
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Plus className="h-8 w-8 text-accent-foreground" />
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Create a Room
                </motion.h3>
                <p className="mt-2 mb-6 text-card/70">
                  Start a new learning session with an AI tutor and invite friends to join
                </p>

                {isLoggedIn ? (
                  <Button 
                    className="rounded-full bg-card text-foreground hover:bg-card/90"
                    onClick={() => router.push("/rooms?action=create")}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-card/60">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Sign in to create rooms</span>
                    </div>
                    <Button 
                      className="rounded-full bg-card text-foreground hover:bg-card/90"
                      onClick={() => setShowAuth(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Sign In to Create
                    </Button>
                  </div>
                )}
              </div>

              {/* Locked overlay for non-logged in users */}
              {!isLoggedIn && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-foreground/50 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
                      <Lock className="h-8 w-8 text-card" />
                    </div>
                    <p className="text-sm font-medium text-card">Sign in to unlock</p>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
            
            {/* Join Room Card */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={isLoggedIn ? { 
                scale: 1.02, 
                rotateY: -5,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)"
              } : {}}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <motion.div 
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-muted/50"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              />
              
              <div className="relative">
                <motion.div 
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                >
                  <Play className="ml-0.5 h-8 w-8 text-foreground" />
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold text-foreground"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  Join a Room
                </motion.h3>
                <p className="mt-2 mb-6 text-muted-foreground">
                  Enter a room code to join an existing study session with friends
                </p>
                
                {isLoggedIn ? (
                  <div className="space-y-2">
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
                        {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                        Join
                      </Button>
                    </div>
                    {joinError && (
                      <p className="text-xs text-destructive">{joinError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Sign in to join rooms</span>
                    </div>
                    <Button 
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setShowAuth(true)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Sign In to Join
                    </Button>
                  </div>
                )}
              </div>

              {/* Locked overlay for non-logged in users */}
              {!isLoggedIn && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 backdrop-blur-sm">
                      <Lock className="h-8 w-8 text-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Sign in to unlock</p>
                  </motion.div>
                </motion.div>
              )}
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
