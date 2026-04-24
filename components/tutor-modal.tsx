"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { type Tutor } from "@/lib/tutors-data"
import { X, Star, Users, Heart, Play } from "lucide-react"

interface TutorModalProps {
  tutor: Tutor | null
  onClose: () => void
}

export function TutorModal({ tutor, onClose }: TutorModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    
    if (tutor) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [tutor, onClose])

  return (
    <AnimatePresence>
      {tutor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-4 z-50 mx-auto my-auto max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-card shadow-2xl lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 text-card backdrop-blur-sm transition-all hover:bg-foreground/40 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Hero Image */}
            <div className="relative h-72 w-full overflow-hidden">
              <motion.div 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${tutor.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/30 to-transparent" />
              
              {/* Subject Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-6 left-6"
              >
                <span className="rounded-full bg-accent px-4 py-2 text-lg font-bold text-accent-foreground">
                  {tutor.subject}
                </span>
              </motion.div>
            </div>
            
            {/* Content */}
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    {tutor.name}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {tutor.tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                </motion.button>
              </div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-bold text-foreground">{tutor.rating}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{tutor.sessions.toLocaleString()}</span>
                  <span className="text-muted-foreground">sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{tutor.saves.toLocaleString()}</span>
                  <span className="text-muted-foreground">saves</span>
                </div>
              </motion.div>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-muted-foreground leading-relaxed"
              >
                {tutor.description}
              </motion.p>
              
              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button size="lg" className="flex-1 gap-2 rounded-full" asChild>
                  <Link href={`/rooms?tutor=${tutor.id}`}>
                    <Play className="h-4 w-4" />
                    Start Learning
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 rounded-full" asChild>
                  <Link href={`/rooms?tutor=${tutor.id}&create=true`}>
                    Create Room
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
