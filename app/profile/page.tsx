"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { tutors } from "@/lib/tutors-data"
import { 
  Settings, 
  Star, 
  Clock, 
  Trophy, 
  Flame,
  BookOpen,
  Target,
  ChevronRight,
  Crown,
  Zap,
  Play
} from "lucide-react"

const recentSessions = [
  {
    id: "1",
    tutorName: "MathMaven",
    subject: "Calculus",
    date: "Today, 2:30 PM",
    duration: "45 min",
    progress: 78,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop"
  },
  {
    id: "2",
    tutorName: "CodeKing",
    subject: "Python Basics",
    date: "Yesterday",
    duration: "1h 20min",
    progress: 92,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop"
  },
  {
    id: "3",
    tutorName: "PhysicsPhenom",
    subject: "Quantum Mechanics",
    date: "2 days ago",
    duration: "55 min",
    progress: 45,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=100&h=100&fit=crop"
  },
  {
    id: "4",
    tutorName: "SpanishSlay",
    subject: "Conversational Spanish",
    date: "3 days ago",
    duration: "30 min",
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1489945052260-4f21c52571bf?w=100&h=100&fit=crop"
  }
]

const stats = [
  { label: "Hours Learned", value: "127", icon: Clock },
  { label: "Sessions", value: "48", icon: BookOpen },
  { label: "Day Streak", value: "23", icon: Flame },
  { label: "Achievements", value: "12", icon: Trophy }
]

const achievements = [
  { name: "Early Bird", description: "Complete 5 morning sessions", progress: 100 },
  { name: "Night Owl", description: "Study past midnight", progress: 100 },
  { name: "Consistency King", description: "30 day streak", progress: 76 },
  { name: "Subject Master", description: "Complete all calculus modules", progress: 45 }
]

export default function ProfilePage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const savedTutors = tutors.slice(0, 4)

  // Redirect to home if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuth(true)
    }
  }, [isLoggedIn])

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "professional":
        return "bg-accent text-accent-foreground"
      case "student":
        return "bg-foreground text-card"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "professional":
        return "Professional"
      case "student":
        return "Student"
      default:
        return "Free"
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onAuthClick={() => setShowAuth(true)} />
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => {
            setShowAuth(false)
            router.push("/")
          }}
          onSuccess={() => setShowAuth(false)}
        />
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground">Please sign in to view your profile</h2>
            <Button className="mt-4 rounded-full" onClick={() => setShowAuth(true)}>
              Sign In
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 overflow-hidden rounded-3xl bg-foreground p-8 text-card"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-card/5" />
            
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
                className="relative"
              >
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-muted ring-4 ring-card/20">
                  <Image
                    src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Crown className="h-4 w-4" />
                </div>
              </motion.div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPlanColor(user?.plan || "free")}`}>
                    {getPlanLabel(user?.plan || "free")} Plan
                  </span>
                </div>
                <p className="mt-1 text-card/70">{user?.email}</p>
                <p className="mt-2 text-sm text-card/60">Learning since {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              </div>
              
              {/* Actions */}
              <Button
                variant="secondary"
                className="rounded-full bg-card/10 text-card hover:bg-card/20"
                asChild
              >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Recent Sessions with Progress */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Recent Sessions</h2>
              <Button variant="ghost" className="gap-1 rounded-full">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                    <Image
                      src={session.thumbnail}
                      alt={session.tutorName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-5 w-5 text-card" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{session.tutorName}</h4>
                      <span className="text-sm text-muted-foreground">• {session.subject}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{session.date}</span>
                      <span>• {session.duration}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{session.progress}%</p>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                    <div className="h-12 w-12">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-muted"
                        />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="text-accent"
                          strokeDasharray={88}
                          initial={{ strokeDashoffset: 88 }}
                          animate={{ strokeDashoffset: 88 - (88 * session.progress) / 100 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <stat.icon className="h-6 w-6 text-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Current Plan */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Plan</h2>
              <Button variant="ghost" className="gap-1 rounded-full" asChild>
                <Link href="/pricing">
                  Upgrade
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className={`relative overflow-hidden rounded-3xl p-6 ${getPlanColor(user?.plan || "free")}`}>
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-card/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {user?.plan === "professional" ? (
                      <Crown className="h-6 w-6" />
                    ) : user?.plan === "student" ? (
                      <Zap className="h-6 w-6" />
                    ) : (
                      <Star className="h-6 w-6" />
                    )}
                    <h3 className="text-2xl font-bold">{getPlanLabel(user?.plan || "free")}</h3>
                  </div>
                  <p className="mt-1 opacity-70">
                    {user?.plan === "professional" 
                      ? "Unlimited access to all features"
                      : user?.plan === "student"
                        ? "Great for students"
                        : "Basic access to tutors"}
                  </p>
                </div>
                {user?.plan !== "professional" && (
                  <Button
                    className="rounded-full bg-card text-foreground hover:bg-card/90"
                    asChild
                  >
                    <Link href="/pricing">Upgrade</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.section>
          
          {/* Achievements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
              <Button variant="ghost" className="gap-1 rounded-full">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    achievement.progress === 100 ? "bg-accent" : "bg-muted"
                  }`}>
                    <Target className={`h-7 w-7 ${
                      achievement.progress === 100 ? "text-accent-foreground" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ delay: 0.9 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {achievement.progress}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Saved Tutors */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Saved Tutors</h2>
              <Button variant="ghost" className="gap-1 rounded-full" asChild>
                <Link href="/tutors">
                  Browse more
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {savedTutors.map((tutor, i) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${tutor.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="mb-1 inline-block rounded-full bg-accent/80 px-2 py-0.5 text-xs text-accent-foreground">
                      {tutor.persona}
                    </span>
                    <p className="font-semibold text-card">{tutor.name}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-card/70">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {tutor.rating}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
