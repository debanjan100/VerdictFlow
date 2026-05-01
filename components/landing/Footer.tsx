import Link from "next/link"
import { Scale, Twitter, Linkedin, Mail, Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-[#050811] pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Logo & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">VerdictFlow</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Transforming complex court judgments into actionable, trackable compliance plans for government departments and ministries.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Security & Privacy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Integration API</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Government Portal FAQ</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Compliance Guide 2024</Link></li>
            </ul>
          </div>

          {/* Col 4: Connect */}
          <div>
            <h4 className="text-white font-semibold mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-slate-400 mb-6">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact Sales</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Support Center</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Partner Program</Link></li>
            </ul>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-500 hover:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} VerdictFlow. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
