import { useState, useRef } from 'react';
import { Search, Loader2, Sparkles, Upload, Link, Image } from 'lucide-react';
import { AssessmentRequest, type AssessmentResult } from '@/shared/types';

interface AssessmentFormProps {
  onAssessmentComplete: (result: AssessmentResult) => void;
}

export default function AssessmentForm({ onAssessmentComplete }: AssessmentFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [assessmentType, setAssessmentType] = useState<'url' | 'image'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, WebP)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let formData: AssessmentRequest;

      if (assessmentType === 'url') {
        formData = {
          assessmentType: 'url',
          websiteUrl: websiteUrl.trim(),
        };
      } else {
        if (!selectedFile) {
          setError('Please select an image file');
          setLoading(false);
          return;
        }

        // Convert image to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });

        formData = {
          assessmentType: 'image',
          imageFile: base64,
        };
      }

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onAssessmentComplete(result.data);
      } else {
        setError(result.message || 'Assessment failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        AI-powered accessibility insights in seconds
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white mb-5">
        Find accessibility issues before your users do
      </h1>
      <p className="text-base md:text-lg text-slate-300 mb-8">
        Our AI scans your website for WCAG compliance issues, prioritizes by impact, and provides clear remediation steps. Get instant insights that protect your users and your business.
      </p>

      {/* Assessment Type Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setAssessmentType('url')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              assessmentType === 'url'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Link className="h-4 w-4" />
            Website URL
          </button>
          <button
            type="button"
            onClick={() => setAssessmentType('image')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              assessmentType === 'image'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Image className="h-4 w-4" />
            Screenshot Upload
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-4">
        {assessmentType === 'url' ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <input 
              type="url" 
              placeholder="https://example.com (full URL required)" 
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 px-3 py-2 min-w-[280px] focus:ring-0"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
            />
            <button 
              type="submit"
              disabled={loading || !websiteUrl.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-colors backdrop-blur"
              >
                <Upload className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-white mb-2">Upload Website Screenshot</p>
                <p className="text-sm text-slate-400 mb-4">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-slate-500">
                  Supports PNG, JPG, WebP • Max 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <img 
                    src={imagePreview || ''} 
                    alt="Website screenshot preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {loading ? 'Analyzing Screenshot...' : 'Analyze Screenshot'}
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </form>

      {error && (
        <div className="mt-4 max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
        <div className="flex -space-x-2">
          <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="" />
          <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1494790108755-2616b612b602?w=100&h=100&fit=crop&crop=face" alt="" />
          <img className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="" />
        </div>
        <span>Trusted by 10,000+ websites for accessibility compliance</span>
      </div>
    </div>
  );
}
