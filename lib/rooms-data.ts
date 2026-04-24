export interface Room {
  id: string
  name: string
  tutorId: string
  tutorName: string
  tutorSubject: string
  topic: string
  participants: number
  maxParticipants: number
  isLive: boolean
  thumbnail: string
}

export const rooms: Room[] = [
  {
    id: "room-1",
    name: "Calculus Study Group",
    tutorId: "3",
    tutorName: "AI Math Master",
    tutorSubject: "Mathematics",
    topic: "Derivatives & Integrals",
    participants: 5,
    maxParticipants: 12,
    isLive: true,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
  },
  {
    id: "room-2",
    name: "Physics 101",
    tutorId: "1",
    tutorName: "AI Physics Tutor",
    tutorSubject: "Physics",
    topic: "Newton's Laws of Motion",
    participants: 8,
    maxParticipants: 15,
    isLive: true,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop"
  },
  {
    id: "room-3",
    name: "Python Beginners",
    tutorId: "4",
    tutorName: "AI Code Coach",
    tutorSubject: "Programming",
    topic: "Functions & Loops",
    participants: 12,
    maxParticipants: 20,
    isLive: true,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop"
  },
  {
    id: "room-4",
    name: "Spanish Conversation",
    tutorId: "5",
    tutorName: "AI Spanish Tutor",
    tutorSubject: "Spanish",
    topic: "Daily Conversations",
    participants: 4,
    maxParticipants: 8,
    isLive: false,
    thumbnail: "https://images.unsplash.com/photo-1489945052260-4f21c52571bf?w=400&h=300&fit=crop"
  }
]

export interface UserSession {
  id: string
  tutorId: string
  tutorName: string
  tutorSubject: string
  topic: string
  date: string
  duration: string
  progress: number
}

export const recentSessions: UserSession[] = [
  {
    id: "session-1",
    tutorId: "3",
    tutorName: "AI Math Master",
    tutorSubject: "Mathematics",
    topic: "Integration Techniques",
    date: "Today",
    duration: "45 min",
    progress: 75
  },
  {
    id: "session-2",
    tutorId: "4",
    tutorName: "AI Code Coach",
    tutorSubject: "Programming",
    topic: "React Fundamentals",
    date: "Yesterday",
    duration: "1h 20min",
    progress: 100
  },
  {
    id: "session-3",
    tutorId: "1",
    tutorName: "AI Physics Tutor",
    tutorSubject: "Physics",
    topic: "Thermodynamics",
    date: "2 days ago",
    duration: "55 min",
    progress: 60
  }
]
