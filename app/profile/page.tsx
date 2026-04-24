"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { tutors } from "@/lib/tutors-data"
import { recentSessions } from "@/lib/rooms-data"
import { 
  Clock, 
  BookOpen, 
  Trophy, 
  Flame,
  Heart,
  ChevronRight,
  Settings
} from "lucide-react"
import Link from "next/link"

const savedTutors = tutors.slice(0, 4)

const stats = [
  { label: "Hours Learned", value: "47.5", icon: Clock, color: "text-blue-500" },
  { label: "Sessions", value: "32", icon: BookOpen, color: "text-green-500" },
  { label: "Achievements", value: "8", icon: Trophy, color: "text-amber-500" },
  { label: "Day Streak", value: "12", icon: Flame, color: "text-orange-500" },
]

const progressData = [
  { subject: "Mathematics", progress: 75, hours: 18 },
  { subject: "Programming", progress: 60, hours: 14 },
  { subject: "Physics", progress: 45, hours: 10 },
  { subject: "Languages", progress: 30, hours: 5.5 },
]

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-16 flex-1 px-6 py-8 lg:ml-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="mb-10 flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
                  JD
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background bg-green-500">
                  <span className="text-xs font-bold text-white">12</span>
                </div>
              </div>
              
              {/* Info */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
                <p className="text-muted-foreground">john.doe@email.com</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Member since January 2024
                </p>
              </div>
            </div>
            
            <Button variant="outline" className="gap-2 rounded-xl" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
          
          {/* Stats Grid */}
          <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {/* Learning Progress */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Learning Progress</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="space-y-6">
                {progressData.map((item) => (
                  <div key={item.subject}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-foreground">{item.subject}</span>
                      <span className="text-sm text-muted-foreground">{item.hours}h learned</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-xs text-muted-foreground">
                      {item.progress}% complete
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Saved Tutors */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Saved Tutors</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                <Link href="/tutors">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {savedTutors.map((tutor) => (
                <Link 
                  key={tutor.id}
                  href="/tutors"
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div 
                    className="h-32 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${tutor.thumbnail})` }}
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-foreground text-sm truncate">{tutor.name}</h3>
                    <p className="text-xs text-muted-foreground">{tutor.subject}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          
          {/* Past Sessions */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Past Sessions</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const tutor = tutors.find(t => t.id === session.tutorId)
                
                return (
                  <div 
                    key={session.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <div 
                      className="h-12 w-12 flex-shrink-0 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${tutor?.thumbnail})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{session.topic}</h4>
                      <p className="text-sm text-muted-foreground">{session.tutorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{session.duration}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
