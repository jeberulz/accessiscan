"use client";
import { Sparkles, Search, Loader2, Link2, Image as ImageIcon, Upload, Layers } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useToast } from '@/components/Toast';

type Props = {
  websiteUrl: string;
  setWebsiteUrl: Dispatch<SetStateAction<string>>;
  loading: boolean;
  onScan: () => void;
  onImageScan?: (imageFile: string) => void;
  onShowBatch?: () => void;
};

export default function Hero({ websiteUrl, setWebsiteUrl, loading, onScan, onImageScan, onShowBatch }: Props) {
  const [mode, setMode] = useState<'url' | 'image'>('url');
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<string>("");
  const { addToast } = useToast();

  const ALLOWED_IMAGE_TYPES = new Set([ 'image/png', 'image/jpeg' ]);
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const MAX_DIMENSION = 2200; // downscale very large images

  const getMagicBytesOk = (mime: string, bytes: Uint8Array) => {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (mime === 'image/png') {
      const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      return sig.every((b, i) => bytes[i] === b);
    }
    // JPEG: FF D8 FF ... (EOI FF D9 optional to check later)
    if (mime === 'image/jpeg') {
      return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    }
    return false;
  };

  const sanitizeImage = async (file: File): Promise<string> => {
    // Basic MIME + size checks
    const mime = file.type;
    if (!ALLOWED_IMAGE_TYPES.has(mime)) {
      throw new Error('Only PNG or JPEG images are allowed.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`Image exceeds ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB.`);
    }

    // Magic bytes validation
    const headerBuf = await file.slice(0, 16).arrayBuffer();
    const header = new Uint8Array(headerBuf);
    if (!getMagicBytesOk(mime, header)) {
      throw new Error('Invalid or corrupted image data.');
    }

    // Decode and re-encode via canvas to strip metadata
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to decode image.'));
        image.src = objectUrl;
        // Prevent potential taint from cross-origin (should not occur for local files)
        image.crossOrigin = 'anonymous';
      });

      // Downscale if huge
      let { width, height } = img;
      const maxDim = Math.max(width, height);
      if (maxDim > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / maxDim;
        width = Math.max(1, Math.floor(width * scale));
        height = Math.max(1, Math.floor(height * scale));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported.');
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer PNG to ensure metadata stripped; keeps fidelity for screenshots
      const dataUrl = canvas.toDataURL('image/png');

      // Post-check size of produced data URL (rough estimate of bytes)
      const base64Len = dataUrl.includes(',') ? dataUrl.split(',')[1].length : 0;
      const approxBytes = Math.floor((base64Len * 3) / 4);
      if (approxBytes > MAX_FILE_SIZE_BYTES) {
        throw new Error('Processed image is too large after sanitization.');
      }
      return dataUrl;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFileName("");
      setSelectedImageFile("");
      return;
    }

    setSelectedFileName(file.name);
    try {
      const safeDataUrl = await sanitizeImage(file);
      setSelectedImageFile(safeDataUrl);
      addToast('Image validated and sanitized', 'info', 2500);
    } catch (err: any) {
      setSelectedFileName("");
      setSelectedImageFile("");
      addToast(err?.message || 'Invalid image selected', 'error');
      // Clear the input so the same file selection can trigger change again
      if (e.target) e.target.value = '' as any;
    }
  };

  const handleScanClick = () => {
    if (mode === 'image' && selectedImageFile && onImageScan) {
      onImageScan(selectedImageFile);
    } else if (mode === 'url') {
      onScan();
    }
  };
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            AI-powered accessibility insights in seconds
          </p>
          <h1 className="sm:text-5xl md:text-7xl text-4xl font-semibold tracking-tight">
            Find accessibility issues before your users do
          </h1>
          <p className="mt-5 text-base md:text-lg text-slate-300">
            Our AI scans your website for WCAG compliance issues, prioritizes by impact, and provides clear remediation steps. Get instant insights that protect your users and your business.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row mt-8 items-center justify-center">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur w-full sm:w-auto">
              {/* Mode selector */}
              <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur shrink-0">
                <button
                  id="modeUrl"
                  type="button"
                  aria-pressed={mode === 'url'}
                  className={`sm:text-sm inline-flex gap-1 text-xs font-medium font-geist rounded-md pt-1.5 pr-3 pb-1.5 pl-3 items-center transition-colors ${
                    mode === 'url'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMode('url')}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  URL
                </button>
                <button
                  id="modeImage"
                  type="button"
                  aria-pressed={mode === 'image'}
                  className={`sm:text-sm inline-flex gap-1 text-xs font-medium font-geist rounded-md pt-1.5 pr-3 pb-1.5 pl-3 items-center transition-colors ${
                    mode === 'image'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMode('image')}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Screenshot
                </button>
              </div>

              {/* URL input */}
              <div id="urlInputWrap" className={`flex items-center gap-3 w-full ${mode === 'url' ? '' : 'hidden'}`}>
                <input
                  id="websiteUrl"
                  type="url"
                  placeholder="Enter your website URL"
                  aria-label="Website URL"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 px-3 py-2 min-w-[280px]"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && websiteUrl.trim() && !loading) onScan();
                  }}
                />
              </div>

              {/* Image upload */}
              <div id="imageInputWrap" className={`items-center gap-3 w-full ${mode === 'image' ? 'flex' : 'hidden'}`}>
                <input id="screenshotFile" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <label htmlFor="screenshotFile" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 cursor-pointer font-geist">
                  <Upload className="h-4 w-4" />
                  Choose image
                </label>
                <span id="fileName" className={`text-xs text-slate-400 font-geist ${selectedFileName ? '' : 'hidden'} truncate max-w-[160px]`}>
                  {selectedFileName}
                </span>
              </div>

              {/* Action */}
              <button
                id="scanButton"
                onClick={handleScanClick}
                disabled={loading || (mode === 'url' && !websiteUrl.trim()) || (mode === 'image' && !selectedImageFile)}
                className="inline-flex gap-2 hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 text-sm font-medium text-white font-geist bg-emerald-600 rounded-lg pt-2 pr-4 pb-2 pl-4 items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Scanning...' : 'Scan\u00A0Now'}
              </button>
            </div>
          </div>

          {/* Batch Assessment Link */}
          {onShowBatch && (
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={onShowBatch}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Layers className="h-4 w-4" />
                Need to assess multiple websites? Try batch assessment
              </button>
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
      </div>
    </section>
  );
}


