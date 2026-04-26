"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { 
  Plus, 
  Users, 
  Sparkles, 
  Zap,
  ArrowRight,
  Palette,
  Brain,
  Wand2,
  Play
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
  const [showAuth, setShowAuth] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const { isLoggedIn, isLoading } = useAuth()

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
          <div className="relative mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Create Room Card */}
              <motion.div
                initial={{ opacity: 0, x: -30, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{
                  scale: 1.02,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
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

                  <Button
                    className="rounded-full bg-card text-foreground hover:bg-card/90"
                    asChild
                  >
                    <Link href="/rooms?action=create">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Room
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Join Room Card */}
              <motion.div
                initial={{ opacity: 0, x: 30, rotateY: 10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{
                  scale: 1.02,
                  rotateY: -5,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)"
                }}
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

                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter room code..."
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="h-12 rounded-full border-0 bg-muted/50"
                    />
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-foreground/20 px-6"
                      asChild
                    >
                      <Link href={joinCode.trim() ? `/classroom/${joinCode.trim().toUpperCase()}` : '#'}>
                        <Zap className="mr-2 h-4 w-4" />
                        Join
                      </Link>
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

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
