"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Zap, ListChecks, Clock, Building2, BarChart3 } from "lucide-react"

const features = [
  {
    title: "AI-Powered Extraction",
    description: "Groq Llama 3.3 70B reads and understands complex legal language with 94%+ accuracy.",
    icon: BrainCircuit,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Real-Time Processing",
    description: "Get structured compliance actions from 100-page judgments in under 30 seconds.",
    icon: Zap,
    color: "from-emerald-500 to-green-400"
  },
  {
    title: "Action Plan Generation",
    description: "Auto-generate department-wise compliance checklists with categorized tasks.",
    icon: ListChecks,
    color: "from-amber-500 to-yellow-400"
  },
  {
    title: "Deadline Tracking",
    description: "Never miss a court-mandated deadline again with automated alerts and countdowns.",
    icon: Clock,
    color: "from-rose-500 to-red-400"
  },
  {
    title: "Multi-Department Support",
    description: "Route extracted actions to the right ministry or department automatically.",
    icon: Building2,
    color: "from-purple-500 to-fuchsia-400"
  },
  {
    title: "Analytics Dashboard",
    description: "Track compliance rates, officer performance, and pending actions across all cases.",
    icon: BarChart3,
    color: "from-indigo-500 to-blue-400"
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#0a0f1e]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold uppercase tracking-wide mb-6"
          >
            Powerful Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Everything you need to manage court compliance
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            Purpose-built for government departments to streamline the intake and execution of legal directives.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-[#111827]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#111827] transition-colors relative group overflow-hidden"
            >
              {/* Hover gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg shadow-black/20`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
