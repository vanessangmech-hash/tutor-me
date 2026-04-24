"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, GraduationCap, Users, User, Settings } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/tutors", icon: GraduationCap, label: "Tutors" },
  { href: "/rooms", icon: Users, label: "Rooms" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-sidebar-border bg-sidebar py-6 lg:w-20">
      <Link href="/" className="mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-primary-foreground">L</span>
        </div>
      </Link>
      
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 hover:bg-sidebar-accent",
                isActive && "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              <span className="sr-only">{item.label}</span>
              
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-2 hidden rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
