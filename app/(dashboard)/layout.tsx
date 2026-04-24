"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, Home, Upload, FileText, CheckSquare, Settings, LogOut, Github, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Upload Judgment", href: "/upload", icon: Upload },
  { name: "Cases Directory", href: "/cases", icon: FileText },
  { name: "Pending Review", href: "/review", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Scale className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">VerdictFlow</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
          
          <div className="pt-4 border-t space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Connect with us</p>
            <div className="flex flex-col space-y-2 px-2">
              <a 
                href="https://github.com/debanjan100" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center text-xs font-medium"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
              <a 
                href="https://www.linkedin.com/in/debanjanghorui5567/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#0A66C2] transition-colors flex items-center text-xs font-medium"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden flex items-center">
            <Scale className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold">VerdictFlow</span>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium">Officer Portal</p>
                <p className="text-muted-foreground text-xs">Gov. User</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-sm font-bold text-primary">OP</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
