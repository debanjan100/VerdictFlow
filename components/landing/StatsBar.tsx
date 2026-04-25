"use client"

import { useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const stats = [
  { value: 10000, suffix: "+", label: "Pages Analyzed", isTime: false },
  { value: 500, suffix: "+", label: "Cases Processed", isTime: false },
  { value: 98, suffix: "%", label: "Compliance Rate", isTime: false },
  { value: 30, suffix: "sec", label: "Avg. Analysis Time", isTime: true }
]

function AnimatedCounter({ end, duration = 2 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationFrame: number

      const animate = (time: number) => {
        if (!startTime) startTime = time
        const progress = (time - startTime) / (duration * 1000)

        if (progress < 1) {
          setCount(Math.floor(end * (1 - Math.pow(1 - progress, 3)))) // easeOutCubic
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [end, duration, isInView])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatsBar() {
  return (
    <section className="py-16 bg-[#060913] border-y border-white/5 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                <AnimatedCounter end={stat.value} />
                <span className="text-blue-500">{stat.suffix}</span>
              </div>
              <p className="text-sm md:text-base text-slate-400 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
