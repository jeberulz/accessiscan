"use client";
import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Users,
  Download,
  Mail,
  Lightbulb,
  Shield,
  Layers,
  EyeOff,
  Contrast,
  MousePointer,
  Type,
  Tag,
  List,
  Gavel,
  Clock,
  Image,
  Loader2
} from 'lucide-react';
import { AssessmentResult } from '@/shared/types';
import LeadCaptureModal from './LeadCaptureModal';
import { exportAssessment, downloadFile, ExportFormat } from '@/lib/export';
import { useToast } from './Toast';

interface AssessmentResultsProps {
  assessment: AssessmentResult;
}

export default function AssessmentResults({ assessment }: AssessmentResultsProps) {
  const { addToast } = useToast();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(0);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getImpactColors = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'border-red-500/20 bg-red-500/10';
      case 'high':
        return 'border-orange-500/20 bg-orange-500/10';
      case 'medium':
        return 'border-amber-500/20 bg-amber-500/10';
      case 'low':
        return 'border-blue-500/20 bg-blue-500/10';
      default:
        return 'border-slate-500/20 bg-slate-500/10';
    }
  };

  // Group issues by impact level for the sidebar
  const criticalIssues = assessment.issues.filter(issue => issue.impact === 'critical');
  const highIssues = assessment.issues.filter(issue => issue.impact === 'high');
  const mediumIssues = assessment.issues.filter(issue => issue.impact === 'medium');
  const lowIssues = assessment.issues.filter(issue => issue.impact === 'low');

  const currentIssue = assessment.issues[selectedIssue] || assessment.issues[0];

  const handleExport = async (format: ExportFormat) => {
    setExportLoading(format);
    
    try {
      const result = await exportAssessment(assessment, format);
      
      if (result.success && result.blob && result.filename) {
        downloadFile(result.blob, result.filename);
        addToast(`${format.toUpperCase()} report downloaded successfully`, 'success');
      } else {
        addToast(result.message || `Failed to export ${format.toUpperCase()}`, 'error');
      }
    } catch (error) {
      addToast(`Export failed: ${error}`, 'error');
    } finally {
      setExportLoading(null);
    }
  };

  return (
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
              AccessiScan Dashboard — {assessment.websiteUrl} audit
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 sm:inline-flex">
              <CheckCircle className="h-3 w-3 mr-1" />
              Scan Complete
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleExport('csv')}
                disabled={exportLoading === 'csv'}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {exportLoading === 'csv' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                CSV
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                disabled={exportLoading === 'pdf'}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                {exportLoading === 'pdf' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                PDF
              </button>
            </div>
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
              <span className="text-xs text-slate-400">{assessment.totalIssues} found</span>
            </div>

            <div className="space-y-2">
              {/* Critical Issues */}
              {criticalIssues.length > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-300">Critical</span>
                    <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{criticalIssues.length}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {criticalIssues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 cursor-pointer hover:bg-red-500/5 rounded p-1" 
                           onClick={() => setSelectedIssue(assessment.issues.indexOf(issue))}>
                        <EyeOff className="h-3 w-3 text-red-400" />
                        <span className="text-red-200 truncate">{issue.type}</span>
                        <span className="ml-auto text-red-300">1</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Impact Issues */}
              {highIssues.length > 0 && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-300">High</span>
                    <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">{highIssues.length}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {highIssues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 cursor-pointer hover:bg-orange-500/5 rounded p-1"
                           onClick={() => setSelectedIssue(assessment.issues.indexOf(issue))}>
                        <Contrast className="h-3 w-3 text-orange-400" />
                        <span className="text-orange-200 truncate">{issue.type}</span>
                        <span className="ml-auto text-orange-300">1</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Impact Issues */}
              {mediumIssues.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-300">Moderate</span>
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{mediumIssues.length}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {mediumIssues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 cursor-pointer hover:bg-amber-500/5 rounded p-1"
                           onClick={() => setSelectedIssue(assessment.issues.indexOf(issue))}>
                        <MousePointer className="h-3 w-3 text-amber-400" />
                        <span className="text-amber-200 truncate">{issue.type}</span>
                        <span className="ml-auto text-amber-300">1</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Impact Issues */}
              {lowIssues.length > 0 && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-300">Minor</span>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">{lowIssues.length}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {lowIssues.slice(0, 2).map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 cursor-pointer hover:bg-emerald-500/5 rounded p-1"
                           onClick={() => setSelectedIssue(assessment.issues.indexOf(issue))}>
                        <Tag className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-200 truncate">{issue.type}</span>
                        <span className="ml-auto text-emerald-300">1</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main content - Issue Details */}
          <main className="relative md:col-span-6 bg-black/20">
            <div className="border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                {getImpactIcon(currentIssue.impact)}
                <span>{currentIssue.impact.charAt(0).toUpperCase() + currentIssue.impact.slice(1)} Issue</span>
                <span className="ml-auto">Impact: {currentIssue.impact} • WCAG: {currentIssue.wcagLevel}</span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className={`relative overflow-hidden rounded-xl border ${getImpactColors(currentIssue.impact)}`}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${currentIssue.impact === 'critical' ? 'bg-red-500/20' : 
                                                       currentIssue.impact === 'high' ? 'bg-orange-500/20' :
                                                       currentIssue.impact === 'medium' ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                      {getImpactIcon(currentIssue.impact)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2">{currentIssue.type}</h3>
                      <p className="text-sm text-slate-300 mb-4">{currentIssue.description}</p>
                      
                      <div className="bg-black/40 rounded-lg p-3 mb-4 border border-white/10">
                        <div className="text-xs text-slate-400 mb-2">Recommendation:</div>
                        <div className="text-xs text-slate-300">
                          {currentIssue.recommendation}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                          currentIssue.impact === 'critical' ? 'bg-red-500/10 text-red-300' :
                          currentIssue.impact === 'high' ? 'bg-orange-500/10 text-orange-300' :
                          currentIssue.impact === 'medium' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'
                        }`}>
                          <Users className="h-3 w-3" />
                          Affects users with disabilities
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                          <Gavel className="h-3 w-3" />
                          {currentIssue.wcagLevel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                          <Clock className="h-3 w-3" />
                          Quick fix
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page preview with highlighted issues */}
              {assessment.screenshotUrl && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300 mb-3">Website preview:</div>
                  <div className="relative rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={assessment.screenshotUrl} 
                      alt={`Screenshot of ${assessment.websiteUrl}`}
                      className="w-full h-48 object-cover object-top"
                      onError={(e) => {
                        // Hide the container if image fails to load
                        const container = e.currentTarget.closest('.mt-6');
                        if (container) {
                          (container as HTMLElement).style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}
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
                  {assessment.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                        index === 0 ? 'bg-red-500/20' : index === 1 ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                      }`}>
                        <span className={`text-xs ${
                          index === 0 ? 'text-red-400' : index === 1 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{index + 1}</span>
                      </div>
                      <span className="text-slate-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Impact Score</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Current Score</span>
                    <span className={`font-medium ${getScoreColor(assessment.overallScore)}`}>{assessment.overallScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${assessment.overallScore >= 80 ? 'bg-emerald-500' : 
                                                      assessment.overallScore >= 60 ? 'bg-amber-500' :
                                                      assessment.overallScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
                      style={{width: `${assessment.overallScore}%`}}
                    ></div>
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

              {assessment.quickWins && assessment.quickWins.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <div className="text-xs text-emerald-300 mb-2">💡 Pro Tip</div>
                  <p className="text-xs text-emerald-200">{assessment.quickWins[0]?.impact || "Fixing the top 3 issues will improve accessibility significantly and reduce legal risk."}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Additional sections for mobile or expanded view */}
      <div className="mt-8 space-y-8 md:hidden">
        {/* Mobile view - Overall Score */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden">
          <div className={`bg-gradient-to-r ${getScoreGradient(assessment.overallScore)} px-8 py-6`}>
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-bold mb-2">Accessibility Score</h3>
                <p className="text-white/90">Based on WCAG 2.1 guidelines</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">{assessment.overallScore}</div>
                <div className="text-lg font-medium">out of 100</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="text-2xl font-bold text-red-400 mb-1">{assessment.criticalIssues}</div>
                <div className="text-sm font-medium text-red-300">Critical</div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400 mb-1">{assessment.highImpactIssues}</div>
                <div className="text-sm font-medium text-orange-300">High Impact</div>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400 mb-1">{assessment.mediumImpactIssues}</div>
                <div className="text-sm font-medium text-amber-300">Medium Impact</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">{assessment.lowImpactIssues}</div>
                <div className="text-sm font-medium text-blue-300">Low Impact</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.05] p-8 text-center">
        <Lightbulb className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to Improve Your Accessibility?
        </h3>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Get a detailed audit and implementation roadmap from our accessibility experts.
          We'll help you prioritize fixes and create an inclusive experience for all users.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center"
          >
            <Mail className="w-5 h-5 mr-2" />
            Get Expert Help
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => handleExport('pdf')}
              disabled={exportLoading === 'pdf'}
              className="bg-white/10 text-slate-200 font-semibold py-4 px-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading === 'pdf' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              PDF Report
            </button>
            <button 
              onClick={() => handleExport('csv')}
              disabled={exportLoading === 'csv'}
              className="bg-blue-600/20 text-blue-200 font-semibold py-4 px-6 rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading === 'csv' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              CSV Data
            </button>
          </div>
        </div>
      </div>

      {showLeadModal && (
        <LeadCaptureModal
          websiteUrl={assessment.websiteUrl}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
}


