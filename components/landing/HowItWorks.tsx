"use client"

import { motion } from "framer-motion"
import { UploadCloud, BrainCircuit, ListChecks, ShieldCheck } from "lucide-react"

const steps = [
  {
    num: "01",
    title: "Upload PDF",
    description: "Securely upload raw court judgments. We handle scanned documents and standard PDFs up to 50MB.",
    icon: UploadCloud,
    color: "from-blue-500 to-cyan-400"
  },
  {
    num: "02",
    title: "AI Analyzes",
    description: "Groq Llama 3.3 70B extracts key metadata and identifies all compliance directives in seconds.",
    icon: BrainCircuit,
    color: "from-emerald-500 to-green-400"
  },
  {
    num: "03",
    title: "Review Actions",
    description: "Officers review the auto-generated action plan, edit details if necessary, and confirm tasks.",
    icon: ListChecks,
    color: "from-amber-500 to-yellow-400"
  },
  {
    num: "04",
    title: "Assign & Track",
    description: "Tasks are routed to correct departments with automated deadline tracking and escalation workflows.",
    icon: ShieldCheck,
    color: "from-purple-500 to-fuchsia-400"
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#0a0f1e]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            How VerdictFlow Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            From complex legal PDF to actionable compliance tracking in four simple steps.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="relative flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <div className="relative mb-6">
                  {/* Number Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#0a0f1e] border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 z-10">
                    {step.num}
                  </div>
                  
                  {/* Icon Circle */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg shadow-black/40`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
