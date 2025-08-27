import { Zap, Brain, TrendingUp, Code } from 'lucide-react';

export default function KeyFeatures() {
  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            <Zap className="h-4 w-4 text-emerald-400" />
            Powered by advanced AI
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">
            Accessibility auditing, reimagined
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Our AI understands context, prioritizes by impact, and provides actionable insights that actually help your users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Brain className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">AI-Powered Detection</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Our machine learning models identify accessibility issues with 95% accuracy, going beyond automated tools to understand context and user impact.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Smart Prioritization</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Issues are ranked by impact, affected user percentage, and fix complexity. Focus on what matters most for your users and compliance.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Code className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Actionable Solutions</h3>
            <p className="text-slate-300 text-sm leading-relaxed">Get specific code examples, implementation guides, and before/after comparisons. No guesswork, just clear paths to compliance.</p>
          </div>
        </div>
      </div>
    </section>
  );
}



