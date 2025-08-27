"use client";
import { useState } from 'react';
import { Plus, X, Globe, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { AssessmentResult } from '@/shared/types';

interface BatchAssessmentProps {
  onBatchComplete: (results: AssessmentResult[]) => void;
  onClose: () => void;
}

interface BatchItem {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: AssessmentResult;
  error?: string;
}

export default function BatchAssessment({ onBatchComplete, onClose }: BatchAssessmentProps) {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: '1', url: '', status: 'pending' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState<string | null>(null);

  const addUrl = () => {
    const newId = (batchItems.length + 1).toString();
    setBatchItems([...batchItems, { id: newId, url: '', status: 'pending' }]);
  };

  const removeUrl = (id: string) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.id !== id));
    }
  };

  const updateUrl = (id: string, url: string) => {
    setBatchItems(batchItems.map(item => 
      item.id === id ? { ...item, url } : item
    ));
  };

  const validateUrls = () => {
    const validItems = batchItems.filter(item => {
      const url = item.url.trim();
      if (!url) return false;
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    });
    return validItems;
  };

  const processBatch = async () => {
    const validItems = validateUrls();
    if (validItems.length === 0) return;

    setIsProcessing(true);
    const results: AssessmentResult[] = [];

    for (const item of validItems) {
      setCurrentProcessing(item.id);
      setBatchItems(prev => prev.map(prevItem => 
        prevItem.id === item.id ? { ...prevItem, status: 'processing' } : prevItem
      ));

      try {
        const url = item.url.trim();
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        
        const response = await fetch('/api/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            assessmentType: 'url', 
            websiteUrl: fullUrl 
          }),
        });

        const json = await response.json();
        
        if (json?.success) {
          const result = json.data as AssessmentResult;
          results.push(result);
          setBatchItems(prev => prev.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, status: 'completed', result }
              : prevItem
          ));
        } else {
          setBatchItems(prev => prev.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, status: 'error', error: json?.message || 'Assessment failed' }
              : prevItem
          ));
        }
      } catch (error) {
        setBatchItems(prev => prev.map(prevItem => 
          prevItem.id === item.id 
            ? { ...prevItem, status: 'error', error: 'Network error' }
            : prevItem
        ));
      }

      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsProcessing(false);
    setCurrentProcessing(null);

    if (results.length > 0) {
      onBatchComplete(results);
    }
  };

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Globe className="h-4 w-4 text-slate-400" />;
    }
  };

  const completedCount = batchItems.filter(item => item.status === 'completed').length;
  const errorCount = batchItems.filter(item => item.status === 'error').length;
  const validUrls = validateUrls();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Batch Assessment</h2>
            <p className="text-sm text-slate-400 mt-1">
              Assess multiple websites simultaneously
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {batchItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-white/5">
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter website URL (e.g., example.com)"
                    value={item.url}
                    onChange={(e) => updateUrl(item.id, e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none"
                  />
                  {item.status === 'error' && item.error && (
                    <p className="text-xs text-red-400 mt-1">{item.error}</p>
                  )}
                  {item.status === 'completed' && item.result && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Score: {item.result.overallScore}/100 • {item.result.totalIssues} issues found
                    </p>
                  )}
                </div>
                {batchItems.length > 1 && (
                  <button
                    onClick={() => removeUrl(item.id)}
                    disabled={isProcessing}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isProcessing && (
            <button
              onClick={addUrl}
              className="mt-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add another URL
            </button>
          )}

          {/* Progress Summary */}
          {isProcessing && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-300 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing batch assessment...
              </div>
              <div className="text-sm text-slate-300">
                Completed: {completedCount} • Errors: {errorCount} • Remaining: {validUrls.length - completedCount - errorCount}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-slate-800/50">
          <div className="text-sm text-slate-400">
            {validUrls.length} valid URL{validUrls.length !== 1 ? 's' : ''} ready for assessment
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={processBatch}
              disabled={isProcessing || validUrls.length === 0}
              className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Start Assessment${validUrls.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}