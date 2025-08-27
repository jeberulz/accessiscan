import { Menu, X } from 'lucide-react';
import { useState } from 'react';
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <header className="relative z-10">
      <nav className="flex max-w-7xl md:px-6 mx-auto pt-4 pr-4 pb-4 pl-4 items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <svg className="md:w-14 md:h-14 w-9 h-9 text-emerald-400" viewBox="0 0 48 48" aria-hidden="true" strokeWidth="1.5">
            <rect width="32" height="32" x="8" y="8" rx="4" fill="none" stroke="currentColor"></rect>
            <circle cx="16" cy="16" r="2" fill="currentColor"></circle>
            <circle cx="32" cy="16" r="2" fill="currentColor"></circle>
            <path d="M16 28 Q24 36 32 28" stroke="currentColor" fill="none"></path>
          </svg>
          <span className="text-lg font-medium tracking-tight text-white">AccessiScan</span>
        </a>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden">
          {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          <span className="sr-only">Open menu</span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Reports</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
          <div className="hidden h-6 w-px bg-white/10 md:block"></div>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</a>
          <button className="group relative inline-flex cursor-pointer transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:-translate-y-[3px] hover:scale-[1.1] hover:text-white text-xs font-medium text-white/70 tracking-tight rounded-full pt-[8px] pr-[16px] pb-[8px] pl-[16px] items-center justify-center" style={{boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.1)',background:'radial-gradient(ellipse at bottom,rgba(71,81,92,1) 0%,rgba(0,0,0,1) 100%)'}}>
            <span className="relative z-10 text-sm font-normal rounded-full">Start Free Audit</span>
            <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[1px] w-[70%] -translate-x-1/2 opacity-20 transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] group-hover:opacity-80 text-xs rounded-full" style={{background:'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)'}}></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="mx-auto max-w-7xl px-4 md:hidden">
          <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <a className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors" href="#">How it works</a>
            <a className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors" href="#">Features</a>
            <a className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors" href="#">Reports</a>
            <a className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors" href="#">Pricing</a>
            <div className="my-2 h-px w-full bg-white/10"></div>
            <div className="flex items-center gap-2">
            
              <a href="#" className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700 transition-colors">Start Free Audit</a>
            </div>
          </div>
        </div>}
    </header>;
}
