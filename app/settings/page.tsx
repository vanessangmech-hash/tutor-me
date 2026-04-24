"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  Camera
} from "lucide-react"

const settingsSections = [
  {
    id: "profile",
    icon: User,
    title: "Profile Settings",
    description: "Update your personal information"
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Manage your notification preferences"
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Privacy & Security",
    description: "Control your privacy settings"
  },
  {
    id: "appearance",
    icon: Palette,
    title: "Appearance",
    description: "Customize how LearnSync looks"
  }
]

export default function SettingsPage() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/profile"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
          </motion.div>
          
          {/* Profile Form */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-3xl border border-border bg-card p-8"
          >
            <h2 className="mb-6 text-xl font-bold text-foreground">Profile Information</h2>
            
            <div className="mb-8 flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-card shadow-lg transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Change Avatar
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input defaultValue="Alex" className="h-12 rounded-xl bg-muted/50 border-0" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input defaultValue="Johnson" className="h-12 rounded-xl bg-muted/50 border-0" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input defaultValue="alex.johnson@email.com" type="email" className="h-12 rounded-xl bg-muted/50 border-0" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Bio
                </label>
                <textarea
                  defaultValue="Passionate learner exploring AI, mathematics, and creative writing."
                  className="h-24 w-full resize-none rounded-xl bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button className="rounded-full px-8">Save Changes</Button>
            </div>
          </motion.section>
          
          {/* Settings Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {settingsSections.map((section, i) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ x: 5 }}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            ))}
          </motion.div>
          
          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 rounded-3xl border border-destructive/20 bg-destructive/5 p-8"
          >
            <h2 className="mb-2 text-xl font-bold text-foreground">Sign Out</h2>
            <p className="mb-6 text-muted-foreground">
              Sign out of your LearnSync account on this device.
            </p>
            <Button 
              variant="outline" 
              className="gap-2 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
