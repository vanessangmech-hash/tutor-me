"use client"

import { useState } from "react"
import { Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorCardProps {
  id: string
  name: string
  subject: string
  thumbnail: string
  views: string
  saves: number
  tags: string[]
  onClick?: () => void
}

export function TutorCard({ 
  name, 
  subject, 
  thumbnail, 
  views, 
  saves, 
  tags,
  onClick 
}: TutorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Card Container with 3D Transform */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300",
          isHovered && "shadow-xl"
        )}
        style={{
          transform: isHovered 
            ? "scale(1.02) perspective(1000px) rotateX(2deg) rotateY(-2deg)" 
            : "scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Thumbnail Container - 9:16 Ratio */}
        <div className="relative aspect-[9/14] w-full overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
            style={{ 
              backgroundImage: `url(${thumbnail})`,
              transform: isHovered ? "scale(1.05)" : "scale(1)"
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top Right - Save Button */}
          <button
            className={cn(
              "absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-all",
              isSaved 
                ? "bg-primary text-primary-foreground" 
                : "bg-white/20 text-white hover:bg-white/30"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsSaved(!isSaved)
            }}
          >
            <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            <span>{isSaved ? saves + 1 : saves}</span>
          </button>
          
          {/* Bottom Left - View Count */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">{views}</span>
          </div>
          
          {/* Center Subject Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-lg bg-white/10 px-4 py-2 text-lg font-semibold text-white backdrop-blur-sm">
              {subject}
            </span>
          </div>
        </div>
      </div>
      
      {/* Card Info */}
      <div className="mt-3 space-y-2">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span 
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
