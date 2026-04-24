"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

const navItems = [
  { href: "/tutors", label: "Tutors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

export function Navbar({ onAuthClick }: { onAuthClick?: () => void }) {
  const pathname = usePathname()
  const { user, isLoggedIn, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-6 z-50 mx-auto max-w-4xl px-4"
    >
      <nav className="flex items-center justify-between rounded-full bg-card/80 px-2 py-2 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 pl-4">
          <motion.div 
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm font-bold text-card">T</span>
          </motion.div>
          <span className="font-semibold text-foreground">Tutor Me</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-muted"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Auth Buttons or User Menu */}
        {isLoggedIn && user ? (
          <div className="relative">
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 transition-colors hover:bg-muted/80"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border"
                  >
                    <div className="border-b border-border p-4">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground capitalize">
                        {user.plan} Plan
                      </span>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowDropdown(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full font-medium"
              onClick={onAuthClick}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-full font-medium"
              onClick={onAuthClick}
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </nav>
    </motion.header>
  )
}
