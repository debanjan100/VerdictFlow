"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useAuthModal } from "@/hooks/useAuthModal"

export default function CTASection() {
  const { openModal } = useAuthModal()

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-[#0a0f1e] to-[#0a0f1e] z-0" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 z-0" />
      
      {/* Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-blue-500/20 rounded-full blur-[100px] z-0" />

      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold mb-8 text-white tracking-tight leading-tight"
        >
          Ready to modernize your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            compliance workflow?
          </span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
        >
          Join dozens of government departments already using VerdictFlow to turn lengthy court judgments into trackable action plans instantly.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <button 
            onClick={() => openModal('signup')}
            className="inline-flex justify-center items-center gap-2 h-16 px-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transform hover:-translate-y-1"
          >
            Start Analyzing Judgments <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
