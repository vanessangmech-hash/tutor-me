"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { rooms } from "@/lib/rooms-data"
import { 
  ArrowLeft, 
  Copy, 
  Check,
  Hand,
  HelpCircle,
  ThumbsUp,
  Send,
  MoreVertical,
  Users,
  Sparkles,
  MessageCircle,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "ai" | "system"
  content: string
  timestamp: Date
}

const participants = [
  { id: "1", name: "You", avatar: "Y", isYou: true },
  { id: "2", name: "Alex", avatar: "A", isYou: false },
  { id: "3", name: "Maria", avatar: "M", isYou: false },
  { id: "4", name: "James", avatar: "J", isYou: false },
  { id: "5", name: "Sophie", avatar: "S", isYou: false },
]

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "system",
    content: "Session started. Welcome to the classroom!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: "2",
    sender: "ai",
    content: "Hello everyone! Today we'll be exploring the fundamentals of our topic. Let's start with the basics and build up from there. Feel free to ask questions anytime!",
    timestamp: new Date(Date.now() - 1000 * 60 * 14)
  },
  {
    id: "3",
    sender: "user",
    content: "Can you explain this concept in simpler terms?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10)
  },
  {
    id: "4",
    sender: "ai",
    content: "Of course! Think of it like building blocks. Each block represents a fundamental piece. When we stack them together in the right way, we create something meaningful!",
    timestamp: new Date(Date.now() - 1000 * 60 * 9)
  }
]

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const room = rooms.find(r => r.id === roomId) || rooms[0]
  
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeReaction, setActiveReaction] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const roomCode = roomId?.toUpperCase().slice(0, 8) || "ROOM-001"
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "That's a great point! Let me elaborate on that concept and provide some examples that might help clarify things further.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1500)
  }
  
  const handleReaction = (reaction: string) => {
    setActiveReaction(reaction)
    setTimeout(() => setActiveReaction(null), 2000)
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Participants (Desktop) */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden w-72 flex-shrink-0 border-r border-border bg-card p-6 lg:block"
      >
        <Link 
          href="/rooms"
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Link>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground">{room.name}</h2>
          <p className="mt-1 text-muted-foreground">{room.tutorName}</p>
        </div>
        
        <div className="mb-8 rounded-2xl bg-muted p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Room Code</p>
          <button 
            onClick={handleCopyCode}
            className="flex w-full items-center justify-between rounded-xl bg-card px-4 py-3 text-sm font-mono font-bold text-foreground transition-all hover:shadow-md"
          >
            {roomCode}
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Participants</h3>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {participants.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {participants.map((participant, i) => (
              <motion.div 
                key={participant.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                  participant.isYou 
                    ? "bg-foreground text-card" 
                    : "bg-muted text-foreground"
                )}>
                  {participant.avatar}
                </div>
                <span className="font-medium text-foreground">
                  {participant.name}
                  {participant.isYou && (
                    <span className="ml-1 text-sm text-muted-foreground">(you)</span>
                  )}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.aside>
      
      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between border-b border-border bg-card px-6 py-4"
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/rooms"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground">{room.topic}</h1>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex h-2 w-2 rounded-full bg-green-500"
                />
              </div>
              <p className="text-sm text-muted-foreground">{room.tutorName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 rounded-full lg:hidden"
              onClick={() => setShowParticipants(true)}
            >
              <Users className="h-4 w-4" />
              {participants.length}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 rounded-full lg:hidden"
              onClick={() => setShowChat(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </motion.header>
        
        {/* Classroom Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative flex h-80 w-full max-w-3xl items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card"
            >
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Sparkles className="mx-auto mb-6 h-16 w-16 text-accent" />
                </motion.div>
                <p className="text-2xl font-bold text-foreground">Interactive Content Area</p>
                <p className="mt-2 text-muted-foreground">
                  Presentations, 3D models, and visual aids appear here
                </p>
              </div>
            </motion.div>
            
            {/* Reaction Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center gap-3"
            >
              {[
                { id: "hand", icon: Hand, label: "Raise Hand", color: "text-amber-500" },
                { id: "confused", icon: HelpCircle, label: "Confused", color: "text-orange-500" },
                { id: "understood", icon: ThumbsUp, label: "Got it!", color: "text-green-500" }
              ].map((reaction) => (
                <motion.div key={reaction.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeReaction === reaction.id ? "default" : "outline"}
                    className={cn(
                      "gap-2 rounded-full px-6",
                      activeReaction === reaction.id && "bg-foreground text-card"
                    )}
                    onClick={() => handleReaction(reaction.id)}
                  >
                    <reaction.icon className={cn(
                      "h-4 w-4",
                      activeReaction !== reaction.id && reaction.color
                    )} />
                    {reaction.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Chat Panel (Desktop) */}
          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden w-80 flex-col border-l border-border bg-card lg:flex"
          >
            <div className="border-b border-border p-4">
              <h3 className="font-bold text-foreground">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, i) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {message.sender === "system" ? (
                    <div className="text-center text-xs text-muted-foreground">
                      {message.content}
                    </div>
                  ) : (
                    <div className={cn(
                      "flex gap-2",
                      message.sender === "user" && "flex-row-reverse"
                    )}>
                      <div className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        message.sender === "ai" 
                          ? "bg-accent text-accent-foreground" 
                          : "bg-foreground text-card"
                      )}>
                        {message.sender === "ai" ? "AI" : "Y"}
                      </div>
                      <div className={cn(
                        "max-w-[200px] rounded-2xl px-4 py-2",
                        message.sender === "ai" 
                          ? "bg-muted text-foreground rounded-tl-sm" 
                          : "bg-foreground text-card rounded-tr-sm"
                      )}>
                        <p className="text-sm">{message.content}</p>
                        <span className={cn(
                          "mt-1 block text-xs",
                          message.sender === "ai" 
                            ? "text-muted-foreground" 
                            : "text-card/70"
                        )}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t border-border p-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="h-12 rounded-full bg-muted/50 border-0"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-12 w-12 rounded-full"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.aside>
        </div>
      </main>
      
      {/* Mobile Chat Drawer */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setShowChat(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-bold text-foreground">Chat</h3>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowChat(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.sender === "system" ? (
                      <div className="text-center text-xs text-muted-foreground">
                        {message.content}
                      </div>
                    ) : (
                      <div className={cn(
                        "flex gap-2",
                        message.sender === "user" && "flex-row-reverse"
                      )}>
                        <div className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          message.sender === "ai" 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-foreground text-card"
                        )}>
                          {message.sender === "ai" ? "AI" : "Y"}
                        </div>
                        <div className={cn(
                          "max-w-[220px] rounded-2xl px-4 py-2",
                          message.sender === "ai" 
                            ? "bg-muted text-foreground rounded-tl-sm" 
                            : "bg-foreground text-card rounded-tr-sm"
                        )}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border p-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="h-12 rounded-full bg-muted/50 border-0"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 rounded-full"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
