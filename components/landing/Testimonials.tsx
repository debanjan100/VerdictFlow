"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Kumar",
    title: "Joint Secretary",
    department: "Ministry of Environment & Forests",
    quote: "VerdictFlow has completely eliminated our compliance backlog. What used to take our legal team 3 days to parse is now extracted and assigned in under a minute.",
    initials: "RK",
    color: "bg-blue-500"
  },
  {
    name: "Priya Sharma",
    title: "Chief Compliance Officer",
    department: "Public Works Department",
    quote: "The accuracy of the Grok AI engine is astounding. It catches nuanced directives and financial penalties that humans occasionally missed during manual review.",
    initials: "PS",
    color: "bg-emerald-500"
  },
  {
    name: "Dr. Arvind Desai",
    title: "Director General",
    department: "Health & Family Welfare",
    quote: "Routing compliance actions to the right regional officers used to be a nightmare. Now, the dashboard tracks every deadline automatically. An absolute game-changer.",
    initials: "AD",
    color: "bg-purple-500"
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0a0f1e] relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold mb-4"
          >
            Trusted by Government Leaders
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            See how VerdictFlow is transforming legal operations across ministries.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="p-8 rounded-3xl bg-[#111827]/50 border border-white/5 relative"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-300 text-lg mb-8 leading-relaxed italic">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-sm text-slate-400">{t.title}</p>
                  <p className="text-xs text-blue-400 mt-0.5">{t.department}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
