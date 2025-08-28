"use client";
import { useState } from 'react';
import { AssessmentResult } from '@/shared/types';
import { ChevronDown, ChevronRight, Globe, AlertTriangle, CheckCircle, ArrowLeft, Filter, Rocket } from 'lucide-react';
import AssessmentResults from './AssessmentResults';

interface BatchResultsProps {
  results: AssessmentResult[];
  onBack: () => void;
  onNewBatch: () => void;
}

export default function BatchResults({ results, onBack, onNewBatch }: BatchResultsProps) {
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('score_desc');
  const [filterByIssues, setFilterByIssues] = useState('all');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // Filter and sort results
  const filteredResults = results.filter(result => {
    switch (filterByIssues) {
      case 'critical':
        return result.criticalIssues > 0;
      case 'high_score':
        return result.overallScore >= 80;
      case 'low_score':
        return result.overallScore < 60;
      default:
        return true;
    }
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'score_asc':
        return a.overallScore - b.overallScore;
      case 'score_desc':
        return b.overallScore - a.overallScore;
      case 'issues_asc':
        return a.totalIssues - b.totalIssues;
      case 'issues_desc':
        return b.totalIssues - a.totalIssues;
      case 'url_asc':
        return a.websiteUrl.localeCompare(b.websiteUrl);
      case 'url_desc':
        return b.websiteUrl.localeCompare(a.websiteUrl);
      default:
        return b.overallScore - a.overallScore;
    }
  });

  const avgScore = Math.round(filteredResults.reduce((sum, r) => sum + r.overallScore, 0) / filteredResults.length);
  const totalIssues = filteredResults.reduce((sum, r) => sum + r.totalIssues, 0);
  const criticalIssues = filteredResults.reduce((sum, r) => sum + r.criticalIssues, 0);

  if (selectedResult) {
    return (
      <div className="min-h-screen bg-black text-slate-100 antialiased">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <button
              onClick={() => setSelectedResult(null)}
              className="inline-flex items-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batch Results
            </button>
          </div>
          <AssessmentResults assessment={selectedResult} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/40 via-green-500/30 to-teal-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-orange-600/30 via-red-600/20 to-emerald-500/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="h-6 w-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">Batch Assessment Results</h1>
            </div>
            <p className="text-lg text-slate-300">
              Completed assessment of {results.length} website{results.length !== 1 ? 's' : ''} • Showing {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button
                onClick={onBack}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </button>
              <button
                onClick={onNewBatch}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-emerald-500/30 bg-emerald-600/10 text-emerald-300 hover:bg-emerald-600/20 font-medium transition-colors"
              >
                Start New Batch
              </button>
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <label className="text-sm text-slate-300">Filter:</label>
              <select
                value={filterByIssues}
                onChange={(e) => setFilterByIssues(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Results</option>
                <option value="critical">Critical Issues Only</option>
                <option value="high_score">High Scores (80+)</option>
                <option value="low_score">Low Scores (&lt;60)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="score_desc">Highest Score</option>
                <option value="score_asc">Lowest Score</option>
                <option value="issues_desc">Most Issues</option>
                <option value="issues_asc">Fewest Issues</option>
                <option value="url_asc">Website A-Z</option>
                <option value="url_desc">Website Z-A</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl border ${getScoreBgColor(avgScore)}`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(avgScore)}`}>
                  {avgScore}
                </div>
                <div className="text-sm text-slate-300">Average Score</div>
              </div>
            </div>
            <div className="p-6 rounded-xl border bg-blue-500/10 border-blue-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{totalIssues}</div>
                <div className="text-sm text-slate-300">Total Issues</div>
              </div>
            </div>
            <div className="p-6 rounded-xl border bg-red-500/10 border-red-500/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">{criticalIssues}</div>
                <div className="text-sm text-slate-300">Critical Issues</div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No results match your filters</h3>
                <p className="text-slate-400">Try adjusting your filter settings</p>
                <button
                  onClick={() => {
                    setFilterByIssues('all');
                    setSortBy('score_desc');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              sortedResults.map((result) => {
              const isExpanded = expandedResults.has(String(result.id) || result.websiteUrl);
              
              return (
                <div key={result.id || result.websiteUrl} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Summary Row */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpanded(String(result.id) || result.websiteUrl)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-slate-400" />
                          <div>
                            <h3 className="font-medium text-white">{result.websiteUrl}</h3>
                            <p className="text-sm text-slate-400">
                              Scanned on {new Date(result.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}
                          </div>
                          <div className="text-xs text-slate-400">out of 100</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.criticalIssues > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                              <span className="text-xs text-red-300">{result.criticalIssues} critical</span>
                            </div>
                          )}
                          {result.overallScore >= 80 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                              <span className="text-xs text-emerald-300">Good</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-6 bg-black/20">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="text-lg font-bold text-red-400">{result.criticalIssues}</div>
                          <div className="text-xs text-red-300">Critical</div>
                        </div>
                        <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <div className="text-lg font-bold text-orange-400">{result.highImpactIssues}</div>
                          <div className="text-xs text-orange-300">High</div>
                        </div>
                        <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <div className="text-lg font-bold text-amber-400">{result.mediumImpactIssues}</div>
                          <div className="text-xs text-amber-300">Medium</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="text-lg font-bold text-blue-400">{result.lowImpactIssues}</div>
                          <div className="text-xs text-blue-300">Low</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          View Detailed Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}