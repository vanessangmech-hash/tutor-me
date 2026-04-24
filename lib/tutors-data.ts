export interface Tutor {
  id: string
  name: string
  subject: string
  thumbnail: string
  views: string
  saves: number
  tags: string[]
  category: string
  description: string
  rating: number
  sessions: number
  persona: string
  personality: string
  videoPreview?: string
}

export const tutors: Tutor[] = [
  {
    id: "1",
    name: "PhysicsPhenom",
    subject: "Physics",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=600&fit=crop",
    views: "143K",
    saves: 2341,
    tags: ["Science", "Visual", "Advanced"],
    category: "Science",
    description: "Master physics concepts from mechanics to quantum theory with interactive simulations and real-world examples.",
    rating: 4.9,
    sessions: 12500,
    persona: "Gen Z Energy",
    personality: "Yo, physics is literally just explaining why stuff does what it does fr fr. No cap, once you get it, everything clicks. Let's vibe with some quantum mechanics bestie.",
    videoPreview: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=450&fit=crop"
  },
  {
    id: "2",
    name: "ChemQueen",
    subject: "Chemistry",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=600&fit=crop",
    views: "89K",
    saves: 1876,
    tags: ["Science", "Interactive", "Beginner"],
    category: "Science",
    description: "Explore the molecular world with hands-on virtual experiments and step-by-step problem solving.",
    rating: 4.8,
    sessions: 8900,
    persona: "Chill Professor",
    personality: "Chemistry is like cooking but with explosions sometimes. I'll break down every reaction so it makes sense, no stress.",
    videoPreview: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&h=450&fit=crop"
  },
  {
    id: "3",
    name: "MathMaven",
    subject: "Mathematics",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop",
    views: "256K",
    saves: 4532,
    tags: ["Math", "Step-by-step", "All Levels"],
    category: "Math",
    description: "From algebra to calculus, get personalized guidance that adapts to your pace and learning style.",
    rating: 4.9,
    sessions: 25600,
    persona: "Hype Coach",
    personality: "MATH IS YOUR SUPERPOWER! Every problem you solve makes your brain stronger. Let's gooo! You've got this!",
    videoPreview: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop"
  },
  {
    id: "4",
    name: "CodeKing",
    subject: "Programming",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop",
    views: "312K",
    saves: 5678,
    tags: ["Coding", "Project-based", "Intermediate"],
    category: "Coding",
    description: "Learn to code through building real projects with instant feedback and best practices guidance.",
    rating: 4.9,
    sessions: 31200,
    persona: "Tech Bro Bestie",
    personality: "Debugging at 3am hits different but we're gonna make you so good you won't need to. Ship it!",
    videoPreview: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop"
  },
  {
    id: "5",
    name: "SpanishSlay",
    subject: "Spanish",
    thumbnail: "https://images.unsplash.com/photo-1489945052260-4f21c52571bf?w=400&h=600&fit=crop",
    views: "167K",
    saves: 3210,
    tags: ["Languages", "Conversational", "Beginner"],
    category: "Languages",
    description: "Become fluent through immersive conversations and cultural context.",
    rating: 4.8,
    sessions: 16700,
    persona: "Latina Tia Energy",
    personality: "Mijo/Mija, we're gonna have you speaking like a native in no time! Come on, repeat after me... perfecto!",
    videoPreview: "https://images.unsplash.com/photo-1489945052260-4f21c52571bf?w=800&h=450&fit=crop"
  },
  {
    id: "6",
    name: "BizBoss",
    subject: "Business",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    views: "98K",
    saves: 2156,
    tags: ["Business", "Case Studies", "Advanced"],
    category: "Business",
    description: "Develop strategic thinking through real-world case studies and interactive simulations.",
    rating: 4.7,
    sessions: 9800,
    persona: "CEO Mentor",
    personality: "Think bigger. Every successful entrepreneur started exactly where you are. Let's build your empire.",
    videoPreview: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop"
  },
  {
    id: "7",
    name: "BioBloom",
    subject: "Biology",
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=600&fit=crop",
    views: "134K",
    saves: 2890,
    tags: ["Science", "Visual", "Intermediate"],
    category: "Science",
    description: "Explore life sciences from cells to ecosystems with stunning visualizations.",
    rating: 4.8,
    sessions: 13400,
    persona: "Nature Nerd",
    personality: "Every living thing is connected in the most beautiful ways. Let me show you how wild biology really is!",
    videoPreview: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop"
  },
  {
    id: "8",
    name: "WriterVibes",
    subject: "Writing",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop",
    views: "78K",
    saves: 1654,
    tags: ["Languages", "Creative", "All Levels"],
    category: "Languages",
    description: "Improve your writing skills with personalized feedback and style guidance.",
    rating: 4.7,
    sessions: 7800,
    persona: "BookTok Bestie",
    personality: "Your words have power bestie! Whether it's essays or novels, let's make your writing absolutely iconic.",
    videoPreview: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop"
  },
  {
    id: "9",
    name: "DataDrip",
    subject: "Data Science",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop",
    views: "201K",
    saves: 3987,
    tags: ["Coding", "Analytics", "Advanced"],
    category: "Coding",
    description: "Master data analysis, machine learning, and visualization techniques.",
    rating: 4.9,
    sessions: 20100,
    persona: "Data is Art",
    personality: "Numbers tell stories if you know how to listen. Let's turn your data into insights that slap.",
    videoPreview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop"
  },
  {
    id: "10",
    name: "EconEra",
    subject: "Economics",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop",
    views: "67K",
    saves: 1432,
    tags: ["Business", "Theory", "Intermediate"],
    category: "Business",
    description: "Understand economic principles through interactive models and current events.",
    rating: 4.6,
    sessions: 6700,
    persona: "Money Mindset",
    personality: "Understanding economics is understanding how the world actually works. Let's get you financially literate!",
    videoPreview: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop"
  },
  {
    id: "11",
    name: "CalculusCreator",
    subject: "Calculus",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop",
    views: "189K",
    saves: 3654,
    tags: ["Math", "Problem Solving", "Advanced"],
    category: "Math",
    description: "Conquer calculus with step-by-step solutions and visual explanations.",
    rating: 4.9,
    sessions: 18900,
    persona: "Calm Explainer",
    personality: "Take a deep breath. Calculus seems scary but it's just patterns. I'll walk you through every single step.",
    videoPreview: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop"
  },
  {
    id: "12",
    name: "FrenchFlair",
    subject: "French",
    thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=600&fit=crop",
    views: "145K",
    saves: 2876,
    tags: ["Languages", "Conversational", "Beginner"],
    category: "Languages",
    description: "Learn French through immersive dialogue and cultural exploration.",
    rating: 4.8,
    sessions: 14500,
    persona: "Parisian Vibes",
    personality: "Ooh la la! French isn't just a language, it's a whole aesthetic. Let's make you sound magnifique!",
    videoPreview: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=450&fit=crop"
  }
]

export const categories = [
  "For you",
  "Math",
  "Science",
  "Coding",
  "Languages",
  "Business"
]
