"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue, useAnimationFrame } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { tutors } from "@/lib/tutors-data"
import { ArrowRight, Play, Sparkles, Users, Zap, Target, Star, ChevronRight, MessageCircle, Palette, Brain, Wand2 } from "lucide-react"

// Animated 3D Tutor Character that follows mouse
function AnimatedTutor() {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        setMousePosition({
          x: (e.clientX - centerX) / 20,
          y: (e.clientY - centerY) / 20,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Random jump animation
  useEffect(() => {
    const jumpInterval = setInterval(() => {
      setIsJumping(true)
      setTimeout(() => setIsJumping(false), 500)
    }, 4000)
    return () => clearInterval(jumpInterval)
  }, [])

  return (
    <motion.div
      ref={ref}
      className="relative h-[450px] w-[450px] lg:h-[550px] lg:w-[550px]"
      animate={{
        rotateX: mousePosition.y,
        rotateY: -mousePosition.x,
        y: isJumping ? -30 : 0,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 30,
        y: { type: "spring", stiffness: 500, damping: 15 }
      }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      {/* Floating rings around tutor */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      />
      
      {/* Floating elements */}
      <motion.div
        className="absolute -right-4 top-20 rounded-2xl bg-accent p-3 shadow-lg"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Brain className="h-6 w-6 text-accent-foreground" />
      </motion.div>
      <motion.div
        className="absolute -left-8 top-32 rounded-2xl bg-foreground p-3 shadow-lg"
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
      >
        <Sparkles className="h-6 w-6 text-card" />
      </motion.div>
      <motion.div
        className="absolute -right-10 bottom-32 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-border"
        animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
      >
        <MessageCircle className="h-6 w-6 text-foreground" />
      </motion.div>
      
      {/* Speech bubble */}
      <motion.div
        className="absolute -right-20 top-10 rounded-2xl bg-card px-4 py-3 shadow-lg ring-1 ring-border"
        initial={{ opacity: 0, scale: 0, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
      >
        <p className="text-sm font-medium text-foreground">Hey bestie! Ready to learn?</p>
        <div className="absolute -left-2 top-4 h-4 w-4 rotate-45 bg-card ring-1 ring-border" />
      </motion.div>

      {/* Main 3D cartoon tutor image - pops off the page */}
      <motion.div
        className="absolute inset-0"
        animate={{ 
          scale: [1, 1.02, 1],
          rotateZ: [0, 1, -1, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "easeInOut" 
        }}
      >
        <Image
          src="/images/3d-tutor.jpg"
          alt="3D AI Tutor"
          fill
          className="object-contain drop-shadow-2xl"
          style={{ 
            filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.25))",
            transform: "translateZ(50px)"
          }}
          priority
        />
      </motion.div>
      
      {/* Glow effect behind tutor */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />
    </motion.div>
  )
}

// Walking tutor animation on scroll - smaller and more subtle
function WalkingTutor() {
  const { scrollYProgress } = useScroll()
  const x = useTransform(scrollYProgress, [0.1, 0.4], ["-100%", "100%"])
  const rotate = useTransform(scrollYProgress, [0.1, 0.4], [0, 10])
  
  return (
    <motion.div
      className="pointer-events-none fixed bottom-6 left-0 z-30 h-16 w-16"
      style={{ x, rotate }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="relative h-full w-full"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-accent shadow-lg">
          <Sparkles className="h-6 w-6 text-accent-foreground" />
        </div>
        <motion.div
          className="absolute -right-1 -top-1 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-bold shadow-md"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Let&apos;s go!
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { stiffness: 100, damping: 30 })

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(v).toLocaleString() + suffix
      }
    })
  }, [spring, suffix])

  return <span ref={ref}>0{suffix}</span>
}

// Masterpiece card gallery with wider spread effect
function MasterpieceGallery() {
  const cards = tutors.slice(0, 7)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <div ref={containerRef} className="relative flex h-[550px] items-center justify-center overflow-visible py-10">
      {cards.map((tutor, i) => {
        const totalCards = cards.length
        const middleIndex = (totalCards - 1) / 2
        const offset = i - middleIndex
        const rotation = offset * 12
        const translateX = offset * 130 // More spread out
        const translateY = Math.abs(offset) * 15
        const zIndex = totalCards - Math.abs(offset)

        return (
          <motion.div
            key={tutor.id}
            className="absolute h-72 w-52 cursor-pointer overflow-hidden rounded-3xl bg-card shadow-2xl"
            initial={{ opacity: 0, y: 100, rotate: 0, x: 0, scale: 0.8 }}
            animate={isInView ? { 
              opacity: 1, 
              y: translateY, 
              rotate: rotation,
              x: translateX,
              scale: 1
            } : {}}
            transition={{ 
              delay: i * 0.08, 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            whileHover={{ 
              scale: 1.2, 
              rotate: 0, 
              y: -40,
              zIndex: 20,
              transition: { duration: 0.3 }
            }}
            style={{ zIndex }}
          >
            {/* Floating animation on each card */}
            <motion.div
              className="h-full w-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.2, ease: "easeInOut" }}
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${tutor.thumbnail})` }}
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <motion.span 
                className="mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {tutor.persona}
              </motion.span>
              <p className="text-lg font-bold text-white">{tutor.name}</p>
              <p className="text-sm text-white/70">{tutor.subject}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Create Room Section
function CreateRoomSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    { icon: Users, title: "Invite Friends", desc: "Learn together in real-time" },
    { icon: Palette, title: "Custom Personas", desc: "Gen Z slang? Formal? You choose!" },
    { icon: Brain, title: "Adaptive AI", desc: "Tutors that learn how you learn" },
    { icon: Wand2, title: "Create Your Tutor", desc: "Design your perfect study buddy" },
  ]

  return (
    <section ref={ref} className="relative overflow-hidden bg-foreground py-32 text-card">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-card blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            Your Space
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight lg:text-6xl">
            Create your own room
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-card/70">
            Build a personalized learning space. Invite your friends, customize your AI tutor&apos;s personality, 
            and learn together. Our AI adapts to your group&apos;s vibe with reinforced learning.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
              }}
              className="group rounded-3xl bg-card/10 p-6 backdrop-blur-sm transition-colors hover:bg-card/15"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <motion.div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent"
                whileHover={{ rotate: 10, scale: 1.1 }}
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 + i * 0.5,
                  ease: "easeInOut"
                }}
              >
                <feature.icon className="h-7 w-7 text-accent-foreground" />
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-card"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
              >
                {feature.title}
              </motion.h3>
              <p className="mt-2 text-card/70">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            className="gap-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href="/create">
              Create a Room
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// Testimonial section with floating avatars
function TestimonialSection() {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Computer Science Student",
      text: "Tutor Me changed how I study. The AI tutors feel like real mentors that actually get me!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "Marcus L.",
      role: "High School Senior",
      text: "Got into my dream college after using Tutor Me for SAT prep. The Gen Z tutor is so fire!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Emily R.",
      role: "Graphic Designer",
      text: "Learning with friends in the same room is amazing. We vibe and learn at the same time!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  ]

  const floatingAvatars = [
    { top: "10%", left: "8%", size: 56, delay: 0 },
    { top: "20%", left: "20%", size: 44, delay: 0.5 },
    { top: "12%", right: "15%", size: 52, delay: 0.3 },
    { top: "25%", right: "8%", size: 40, delay: 0.7 },
    { bottom: "20%", left: "12%", size: 48, delay: 0.2 },
    { bottom: "15%", right: "20%", size: 50, delay: 0.6 },
  ]

  return (
    <section className="relative overflow-hidden bg-muted/50 py-32">
      {/* Curved text path */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]">
        <svg viewBox="0 0 1400 400" className="absolute left-1/2 top-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2">
          <path
            id="textPath"
            d="M -100 300 Q 300 50 700 200 Q 1100 350 1500 100"
            fill="none"
          />
          <text className="fill-foreground text-3xl font-bold">
            <textPath href="#textPath">
              see how our students have transformed their lives through our platform. Read their stories and join our community.
            </textPath>
          </text>
        </svg>
      </div>

      {/* Floating avatars */}
      {floatingAvatars.map((avatar, i) => (
        <motion.div
          key={i}
          className="absolute overflow-hidden rounded-full bg-card p-1 shadow-lg ring-2 ring-border/50"
          style={{
            top: avatar.top,
            left: avatar.left,
            right: avatar.right,
            bottom: avatar.bottom,
            width: avatar.size,
            height: avatar.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: avatar.delay, duration: 0.5, type: "spring" }}
          animate={{ y: [0, -8, 0] }}
          //@ts-expect-error - framer-motion types
          transition={{ y: { repeat: Infinity, duration: 3 + i * 0.3, ease: "easeInOut" }}}
        >
          <Image
            src={`https://images.unsplash.com/photo-${1500000000000 + i * 100}?w=100&h=100&fit=crop`}
            alt=""
            width={avatar.size}
            height={avatar.size}
            className="h-full w-full rounded-full object-cover"
          />
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            Testimonials
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Student Testimonials
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how our members have leveled up with our AI tutors and study rooms.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-3xl bg-card p-8 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/20" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/80">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Tutor preview carousel
function TutorCarousel({ onTutorClick }: { onTutorClick: () => void }) {
  return (
    <section className="overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Meet our AI Tutors</h2>
            <p className="mt-2 text-muted-foreground">Each with their own vibe and teaching style</p>
          </div>
          <Button variant="ghost" className="gap-1" asChild>
            <Link href="/tutors">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <motion.div
        className="flex gap-4 px-6"
        animate={{ x: [0, -1200] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...tutors, ...tutors].map((tutor, i) => (
          <motion.button
            key={`${tutor.id}-${i}`}
            onClick={onTutorClick}
            className="group relative h-72 w-52 flex-shrink-0 overflow-hidden rounded-3xl"
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${tutor.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <span className="mb-1 inline-block rounded-full bg-accent/80 px-2 py-0.5 text-xs text-accent-foreground backdrop-blur-sm">
                {tutor.persona}
              </span>
              <p className="font-bold text-card">{tutor.name}</p>
              <p className="text-sm text-card/70">{tutor.subject}</p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="text-xs text-card/80">{tutor.rating}</span>
              </div>
            </div>
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/90 shadow-lg backdrop-blur-sm">
                <Play className="ml-1 h-6 w-6 text-foreground" />
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}

// CTA Section
function CTASection({ onAuthClick }: { onAuthClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Sparkles className="h-10 w-10 text-accent-foreground" />
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Ready to level up your learning?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who are already learning smarter, not harder. 
            Your personalized AI tutor is waiting.
          </p>
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              size="lg"
              className="gap-2 rounded-full px-8"
              onClick={onAuthClick}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full"
              asChild
            >
              <Link href="/pricing">
                View pricing
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const { isLoggedIn } = useAuth()
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const handleTutorClick = () => {
    if (!isLoggedIn) {
      setShowAuth(true)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <WalkingTutor />

      {/* Hero Section - Sapforce style */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen overflow-hidden pt-32"
      >
        {/* Giant typography background with bounce */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 whitespace-nowrap text-[14vw] font-black tracking-tighter text-foreground/[0.04] lg:text-[200px]"
        >
          {"TUTOR ME.".split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex min-h-[80vh] items-center justify-center">
            {/* Left stats */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute left-0 top-1/3 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <Image
                      key={i}
                      src={`https://images.unsplash.com/photo-${1494790108377 + i * 10000}?w=40&h=40&fit=crop`}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-card"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={2} suffix="M+" />
                  </p>
                  <p className="text-sm text-muted-foreground">Active learners</p>
                </div>
              </div>
              
              <p className="mt-16 max-w-[220px] text-lg text-foreground">
                The learning platform that adapts to <span className="italic">your</span> vibe with AI tutors and collaborative rooms
              </p>
              <div className="mt-4 flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Center 3D Tutor */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatedTutor />
            </motion.div>

            {/* Right features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute right-0 top-1/3 hidden text-right lg:block"
            >
              {[
                { label: "AI-Powered", num: "01" },
                { label: "Collaborative", num: "02" },
                { label: "Personalized", num: "03" },
              ].map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {item.label} <span className="text-foreground/30">/{item.num}</span>
                </motion.p>
              ))}
            </motion.div>

            {/* How it works button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", bounce: 0.4 }}
              className="absolute bottom-10 right-10"
            >
              <motion.button
                onClick={() => setShowAuth(true)}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="mr-1 h-4 w-4" />
                How it works?
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Masterpiece Section */}
      <section className="bg-muted/30 py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              Discover
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-foreground lg:text-6xl"
          >
            A place to display your{" "}
            <span className="italic">masterpiece.</span>
          </motion.h2>

          <MasterpieceGallery />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground"
          >
            Explore tutor rooms, discover new learning styles, and find the perfect AI tutor that matches your energy.
          </motion.p>


        </div>
      </section>

      {/* Create Room Section */}
      <CreateRoomSection />

      {/* Tutor Carousel */}
      <TutorCarousel onTutorClick={handleTutorClick} />

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <CTASection onAuthClick={() => setShowAuth(true)} />

      {/* Footer */}
      <Footer />
    </div>
  )
}
