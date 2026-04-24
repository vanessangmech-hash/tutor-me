"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  LogOut
} from "lucide-react"
import Link from "next/link"

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
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-16 flex-1 px-6 py-8 lg:ml-20 lg:px-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/profile"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
          </div>
          
          {/* Profile Form */}
          <section className="mb-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Profile Information</h2>
            
            <div className="mb-6 flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                JD
              </div>
              <div>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Change Avatar
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  First Name
                </label>
                <Input defaultValue="John" className="rounded-xl" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Last Name
                </label>
                <Input defaultValue="Doe" className="rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input defaultValue="john.doe@email.com" type="email" className="rounded-xl" />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button className="rounded-xl">Save Changes</Button>
            </div>
          </section>
          
          {/* Settings Sections */}
          <div className="space-y-3">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Danger Zone */}
          <div className="mt-10 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Sign Out</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Sign out of your LearnSync account on this device.
            </p>
            <Button variant="outline" className="gap-2 rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
