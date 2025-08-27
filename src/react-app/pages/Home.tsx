import { useState } from 'react';
import { Brain, TrendingUp, Code, Zap, Shield, CheckCircle } from 'lucide-react';
import Header from '@/react-app/components/Header';
import AssessmentForm from '@/react-app/components/AssessmentForm';
import AssessmentResults from '@/react-app/components/AssessmentResults';
import { AssessmentResult } from '@/shared/types';

export default function Home() {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessment(result);
    setShowForm(false);
  };

  const handleNewAssessment = () => {
    setAssessment(null);
    setShowForm(true);
  };

  if (assessment && !showForm) {
    return (
      <div className="min-h-screen bg-black text-slate-100 antialiased">
        {/* Backdrop glows */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
        </div>
        
        <Header />
        <main className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <button
              onClick={handleNewAssessment}
              className="inline-flex items-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 font-medium transition-colors"
            >
              ← Assess Another Website
            </button>
          </div>
          <AssessmentResults assessment={assessment} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 antialiased">
      {/* Backdrop glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-16">
          <AssessmentForm onAssessmentComplete={handleAssessmentComplete} />
        </div>

        {/* Dashboard Preview */}
        <div className="-mb-8 max-w-7xl md:px-6 mr-auto ml-auto pr-4 pl-4">
            <div className="relative w-full overflow-hidden shadow-black/50 bg-gradient-to-b from-white/[0.04] to-white/[0.02] border-white/10 border rounded-2xl mr-auto ml-auto shadow-2xl backdrop-blur-xl">
                {/* Topbar */}
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
                        <span className="h-3 w-3 rounded-full bg-yellow-400/80"></span>
                        <span className="h-3 w-3 rounded-full bg-green-500/80"></span>
                        <div className="ml-3 hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 sm:flex">
                            <Shield className="h-3.5 w-3.5 text-emerald-400" />
                            AccessiScan Dashboard — example.com audit
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 sm:inline-flex">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Scan Complete
                        </span>
                        <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Export Report</button>
                    </div>
                </div>

                {/* Dashboard body */}
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Left panel - Issue Categories */}
                    <aside className="hidden md:block md:col-span-3 bg-black/30 border-white/10 border-r pt-3 pr-3 pb-3 pl-3">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300">
                                <Brain className="h-3.5 w-3.5" />
                                Issue Categories
                            </div>
                            <span className="text-xs text-slate-400">47 found</span>
                        </div>

                        <div className="space-y-2">
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-red-300">Critical</span>
                                    <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">12</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-3 w-3 text-red-400" />
                                        <span className="text-red-200">Missing alt text</span>
                                        <span className="ml-auto text-red-300">8</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-3 w-3 text-red-400" />
                                        <span className="text-red-200">Low contrast</span>
                                        <span className="ml-auto text-red-300">4</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-amber-300">Moderate</span>
                                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">23</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3 text-amber-400" />
                                        <span className="text-amber-200">Focus indicators</span>
                                        <span className="ml-auto text-amber-300">15</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Code className="h-3 w-3 text-amber-400" />
                                        <span className="text-amber-200">Heading structure</span>
                                        <span className="ml-auto text-amber-300">8</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-emerald-300">Minor</span>
                                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">12</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-200">Link descriptions</span>
                                        <span className="ml-auto text-emerald-300">7</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-200">List markup</span>
                                        <span className="ml-auto text-emerald-300">5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content - Issue Details */}
                    <main className="relative md:col-span-6 bg-black/20">
                        <div className="border-b border-white/10 px-3 py-2">
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <Zap className="h-4 w-4 text-red-400" />
                                <span>Critical Issue</span>
                                <span className="ml-auto">Impact: High • Users affected: 85%</span>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-red-500/20 p-2">
                                            <Code className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-white mb-2">Missing Alt Text on Images</h3>
                                            <p className="text-sm text-slate-300 mb-4">8 images lack alternative text, making content inaccessible to screen readers and users with visual impairments.</p>
                                            
                                            <div className="bg-black/40 rounded-lg p-3 mb-4 border border-white/10">
                                                <div className="text-xs text-slate-400 mb-2">Code example:</div>
                                                <code className="text-xs text-red-300 font-mono">
                                                    &lt;img src="hero-image.jpg" /&gt;  ❌<br />
                                                    <span className="text-emerald-300">&lt;img src="hero-image.jpg" alt="Team collaborating on accessibility audit" /&gt;  ✅</span>
                                                </code>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Affects screen readers
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                                                    <Shield className="h-3 w-3" />
                                                    WCAG 1.1.1 Level A
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                                                    <Zap className="h-3 w-3" />
                                                    5 min fix
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Page preview with highlighted issues */}
                            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="text-sm text-slate-300 mb-3">Preview with issues highlighted:</div>
                                <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-4 space-y-2">
                                        <div className="h-3 bg-white/20 rounded w-2/3"></div>
                                        <div className="h-2 bg-white/10 rounded w-full"></div>
                                        <div className="h-2 bg-white/10 rounded w-4/5"></div>
                                        
                                        {/* Highlighted problematic images */}
                                        <div className="flex gap-2 mt-4">
                                            <div className="w-16 h-12 bg-red-500/30 border-2 border-red-500 rounded relative">
                                                <Code className="h-4 w-4 text-red-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">!</span>
                                                </div>
                                            </div>
                                            <div className="w-16 h-12 bg-red-500/30 border-2 border-red-500 rounded relative">
                                                <Code className="h-4 w-4 text-red-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">!</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Right panel - Recommendations */}
                    <aside className="hidden md:block md:col-span-3 border-l border-white/10 bg-black/30 p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300">
                                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                                Quick Fixes
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/5 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-white mb-2">Immediate Actions</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                                            <span className="text-red-400 text-xs">1</span>
                                        </div>
                                        <span className="text-slate-300">Add descriptive alt text to hero image</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                                            <span className="text-red-400 text-xs">2</span>
                                        </div>
                                        <span className="text-slate-300">Update product gallery images with context</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                                            <span className="text-amber-400 text-xs">3</span>
                                        </div>
                                        <span className="text-slate-300">Improve button contrast ratios</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-white mb-2">Impact Score</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-300">Current Score</span>
                                        <span className="text-red-400 font-medium">42/100</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{width: '42%'}}></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-300">Potential Score</span>
                                        <span className="text-emerald-400 font-medium">89/100</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1">
                                        <div className="bg-emerald-500 h-1 rounded-full" style={{width: '89%'}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                <div className="text-xs text-emerald-300 mb-2">💡 Pro Tip</div>
                                <p className="text-xs text-emerald-200">Fixing the top 3 issues will improve accessibility by 67% and reduce legal risk significantly.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Pricing Section */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="border-white/10 border rounded-3xl p-12 lg:p-16 bg-white/[0.03] backdrop-blur">
            <div className="text-center mb-16">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <Shield className="h-4 w-4 text-emerald-400" />
                Start protecting your users today
              </p>
              <h3 className="text-3xl lg:text-4xl text-white tracking-tight mb-6 font-semibold">Simple, transparent pricing</h3>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Get started for free with our comprehensive accessibility audit. Upgrade to unlock advanced features and ongoing monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Audit */}
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
                <button className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  Start Free Audit
                </button>
              </div>

              {/* Pro Plan */}
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Make your website accessible for everyone</h2>
              <p className="mt-2 text-sm text-slate-400">Start with a free audit and see exactly what needs to be fixed. No commitment, instant results.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <span>© 2025 AccessiScan</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-300 transition-colors">WCAG Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
