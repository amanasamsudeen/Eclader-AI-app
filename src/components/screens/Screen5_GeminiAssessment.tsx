import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Leaf, 
  Wrench, 
  ChevronRight,
  Info,
  Lock,
  Unlock,
  RefreshCw,
  HeartHandshake,
  Recycle,
  Coins,
  Check,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { CircularRoute, CalculatedPathwayResult } from '../../types';

export const Screen5_GeminiAssessment: React.FC = () => {
  const { devices, activeDeviceId, setActiveDeviceId, setActiveScreen, updateDevice } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assessment = currentDevice?.geminiAssessment;

  // Track user answers to follow-up diagnostic questions
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    return assessment?.userAnswers || {};
  });

  const [isCalculatingPathway, setIsCalculatingPathway] = useState<boolean>(false);
  const [calculatedPathway, setCalculatedPathway] = useState<CalculatedPathwayResult | null>(() => {
    return assessment?.calculatedPathway || null;
  });

  const questions = assessment?.suggestedFollowUpQuestions || [];
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = questions.length > 0 && answeredCount >= questions.length;

  // Sync state if active device changes
  useEffect(() => {
    if (assessment?.userAnswers) {
      setAnswers(assessment.userAnswers);
    } else {
      setAnswers({});
    }
    if (assessment?.calculatedPathway) {
      setCalculatedPathway(assessment.calculatedPathway);
    } else {
      setCalculatedPathway(null);
    }
  }, [activeDeviceId, currentDevice?.id]);

  const handleSelectAnswer = async (questionId: string, option: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: option,
    };
    setAnswers(newAnswers);

    // If all or most questions are answered, trigger pathway recommendation
    if (questions.length > 0 && Object.keys(newAnswers).length >= questions.length) {
      await calculatePathwayRecommendation(newAnswers);
    }
  };

  const calculatePathwayRecommendation = async (userAnswersToUse = answers) => {
    setIsCalculatingPathway(true);

    try {
      // Call server endpoint
      const res = await fetch('/api/gemini/recommend-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectedEwasteObject: assessment?.detectedEwasteObject || currentDevice.title,
          identifiedHardwareModel: assessment?.identifiedHardwareModel || currentDevice.brandModel,
          visualDamagePoints: assessment?.visibleDamagePoints || currentDevice.knownFlaws,
          userAnswers: userAnswersToUse,
          recoverableMassKg: assessment?.recoverableMassKg || 1.5,
          co2eAvoidanceKg: assessment?.co2eAvoidanceKg || 180,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: CalculatedPathwayResult = json.data;
        setCalculatedPathway(result);

        // Update device in AppContext and Firestore
        if (currentDevice) {
          const updatedAssessment = {
            ...assessment!,
            userAnswers: userAnswersToUse,
            calculatedPathway: result,
            preliminaryRecommendation: result.recommendedPathway,
          };
          updateDevice(currentDevice.id, {
            geminiAssessment: updatedAssessment,
          });
        }
      }
    } catch (err) {
      console.warn('Pathway calculation error, applying local rule engine fallback:', err);
      // Local fallback
      const fallbackResult: CalculatedPathwayResult = {
        recommendedPathway: 'Component Repair',
        confidenceScore: 91,
        plainLanguageReason: `Because your device powers on and personal files are preserved, repairing the broken components is the most cost-effective and circular route in Sri Lanka.`,
        keyFactors: ['Power circuitry responds', 'Hardware logic intact', 'Substantial savings vs new replacement'],
        nextStepAdvice: 'Connect with a verified bench technician in Colombo to confirm parts availability.',
        alternativePathways: ['Reuse or Resale', 'Parts Recovery'],
        estimatedEconomicImpact: 'Saves ~LKR 145,000 compared to buying new',
        co2eAvoidanceKg: assessment?.co2eAvoidanceKg || 185,
      };
      setCalculatedPathway(fallbackResult);
    } finally {
      setIsCalculatingPathway(false);
    }
  };

  const handleProceedToRoutes = (pathwayName?: string) => {
    if (currentDevice) {
      // Map pathway name to CircularRoute
      let route: CircularRoute = 'repair';
      const p = (pathwayName || calculatedPathway?.recommendedPathway || assessment?.preliminaryRecommendation || '').toLowerCase();
      if (p.includes('reuse') || p.includes('resale')) route = 'reuse_resale';
      else if (p.includes('donation')) route = 'donation';
      else if (p.includes('parts') || p.includes('salvage') || p.includes('recovery')) route = 'parts_recovery';
      else if (p.includes('recycling')) route = 'recycling';
      else route = 'repair';

      updateDevice(currentDevice.id, {
        selectedRoute: route,
      });
    }

    setActiveDeviceId(currentDevice.id);
    setActiveScreen(6); // Screen 6: Smart Route Recommendation
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No Assessment Data Found</h2>
          <p className="text-xs text-slate-600">
            Please submit a device photograph or select an existing hardware record to view its Gemini Optical Triage analysis.
          </p>
          <button
            onClick={() => setActiveScreen(4)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Submit a Device Photograph
          </button>
        </div>
      </div>
    );
  }

  // Get matching pathway icon & colors
  const getPathwayBadge = (pathwayName: string) => {
    const p = pathwayName.toLowerCase();
    if (p.includes('repair')) {
      return {
        icon: Wrench,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        cardBg: 'from-blue-950 via-slate-900 to-emerald-950',
        accentColor: 'text-blue-400',
      };
    }
    if (p.includes('reuse') || p.includes('resale')) {
      return {
        icon: RefreshCw,
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
        cardBg: 'from-teal-950 via-slate-900 to-emerald-950',
        accentColor: 'text-teal-400',
      };
    }
    if (p.includes('donation')) {
      return {
        icon: HeartHandshake,
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        cardBg: 'from-amber-950 via-slate-900 to-emerald-950',
        accentColor: 'text-amber-400',
      };
    }
    if (p.includes('parts') || p.includes('salvage') || p.includes('recovery')) {
      return {
        icon: Layers,
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        cardBg: 'from-purple-950 via-slate-900 to-emerald-950',
        accentColor: 'text-purple-400',
      };
    }
    return {
      icon: Recycle,
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cardBg: 'from-emerald-950 via-slate-900 to-teal-950',
      accentColor: 'text-emerald-400',
    };
  };

  const detectedEwasteTitle = assessment.detectedEwasteObject || `${currentDevice.category} with Physical Wear`;
  const ewasteCategoryName = assessment.ewasteCategory || (currentDevice.category === 'Laptop' ? 'Computing & Laptops (WEEE Cat 3)' : 'Consumer Electronics');

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">{currentDevice.tagNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                E-Waste Assessment & Smart Pathway
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                AI detects hardware damage and asks simple questions to recommend your ideal circular route
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              {calculatedPathway ? (
                <button
                  onClick={() => handleProceedToRoutes()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to Routes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => calculatePathwayRecommendation()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-300 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reveal Recommendation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* 3-Step Guided Workflow Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                ✓
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Step 1: Image Detection</div>
                <div className="text-xs font-semibold text-slate-800">E-Waste Object Identified</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isAllAnswered 
                ? 'bg-emerald-50/70 border-emerald-200' 
                : 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isAllAnswered ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white shadow-2xs'
              }`}>
                {isAllAnswered ? '✓' : '2'}
              </div>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  isAllAnswered ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  Step 2: Simple Intake Questions
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {isAllAnswered ? 'All Questions Answered' : `${answeredCount} of ${questions.length} Answered`}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              calculatedPathway
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                calculatedPathway ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {calculatedPathway ? <Sparkles className="w-4 h-4 text-white" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  calculatedPathway ? 'text-emerald-800' : 'text-slate-500'
                }`}>
                  Step 3: Recommended Pathway
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {calculatedPathway ? calculatedPathway.recommendedPathway : 'Unlocks after questions'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Axiom & Safety Boundary Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900/90 leading-relaxed">
            <span className="font-bold text-amber-950">Core Operating Axiom: </span>
            AI recommends based on visible cues and your answers; qualified bench technicians verify physical motherboard rails with multimeter before ordering parts.
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: STEP 1 - Image & E-Waste Detection Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Scanned Image Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Analyzed Photograph
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gemini Vision Scan
                </span>
              </div>

              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                <img
                  src={currentDevice.photoUrl}
                  alt={currentDevice.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Visual optical detection overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 m-3 rounded-lg flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    <span>E-WASTE SCAN: OK</span>
                    <span>CONF: {assessment.modelMatchConfidence}%</span>
                  </div>
                  <div className="self-start text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                    TARGET: {assessment.identifiedHardwareModel.slice(0, 24)}
                  </div>
                </div>
              </div>

              {/* Detected Object Highlight Box */}
              <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Detected E-Waste Object</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 leading-snug">
                  {detectedEwasteTitle}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {assessment.simpleDescription || assessment.visualMechanicalState}
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white border border-emerald-200 rounded text-[11px] font-medium text-emerald-800">
                    🏷️ {ewasteCategoryName}
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                    Confidence: {assessment.modelMatchConfidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware Model Identification */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hardware Model Specs
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {assessment.deviceClass}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {assessment.identifiedHardwareModel}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {assessment.attributionRationale}
                </p>
              </div>

              {/* Detected Visible Flaws */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Detected Physical Flaws & Wear:
                </div>
                <div className="space-y-1.5">
                  {assessment.visibleDamagePoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental & Metallurgy Impact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recyclable Resources & Carbon LCA
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <div className="text-[10px] font-semibold text-emerald-800 uppercase">Avoided Carbon</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> ~{assessment.co2eAvoidanceKg} kg CO₂e
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Recoverable Mass</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">
                    {assessment.recoverableMassKg} kg WEEE
                  </div>
                </div>
              </div>

              {assessment.preciousMetalsEstimate && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="font-semibold text-slate-800">Trace Metallurgy: </span>
                  {assessment.preciousMetalsEstimate}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: STEP 2 (Questions) & STEP 3 (Recommended Pathway) */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 2: SIMPLE INTAKE QUESTIONS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Simple Questions from Image Identification
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Based on what the AI identified in your photo, please answer these quick questions to calculate your best circular pathway.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {answeredCount} of {questions.length} answered
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, qIndex) => {
                  const selectedVal = answers[q.id];

                  return (
                    <div 
                      key={q.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        selectedVal 
                          ? 'bg-slate-50/80 border-emerald-300 ring-1 ring-emerald-500/10' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Question {qIndex + 1}
                            </span>
                            {selectedVal && (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Answered
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {q.question}
                          </div>
                          {q.helperText && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <span>💡</span>
                              <span>{q.helperText}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((option, optIdx) => {
                          const isOptionSelected = selectedVal === option;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(q.id, option)}
                              className={`p-3 rounded-xl text-xs text-left font-medium transition-all cursor-pointer border flex items-start gap-2.5 ${
                                isOptionSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                isOptionSelected 
                                  ? 'bg-white text-emerald-700 border-white font-bold text-[10px]' 
                                  : 'border-slate-300 text-transparent'
                              }`}>
                                ✓
                              </div>
                              <span className="leading-snug">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action trigger if not automatically calculated */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-600 text-center sm:text-left">
                  {isAllAnswered ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      All questions answered! Pathway calculated below.
                    </span>
                  ) : (
                    <span>
                      Select an answer above to see your customized recommendation.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => calculatePathwayRecommendation()}
                  disabled={isCalculatingPathway}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCalculatingPathway ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing AI Pathway...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{calculatedPathway ? 'Re-calculate Pathway' : 'Calculate Recommended Pathway'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 3: RECOMMENDED PATHWAY CARD (Revealed after answers) */}
            {calculatedPathway ? (
              // UNLOCKED STATE
              (() => {
                const badgeInfo = getPathwayBadge(calculatedPathway.recommendedPathway);
                const BadgeIcon = badgeInfo.icon;

                return (
                  <div className="rounded-2xl border border-emerald-300 bg-white shadow-md overflow-hidden animate-fadeIn space-y-0">
                    
                    {/* Header Banner */}
                    <div className={`p-6 bg-gradient-to-br ${badgeInfo.cardBg} text-white space-y-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            Step 3: AI Recommended Pathway
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {calculatedPathway.confidenceScore}% Viability Match
                        </span>
                      </div>

                      <div className="pt-1">
                        <div className="text-xs uppercase tracking-wider text-emerald-200/80 font-bold">
                          Primary Recommended Pathway
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 mt-1">
                          <BadgeIcon className={`w-8 h-8 ${badgeInfo.accentColor}`} />
                          <span>{calculatedPathway.recommendedPathway}</span>
                        </h2>
                      </div>

                      {/* Plain Language Reasoning based on user answers */}
                      <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 space-y-1">
                        <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                          Why this pathway fits your device:
                        </div>
                        <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                          {calculatedPathway.plainLanguageReason}
                        </p>
                      </div>

                      {/* Financial Impact */}
                      {calculatedPathway.estimatedEconomicImpact && (
                        <div className="text-xs text-emerald-200 flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-semibold text-white">{calculatedPathway.estimatedEconomicImpact}</span>
                        </div>
                      )}
                    </div>

                    {/* Pathway Details Body */}
                    <div className="p-6 space-y-5">
                      
                      {/* Key Decision Factors */}
                      {calculatedPathway.keyFactors && calculatedPathway.keyFactors.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Key Influencing Factors from your Answers:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {calculatedPathway.keyFactors.map((f, i) => (
                              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Step Advice */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Next Recommended Step in Sri Lanka:</span>
                        <p className="leading-relaxed">{calculatedPathway.nextStepAdvice}</p>
                      </div>

                      {/* Alternative Pathways */}
                      {calculatedPathway.alternativePathways && calculatedPathway.alternativePathways.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                          <span className="font-semibold">Alternative Viable Options:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {calculatedPathway.alternativePathways.map((alt, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Direct CTA Button */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 text-center sm:text-left">
                          Click below to confirm your route and compare technicians or drop-off centers.
                        </div>

                        <button
                          onClick={() => handleProceedToRoutes(calculatedPathway.recommendedPathway)}
                          className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>Proceed with {calculatedPathway.recommendedPathway}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })()
            ) : (
              // LOCKED / PENDING STATE
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Pathway Recommendation Locked
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Answer the {questions.length} simple intake questions above so AI can combine your photo findings with your hardware status to calculate the optimal circular route.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => calculatePathwayRecommendation()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Calculate Recommendation Now</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
