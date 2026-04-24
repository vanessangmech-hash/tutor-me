"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { tutors } from "@/lib/tutors-data"
import { ArrowRight, Users, GraduationCap, Sparkles, Play, ChevronRight } from "lucide-react"

function HeroCard({ 
  className, 
  delay = 0 
}: { 
  className?: string
  delay?: number 
}) {
  return (
    <div 
      className={`rounded-2xl bg-card p-4 shadow-lg ${className}`}
      style={{ 
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20" />
        <div className="space-y-1">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-2 w-16 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-3/4 rounded bg-muted" />
      </div>
    </div>
  )
}

function TutorPreviewCard({ tutor }: { tutor: typeof tutors[0] }) {
  return (
    <Link href="/tutors" className="group block flex-shrink-0">
      <div className="relative h-48 w-36 overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tutor.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm font-medium text-white">{tutor.subject}</p>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-16 flex-1 lg:ml-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-20 lg:px-12 lg:py-32">
          {/* Background Gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Learning
                </div>
                
                <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
                  Learn with tutors that adapt to{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    your style
                  </span>
                </h1>
                
                <p className="max-w-lg text-pretty text-lg text-muted-foreground">
                  Join multiplayer classrooms with AI tutors that understand how you learn. 
                  Create rooms, collaborate with peers, and master any subject.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="gap-2 rounded-xl" asChild>
                    <Link href="/rooms">
                      Create Room
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 rounded-xl" asChild>
                    <Link href="/rooms">
                      <Play className="h-4 w-4" />
                      Join Room
                    </Link>
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">50K+</p>
                    <p className="text-sm text-muted-foreground">Active Learners</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">100+</p>
                    <p className="text-sm text-muted-foreground">AI Tutors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4.9</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </div>
              
              {/* Right - Floating Cards */}
              <div className="relative hidden h-[500px] lg:block">
                <style jsx>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                  }
                `}</style>
                <HeroCard className="absolute left-0 top-0 w-64" delay={0} />
                <HeroCard className="absolute right-0 top-20 w-56" delay={1} />
                <HeroCard className="absolute bottom-20 left-10 w-60" delay={2} />
                <HeroCard className="absolute bottom-0 right-10 w-52" delay={0.5} />
              </div>
            </div>
          </div>
        </section>
        
        {/* Tutor Preview Section */}
        <section className="border-t border-border bg-card/50 px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Popular Tutors</h2>
                <p className="mt-1 text-muted-foreground">Discover AI tutors loved by learners</p>
              </div>
              <Button variant="ghost" className="gap-1" asChild>
                <Link href="/tutors">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {tutors.slice(0, 8).map((tutor) => (
                <TutorPreviewCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <p className="mt-2 text-muted-foreground">Get started in three simple steps</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: "Create a Room",
                  description: "Start a multiplayer classroom and invite friends or join an existing session."
                },
                {
                  icon: GraduationCap,
                  title: "Choose Your Tutor",
                  description: "Browse AI tutors specialized in your subject and learning style."
                },
                {
                  icon: Sparkles,
                  title: "Learn Together",
                  description: "Collaborate with peers while your AI tutor guides the session."
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Create Your Own Tutor Section */}
        <section className="border-t border-border bg-card/50 px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Create Your Own Tutor</h2>
            <p className="mt-2 text-muted-foreground">
              Customize an AI tutor for your specific needs
            </p>
            
            <div className="mt-10 rounded-2xl border border-border bg-card p-8">
              <div className="space-y-6">
                <div className="text-left">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    What subject should your tutor specialize in?
                  </label>
                  <Input 
                    placeholder="e.g., Advanced Calculus, Machine Learning, Spanish..." 
                    className="rounded-xl"
                  />
                </div>
                
                <div className="text-left">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Teaching Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Visual", "Step-by-step", "Conversational", "Project-based", "Quiz-focused"].map((style) => (
                      <button
                        key={style}
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button size="lg" className="w-full rounded-xl">
                  Create Custom Tutor
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-6 py-24 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to transform how you learn?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of learners already using LearnSync to master new skills.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="gap-2 rounded-xl" asChild>
                <Link href="/tutors">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-border px-6 py-8 lg:px-12">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">L</span>
              </div>
              <span className="font-semibold text-foreground">LearnSync</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with AI, for learners everywhere.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
