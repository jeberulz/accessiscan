"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import AssessmentResults from '@/components/AssessmentResults';
import type { AssessmentResult } from '@/shared/types';
import Hero from '@/components/Hero';
import { useToast } from '@/components/Toast';
import AssessmentHistory from '@/components/AssessmentHistory';
import BatchAssessment from '@/components/BatchAssessment';
import BatchResults from '@/components/BatchResults';
import { ArrowLeft, History, Rocket } from 'lucide-react';

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
  const { addToast } = useToast();
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [footerUrl, setFooterUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBatchAssessment, setShowBatchAssessment] = useState(false);
  const [batchResults, setBatchResults] = useState<AssessmentResult[] | null>(null);



  const handleNewAssessment = () => {
    setAssessment(null);
    setBatchResults(null);
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
        addToast('Assessment completed successfully!', 'success');
      } else {
        addToast(json?.message || 'Assessment failed', 'error');
      }
    } catch (e) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const performAssessment = async (body: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json?.success) {
        setAssessment(json.data as AssessmentResult);
        setShowForm(false);
        addToast('Assessment completed successfully!', 'success');
      } else {
        addToast(json?.message || 'Assessment failed', 'error');
      }
    } catch (e) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (source?: 'hero' | 'footer') => {
    const urlToScan = source === 'footer' ? footerUrl.trim() : websiteUrl.trim();
    if (!urlToScan) return;
    await performAssessment({ assessmentType: 'url', websiteUrl: urlToScan });
  };

  const handleImageScan = async (imageFile: string) => {
    await performAssessment({ assessmentType: 'image', imageFile });
  };

  const handleBatchComplete = (results: AssessmentResult[]) => {
    setBatchResults(results);
    setShowBatchAssessment(false);
    setShowForm(false);
    addToast(`Batch assessment completed! ${results.length} website${results.length !== 1 ? 's' : ''} assessed.`, 'success');
  };

  // Show batch results
  if (batchResults && !showForm) {
    return (
      <BatchResults
        results={batchResults}
        onBack={handleNewAssessment}
        onNewBatch={() => {
          setBatchResults(null);
          setShowBatchAssessment(true);
        }}
      />
    );
  }

  // Show single assessment results
  if (assessment && !showForm) {
    return (
      <div className="min-h-screen bg-black text-slate-100 antialiased">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
        </div>
        <Header 
          onShowHistory={() => setShowHistory(true)} 
          onShowBatch={() => setShowBatchAssessment(true)}
        />
        <main className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleNewAssessment}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Assess Another Website
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-emerald-500/30 bg-emerald-600/10 text-emerald-300 hover:bg-emerald-600/20 font-medium transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </button>
              <button
                onClick={() => setShowBatchAssessment(true)}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-blue-500/30 bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 font-medium transition-colors"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Batch Assessment
              </button>
            </div>
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
      <Header 
        onShowHistory={() => setShowHistory(true)} 
        onShowBatch={() => setShowBatchAssessment(true)}
      />
      <Hero
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        loading={loading}
        onScan={() => handleScan('hero')}
        onImageScan={handleImageScan}
        onShowBatch={() => setShowBatchAssessment(true)}
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

      {/* Assessment History Modal */}
      {showHistory && (
        <AssessmentHistory
          onSelectAssessment={(selectedAssessment) => {
            setAssessment(selectedAssessment);
            setShowForm(false);
            setShowHistory(false);
            addToast('Assessment loaded from history', 'info');
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Batch Assessment Modal */}
      {showBatchAssessment && (
        <BatchAssessment
          onBatchComplete={handleBatchComplete}
          onClose={() => setShowBatchAssessment(false)}
        />
      )}
      
    </div>
  );
}

