"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Scale, Github, Linkedin } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success("Login successful")
      router.push("/dashboard") // Will redirect to (dashboard)/page.tsx
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl border-primary/20 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-2 text-center">
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <div className="bg-primary/10 p-4 rounded-full ring-1 ring-primary/20">
                <Scale className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight">VerdictFlow</CardTitle>
            <CardDescription className="text-base">
              Government Legal Intelligence Platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="officer@gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-base py-6 transition-all hover:scale-[1.02]" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-muted-foreground font-medium">Connect with us</p>
        <div className="flex justify-center items-center space-x-6">
          <a 
            href="https://github.com/debanjan100" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2"
          >
            <Github className="h-5 w-5" />
            <span className="text-sm font-medium">GitHub</span>
          </a>
          <a 
            href="https://www.linkedin.com/in/debanjanghorui5567/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#0A66C2] transition-colors flex items-center space-x-2"
          >
            <Linkedin className="h-5 w-5" />
            <span className="text-sm font-medium">LinkedIn</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
