"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth, UserPlan } from "@/lib/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultMode?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>("free")
  const { login, signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await signup(name, email, password, selectedPlan)
      }
      onSuccess?.()
      onClose()
      // Reset form
      setName("")
      setEmail("")
      setPassword("")
      setSelectedPlan("free")
    } catch (error) {
      console.error("Auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-3xl bg-card shadow-2xl">
              {/* Header with gradient */}
              <div className="relative bg-foreground px-8 py-10 text-center">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full bg-card/10 p-2 text-card transition-colors hover:bg-card/20"
                >
                  <X className="h-4 w-4" />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"
                >
                  <Sparkles className="h-8 w-8 text-accent-foreground" />
                </motion.div>

                <h2 className="text-2xl font-bold text-card">
                  {mode === "login" ? "Welcome back" : "Join Tutor Me"}
                </h2>
                <p className="mt-1 text-sm text-card/70">
                  {mode === "login"
                    ? "Continue your learning journey"
                    : "Start learning with AI tutors today"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        key="name-field"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 rounded-xl border-border bg-muted/50 pl-11"
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-border bg-muted/50 pl-11"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-border bg-muted/50 pl-11"
                      required
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div 
                      key="plan-selector"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6"
                    >
                      <p className="mb-3 text-sm font-medium text-foreground">Choose your plan</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: "Free", price: "$0", value: "free" as UserPlan },
                          { name: "Student", price: "$9", value: "student" as UserPlan },
                          { name: "Pro", price: "$19", value: "professional" as UserPlan },
                        ].map((plan) => (
                          <label
                            key={plan.name}
                            className="group relative cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="plan"
                              checked={selectedPlan === plan.value}
                              onChange={() => setSelectedPlan(plan.value)}
                              className="peer sr-only"
                            />
                            <motion.div 
                              className="rounded-xl border-2 border-border bg-muted/30 p-3 text-center transition-all peer-checked:border-foreground peer-checked:bg-foreground/5"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <p className="text-xs text-muted-foreground">{plan.price}/mo</p>
                              <p className="font-medium text-foreground">{plan.name}</p>
                            </motion.div>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full gap-2 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                    />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {mode === "login" ? (
                      <>
                        {"Don't have an account? "}
                        <span className="font-medium text-foreground">Sign up</span>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <span className="font-medium text-foreground">Sign in</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
