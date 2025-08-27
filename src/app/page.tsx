"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import AssessmentResults from '@/components/AssessmentResults';
import type { AssessmentResult } from '@/shared/types';
import Hero from '@/components/Hero';

const AuditPreview = dynamic(() => import('@/components/AuditPreview'), {
  ssr: false,
});

const KeyFeatures = dynamic(() => import('@/components/KeyFeatures'), {
  ssr: false,
});

const Pricing = dynamic(() => import('@/components/Pricing'), {
  ssr: false,
});

const FooterCta = dynamic(() => import('@/components/FooterCta'), {
  ssr: false,
});

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
      <Hero
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        loading={loading}
        onScan={() => handleScan('hero')}
      />

      <AuditPreview />
      
      <KeyFeatures />

      <Pricing loading={loading} websiteUrl={websiteUrl} onStartAudit={() => handleScan('hero')} />

      <FooterCta
        footerUrl={footerUrl}
        setFooterUrl={setFooterUrl}
        setWebsiteUrl={setWebsiteUrl}
        loading={loading}
        onScanFooter={() => handleScan('footer')}
      />
      
    </div>
  );
}

