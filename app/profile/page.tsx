"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
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
  Check
} from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: ["3 AI tutors", "2 rooms/month", "Basic analytics"],
    color: "bg-muted",
    textColor: "text-foreground",
    current: false
  },
  {
    name: "Student",
    price: "$9",
    description: "Most popular for students",
    features: ["Unlimited tutors", "10 rooms/month", "Advanced analytics", "Priority support"],
    color: "bg-foreground",
    textColor: "text-card",
    current: true
  },
  {
    name: "Professional",
    price: "$19",
    description: "For power learners",
    features: ["Everything in Student", "Unlimited rooms", "Custom tutors", "API access"],
    color: "bg-accent",
    textColor: "text-accent-foreground",
    current: false
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
  const savedTutors = tutors.slice(0, 4)

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
            className="relative mb-12 overflow-hidden rounded-3xl bg-foreground p-8 text-card"
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
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
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
                  <h1 className="text-3xl font-bold">Alex Johnson</h1>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Student Plan
                  </span>
                </div>
                <p className="mt-1 text-card/70">alex.johnson@email.com</p>
                <p className="mt-2 text-sm text-card/60">Learning since January 2024</p>
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
          
          {/* Stats Grid */}
          <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
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
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-2xl font-bold text-foreground">Your Plan</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl p-6 ${plan.color} ${plan.textColor} ${
                    plan.current ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  {plan.current && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-card/20 px-2 py-0.5 text-xs font-medium">
                      <Zap className="h-3 w-3" />
                      Current
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm opacity-70">{plan.description}</p>
                  <p className="mt-4 text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal opacity-70">/mo</span>
                  </p>
                  
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {!plan.current && (
                    <Button
                      className={`mt-6 w-full rounded-full ${
                        plan.name === "Professional" 
                          ? "bg-accent-foreground text-accent hover:bg-accent-foreground/90" 
                          : "bg-foreground text-card hover:bg-foreground/90"
                      }`}
                    >
                      {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Achievements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="mb-6 flex items-center justify-between">
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
                  transition={{ delay: 0.6 + i * 0.1 }}
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
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
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
            transition={{ delay: 0.7 }}
          >
            <div className="mb-6 flex items-center justify-between">
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
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${tutor.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
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
