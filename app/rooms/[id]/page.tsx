"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
  Sparkles
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
    content: "Hello everyone! Today we&apos;ll be exploring the fundamentals of our topic. Let&apos;s start with the basics and build up from there. Feel free to ask questions anytime!",
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
    content: "Of course! Think of it like this: imagine you have building blocks. Each block represents a fundamental piece of the concept. When we stack them together in the right way, we create something meaningful and useful.",
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
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "That&apos;s a great point! Let me elaborate on that concept and provide some examples that might help clarify things further.",
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
      {/* Left Sidebar - Participants */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card p-4 lg:block">
        {/* Back Button */}
        <Link 
          href="/rooms"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Link>
        
        {/* Room Info */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground">{room.name}</h2>
          <p className="text-sm text-muted-foreground">{room.tutorName}</p>
        </div>
        
        {/* Room Code */}
        <div className="mb-6 rounded-xl bg-muted p-3">
          <p className="mb-1 text-xs text-muted-foreground">Room Code</p>
          <button 
            onClick={handleCopyCode}
            className="flex w-full items-center justify-between rounded-lg bg-background px-3 py-2 text-sm font-mono font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {roomCode}
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        
        {/* Participants */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Participants</h3>
            <span className="text-xs text-muted-foreground">{participants.length}</span>
          </div>
          
          <div className="space-y-2">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  participant.isYou 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {participant.avatar}
                </div>
                <span className="text-sm text-foreground">
                  {participant.name}
                  {participant.isYou && (
                    <span className="ml-1 text-muted-foreground">(you)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/rooms"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-foreground">{room.topic}</h1>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">{room.tutorName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 lg:hidden"
            >
              <Users className="h-4 w-4" />
              {participants.length}
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Classroom Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-8">
            {/* 3D Placeholder */}
            <div className="relative flex h-64 w-full max-w-2xl items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card">
              <div className="text-center">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary/50" />
                <p className="text-lg font-medium text-foreground">Interactive Content Area</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Presentations, 3D models, and visual aids appear here
                </p>
              </div>
            </div>
            
            {/* Reaction Buttons */}
            <div className="mt-8 flex items-center gap-3">
              {[
                { id: "hand", icon: Hand, label: "Raise Hand", color: "text-amber-500" },
                { id: "confused", icon: HelpCircle, label: "Confused", color: "text-orange-500" },
                { id: "understood", icon: ThumbsUp, label: "Understood", color: "text-green-500" }
              ].map((reaction) => (
                <Button
                  key={reaction.id}
                  variant={activeReaction === reaction.id ? "default" : "outline"}
                  className={cn(
                    "gap-2 rounded-xl",
                    activeReaction === reaction.id && "bg-primary"
                  )}
                  onClick={() => handleReaction(reaction.id)}
                >
                  <reaction.icon className={cn(
                    "h-4 w-4",
                    activeReaction !== reaction.id && reaction.color
                  )} />
                  {reaction.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Chat Panel */}
          <aside className="flex w-80 flex-col border-l border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-semibold text-foreground">Chat</h3>
            </div>
            
            {/* Messages */}
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
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium",
                        message.sender === "ai" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {message.sender === "ai" ? "AI" : "Y"}
                      </div>
                      <div className={cn(
                        "max-w-[200px] rounded-2xl px-4 py-2",
                        message.sender === "ai" 
                          ? "bg-muted text-foreground rounded-tl-sm" 
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      )}>
                        <p className="text-sm">{message.content}</p>
                        <span className={cn(
                          "mt-1 block text-xs",
                          message.sender === "ai" 
                            ? "text-muted-foreground" 
                            : "text-primary-foreground/70"
                        )}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
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
                  className="rounded-xl"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-xl"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
