"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TutorCard } from "@/components/tutor-card"
import { TutorModal } from "@/components/tutor-modal"
import { tutors, categories, type Tutor } from "@/lib/tutors-data"
import { Search, SlidersHorizontal, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TutorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("For you")
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [visibleCount, setVisibleCount] = useState(8)

  const filteredTutors = useMemo(() => {
    let filtered = tutors

    // Filter by category
    if (activeCategory !== "For you") {
      filtered = filtered.filter(t => t.category === activeCategory)
    }

    // Filter by search
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="ml-16 flex-1 px-6 py-8 lg:ml-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Discover Tutors</h1>
            <p className="mt-1 text-muted-foreground">Find the perfect AI tutor for your learning journey</p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tutors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category}
              </button>
            ))}
            <button className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Tutors Grid */}
          {visibleTutors.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {visibleTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    {...tutor}
                    onClick={() => setSelectedTutor(tutor)}
                  />
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="rounded-xl bg-secondary px-8 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    Load More Tutors
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No tutors found</h3>
              <p className="mt-1 text-muted-foreground">Try adjusting your search or filters</p>
            </div>
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
