"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/tutors", label: "Tutors" },
  { href: "/rooms", label: "Rooms" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
]

export function Navbar({ onAuthClick }: { onAuthClick?: () => void }) {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-6 z-50 mx-auto max-w-4xl px-4"
    >
      <nav className="flex items-center justify-between rounded-full bg-card/80 px-2 py-2 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-1 pl-4">
          {navItems.map((item, i) => {
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
      </nav>
    </motion.header>
  )
}
