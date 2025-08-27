"use client";
import { Search, Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  footerUrl: string;
  setFooterUrl: Dispatch<SetStateAction<string>>;
  setWebsiteUrl: Dispatch<SetStateAction<string>>;
  loading: boolean;
  onScanFooter: () => void;
};

export default function FooterCta({ footerUrl, setFooterUrl, setWebsiteUrl, loading, onScanFooter }: Props) {
  return (
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
                      if (footerUrl.trim() && !loading) onScanFooter();
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setWebsiteUrl(footerUrl);
                    onScanFooter();
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
  );
}



