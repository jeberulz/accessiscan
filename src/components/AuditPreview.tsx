import { ShieldCheck, CheckCircle, Layers, AlertTriangle, EyeOff, Lightbulb, Image as ImageIcon } from 'lucide-react';

export default function AuditPreview() {
  return (
    <section className="relative z-10">
      <div className="-mb-8 max-w-7xl md:px-6 mr-auto ml-auto pr-4 pl-4">
        <div className="relative w-full overflow-hidden shadow-black/50 bg-gradient-to-b from-white/[0.04] to-white/[0.02] border-white/10 border rounded-2xl mr-auto ml-auto shadow-2xl backdrop-blur-xl">
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

          <div className="grid grid-cols-1 md:grid-cols-12">
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
                          <div className="grid grid-cols-1 gap-3 text-xs text-slate-300">
                            <div>
                              <div className="text-[11px] text-red-300 mb-1">Before</div>
                              <pre className="whitespace-pre-wrap break-words">{`<img src="hero-image.jpg" />`}</pre>
                            </div>
                            <div>
                              <div className="text-[11px] text-emerald-300 mb-1">After</div>
                              <pre className="whitespace-pre-wrap break-words">{`<img src="hero-image.jpg" alt="Team collaborating on accessibility audit" />`}</pre>
                            </div>
                          </div>
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
                  <div className="text-xs text-emerald-300 mb-2 inline-flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Pro Tip</div>
                  <p className="text-xs text-emerald-200">Fixing the top 3 issues will improve accessibility by 67% and reduce legal risk significantly.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}



