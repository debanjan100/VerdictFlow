"use client"

import { useState } from "react"
import { Scale, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess("")
    
    if (!formData.name || !formData.email || !formData.role || !formData.password || !formData.confirmPassword) {
      return setError("Please complete all fields.")
    }
    if (formData.password.length < 8) return setError("Password must be at least 8 characters.")
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.")
    
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.name, role: formData.role } }
    })
    
    if (authError) {
      setError(authError.message)
    } else {
      setSuccess("Account created! Check your email to verify.")
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="w-full max-w-[440px] bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 sm:p-10 shadow-2xl relative z-10">
      
      <div className="flex flex-col items-center mb-8">
        <Link href="/">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--blue)] flex items-center justify-center shadow-lg mb-4 cursor-pointer hover:scale-105 transition-transform">
            <Scale className="text-white w-6 h-6" />
          </div>
        </Link>
        <h1 className="font-playfair text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-[var(--muted)] text-center text-sm">Join VerdictFlow — AI case management</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-6 bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] px-4 py-3 rounded-xl flex items-start text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 mr-2 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-6 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] px-4 py-3 rounded-xl flex items-start text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 mr-2 shrink-0" />
            <p>{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input 
            type="text" required placeholder="Full Name"
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all"
            value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <select 
            required
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all appearance-none"
            value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}
          >
            <option value="" disabled className="text-[var(--muted)]">Select Role</option>
            <option value="reviewer">Case Reviewer</option>
            <option value="department_head">Department Head</option>
            <option value="viewer">Viewer / Analyst</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input 
            type="email" required placeholder="you@department.gov.in"
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all"
            value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input 
            type="password" required placeholder="Password"
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all"
            value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input 
            type="password" required placeholder="Confirm Password"
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all"
            value={formData.confirmPassword} onChange={e=>setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-[var(--blue)] to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg flex justify-center items-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 h-px bg-[var(--border)]"></div>
        <span className="px-4 text-xs text-[var(--muted)] uppercase tracking-wider font-medium">Or</span>
        <div className="flex-1 h-px bg-[var(--border)]"></div>
      </div>

      <button 
        onClick={handleGoogleAuth} type="button"
        className="mt-6 w-full py-3.5 bg-[var(--surface2)] hover:bg-[var(--border)] border border-[var(--border)] text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--gold)] hover:text-white font-medium transition-colors">
          Sign in
        </Link>
      </p>

    </div>
  )
}
