import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_HARDWARE_PRESETS } from '../../data/mockData';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert,
  Loader2,
  RefreshCw,
  Scan
} from 'lucide-react';
import { DeviceRecord } from '../../types';
import { optimizeImageForAnalysis } from '../../utils/imageOptimizer';

export const Screen4_AddDevice: React.FC = () => {
  const { currentUser, addDevice, setActiveDeviceId, setActiveScreen } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deviceLabel, setDeviceLabel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgressStage, setSubmitProgressStage] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15MB. Please upload a smaller photograph.');
      return;
    }

    setImageFile(file);
    setIsOptimizing(true);
    
    try {
      // Rapid client-side optimization: scales to max 1200px and compresses to ~100KB JPEG
      const optimized = await optimizeImageForAnalysis(file, 1200, 0.82);
      setImagePreviewUrl(optimized.dataUrl);
      setImageBase64(optimized.dataUrl);
      setMimeType('image/jpeg');
    } catch (optErr) {
      console.warn('Image optimization fallback:', optErr);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreviewUrl(result);
        setImageBase64(result);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLoadPreset = (preset: typeof SAMPLE_HARDWARE_PRESETS[0]) => {
    setErrorMsg(null);
    setDeviceLabel(preset.title);
    setImagePreviewUrl(preset.imageUrl);
    setImageBase64(preset.imageUrl);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreviewUrl('');
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!imagePreviewUrl) {
      setErrorMsg('Please upload a clear photograph of an electronic device or choose a test image.');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgressStage('Initializing optical AI triage on Screen 5...');

    try {
      const deviceId = `dev-${Date.now()}`;
      const tagNumber = `ECL-CMB-2026-${Math.floor(100 + Math.random() * 900)}`;

      const photoUrl = imageBase64 || imagePreviewUrl;

      // Instant intake record with optical scanning flag enabled
      const newRecord: DeviceRecord = {
        id: deviceId,
        tagNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        userDistrict: currentUser.location,
        title: deviceLabel || `Electronic Hardware (${tagNumber})`,
        category: 'Laptop',
        brandModel: deviceLabel || 'Pending Optical Scan',
        lifecycleAge: 'Determined through dynamic triage',
        powerState: 'Determined through dynamic triage',
        knownFlaws: [],
        observations: 'Captured photograph for Gemini AI optical triage.',
        status: 'intake_pending',
        selectedRoute: 'repair',
        photoUrl: photoUrl,
        createdAt: new Date().toISOString(),
        geminiAssessment: {
          isAnalyzing: true,
          identifiedHardwareModel: deviceLabel || 'Scanning Hardware...',
          modelMatchConfidence: 0,
          attributionRationale: 'Optical analysis in progress with Gemini Vision',
          deviceClass: 'Electronics',
          visualMechanicalState: 'Optical scan running',
          visibleDamagePoints: [],
          preliminaryRecommendation: 'Evaluating with Gemini Vision...',
          recommendationViabilityPercent: 0,
          pathwayRationale: 'Evaluating physical condition and observable features.',
          alternativePathways: [],
          recoverableMassKg: 1.5,
          co2eAvoidanceKg: 180,
          safetyAndVerificationDisclaimer: 'Optical triage in progress...',
          suggestedFollowUpQuestions: [],
          dynamicQuestions: [],
          dynamicAnswers: {},
        },
        milestones: [
          {
            id: 'm1',
            title: 'Hardware Intake & Upload',
            description: `Captured photograph of ${deviceLabel || 'electronic hardware'}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: true,
            actor: currentUser.name,
          },
        ],
      };

      await addDevice(newRecord);
      setActiveDeviceId(deviceId);
      setIsSubmitting(false);

      // Fast-track navigation: Screen 5 opens immediately with high-tech scanning overlay!
      setActiveScreen(5);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to start Gemini optical assessment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Submit Electronic Hardware for Optical Triage
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Upload clear photographs of your device casing, screen, and ports. Gemini analyzes the hardware and generates dynamic diagnostic questions.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Quick presets for effortless evaluation */}
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Evaluation Test Hardware Presets
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Click to populate photograph</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_HARDWARE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className="text-left p-3 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-200/80 transition-all hover:scale-[1.01] shadow-2xs cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 truncate">{preset.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error message banner with clear action */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shrink-0 cursor-pointer text-xs"
            >
              Select New Photo
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Photo Upload */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <span>Electronic Device Photograph</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accepts JPEG, PNG, or WebP (up to 10MB). Provide a photograph showing casing, screen, or model labels.
                </p>
              </div>

              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            {/* Upload Box / Image Preview */}
            {!imagePreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Click to select photo or drag and drop here
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supported formats: JPEG, PNG, WebP (Max 10 MB)
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Real optical diagnosis with Gemini Multimodal Vision
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video max-h-96 flex items-center justify-center">
                <img
                  src={imagePreviewUrl}
                  alt="Device preview"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-mono border border-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Image Ready for Optical Scan
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md cursor-pointer transition-colors"
                >
                  Change Photograph
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Optional Device Reference Label */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Optional Device Reference Label (e.g. Office laptop, home printer)
              </label>
              <input
                type="text"
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                placeholder="Leave blank for Gemini to automatically identify from image..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-emerald-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gemini will identify device category, brand, model, and physical condition directly from the photograph.
              </p>
            </div>
          </div>

          {/* Guiding Principle reminder */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-start gap-3 border border-slate-800">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-400 uppercase tracking-wider">Mandatory Operating Principle:</strong>
              <p className="text-slate-300 mt-0.5">
                &ldquo;AI recommends; qualified bench technicians verify.&rdquo; Gemini provides non-destructive optical triage based on visible evidence and your answers. Physical multimeter checks are performed by certified technicians before repairs.
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveScreen(3)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !imagePreviewUrl}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitProgressStage || 'Analyzing with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with Gemini</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
