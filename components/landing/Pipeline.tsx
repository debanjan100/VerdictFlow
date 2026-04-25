export default function Pipeline() {
  const pipelineSteps = [
    { icon: "📄", title: "Extract", desc: "Case details, directions, parties, timelines", color: "var(--blue)" },
    { icon: "⚙", title: "Generate", desc: "Action plan, priority, compliance roadmap", color: "var(--gold)" },
    { icon: "🛡", title: "Verify", desc: "Human review with confidence indicators", color: "#9b59b6" },
    { icon: "📊", title: "Dashboard", desc: "Trusted, department-wise decision view", color: "var(--success)" }
  ]

  return (
    <section id="pipeline" className="max-w-[1100px] mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <span className="section-tag mb-4">Architecture</span>
        <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">The 4-Stage Pipeline</h2>
        <p className="text-[var(--muted)] max-w-2xl mx-auto">A seamless flow of data from court system to department heads.</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-10 overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] flex items-start justify-between relative">
          
          {/* Connecting Line */}
          <div className="absolute top-[36px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[var(--blue)] via-[var(--gold)] to-[var(--success)] opacity-30 -z-10" />

          {pipelineSteps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center px-4 relative z-10">
              <div 
                className="w-[72px] h-[72px] rounded-full bg-[var(--surface2)] border-2 flex items-center justify-center text-[26px] mb-6 shadow-xl"
                style={{ borderColor: step.color }}
              >
                {step.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-[var(--muted)] text-sm leading-[1.5] max-w-[160px]">
                {step.desc}
              </p>
            </div>
          ))}
          
        </div>
      </div>
    </section>
  )
}
