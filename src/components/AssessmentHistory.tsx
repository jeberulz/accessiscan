"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Globe, TrendingUp, TrendingDown, Eye, Loader2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { AssessmentResult } from '@/shared/types';
import { useToast } from './Toast';

interface AssessmentHistoryProps {
  onSelectAssessment: (assessment: AssessmentResult) => void;
  onClose: () => void;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export default function AssessmentHistory({ onSelectAssessment, onClose }: AssessmentHistoryProps) {
  const { addToast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    website: '',
    email: '',
    minScore: '',
    maxScore: '',
    dateFrom: '',
    dateTo: '',
    impactLevel: '',
    sortBy: 'date_desc',
    limit: 10
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });

  const fetchAssessments = async (offset = 0, append = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: filters.limit.toString(),
        offset: offset.toString(),
        ...(filters.website && { website: filters.website }),
        ...(filters.email && { email: filters.email }),
        ...(filters.minScore && { minScore: filters.minScore }),
        ...(filters.maxScore && { maxScore: filters.maxScore }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.impactLevel && { impactLevel: filters.impactLevel }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      });

      const response = await fetch(`/api/assessments?${params}`);
      const result = await response.json();

      if (result.success) {
        if (append) {
          setAssessments(prev => [...prev, ...result.data.assessments]);
        } else {
          setAssessments(result.data.assessments);
        }
        setPagination(result.data.pagination);
      } else {
        addToast(result.message || 'Failed to fetch assessments', 'error');
      }
    } catch (error) {
      addToast('Network error while fetching assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [filters.email, filters.website]);

  const handleLoadMore = () => {
    fetchAssessments(pagination.offset + pagination.limit, true);
  };

  const handleRefresh = () => {
    fetchAssessments(0, false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-emerald-200 transition-colors p-2 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Assessment History</h2>
              <p className="text-emerald-100">View and manage previous accessibility assessments</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          {/* Basic Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Filter by Website
              </label>
              <input
                type="text"
                placeholder="Enter website URL or domain..."
                value={filters.website}
                onChange={(e) => setFilters(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Filter by Email
              </label>
              <input
                type="email"
                placeholder="Enter email address..."
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showAdvancedFilters ? 'Hide' : 'Advanced'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <h4 className="text-lg font-medium text-white mb-4">Advanced Filters</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Score Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={filters.minScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Impact Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Critical Issues Level
                  </label>
                  <select
                    value={filters.impactLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, impactLevel: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white"
                  >
                    <option value="">Any level</option>
                    <option value="high">High critical issues (5+)</option>
                    <option value="medium">Medium critical issues (1-4)</option>
                    <option value="low">Low critical issues (0)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="score_desc">Highest Score</option>
                    <option value="score_asc">Lowest Score</option>
                    <option value="issues_desc">Most Issues</option>
                    <option value="issues_asc">Fewest Issues</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => {
                    setFilters({
                      website: '',
                      email: '',
                      minScore: '',
                      maxScore: '',
                      dateFrom: '',
                      dateTo: '',
                      impactLevel: '',
                      sortBy: 'date_desc',
                      limit: 10
                    });
                    handleRefresh();
                  }}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear All Filters
                </button>
                <div className="text-sm text-slate-400">
                  {pagination.total} total assessment{pagination.total !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="p-6">
          {loading && assessments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="ml-3 text-slate-300">Loading assessments...</span>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No assessments found</h3>
              <p className="text-slate-400">Try adjusting your filters or create a new assessment</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => onSelectAssessment(assessment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe className="w-5 h-5 text-emerald-400" />
                          <h3 className="font-medium text-white truncate">
                            {assessment.websiteUrl}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(assessment.createdAt)}
                          </span>
                          <span>{assessment.totalIssues} issues found</span>
                          {assessment.criticalIssues > 0 && (
                            <span className="text-red-400 font-medium">
                              {assessment.criticalIssues} critical
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getScoreIcon(assessment.overallScore)}
                            <span className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                              {assessment.overallScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">Accessibility Score</div>
                        </div>

                        <button className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-300 px-3 py-2 rounded-lg hover:bg-emerald-600/30 transition-colors">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {pagination.hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-white/10 text-slate-200 font-medium py-3 px-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Load More ({pagination.total - pagination.offset - pagination.limit} remaining)
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Showing {assessments.length} of {pagination.total} assessments</span>
                  <span>
                    {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}