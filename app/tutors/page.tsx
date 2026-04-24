"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { TutorModal } from "@/components/tutor-modal"
import { tutors, categories, type Tutor } from "@/lib/tutors-data"
import { Search, SlidersHorizontal, Plus, Star, Play } from "lucide-react"
import { cn } from "@/lib/utils"

function TutorCard({ 
  tutor, 
  index, 
  onClick 
}: { 
  tutor: Tutor
  index: number
  onClick: () => void 
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-3xl text-left"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${tutor.thumbnail})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/30 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
      
      {/* Play Button on Hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
      >
        <Play className="ml-1 h-6 w-6" />
      </motion.div>
      
      {/* Rating Badge */}
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
        <Star className="h-3 w-3 fill-accent text-accent" />
        {tutor.rating}
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-lg font-bold text-card">{tutor.name}</p>
        <p className="text-sm text-card/70">{tutor.subject}</p>
        
        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tutor.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-card/20 px-2 py-0.5 text-xs text-card/90 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

export default function TutorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("For you")
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [visibleCount, setVisibleCount] = useState(12)
  const [showAuth, setShowAuth] = useState(false)

  const filteredTutors = useMemo(() => {
    let filtered = tutors

    if (activeCategory !== "For you") {
      filtered = filtered.filter(t => t.category === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [searchQuery, activeCategory])

  const visibleTutors = filteredTutors.slice(0, visibleCount)
  const hasMore = visibleCount < filteredTutors.length

  const handleTutorClick = (tutor: Tutor) => {
    // In a real app, check if user is logged in
    const isLoggedIn = false // This would come from auth state
    if (!isLoggedIn) {
      setShowAuth(true)
    } else {
      setSelectedTutor(tutor)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Discover AI Tutors
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Find the perfect tutor for your learning journey
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-8 flex max-w-2xl gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tutors by name, subject, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-4 text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </div>
            <button className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-foreground hover:text-foreground">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </motion.div>
          
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 flex flex-wrap items-center justify-center gap-2"
          >
            {categories.map((category, i) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                  activeCategory === category
                    ? "bg-foreground text-card shadow-lg"
                    : "bg-card text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                {category}
              </motion.button>
            ))}
            <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              <Plus className="h-4 w-4" />
            </button>
          </motion.div>
          
          {/* Tutors Grid */}
          <AnimatePresence mode="wait">
            {visibleTutors.length > 0 ? (
              <motion.div
                key={activeCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
              >
                {visibleTutors.map((tutor, i) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    index={i}
                    onClick={() => handleTutorClick(tutor)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-4 rounded-full bg-muted p-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No tutors found</h3>
                <p className="mt-1 text-muted-foreground">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Load More */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex justify-center"
            >
              <button
                onClick={() => setVisibleCount(prev => prev + 8)}
                className="group flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-medium text-card transition-all hover:scale-105 hover:shadow-lg"
              >
                Load More Tutors
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ↓
                </motion.span>
              </button>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Tutor Detail Modal */}
      <TutorModal 
        tutor={selectedTutor} 
        onClose={() => setSelectedTutor(null)} 
      />
    </div>
  )
}
