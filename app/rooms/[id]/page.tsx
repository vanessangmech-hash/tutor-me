"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import {
  getRoom,
  sendMessage as apiSendMessage,
  recordReward,
  leaveRoom,
  subscribeToRoom,
  onRoomMessage,
  offRoomMessage,
  disconnectRealtime,
  type Room,
  type RoomMember,
} from "@/lib/api"
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
  X,
  Loader2,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "ai" | "system"
  content: string
  timestamp: Date
  sources?: { title: string; url: string }[]
  rewardGranted?: boolean
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { user, isLoggedIn } = useAuth()

  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeReaction, setActiveReaction] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadRoom = useCallback(async () => {
    setIsLoadingRoom(true)
    setLoadError(null)
    try {
      const res = await getRoom({ id: roomId })
      setRoom(res.room)
      setMembers(res.members || [])
      setMessages([
        {
          id: "system-start",
          sender: "system",
          content: `Welcome to ${res.room.personas?.name || "AI Tutor"}'s classroom! Room code: ${res.room.room_code}`,
          timestamp: new Date(res.room.created_at),
        },
        {
          id: "ai-welcome",
          sender: "ai",
          content: `Hello! I'm ${res.room.personas?.name || "your AI professor"}${res.room.personas?.subject ? `, specializing in ${res.room.personas.subject}` : ""}. Feel free to ask me anything! I'll adapt my teaching to match your learning style.`,
          timestamp: new Date(res.room.created_at),
        },
      ])
    } catch (err: any) {
      setLoadError(err.message || "Room not found")
    } finally {
      setIsLoadingRoom(false)
    }
  }, [roomId])

  useEffect(() => {
    if (roomId) loadRoom()
  }, [roomId, loadRoom])

  useEffect(() => {
    if (!room || !isLoggedIn) return

    let mounted = true

    const setupRealtime = async () => {
      try {
        await subscribeToRoom(room.id)

        const handleNewMessage = (payload: any) => {
          if (!mounted) return
          if (payload.sender_type === "agent") {
            setMessages((prev) => [
              ...prev,
              {
                id: payload.message_id || Date.now().toString(),
                sender: "ai",
                content: payload.content,
                timestamp: new Date(),
                sources: payload.metadata?.sources,
              },
            ])
          }
        }

        const handlePresence = (payload: any) => {
          if (!mounted) return
          const eventType = payload.user_id ? "joined" : "left"
          setMessages((prev) => [
            ...prev,
            {
              id: `presence-${Date.now()}`,
              sender: "system",
              content: `A participant ${eventType} the room`,
              timestamp: new Date(),
            },
          ])
        }

        onRoomMessage("new_message", handleNewMessage)
        onRoomMessage("user_joined", handlePresence)
        onRoomMessage("user_left", handlePresence)
      } catch {
        // Realtime is best-effort
      }
    }

    setupRealtime()

    return () => {
      mounted = false
      disconnectRealtime()
    }
  }, [room, isLoggedIn])

  const handleCopyCode = () => {
    if (!room) return
    navigator.clipboard.writeText(room.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !room || isSending) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    const msgText = newMessage
    setNewMessage("")
    setIsSending(true)

    try {
      const res = await apiSendMessage(room.id, msgText)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: res.response,
          timestamp: new Date(),
          sources: res.sources,
          rewardGranted: res.reward_granted,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "system",
          content: "Failed to get a response. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleReaction = async (reaction: string) => {
    if (!room) return
    setActiveReaction(reaction)

    if (reaction === "understood" && room.personas?.id) {
      try {
        await recordReward({
          room_id: room.id,
          persona_id: room.personas.id,
          topic: room.personas.subject || "General",
        })
        setMessages((prev) => [
          ...prev,
          {
            id: `reward-${Date.now()}`,
            sender: "system",
            content: "You marked this topic as understood! Reward granted to the tutor.",
            timestamp: new Date(),
          },
        ])
      } catch {
        // Best-effort
      }
    }

    if (reaction === "confused") {
      const confusedMsg = "I'm confused, can you explain that differently? Maybe with a simpler example?"
      setNewMessage("")
      setIsSending(true)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "user",
          content: confusedMsg,
          timestamp: new Date(),
        },
      ])

      try {
        const res = await apiSendMessage(room.id, confusedMsg)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            content: res.response,
            timestamp: new Date(),
            sources: res.sources,
          },
        ])
      } catch {
        // Best-effort
      } finally {
        setIsSending(false)
      }
    }

    setTimeout(() => setActiveReaction(null), 2000)
  }

  const handleLeaveRoom = async () => {
    if (!room) return
    try {
      await leaveRoom(room.id)
    } catch {
      // Best-effort
    }
    router.push("/rooms")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isLoadingRoom) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent" />
          <p className="text-lg font-medium text-foreground">Loading classroom...</p>
        </div>
      </div>
    )
  }

  if (loadError || !room) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-foreground">
            {loadError || "Room not found"}
          </p>
          <Button asChild className="rounded-full">
            <Link href="/rooms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rooms
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const persona = room.personas
  const roomCode = room.room_code

  const renderMessage = (message: Message, i: number) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i < 5 ? i * 0.05 : 0 }}
    >
      {message.sender === "system" ? (
        <div className="text-center text-xs text-muted-foreground">{message.content}</div>
      ) : (
        <div className={cn("flex gap-2", message.sender === "user" && "flex-row-reverse")}>
          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
              message.sender === "ai"
                ? "bg-accent text-accent-foreground"
                : "bg-foreground text-card"
            )}
          >
            {message.sender === "ai" ? "AI" : (user?.name?.[0]?.toUpperCase() || "Y")}
          </div>
          <div>
            <div
              className={cn(
                "max-w-[220px] rounded-2xl px-4 py-2",
                message.sender === "ai"
                  ? "rounded-tl-sm bg-muted text-foreground"
                  : "rounded-tr-sm bg-foreground text-card"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  message.sender === "ai" ? "text-muted-foreground" : "text-card/70"
                )}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {message.sources.map((src, j) => (
                  <a
                    key={j}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {src.title}
                  </a>
                ))}
              </div>
            )}
            {message.rewardGranted && (
              <p className="mt-1 text-xs text-green-500">
                Understanding detected — reward granted!
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )

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
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rooms
        </Link>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground">
            {persona?.name || "AI Tutor"}
          </h2>
          <p className="mt-1 text-muted-foreground">{persona?.subject || "General"}</p>
        </div>

        <div className="mb-8 rounded-2xl bg-muted p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Room Code</p>
          <button
            onClick={handleCopyCode}
            className="flex w-full items-center justify-between rounded-xl bg-card px-4 py-3 font-mono text-sm font-bold text-foreground transition-all hover:shadow-md"
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
              {members.length}
            </span>
          </div>

          <div className="space-y-2">
            {members.map((member, i) => {
              const isYou = member.user_id === user?.id
              return (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                      isYou ? "bg-foreground text-card" : "bg-muted text-foreground"
                    )}
                  >
                    {member.display_name?.[0]?.toUpperCase() || member.role[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {isYou ? "You" : (member.display_name || member.role)}
                    </span>
                    <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <Button
          variant="outline"
          className="mt-8 w-full gap-2 rounded-full text-destructive hover:bg-destructive/10"
          onClick={handleLeaveRoom}
        >
          <LogOut className="h-4 w-4" />
          Leave Room
        </Button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between border-b border-border bg-card px-6 py-4"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/rooms"
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground">
                  {persona?.subject || "Classroom"}
                </h1>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex h-2 w-2 rounded-full bg-green-500"
                />
              </div>
              <p className="text-sm text-muted-foreground">{persona?.name || "AI Tutor"}</p>
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
              {members.length}
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
                  3D models, VAPI interactions, and visual aids will appear here
                </p>
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-accent"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is thinking...
                  </motion.div>
                )}
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
                { id: "understood", icon: ThumbsUp, label: "Got it!", color: "text-green-500" },
              ].map((reaction) => (
                <motion.div key={reaction.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeReaction === reaction.id ? "default" : "outline"}
                    className={cn(
                      "gap-2 rounded-full px-6",
                      activeReaction === reaction.id && "bg-foreground text-card"
                    )}
                    onClick={() => handleReaction(reaction.id)}
                    disabled={isSending}
                  >
                    <reaction.icon
                      className={cn(
                        "h-4 w-4",
                        activeReaction !== reaction.id && reaction.color
                      )}
                    />
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

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, i) => renderMessage(message, i))}
              {isSending && (
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                    <motion.div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-2 w-2 rounded-full bg-muted-foreground/50"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}
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
                  className="h-12 rounded-full border-0 bg-muted/50"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message, i) => renderMessage(message, i))}
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
                    className="h-12 rounded-full border-0 bg-muted/50"
                    disabled={isSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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
