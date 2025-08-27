"use client";
import { useState } from 'react';
import Header from '@/components/Header';
import AssessmentResults from '@/components/AssessmentResults';
import type { AssessmentResult } from '@/shared/types';
import {
  Sparkles,
  Search,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Zap,
  Brain,
  TrendingUp,
  Code,
  Play,
  BookOpen,
} from 'lucide-react';

export default function Page() {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [footerUrl, setFooterUrl] = useState('');
  const [loading, setLoading] = useState(false);



  const handleNewAssessment = () => {
    setAssessment(null);
    setShowForm(true);
    setWebsiteUrl('');
    setFooterUrl('');
  };

  const handleScan = async (source?: 'hero' | 'footer') => {
    const urlToScan = source === 'footer' ? footerUrl.trim() : websiteUrl.trim();
    if (!urlToScan) return;
    try {
      setLoading(true);
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentType: 'url', websiteUrl: urlToScan }),
      });
      const json = await res.json();
      if (json?.success) {
        setAssessment(json.data as AssessmentResult);
        setShowForm(false);
      } else {
        alert(json?.message || 'Assessment failed');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (assessment && !showForm) {
    return (
      <div className="min-h-screen bg-black text-slate-100 antialiased">
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
          {assessment && <AssessmentResults assessment={assessment} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
      </div>
      <Header />
      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI-powered accessibility insights in seconds
            </p>
            <h1 className="sm:text-5xl md:text-7xl text-4xl font-semibold tracking-tight">
              Find accessibility issues before your users do
            </h1>
            <p className="mt-5 text-base md:text-lg text-slate-300">
              Our AI scans your website for WCAG compliance issues, prioritizes by impact, and provides clear remediation steps. Get instant insights that protect your users and your business.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur">
                <input
                  id="websiteUrl"
                  type="url"
                  placeholder="Enter your website URL"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 px-3 py-2 min-w-[280px]"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <button
                  id="scanButton"
                  onClick={() => handleScan('hero')}
                  disabled={loading || !websiteUrl.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {loading ? 'Scanning...' : 'Scan Now'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
              <div className="flex -space-x-2">
                <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="" />
                <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1494790108755-2616b612b602?w=100&h=100&fit=crop&crop=face" alt="" />
                <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="" />
              </div>
              <span>Trusted by 10,000+ websites for accessibility compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Interface Preview */}
      <section className="relative z-10">
        <div className="-mb-8 max-w-7xl md:px-6 mr-auto ml-auto pr-4 pl-4">
          <div className="relative w-full overflow-hidden shadow-black/50 bg-gradient-to-b from-white/[0.04] to-white/[0.02] border-white/10 border rounded-2xl mr-auto ml-auto shadow-2xl backdrop-blur-xl">
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-400/80"></span>
                <span className="h-3 w-3 rounded-full bg-green-500/80"></span>
                <div className="ml-3 hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
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
                    <Layers className="h-3.5 w-3.5" />
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
                        <EyeOff className="h-3 w-3 text-red-400" />
                        <span className="text-red-200">Missing alt text</span>
                        <span className="ml-auto text-red-300">8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
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
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
                        <span className="text-amber-200">Focus indicators</span>
                        <span className="ml-auto text-amber-300">15</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
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
                        <AlertTriangle className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-200">Link descriptions</span>
                        <span className="ml-auto text-emerald-300">7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-emerald-400" />
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
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span>Critical Issue</span>
                    <span className="ml-auto">Impact: High • Users affected: 85%</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-500/20 p-2">
                          <EyeOff className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white mb-2">Missing Alt Text on Images</h3>
                          <p className="text-sm text-slate-300 mb-4">8 images lack alternative text, making content inaccessible to screen readers and users with visual impairments.</p>

                          <div className="bg-black/40 rounded-lg p-3 mb-4 border border-white/10">
                            <div className="text-xs text-slate-400 mb-2">Code example:</div>
                            <code className="text-xs text-red-300 font-mono">
                              {`<img src="hero-image.jpg" />  ❌`}<br />
                              <span className="text-emerald-300">{`<img src="hero-image.jpg" alt="Team collaborating on accessibility audit" />  ✅`}</span>
                            </code>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300">
                              <AlertTriangle className="h-3 w-3" />
                              Affects screen readers
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                              <Lightbulb className="h-3 w-3" />
                              WCAG 1.1.1 Level A
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                              <AlertTriangle className="h-3 w-3" />
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
                        <div className="flex gap-2 mt-4">
                          <div className="w-16 h-12 bg-red-500/30 border-2 border-red-500 rounded relative">
                            <ImageIcon className="h-4 w-4 text-red-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                          </div>
                          <div className="w-16 h-12 bg-red-500/30 border-2 border-red-500 rounded relative">
                            <ImageIcon className="h-4 w-4 text-red-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
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
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Potential Score</span>
                        <span className="text-emerald-400 font-medium">89/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '89%' }}></div>
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
      
      {/* Key Features Section */}
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
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
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
                <button
                  onClick={() => handleScan('hero')}
                  disabled={loading || !websiteUrl.trim()}
                  className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

      {/* Footer */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Make your website accessible for everyone</h2>
              <p className="mt-2 text-sm text-slate-400">Start with a free audit and see exactly what needs to be fixed. No commitment, instant results.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur">
                  <input
                    id="footerUrl"
                    type="url"
                    placeholder="Enter your website URL"
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 px-3 py-2 min-w-[240px]"
                    value={footerUrl}
                    onChange={(e) => setFooterUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setWebsiteUrl(footerUrl);
                        handleScan('footer');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      setWebsiteUrl(footerUrl);
                      handleScan('footer');
                    }}
                    disabled={loading || !footerUrl.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Start Free Audit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <span>© 2025 AccessiScan</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300">Privacy</a>
              <a href="#" className="hover:text-slate-300">Terms</a>
              <a href="#" className="hover:text-slate-300">WCAG Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}

