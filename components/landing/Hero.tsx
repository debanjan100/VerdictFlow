"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, ShieldCheck, Zap, Activity } from "lucide-react"
import { useAuthModal } from "@/hooks/useAuthModal"

const text = "Transform Court Judgments Into Action — Instantly."
const words = text.split(" ")

export default function Hero() {
  const { openModal } = useAuthModal()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a0f1e]" />
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, #0d1b6e 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, #0d1b6e 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, #0d1b6e 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-40"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      </div>

      <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Text Content */}
        <div className="max-w-2xl">
          {/* Floating Stat Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> 94% accuracy rate
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5" /> &lt; 30 sec analysis
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wide">
              <Activity className="w-3.5 h-3.5" /> Used by 12+ departments
            </div>
          </motion.div>

          {/* Word-by-word reveal */}
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="inline-block mr-3 lg:mr-4"
              >
                {word === "Action" ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed"
          >
            VerdictFlow uses AI to extract compliance obligations from court PDFs and turn them into trackable action plans for government departments.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => openModal('signup')}
              className="inline-flex justify-center items-center gap-2 h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex justify-center items-center gap-2 h-14 px-8 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-lg transition-all backdrop-blur-sm">
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Right SVG Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative h-[500px] w-full max-w-lg mx-auto"
        >
          {/* Glowing orb behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px]" />
          
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 400 500" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              
              {/* Document Base */}
              <motion.rect 
                x="100" y="50" width="200" height="280" rx="12" 
                fill="#1e293b" stroke="#334155" strokeWidth="2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Text lines in doc */}
              {[...Array(6)].map((_, i) => (
                <motion.rect 
                  key={`line-${i}`}
                  x="130" y={100 + i * 24} width={i % 2 === 0 ? "140" : "100"} height="6" rx="3" 
                  fill="#334155"
                  initial={{ width: 0 }}
                  animate={{ width: i % 2 === 0 ? 140 : 100 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                />
              ))}

              {/* Scanner Line */}
              <motion.line 
                x1="80" y1="50" x2="320" y2="50" 
                stroke="#3b82f6" strokeWidth="4"
                style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
                animate={{ y: [50, 330, 50] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Extraction Particles */}
              {[...Array(3)].map((_, i) => (
                <motion.path
                  key={`particle-${i}`}
                  d={`M 200 ${150 + i * 30} Q 300 ${200 + i * 20} 320 ${350 + i * 20}`}
                  stroke="url(#gradient-line)" strokeWidth="3" strokeDasharray="5 5"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: 1 + i * 0.5, repeat: Infinity }}
                />
              ))}

              {/* Data Cards popping out */}
              <motion.g
                initial={{ y: 400, opacity: 0 }}
                animate={{ y: 340, opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <rect x="50" y="340" width="140" height="80" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.3))" }} />
                <rect x="70" y="360" width="80" height="6" rx="3" fill="#60a5fa" />
                <rect x="70" y="375" width="100" height="4" rx="2" fill="#334155" />
                <rect x="70" y="385" width="60" height="4" rx="2" fill="#334155" />
              </motion.g>

              <motion.g
                initial={{ y: 450, opacity: 0 }}
                animate={{ y: 380, opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.5 }}
              >
                <rect x="210" y="380" width="140" height="80" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1" style={{ filter: "drop-shadow(0 0 10px rgba(16,185,129,0.3))" }} />
                <rect x="230" y="400" width="80" height="6" rx="3" fill="#34d399" />
                <rect x="230" y="415" width="100" height="4" rx="2" fill="#334155" />
                <rect x="230" y="425" width="60" height="4" rx="2" fill="#334155" />
              </motion.g>

              <defs>
                <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
