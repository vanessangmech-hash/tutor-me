"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
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
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

function RoomCard({ room }: { room: typeof rooms[0] }) {
  return (
    <Link 
      href={`/rooms/${room.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative h-36 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${room.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Live Badge */}
        {room.isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </div>
        )}
        
        {/* Participants */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Users className="h-3.5 w-3.5" />
          {room.participants}/{room.maxParticipants}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {room.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{room.tutorName}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {room.topic}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  )
}

function SessionCard({ session }: { session: typeof recentSessions[0] }) {
  const tutor = tutors.find(t => t.id === session.tutorId)
  
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md">
      {/* Tutor Avatar */}
      <div 
        className="h-14 w-14 flex-shrink-0 rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${tutor?.thumbnail})` }}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{session.topic}</h4>
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
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium text-foreground">{session.progress}%</span>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div 
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${session.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  const [joinCode, setJoinCode] = useState("")
  const liveRooms = rooms.filter(r => r.isLive)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-16 flex-1 px-6 py-8 lg:ml-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
              <p className="mt-1 text-muted-foreground">Join live sessions or create your own</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {/* Create Room Card */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Create a Room</h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Start a new learning session with an AI tutor
              </p>
              <Button className="rounded-xl" asChild>
                <Link href="/rooms/create">Create Room</Link>
              </Button>
            </div>
            
            {/* Join Room Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Play className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Join a Room</h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Enter a room code to join an existing session
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter room code..." 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="rounded-xl"
                />
                <Button variant="outline" className="rounded-xl px-6">
                  Join
                </Button>
              </div>
            </div>
          </div>
          
          {/* Live Rooms */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Live Now</h2>
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <Search className="h-4 w-4" />
                Browse all
              </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </section>
          
          {/* Continue Learning */}
          <section className="mb-10">
            <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex-1">
                <h3 className="text-xl font-bold">Continue Learning</h3>
                <p className="mt-1 text-white/80">Pick up where you left off</p>
              </div>
              <Button 
                size="lg" 
                className="rounded-xl bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href={`/rooms/session-1`}>
                  Resume Session
                </Link>
              </Button>
            </div>
          </section>
          
          {/* Recent Sessions */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
