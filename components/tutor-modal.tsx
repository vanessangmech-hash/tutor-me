"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type Tutor } from "@/lib/tutors-data"
import { X, Star, Users, Heart, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorModalProps {
  tutor: Tutor | null
  onClose: () => void
}

export function TutorModal({ tutor, onClose }: TutorModalProps) {
  // Handle escape key
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

  if (!tutor) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-card shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Hero Image */}
        <div className="relative h-64 w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${tutor.thumbnail})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Subject Badge */}
          <div className="absolute bottom-6 left-6">
            <span className="rounded-lg bg-white/10 px-4 py-2 text-xl font-semibold text-white backdrop-blur-sm">
              {tutor.subject}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{tutor.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tutor.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <Heart className="h-5 w-5" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="mb-6 flex gap-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{tutor.rating}</span>
              <span className="text-muted-foreground">rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{tutor.sessions.toLocaleString()}</span>
              <span className="text-muted-foreground">sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{tutor.saves.toLocaleString()}</span>
              <span className="text-muted-foreground">saves</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="mb-8 text-muted-foreground leading-relaxed">
            {tutor.description}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 gap-2 rounded-xl" asChild>
              <Link href={`/rooms?tutor=${tutor.id}`}>
                <Play className="h-4 w-4" />
                Start Learning
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-xl" asChild>
              <Link href={`/rooms?tutor=${tutor.id}&create=true`}>
                Create Room with Tutor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
