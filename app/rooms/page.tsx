"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { rooms, recentSessions } from "@/lib/rooms-data"
import { tutors } from "@/lib/tutors-data"
import { 
  Plus, 
  Users, 
  Play, 
  Clock, 
  ArrowRight,
  Radio,
  Search,
  Sparkles,
  Zap
} from "lucide-react"

function RoomCard({ room, index }: { room: typeof rooms[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link 
        href={`/rooms/${room.id}`}
        className="group block overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-xl"
      >
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${room.thumbnail})` }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
          
          {/* Live Badge */}
          {room.isLive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </motion.div>
          )}
          
          {/* Participants */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
            <Users className="h-3.5 w-3.5" />
            {room.participants}/{room.maxParticipants}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-foreground">
            {room.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{room.tutorName}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
              {room.topic}
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

function SessionCard({ session, index }: { session: typeof recentSessions[0]; index: number }) {
  const tutor = tutors.find(t => t.id === session.tutorId)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-lg"
    >
      {/* Tutor Avatar */}
      <div 
        className="h-16 w-16 flex-shrink-0 rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${tutor?.thumbnail})` }}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{session.topic}</h4>
        <p className="text-sm text-muted-foreground">{session.tutorName}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{session.date}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration}
          </span>
        </div>
      </div>
      
      {/* Progress */}
      <div className="flex flex-col items-end gap-2">
        <span className="text-lg font-bold text-foreground">{session.progress}%</span>
        <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
          <motion.div 
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${session.progress}%` }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function RoomsPage() {
  const [joinCode, setJoinCode] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const liveRooms = rooms.filter(r => r.isLive)

  const handleCreateRoom = () => {
    // In real app, check if logged in
    const isLoggedIn = false
    if (!isLoggedIn) {
      setShowAuth(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
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
          
          {/* Quick Actions */}
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {/* Create Room Card */}
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
                <p className="mt-2 mb-6 text-card/70">
                  Start a new learning session with an AI tutor and invite friends
                </p>
                <Button 
                  className="rounded-full bg-card text-foreground hover:bg-card/90"
                  onClick={handleCreateRoom}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              </div>
            </motion.div>
            
            {/* Join Room Card */}
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
                <p className="mt-2 mb-6 text-muted-foreground">
                  Enter a room code to join an existing session
                </p>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Enter room code..." 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="h-12 rounded-full bg-muted/50 border-0"
                  />
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-full px-6 border-foreground/20"
                    onClick={() => setShowAuth(true)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Join
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Live Rooms */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">Live Now</h2>
                <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              </div>
              <Button variant="ghost" className="gap-2 rounded-full text-muted-foreground">
                <Search className="h-4 w-4" />
                Browse all
              </Button>
            </motion.div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          </section>
          
          {/* Continue Learning Banner */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <div className="relative overflow-hidden rounded-3xl bg-accent p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-foreground/10" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-accent-foreground">Continue Learning</h3>
                  <p className="mt-1 text-accent-foreground/70">Pick up where you left off in Calculus Fundamentals</p>
                </div>
                <Button 
                  size="lg" 
                  className="rounded-full bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                  asChild
                >
                  <Link href="/rooms/session-1">
                    <Play className="mr-2 h-4 w-4" />
                    Resume Session
                  </Link>
                </Button>
              </div>
            </div>
          </motion.section>
          
          {/* Recent Sessions */}
          <section>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 text-2xl font-bold text-foreground"
            >
              Recent Sessions
            </motion.h2>
            <div className="space-y-4">
              {recentSessions.map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
