"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Footer } from "@/components/footer"
import { tutors } from "@/lib/tutors-data"
import { ArrowRight, Play, Sparkles, Users, Zap, Target, Star, ChevronRight } from "lucide-react"

// Animated 3D blob component
function AnimatedBlob() {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        setMousePosition({
          x: (e.clientX - centerX) / 30,
          y: (e.clientY - centerY) / 30,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.div
      ref={ref}
      className="relative h-[500px] w-[500px] lg:h-[600px] lg:w-[600px]"
      animate={{
        rotateX: mousePosition.y,
        rotateY: -mousePosition.x,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 30 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JbFmTRcRgVW6J2BoZP6BKDUPwBJJ5m.png"
        alt="3D Abstract Shape"
        fill
        className="object-contain drop-shadow-2xl"
        priority
      />
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

// Card gallery with fan effect
function CardGallery() {
  const cards = tutors.slice(0, 6)

  return (
    <div className="relative flex h-[400px] items-center justify-center">
      {cards.map((tutor, i) => {
        const rotation = (i - 2.5) * 12
        const translateY = Math.abs(i - 2.5) * 15

        return (
          <motion.div
            key={tutor.id}
            className="absolute h-56 w-44 overflow-hidden rounded-2xl bg-card shadow-xl"
            initial={{ opacity: 0, y: 100, rotate: 0 }}
            whileInView={{ opacity: 1, y: translateY, rotate: rotation }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 0, 
              y: -20,
              zIndex: 10,
              transition: { duration: 0.3 }
            }}
            style={{ 
              zIndex: i === 2 || i === 3 ? 5 : 6 - Math.abs(i - 2.5),
              left: `calc(50% + ${(i - 2.5) * 60}px - 88px)`
            }}
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${tutor.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-bold text-white">{tutor.name}</p>
              <p className="text-xs text-white/70">{tutor.subject}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Testimonial section with floating avatars
function TestimonialSection() {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Computer Science Student",
      text: "LearnSync changed how I study. The AI tutors feel like real mentors!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      name: "Marcus L.",
      role: "High School Senior",
      text: "Got into my dream college after using LearnSync for SAT prep.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Emily R.",
      role: "Graphic Designer",
      text: "The collaborative rooms are amazing. Learning with friends is so much better!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
    }
  ]

  const floatingAvatars = [
    { top: "5%", left: "5%", size: 60, delay: 0 },
    { top: "15%", left: "25%", size: 50, delay: 0.5 },
    { top: "8%", right: "20%", size: 55, delay: 0.3 },
    { top: "20%", right: "5%", size: 45, delay: 0.7 },
    { bottom: "25%", left: "8%", size: 48, delay: 0.2 },
    { bottom: "15%", right: "15%", size: 52, delay: 0.6 },
  ]

  return (
    <section className="relative overflow-hidden bg-muted/50 py-32">
      {/* Curved text */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
        <svg viewBox="0 0 1200 400" className="absolute left-0 top-1/2 w-full -translate-y-1/2">
          <path
            id="curve"
            d="M 0 300 Q 300 100 600 200 Q 900 300 1200 100"
            fill="none"
          />
          <text className="fill-foreground text-2xl font-bold">
            <textPath href="#curve">
              over how our students have transformed their lives through our classes. Read their stories.
            </textPath>
          </text>
        </svg>
      </div>

      {/* Floating avatars */}
      {floatingAvatars.map((avatar, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-card/80 p-1 shadow-lg ring-2 ring-border"
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
          animate={{
            y: [0, -10, 0],
          }}
          //@ts-expect-error - framer-motion types
          transition={{
            y: { repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" }
          }}
        >
          <div className="h-full w-full rounded-full bg-muted" />
        </motion.div>
      ))}

      <div className="mx-auto max-w-6xl px-6">
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
            See how our members have reduced stress and enhanced well-being with our support and guidance.
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

// Features bento grid
function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered Tutors",
      description: "Personalized learning paths that adapt to your unique style and pace.",
      icon: Sparkles,
      size: "large",
      color: "bg-accent"
    },
    {
      title: "Multiplayer Rooms",
      description: "Learn together with friends in real-time collaborative sessions.",
      icon: Users,
      size: "small",
      color: "bg-foreground"
    },
    {
      title: "Instant Feedback",
      description: "Get immediate responses and corrections as you learn.",
      icon: Zap,
      size: "small",
      color: "bg-foreground"
    },
    {
      title: "Goal Tracking",
      description: "Set targets and watch your progress with detailed analytics.",
      icon: Target,
      size: "medium",
      color: "bg-accent"
    }
  ]

  return (
    <section className="py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Everything you need to learn
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed for the modern learner
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl bg-accent p-8 md:col-span-2 md:row-span-2"
          >
            <div className="relative z-10">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-foreground/10">
                <Sparkles className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-accent-foreground">AI-Powered Tutors</h3>
              <p className="mt-2 max-w-md text-accent-foreground/80">
                Personalized learning paths that adapt to your unique style and pace. Our AI understands how you learn best.
              </p>
            </div>
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent-foreground/10 transition-transform group-hover:scale-110" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent-foreground/10 transition-transform group-hover:scale-125" />
          </motion.div>

          {/* Small cards */}
          {features.slice(1, 4).map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`group relative overflow-hidden rounded-3xl p-6 ${
                feature.color === "bg-foreground" ? "bg-foreground text-card" : "bg-card"
              }`}
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
                feature.color === "bg-foreground" ? "bg-card/10" : "bg-foreground/5"
              }`}>
                <feature.icon className={`h-6 w-6 ${
                  feature.color === "bg-foreground" ? "text-card" : "text-foreground"
                }`} />
              </div>
              <h3 className={`font-bold ${
                feature.color === "bg-foreground" ? "text-card" : "text-foreground"
              }`}>{feature.title}</h3>
              <p className={`mt-1 text-sm ${
                feature.color === "bg-foreground" ? "text-card/70" : "text-muted-foreground"
              }`}>{feature.description}</p>
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
            <p className="mt-2 text-muted-foreground">Specialized in every subject you need</p>
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
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...tutors, ...tutors].map((tutor, i) => (
          <motion.button
            key={`${tutor.id}-${i}`}
            onClick={onTutorClick}
            className="group relative h-64 w-48 flex-shrink-0 overflow-hidden rounded-2xl"
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${tutor.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="font-bold text-card">{tutor.name}</p>
              <p className="text-sm text-card/70">{tutor.subject}</p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="text-xs text-card/80">{tutor.rating}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Hero Section - Sapforce style */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen overflow-hidden pt-32"
      >
        {/* Giant typography background */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 whitespace-nowrap text-[12vw] font-black tracking-tighter text-foreground/5 lg:text-[180px]"
        >
          LEARNSYNC.
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
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-muted ring-2 ring-card"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={2} suffix="M+" />
                  </p>
                  <p className="text-sm text-muted-foreground">World active users</p>
                </div>
              </div>
              
              <p className="mt-16 max-w-[200px] text-lg text-foreground">
                The learning platform that keeps your flow with AI tools and built-in collaboration
              </p>
            </motion.div>

            {/* Center 3D blob */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatedBlob />
            </motion.div>

            {/* Right features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute right-0 top-1/3 hidden text-right lg:block"
            >
              {[
                { label: "Web based", num: "01" },
                { label: "Collaborative", num: "02" },
                { label: "Real-time", num: "03" },
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
              className="absolute bottom-20 right-10"
            >
              <button
                onClick={() => setShowAuth(true)}
                className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground shadow-lg transition-transform hover:scale-110"
              >
                <Play className="mr-1 h-4 w-4" />
                How it works?
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Masterpiece Section */}
      <section className="bg-muted/30 py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight text-foreground lg:text-6xl"
          >
            A place to display your{" "}
            <span className="italic">masterpiece.</span>
          </motion.h2>

          <CardGallery />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground"
          >
            Students can showcase their achievements, and peers can discover and learn from each other.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="gap-2 rounded-full"
              onClick={() => setShowAuth(true)}
            >
              Join for $9.99/m
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-1"
              asChild
            >
              <Link href="/about">
                Read more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tutor Carousel */}
      <TutorCarousel onTutorClick={() => setShowAuth(true)} />

      {/* Features Bento */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <section className="py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Improve flexibility, strength, and peace.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Classes designed to enhance flexibility, build strength, and promote deep relaxation, all within our supportive community.
            </p>
            <Button
              size="lg"
              className="mt-8 gap-2 rounded-full"
              onClick={() => setShowAuth(true)}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
