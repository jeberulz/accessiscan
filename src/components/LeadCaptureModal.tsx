"use client";
import { useState } from 'react';
import { X, Mail, Building2, Globe, CheckCircle } from 'lucide-react';
import { LeadCapture } from '@/shared/types';

interface LeadCaptureModalProps {
  websiteUrl: string;
  onClose: () => void;
}

export default function LeadCaptureModal({ websiteUrl, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadCapture>({
    email: '',
    companyName: '',
    websiteUrl,
    contactPreferences: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setErrors({ submit: result.message || 'Failed to submit' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        contactPreferences: checked
          ? [...prev.contactPreferences, value]
          : prev.contactPreferences.filter(pref => pref !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Thank You!</h3>
          <p className="text-slate-300 mb-6">
            We've received your information and will be in touch within 24 hours with a detailed accessibility roadmap for your website.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-emerald-200 transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold text-white mb-2">
            Get Expert Accessibility Help
          </h3>
          <p className="text-emerald-100">
            Let's discuss how we can improve your website's accessibility
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="email" className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 mr-2 text-emerald-400" />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
              required
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-emerald-400" />
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-white placeholder-slate-400"
              required
            />
            {errors.companyName && (
              <p className="mt-2 text-sm text-red-400">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label htmlFor="websiteUrl" className="flex items-center text-sm font-medium text-slate-300 mb-2">
              <Globe className="w-4 h-4 mr-2 text-emerald-400" />
              Website URL
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white"
              readOnly
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              How would you like us to contact you?
            </label>
            <div className="space-y-3">
              {[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone Call' },
                { value: 'demo', label: 'Schedule a Demo' },
                { value: 'consultation', label: 'Free Consultation' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="contactPreferences"
                    value={option.value}
                    checked={formData.contactPreferences.includes(option.value)}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 bg-white/5 border-white/20 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-3 text-sm text-slate-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Submitting...' : 'Get Expert Help'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            By submitting, you agree to receive communications about accessibility services. 
            We respect your privacy and won't spam you.
          </p>
        </form>
      </div>
    </div>
  );
}


