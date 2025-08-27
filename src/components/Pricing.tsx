import { ShieldCheck, CheckCircle, Play, BookOpen } from 'lucide-react';

type Props = {
  loading: boolean;
  websiteUrl: string;
  onStartAudit: () => void;
};

export default function Pricing({ loading, websiteUrl, onStartAudit }: Props) {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="border-white/10 border rounded-3xl p-12 lg:p-16 bg-white/[0.03] backdrop-blur">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Start protecting your users today
            </p>
            <h3 className="text-3xl lg:text-4xl text-white tracking-tight mb-6 font-semibold">Simple, transparent pricing</h3>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Get started for free with our comprehensive accessibility audit. Upgrade to unlock advanced features and ongoing monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-emerald-500/30 p-8 bg-emerald-500/[0.05]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 text-xs font-medium text-white rounded-full border border-emerald-500/30 bg-emerald-500/15">Most Popular</span>
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-medium text-white mb-2">Free Accessibility Audit</h4>
                <p className="text-sm text-slate-400 mb-6">Get instant insights into your website's accessibility issues with our comprehensive AI analysis.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-white font-semibold">Free</span>
                  <span className="text-sm text-slate-400">always</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Complete WCAG compliance scan</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">AI-powered issue prioritization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Downloadable PDF report</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Code examples & fixes</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Impact assessment</span>
                </li>
              </ul>
              <button
                onClick={onStartAudit}
                disabled={loading || !websiteUrl.trim()}
                className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Free Audit
              </button>
            </div>

            <div className="relative rounded-2xl border border-white/10 p-8 bg-white/[0.02]">
              <div className="mb-8">
                <h4 className="text-xl font-medium text-white mb-2">AccessiScan Pro</h4>
                <p className="text-sm text-slate-400 mb-6">Ongoing monitoring, team collaboration, and advanced compliance features for professional teams.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl text-white font-semibold">$49</span>
                  <span className="text-sm text-slate-400">per month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Continuous monitoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Team collaboration tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">API access</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-400 flex-shrink-0 h-4 w-4" />
                  <span className="text-sm text-slate-300">Priority support</span>
                </li>
              </ul>
              <button className="w-full py-4 px-6 rounded-xl text-sm font-medium text-slate-300 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/5">
                Contact Sales
              </button>
            </div>
          </div>

          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-400 mb-4">
              Join thousands of websites improving their accessibility. No credit card required for free audit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-slate-200 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/5">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </button>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5">
                <BookOpen className="mr-2 h-4 w-4" />
                Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


