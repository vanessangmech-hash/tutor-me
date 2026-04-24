"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Globe, Sparkles, Heart, Rocket, Brain } from "lucide-react"

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    bio: "Former ML engineer at Google, Stanford CS PhD"
  },
  {
    name: "Marcus Williams",
    role: "CTO & Co-founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "Ex-Meta, built AI systems serving 1B+ users"
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Product",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    bio: "Previously led education products at Coursera"
  },
  {
    name: "David Park",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    bio: "Award-winning designer, ex-Apple"
  }
]

const values = [
  {
    icon: Brain,
    title: "Learn Your Way",
    description: "Every learner is unique. Our AI adapts to your pace, style, and vibe."
  },
  {
    icon: Users,
    title: "Better Together",
    description: "Learning with friends hits different. Create rooms and grow together."
  },
  {
    icon: Sparkles,
    title: "AI That Gets You",
    description: "Our tutors understand how you learn and reinforce what works for you."
  },
  {
    icon: Heart,
    title: "Always Supportive",
    description: "No judgment, just encouragement. Your AI tutor is always in your corner."
  }
]

const stats = [
  { value: "2M+", label: "Active Learners" },
  { value: "150+", label: "Countries" },
  { value: "500K+", label: "Sessions Daily" },
  { value: "98%", label: "Satisfaction Rate" }
]

export default function AboutPage() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        {/* Hero */}
        <section className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
          >
            Our Mission
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-foreground lg:text-6xl"
          >
            Making learning{" "}
            <span className="italic">personal</span> and{" "}
            <span className="italic">fun</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl text-muted-foreground"
          >
            We believe everyone deserves a tutor who understands exactly how they learn. 
            That&apos;s why we built Tutor Me - customizable AI tutors that adapt to you. 
            Invite your friends, create your own room, and learn together with an AI that 
            reinforces and adapts to your style.
          </motion.p>
        </section>
        
        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="rounded-3xl bg-foreground p-8 text-center text-card"
              >
                <p className="text-4xl font-bold lg:text-5xl">{stat.value}</p>
                <p className="mt-2 text-card/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        {/* Story */}
        <section className="mx-auto mt-32 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                <Rocket className="h-6 w-6 text-accent-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            </div>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Tutor Me started at a hackathon in 2024, where our founders shared a common frustration: 
                traditional tutoring was expensive, impersonal, and didn&apos;t fit how they actually learned.
              </p>
              <p>
                We asked ourselves: what if you could have a personal AI tutor that <span className="font-medium text-foreground">actually gets you</span>? 
                Not just answers questions, but understands your learning style, speaks your language 
                (yes, even Gen Z slang), and adapts to what works best for you.
              </p>
              <p>
                We built Tutor Me as a virtual space where you can talk to AI agents that feel like 
                real tutors. Each user can join existing rooms or customize their own persona - whether 
                you want a hype coach, a chill professor, or someone who explains things like your coolest friend.
              </p>
              <p>
                The best part? <span className="font-medium text-foreground">You can learn with your friends</span>. 
                Create a room, invite your study group, and let your AI tutor guide everyone. 
                Our AI uses reinforced learning to understand what clicks with your group and adjusts in real-time.
              </p>
              <p>
                Today, over 2 million learners worldwide use Tutor Me to master everything from calculus 
                to coding, languages to leadership. And we&apos;re just getting started.
              </p>
            </div>
          </motion.div>
        </section>
        
        {/* Values */}
        <section className="mx-auto mt-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              What We Believe
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Our Values</h2>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-border bg-card p-8"
              >
                <motion.div 
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <value.icon className="h-7 w-7 text-accent-foreground" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Team */}
        <section className="mx-auto mt-32 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              The Crew
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Meet the Team</h2>
            <p className="mt-2 text-muted-foreground">The people making learning personal again</p>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-accent">{member.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* CTA - Join Our Mission */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-32 max-w-3xl text-center"
        >
          <div className="overflow-hidden rounded-3xl bg-foreground p-12 text-card">
            <motion.div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Globe className="h-8 w-8 text-accent-foreground" />
            </motion.div>
            <h2 className="text-3xl font-bold">Join our mission</h2>
            <p className="mt-4 text-card/70">
              We&apos;re building the future of personalized education. Whether you want to learn, 
              teach, or help us build - there&apos;s a place for you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setShowAuth(true)}
              >
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-card/20 text-card hover:bg-card/10"
              >
                View Careers
              </Button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
