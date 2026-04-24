"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Globe, Sparkles, Heart } from "lucide-react"

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
    icon: Sparkles,
    title: "Innovation First",
    description: "We push the boundaries of what's possible in AI-powered education."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Learning is better together. We build for collaboration."
  },
  {
    icon: Globe,
    title: "Accessible to All",
    description: "Quality education should be available to everyone, everywhere."
  },
  {
    icon: Heart,
    title: "Student Centered",
    description: "Every decision we make starts with the learner in mind."
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-foreground lg:text-6xl"
          >
            Making learning{" "}
            <span className="italic">personal</span> again
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl text-muted-foreground"
          >
            We believe everyone deserves a tutor who understands exactly how they learn. 
            That's why we built LearnSync - AI tutors that adapt to you.
          </motion.p>
        </section>
        
        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
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
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
              <p>
                LearnSync started in a Stanford dorm room in 2023, when our founders realized 
                that the most effective learning happens one-on-one with a great tutor - but 
                that experience was inaccessible to most people.
              </p>
              <p>
                We asked ourselves: what if AI could be that tutor? Not a replacement for human 
                connection, but a complement - available 24/7, infinitely patient, and perfectly 
                adapted to each learner's unique style.
              </p>
              <p>
                Today, LearnSync helps over 2 million learners worldwide master everything from 
                calculus to coding, languages to leadership. And we're just getting started.
              </p>
            </div>
          </motion.div>
        </section>
        
        {/* Values */}
        <section className="mx-auto mt-32 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-bold text-foreground"
          >
            Our Values
          </motion.h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border border-border bg-card p-8"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <value.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Team */}
        <section className="mx-auto mt-32 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-bold text-foreground"
          >
            Meet the Team
          </motion.h2>
          
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
        
        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-32 max-w-3xl text-center"
        >
          <div className="rounded-3xl bg-foreground p-12 text-card">
            <h2 className="text-3xl font-bold">Join our mission</h2>
            <p className="mt-4 text-card/70">
              We're always looking for passionate people to help us transform education.
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
