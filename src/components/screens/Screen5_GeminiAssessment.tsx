import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Leaf, 
  Wrench, 
  Lock, 
  RefreshCw, 
  HeartHandshake, 
  Recycle, 
  Coins, 
  Check, 
  AlertCircle, 
  Loader2,
  HelpCircle,
  ShieldAlert,
  Send,
  Scan,
  Eye,
  Truck
} from 'lucide-react';
import { 
  CircularRoute, 
  DynamicQuestion, 
  GeminiVisualAnalysis, 
  FinalPersonalizedAssessment 
} from '../../types';

const SCAN_TELEMETRY_PHASES = [
  'Phase 1/4: Ingesting calibrated optical spectrum...',
  'Phase 2/4: Detecting hardware casing, chassis & hinge integrity...',
  'Phase 3/4: Scanning for visible fractures, cracks, scratches & battery bulge...',
  'Phase 4/4: Formulating adaptive diagnostic inquiries with Gemini Multimodal Vision...',
];

export const Screen5_GeminiAssessment: React.FC = () => {
  const { devices, activeDeviceId, setActiveDeviceId, setActiveScreen, updateDevice, setDeviceRoute } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assessment = currentDevice?.geminiAssessment;

  // Guard references to ensure image is analyzed strictly ONCE and questions generated strictly ONCE
  const isAnalyzingRef = useRef<boolean>(false);
  const isGeneratingQuestionsRef = useRef<boolean>(false);
  const analyzedDeviceIdsRef = useRef<Set<string>>(new Set());
  const questionGeneratedDeviceIdsRef = useRef<Set<string>>(new Set());

  // Determine if active optical scan is running on mount
  const hasExistingVisual = !!(assessment?.visualAnalysis && assessment.visualAnalysis.isElectronicDevice !== undefined);
  const needsInitialScan = !hasExistingVisual && (!assessment?.visualAnalysis || !!assessment?.isAnalyzing);
  const [isScanningOptical, setIsScanningOptical] = useState<boolean>(needsInitialScan);
  const [telemetryPhaseIndex, setTelemetryPhaseIndex] = useState<number>(0);
  const [nonElectronicError, setNonElectronicError] = useState<string | null>(null);

  // Visual analysis from Gemini Stage 1
  const [visualAnalysis, setVisualAnalysis] = useState<GeminiVisualAnalysis | null>(() => {
    if (assessment?.visualAnalysis) return assessment.visualAnalysis;
    if (assessment && !assessment.isAnalyzing) {
      return {
        isElectronicDevice: true,
        category: assessment.ewasteCategory || currentDevice?.category || 'Electronic Equipment',
        name: assessment.detectedEwasteObject || currentDevice?.title || 'Hardware Intake',
        brand_or_model: assessment.identifiedHardwareModel || currentDevice?.brandModel || 'Hardware Model',
        visible_condition: assessment.visualMechanicalState || assessment.simpleDescription || 'Inspected by Gemini vision.',
        visible_damage: assessment.visibleDamagePoints || [],
        what_cannot_be_determined: [
          'Motherboard power rail voltages',
          'Internal battery capacity and impedance',
          'Hidden liquid corrosion under microchips',
        ],
        uncertainties: [
          'Does the device power on when connected to charger?',
          'Is user data recovery required from storage drive?',
        ],
        safety_notes: [
          assessment.safetyAndVerificationDisclaimer || 'Non-destructive optical triage; technician multimeter test required.',
        ],
        identification_confidence: 'high',
        modelMatchConfidencePercent: assessment.modelMatchConfidence || 88,
        recoverableMassKg: assessment.recoverableMassKg || 1.5,
        co2eAvoidanceKg: assessment.co2eAvoidanceKg || 180,
      };
    }
    return null;
  });

  // Dynamic follow-up questions from Gemini Stage 2 (strictly dynamic)
  const [questions, setQuestions] = useState<DynamicQuestion[]>(() => {
    if (assessment?.dynamicQuestions && assessment.dynamicQuestions.length > 0) {
      return assessment.dynamicQuestions;
    }
    return [];
  });

  // User answers state (supports string or array of strings for multiple choice)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    return (assessment?.dynamicAnswers as Record<string, string | string[]>) || 
      (assessment?.userAnswers as Record<string, string | string[]>) || 
      {};
  });

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Stage 3 final personalized assessment
  const [finalAssessment, setFinalAssessment] = useState<FinalPersonalizedAssessment | null>(() => {
    return assessment?.finalPersonalizedAssessment || null;
  });

  // Telemetry phase ticker while optical scan is active
  useEffect(() => {
    if (!isScanningOptical) return;
    const interval = setInterval(() => {
      setTelemetryPhaseIndex((prev) => (prev + 1) % SCAN_TELEMETRY_PHASES.length);
    }, 750);
    return () => clearInterval(interval);
  }, [isScanningOptical]);

  // Run Real Optical Analysis via Gemini Vision API (analyzed strictly ONCE)
  const runOpticalAnalysis = async (forceRetry = false) => {
    if (!currentDevice?.photoUrl || !currentDevice?.id) return;
    
    // Guard against multiple calls: check if in progress or already completed for this device
    if (isAnalyzingRef.current) return;
    if (!forceRetry && (analyzedDeviceIdsRef.current.has(currentDevice.id) || (assessment?.visualAnalysis && !assessment?.isAnalyzing))) {
      setIsScanningOptical(false);
      return;
    }

    isAnalyzingRef.current = true;
    setIsScanningOptical(true);
    setApiError(null);
    setNonElectronicError(null);

    try {
      let payload: any = {};
      if (currentDevice.photoUrl.startsWith('data:image')) {
        payload.imageBase64 = currentDevice.photoUrl;
      } else {
        payload.imageUrl = currentDevice.photoUrl;
      }

      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Gemini image analysis failed. Please try again.');
      }

      const visual: GeminiVisualAnalysis = json.data;

      // Mark this device ID as analyzed
      analyzedDeviceIdsRef.current.add(currentDevice.id);

      // Check if image is an electronic device
      if (visual.isElectronicDevice === false) {
        setNonElectronicError(
          visual.unclearMessage ||
            'This photograph does not appear to show an electronic device or e-waste. Please upload a clear photograph of an electronic device.'
        );
        setIsScanningOptical(false);
        return;
      }

      setVisualAnalysis(visual);

      // Map detected category to app's Category union
      let mappedCategory: any = 'Laptop';
      const c = (visual.category || '').toLowerCase();
      if (c.includes('phone') || c.includes('mobile')) mappedCategory = 'Smartphone';
      else if (c.includes('tablet')) mappedCategory = 'Tablet';
      else if (c.includes('desktop') || c.includes('computer') || c.includes('workstation')) mappedCategory = 'Desktop PC';
      else if (c.includes('monitor') || c.includes('television') || c.includes('display')) mappedCategory = 'Monitor';
      else if (c.includes('printer') || c.includes('charger') || c.includes('battery') || c.includes('peripheral') || c.includes('audio') || c.includes('appliance')) mappedCategory = 'Audio/Appliance';

      const updatedAssessment: any = {
        ...(currentDevice.geminiAssessment || {}),
        isAnalyzing: false,
        visualAnalysis: visual,
        detectedEwasteObject: `${visual.name || visual.category} (${visual.brand_or_model || 'Hardware'})`,
        ewasteCategory: visual.category || 'Consumer Electronics',
        simpleDescription: visual.visible_condition || 'Visual hardware triage completed.',
        identifiedHardwareModel: visual.brand_or_model || 'Hardware Model',
        modelMatchConfidence: visual.modelMatchConfidencePercent || 92,
        visibleDamagePoints: visual.visible_damage && visual.visible_damage.length > 0 ? visual.visible_damage : ['No visible exterior damage detected'],
        recoverableMassKg: visual.recoverableMassKg || 1.5,
        co2eAvoidanceKg: visual.co2eAvoidanceKg || 180,
        safetyAndVerificationDisclaimer: visual.safety_notes?.join('; ') || 'Optical triage does not test motherboard rails.',
        suggestedFollowUpQuestions: [],
      };

      updateDevice(currentDevice.id, {
        title: visual.name || currentDevice.title,
        category: mappedCategory,
        brandModel: visual.brand_or_model || currentDevice.brandModel,
        knownFlaws: visual.visible_damage || [],
        observations: visual.visible_condition || 'Visual diagnosis completed.',
        geminiAssessment: updatedAssessment,
      });

      setIsScanningOptical(false);

      // Automatically generate Stage 2 follow-up questions from the fresh visual analysis ONLY ONCE
      const existingQs = currentDevice.geminiAssessment?.dynamicQuestions;
      if (!existingQs || existingQs.length === 0) {
        if (!questionGeneratedDeviceIdsRef.current.has(currentDevice.id)) {
          await generateInitialDynamicQuestions(visual);
        }
      }
    } catch (err: any) {
      console.error('Error during optical scan:', err);
      setApiError(err?.message || 'Failed to complete optical scan with Gemini AI. Please retry.');
      setIsScanningOptical(false);
    } finally {
      isAnalyzingRef.current = false;
    }
  };

  // Generate dynamic follow-up questions from Gemini Stage 2 (strictly once per device state)
  const generateInitialDynamicQuestions = async (activeVisual?: GeminiVisualAnalysis, force = false) => {
    const targetVisual = activeVisual || visualAnalysis;
    if (!targetVisual || !currentDevice?.id) return;
    
    // Prevent duplicate concurrent requests or repeated question calls
    if (isGeneratingQuestionsRef.current) return;
    if (!force && (
      questionGeneratedDeviceIdsRef.current.has(currentDevice.id) ||
      (questions && questions.length > 0) ||
      (currentDevice.geminiAssessment?.dynamicQuestions && currentDevice.geminiAssessment.dynamicQuestions.length > 0)
    )) {
      return;
    }

    isGeneratingQuestionsRef.current = true;
    setIsGeneratingQuestions(true);
    setApiError(null);

    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: targetVisual,
          allAnswers: answers,
          round: 1,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate dynamic assessment questions with Gemini.');
      }

      questionGeneratedDeviceIdsRef.current.add(currentDevice.id);

      if (json.data.questions && json.data.questions.length > 0) {
        setQuestions(json.data.questions);
        if (currentDevice && currentDevice.geminiAssessment) {
          updateDevice(currentDevice.id, {
            geminiAssessment: {
              ...currentDevice.geminiAssessment,
              dynamicQuestions: json.data.questions,
            },
          });
        }
      } else if (json.data.sufficientInformationCollected) {
        await requestFinalPersonalizedAssessment();
      }
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setApiError(err?.message || 'Failed to generate dynamic questions with Gemini AI. Please retry.');
    } finally {
      isGeneratingQuestionsRef.current = false;
      setIsGeneratingQuestions(false);
    }
  };

  // Auto-run optical scan on mount strictly ONCE per device if needed
  useEffect(() => {
    if (!currentDevice?.id) return;
    if (analyzedDeviceIdsRef.current.has(currentDevice.id)) return;
    if (assessment?.visualAnalysis && !assessment?.isAnalyzing) {
      analyzedDeviceIdsRef.current.add(currentDevice.id);
      setIsScanningOptical(false);
      return;
    }
    if (currentDevice?.photoUrl && !isAnalyzingRef.current) {
      runOpticalAnalysis(false);
    }
  }, [currentDevice?.id]);

  // Sync state if active device changes (pure state sync, never fires duplicate API calls)
  useEffect(() => {
    if (assessment?.dynamicAnswers) {
      setAnswers(assessment.dynamicAnswers);
    } else if (assessment?.userAnswers) {
      setAnswers(assessment.userAnswers);
    } else {
      setAnswers({});
    }

    if (assessment?.finalPersonalizedAssessment) {
      setFinalAssessment(assessment.finalPersonalizedAssessment);
    } else {
      setFinalAssessment(null);
    }

    if (assessment?.visualAnalysis) {
      setVisualAnalysis(assessment.visualAnalysis);
      if (currentDevice?.id) analyzedDeviceIdsRef.current.add(currentDevice.id);
    }

    if (assessment?.dynamicQuestions && assessment.dynamicQuestions.length > 0) {
      setQuestions(assessment.dynamicQuestions);
      if (currentDevice?.id) questionGeneratedDeviceIdsRef.current.add(currentDevice.id);
    }
  }, [activeDeviceId, currentDevice?.id]);

  // Answer handler
  const handleSelectAnswer = (questionId: string, option: string, type: string) => {
    setApiError(null);
    if (type === 'multiple_choice') {
      const current = (answers[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
    }
  };

  const handleTextAnswer = (questionId: string, val: string) => {
    setApiError(null);
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleNotSureAnswer = (questionId: string) => {
    setApiError(null);
    setAnswers((prev) => ({ ...prev, [questionId]: 'Not sure / Unknown' }));
  };

  // Submit answers to Gemini for evaluation or next round / final assessment
  const handleSubmitAnswersToGemini = async () => {
    if (!visualAnalysis) return;
    setApiError(null);
    setIsSubmittingAnswers(true);

    try {
      // Send conversation context + answers to Stage 2 questions endpoint
      const qRes = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: visualAnalysis,
          conversationHistory: [
            {
              round: currentRound,
              questions: questions.map((q) => ({
                id: q.id,
                text: q.text,
                reason: q.reason,
                type: q.type,
                answer: answers[q.id],
              })),
            },
          ],
          allAnswers: answers,
          round: currentRound + 1,
        }),
      });

      const qJson = await qRes.json();
      if (!qRes.ok || !qJson.success) {
        throw new Error(qJson.error || 'Gemini assessment evaluation failed.');
      }

      const qData = qJson.data;

      // If Gemini indicates enough information is gathered or round >= 2, call final assessment
      if (qData.sufficientInformationCollected || qData.stage === 'final_assessment' || currentRound >= 2 || (qData.questions && qData.questions.length === 0)) {
        await requestFinalPersonalizedAssessment();
      } else if (qData.questions && qData.questions.length > 0) {
        // Next round of questions generated dynamically
        setQuestions(qData.questions);
        setCurrentRound((prev) => prev + 1);
        setIsSubmittingAnswers(false);
      } else {
        await requestFinalPersonalizedAssessment();
      }
    } catch (err: any) {
      console.error('Error submitting answers to Gemini:', err);
      setIsSubmittingAnswers(false);
      setApiError(err?.message || 'Failed to submit answers to Gemini. Please try again.');
    }
  };

  // Request Stage 3 Final Personalized Assessment
  const requestFinalPersonalizedAssessment = async () => {
    if (!visualAnalysis) return;
    setIsSubmittingAnswers(true);
    setApiError(null);

    try {
      const answeredList = questions.map((q) => ({
        id: q.id,
        text: q.text,
        reason: q.reason,
        answer: answers[q.id] || 'Not specified',
      }));

      const res = await fetch('/api/gemini/final-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: visualAnalysis,
          allAnswers: answers,
          answeredQuestions: answeredList,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Gemini final recommendation failed.');
      }

      const finalResult: FinalPersonalizedAssessment = json.data;
      setFinalAssessment(finalResult);

      // Map to legacy calculatedPathway so downstream screens continue to function flawlessly
      const legacyResult = {
        recommendedPathway: finalResult.recommended_route,
        confidenceScore: finalResult.confidence_score,
        plainLanguageReason: finalResult.reasoning?.join(' ') || 'Personalized circular recommendation based on actual analysis and responses.',
        keyFactors: finalResult.key_decision_factors || finalResult.confirmed_observations,
        nextStepAdvice: finalResult.next_step_advice,
        alternativePathways: finalResult.alternative_routes,
        estimatedEconomicImpact: finalResult.estimated_economic_impact,
        co2eAvoidanceKg: finalResult.co2e_avoidance_kg || visualAnalysis.co2eAvoidanceKg,
      };

      // Map pathway name to CircularRoute
      let route: CircularRoute = 'repair';
      const p = (finalResult.recommended_route || '').toLowerCase();
      if (p.includes('reuse') || p.includes('resale')) route = 'reuse_resale';
      else if (p.includes('donation')) route = 'donation';
      else if (p.includes('parts') || p.includes('salvage') || p.includes('recovery')) route = 'parts_recovery';
      else if (p.includes('recycling')) route = 'recycling';
      else route = 'repair';

      // Persist in AppContext & Firestore
      if (currentDevice) {
        const updatedAssessment = {
          ...assessment!,
          visualAnalysis,
          dynamicAnswers: answers,
          userAnswers: Object.fromEntries(
            Object.entries(answers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v])
          ),
          finalPersonalizedAssessment: finalResult,
          calculatedPathway: legacyResult,
          preliminaryRecommendation: finalResult.recommended_route,
        };

        updateDevice(currentDevice.id, {
          selectedRoute: route,
          geminiAssessment: updatedAssessment,
        });
      }
    } catch (err: any) {
      console.error('Final assessment error:', err);
      setApiError(err?.message || 'Failed to generate final assessment with Gemini. Please retry.');
    } finally {
      setIsSubmittingAnswers(false);
    }
  };

  const handleProceedToRoutes = () => {
    setActiveDeviceId(currentDevice.id);
    setActiveScreen(6); // Screen 6: Smart Route Recommendation
  };

  const handleProceedDirectToPathway = async (customPathway?: string) => {
    if (!currentDevice) return;
    setActiveDeviceId(currentDevice.id);
    const target = (customPathway || finalAssessment?.recommended_route || '').toLowerCase();

    if (target.includes('parts') || target.includes('salvage') || target.includes('recovery')) {
      await setDeviceRoute(currentDevice.id, 'parts_recovery');
      setActiveScreen(14); // Screen 14: Parts Recovery Pickup
    } else if (target.includes('recycling')) {
      await setDeviceRoute(currentDevice.id, 'recycling');
      setActiveScreen(13); // Screen 13: Recycling Agencies
    } else if (target.includes('donation')) {
      await setDeviceRoute(currentDevice.id, 'donation');
      setActiveScreen(15); // Screen 15: Community Donation
    } else if (target.includes('repair')) {
      await setDeviceRoute(currentDevice.id, 'repair');
      setActiveScreen(7); // Screen 7: Technician Matching
    } else {
      setActiveScreen(6);
    }
  };

  if (!currentDevice) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No Device Selected</h2>
          <p className="text-xs text-slate-600">
            Please submit a device photograph to initiate real Gemini optical diagnosis and adaptive intake questions.
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
    const p = (pathwayName || '').toLowerCase();
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

  const answeredQuestionsCount = questions.filter((q) => {
    const val = answers[q.id];
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === 'string' && val.trim().length > 0;
  }).length;

  const allCurrentRoundAnswered = questions.length > 0 && answeredQuestionsCount >= questions.length;

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  {currentDevice.tagNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Gemini Multimodal Vision Triage
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                E-Waste Assessment & Smart Pathway
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                AI inspects visual condition and asks dynamic follow-up questions to calculate your personalized circular route
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              {finalAssessment ? (
                <button
                  onClick={() => handleProceedToRoutes()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to Routes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Global Error Banner with Retry */}
        {apiError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => {
                if (isScanningOptical || !visualAnalysis) {
                  runOpticalAnalysis(true);
                } else {
                  handleSubmitAnswersToGemini();
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shrink-0 cursor-pointer text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Progress Step Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Step 1: Visual Inspection */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isScanningOptical
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {isScanningOptical ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : '✓'}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span>Step 1: Visual Inspection</span>
                  {isScanningOptical && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {isScanningOptical 
                    ? 'Scanning hardware optics...' 
                    : (visualAnalysis?.name || visualAnalysis?.category || 'Visual Inspection Complete')}
                </div>
              </div>
            </div>

            {/* Step 2: Dynamic Questions */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              finalAssessment 
                ? 'bg-emerald-50/70 border-emerald-200' 
                : !isScanningOptical 
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                finalAssessment 
                  ? 'bg-emerald-600 text-white' 
                  : !isScanningOptical 
                    ? 'bg-amber-600 text-white shadow-2xs' 
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {finalAssessment ? '✓' : isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : '2'}
              </div>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  finalAssessment ? 'text-emerald-800' : !isScanningOptical ? 'text-amber-800' : 'text-slate-500'
                }`}>
                  Step 2: Dynamic Inquiries
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {finalAssessment 
                    ? 'Questions Evaluated' 
                    : isScanningOptical
                      ? 'Queued after optical scan'
                      : `Round ${currentRound} • ${answeredQuestionsCount} of ${questions.length} Answered`}
                </div>
              </div>
            </div>

            {/* Step 3: Personalized Pathway */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              finalAssessment
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                finalAssessment ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {finalAssessment ? <Sparkles className="w-4 h-4 text-white" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  finalAssessment ? 'text-emerald-800' : 'text-slate-500'
                }`}>
                  Step 3: Personalized Route
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {finalAssessment ? finalAssessment.recommended_route : 'Unlocks after answers'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Operating Principle & Safety Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900/90 leading-relaxed">
            <span className="font-bold text-amber-950">Operating Principle: </span>
            AI recommends based on visible cues and your answers; qualified bench technicians verify physical motherboard rails with multimeter before ordering parts.
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Stage 1 - Image Detection & Hardware Analysis */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Scanned Image Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanningOptical ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isScanningOptical ? 'Optical Telemetry Scan' : 'Analyzed Photograph'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isScanningOptical && (
                    <button
                      type="button"
                      onClick={() => runOpticalAnalysis(true)}
                      title="Re-run optical scan animation"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-Scan</span>
                    </button>
                  )}
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Gemini Multimodal Vision
                  </span>
                </div>
              </div>

              {/* Photograph Screen with High-Tech Scanning Overlay */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={currentDevice.photoUrl}
                  alt={currentDevice.title}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    isScanningOptical ? 'brightness-90 contrast-110' : ''
                  }`}
                />
                
                {/* 1. ACTIVE HIGH-TECH OPTICAL SCANNING OVERLAY */}
                {isScanningOptical && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex flex-col justify-between">
                    
                    {/* Subtle Matrix Grid Pulse */}
                    <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] animate-grid-pulse opacity-30" />

                    {/* Sweeping Laser Beam with Glow and Trailing Gradient */}
                    <div className="absolute left-0 right-0 animate-laser-sweep pointer-events-none">
                      {/* Glow halo */}
                      <div className="h-24 -mt-24 bg-gradient-to-t from-emerald-500/25 via-emerald-400/10 to-transparent w-full" />
                      {/* Laser line */}
                      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_16px_#34d399]" />
                    </div>

                    {/* Corner Target HUD Reticles */}
                    <div className="absolute inset-3 pointer-events-none animate-reticle">
                      <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm shadow-[0_0_8px_#10b981]" />
                      <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm shadow-[0_0_8px_#10b981]" />
                      <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm shadow-[0_0_8px_#10b981]" />
                      <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-emerald-400 rounded-br-sm shadow-[0_0_8px_#10b981]" />

                      {/* Center Target Crosshairs */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-emerald-400/40 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      </div>
                    </div>

                    {/* Top Telemetry Banner */}
                    <div className="relative z-10 m-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>OPTICAL AI SCAN IN PROGRESS</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-slate-950/85 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                        GEMINI MULTIMODAL INTELLIGENCE
                      </div>
                    </div>

                    {/* Bottom Live Progress & Telemetry Readout */}
                    <div className="relative z-10 m-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-200 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur-md">
                        <span className="truncate">{SCAN_TELEMETRY_PHASES[telemetryPhaseIndex]}</span>
                        <span className="text-emerald-400 font-bold shrink-0 ml-2 animate-pulse">PROCESSING</span>
                      </div>

                      <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-emerald-500/30">
                        <div className="h-full bg-gradient-to-r from-emerald-600 via-teal-300 to-emerald-500 animate-beam-flow w-full" />
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. SUBMITTING ANSWERS AI RE-EVALUATION SCAN OVERLAY */}
                {isSubmittingAnswers && !isScanningOptical && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex flex-col justify-between">
                    <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[1px]" />
                    <div className="absolute left-0 right-0 animate-laser-sweep pointer-events-none">
                      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_16px_#2dd4bf]" />
                    </div>
                    <div className="m-3 self-start px-2.5 py-1 rounded bg-slate-950/90 border border-teal-500/40 text-[10px] font-mono text-teal-300 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                      <span>CORRELATING PHYSICAL CLUES & ANSWERS</span>
                    </div>
                  </div>
                )}

                {/* 3. VERIFIED OPTICAL BOUNDING BOX */}
                {!isScanningOptical && visualAnalysis && !nonElectronicError && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 m-3 rounded-lg flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-xs">
                      <span>E-WASTE SCAN: OK</span>
                      <span>CONF: {visualAnalysis.identification_confidence?.toUpperCase()} ({visualAnalysis.modelMatchConfidencePercent}%)</span>
                    </div>
                    <div className="self-start text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                      DETECTED: {visualAnalysis.category.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* NON-ELECTRONIC ERROR ALERT */}
              {nonElectronicError && (
                <div className="p-4 bg-amber-50 border-t border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Non-Electronic Photograph Detected</span>
                  </div>
                  <p className="text-xs text-amber-950/90 leading-relaxed">
                    {nonElectronicError}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveScreen(4)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Take / Select Another Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => runOpticalAnalysis(true)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Retry Optical Scan
                    </button>
                  </div>
                </div>
              )}

              {/* DETECTED OBJECT HIGHLIGHT BOX */}
              {visualAnalysis && !nonElectronicError && (
                <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identified Electronic Device</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 leading-snug">
                    {visualAnalysis.name}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {visualAnalysis.visible_condition}
                  </div>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-emerald-200 rounded text-[11px] font-medium text-emerald-800">
                      🏷️ {visualAnalysis.category}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                      Model: {visualAnalysis.brand_or_model}
                    </span>
                  </div>
                </div>
              )}

              {/* SCANNING ACTIVE SKELETON */}
              {isScanningOptical && !visualAnalysis && (
                <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Scan className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>Optical AI Telemetry in Progress...</span>
                  </div>
                  <div className="h-4 bg-slate-200/80 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-200/60 rounded animate-pulse w-1/2" />
                </div>
              )}
            </div>

            {/* Observable Damage & Condition Details */}
            {visualAnalysis && !nonElectronicError && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Visual Physical Condition
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {visualAnalysis.identification_confidence} confidence
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {visualAnalysis.brand_or_model}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {visualAnalysis.visible_condition}
                  </p>
                </div>

                {/* Observable Physical Damage */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Observable Physical Damage & Signs:
                  </div>
                  <div className="space-y-1.5">
                    {visualAnalysis.visible_damage && visualAnalysis.visible_damage.length > 0 ? (
                      visualAnalysis.visible_damage.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        No exterior physical damage visually observed.
                      </div>
                    )}
                  </div>
                </div>

                {/* What Cannot Be Determined Visually */}
                {visualAnalysis.what_cannot_be_determined && visualAnalysis.what_cannot_be_determined.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cannot be determined from photograph:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
                      {visualAnalysis.what_cannot_be_determined.map((item, idx) => (
                        <li key={idx} className="leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Observable Safety Notes */}
                {visualAnalysis.safety_notes && visualAnalysis.safety_notes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Observable Safety Considerations:</span>
                    </div>
                    <div className="space-y-1">
                      {visualAnalysis.safety_notes.map((note, idx) => (
                        <p key={idx} className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Environmental & Resource Metrics */}
            {visualAnalysis && !nonElectronicError && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Resource Recovery & Carbon LCA
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-semibold text-emerald-800 uppercase">Avoided Carbon</div>
                    <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <Leaf className="w-4 h-4" /> ~{visualAnalysis.co2eAvoidanceKg} kg CO₂e
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Recoverable Mass</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      {visualAnalysis.recoverableMassKg} kg WEEE
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Stage 2 (Dynamic Questions) & Stage 3 (Personalized Pathway) */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 2: DYNAMIC INTAKE QUESTIONS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Adaptive Questions from Gemini Vision
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Generated dynamically from your uploaded photograph to uncover operational condition, power status, and user needs.
                  </p>
                </div>

                {!isScanningOptical && (
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Round {currentRound} • {answeredQuestionsCount} of {questions.length} answered
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Questions List or Scanning Wait State */}
              {isScanningOptical ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl space-y-3.5 border border-slate-200">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
                    <Scan className="w-5 h-5 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Evaluating device photograph with Gemini Vision...
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {SCAN_TELEMETRY_PHASES[telemetryPhaseIndex]}
                  </p>
                </div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-800">
                        Gemini Multimodal Intelligence is analyzing physical condition and formulating dynamic questions...
                      </p>
                      <p className="text-xs text-slate-500">
                        Checking power status, display symptoms, and component preservation needs.
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-800">
                        Dynamic questions ready to be generated for {visualAnalysis?.name || 'this hardware'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Gemini inspects visible casing wear, screen damage, and connector ports to formulate personalized diagnostic inquiries.
                      </p>
                      <button
                        type="button"
                        onClick={() => generateInitialDynamicQuestions(undefined, true)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Formulate Dynamic Questions with Gemini</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, qIndex) => {
                    const currentAnswer = answers[q.id];
                    const isAnswered = currentAnswer !== undefined && currentAnswer !== '' && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

                    return (
                      <div 
                        key={q.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          isAnswered 
                            ? 'bg-slate-50/80 border-emerald-300 ring-1 ring-emerald-500/10' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Question {qIndex + 1}
                              </span>
                              {q.required && (
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">Required</span>
                              )}
                            </div>
                            {isAnswered && (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Answered
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-bold text-slate-900 mt-1">
                            {q.text}
                          </div>

                          {q.reason && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                              <span>💡</span>
                              <span>{q.reason}</span>
                            </div>
                          )}
                        </div>

                        {/* Question Input Controls based on type */}
                        <div className="mt-3">
                          
                          {/* YES / NO Questions */}
                          {q.type === 'yes_no' && (
                            <div className="grid grid-cols-3 gap-2">
                              {['Yes', 'No', 'Not sure'].map((opt) => {
                                const selected = currentAnswer === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, opt, 'yes_no')}
                                    className={`p-2.5 rounded-xl text-xs font-semibold text-center border cursor-pointer transition-all ${
                                      selected
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* SINGLE CHOICE Questions */}
                          {q.type === 'single_choice' && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((option, optIdx) => {
                                const selected = currentAnswer === option;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, option, 'single_choice')}
                                    className={`p-3 rounded-xl text-xs text-left font-medium transition-all cursor-pointer border flex items-start gap-2.5 ${
                                      selected
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                      selected 
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
                          )}

                          {/* MULTIPLE CHOICE Questions */}
                          {q.type === 'multiple_choice' && q.options && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((option, optIdx) => {
                                  const selectedList = (currentAnswer as string[]) || [];
                                  const selected = selectedList.includes(option);
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() => handleSelectAnswer(q.id, option, 'multiple_choice')}
                                      className={`p-3 rounded-xl text-xs text-left font-medium transition-all cursor-pointer border flex items-start gap-2.5 ${
                                        selected
                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                        selected 
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
                          )}

                          {/* SHORT TEXT Questions */}
                          {q.type === 'short_text' && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={(currentAnswer as string) || ''}
                                onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                                placeholder="Type your answer or symptom details..."
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-emerald-600"
                              />
                            </div>
                          )}

                          {/* Optional "I don't know / Not sure" fallback button */}
                          <div className="mt-2.5 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleNotSureAnswer(q.id)}
                              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 cursor-pointer"
                            >
                              I don't know / Not sure
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submission / Progression Action Bar */}
              {!isScanningOptical && questions.length > 0 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="text-xs text-slate-600 text-center sm:text-left">
                    {finalAssessment ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Dynamic questions evaluated. Personalized recommendation ready below.
                      </span>
                    ) : (
                      <span>
                        {allCurrentRoundAnswered
                          ? 'All round questions answered! Click submit to evaluate next step with Gemini.'
                          : `Please answer the questions above (${answeredQuestionsCount} of ${questions.length} answered).`}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitAnswersToGemini}
                    disabled={isSubmittingAnswers || answeredQuestionsCount === 0}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingAnswers ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini Evaluating Answers...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{finalAssessment ? 'Re-evaluate with Gemini' : 'Submit Answers to Gemini'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* STEP 3: PERSONALIZED FINAL RECOMMENDATION CARD */}
            {finalAssessment ? (
              (() => {
                const badgeInfo = getPathwayBadge(finalAssessment.recommended_route);
                const BadgeIcon = badgeInfo.icon;

                return (
                  <div className="rounded-2xl border border-emerald-300 bg-white shadow-md overflow-hidden space-y-0 animate-fadeIn">
                    
                    {/* Header Banner */}
                    <div className={`p-6 bg-gradient-to-br ${badgeInfo.cardBg} text-white space-y-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            Step 3: Personalized Circular Recommendation
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {finalAssessment.confidence_score}% Viability Confidence
                        </span>
                      </div>

                      <div className="pt-1">
                        <div className="text-xs uppercase tracking-wider text-emerald-200/80 font-bold">
                          AI Recommended Pathway
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 mt-1">
                          <BadgeIcon className={`w-8 h-8 ${badgeInfo.accentColor}`} />
                          <span>{finalAssessment.recommended_route}</span>
                        </h2>
                      </div>

                      {/* User-Reported Operational Status Summary */}
                      {finalAssessment.user_reported_operational_condition && (
                        <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 space-y-0.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            User-Reported Operational State:
                          </div>
                          <p className="text-xs text-white/95 leading-relaxed">
                            {finalAssessment.user_reported_operational_condition}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-emerald-200 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-emerald-300" />
                        <span>Synthesized across visual optical indicators & user responses</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      
                      {/* Confirmed Observations vs Unverified Assumptions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Confirmed Observations */}
                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                          <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Confirmed Physical Observations:</span>
                          </div>
                          <div className="space-y-1.5">
                            {finalAssessment.confirmed_observations?.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Unverified Assumptions & Technical Uncertainties */}
                        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Remaining Uncertainties:</span>
                          </div>
                          <div className="space-y-1.5">
                            {finalAssessment.unverified_assumptions?.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Reasoning Breakdown */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Why Gemini Recommended This Route:
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          {finalAssessment.reasoning?.map((r, i) => (
                            <p key={i} className="text-xs text-slate-700 leading-relaxed">
                              {r}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Potential Repair & Reuse Considerations */}
                      {finalAssessment.potential_repair_or_reuse_considerations && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-slate-600" />
                            <span>Repair & Reuse Considerations:</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {finalAssessment.potential_repair_or_reuse_considerations}
                          </p>
                        </div>
                      )}

                      {/* Safety Precautions */}
                      {finalAssessment.safety_notes && finalAssessment.safety_notes.length > 0 && (
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>Handling & Technician Precautions:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-amber-900/90 pl-1">
                            {finalAssessment.safety_notes.map((sn, idx) => (
                              <li key={idx}>{sn}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Steps Guidance */}
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                        <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                          <ArrowRight className="w-4 h-4 text-emerald-600" />
                          <span>Next Practical Steps:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {finalAssessment.next_step_advice}
                        </p>
                      </div>

                      {/* Alternative Pathways */}
                      {finalAssessment.alternative_routes && finalAssessment.alternative_routes.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Alternative Pathways Considered:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {finalAssessment.alternative_routes.map((alt, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveScreen(3)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
                        >
                          Return to Dashboard
                        </button>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleProceedToRoutes}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
                          >
                            Compare All 5 Pathways
                          </button>

                          {(() => {
                            const rec = (finalAssessment.recommended_route || '').toLowerCase();
                            if (rec.includes('parts') || rec.includes('salvage') || rec.includes('recovery')) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleProceedDirectToPathway('parts_recovery')}
                                  className="px-6 py-3 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <Layers className="w-4 h-4 text-purple-200" />
                                  <span>Proceed to Parts Recovery Pickup</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }
                            if (rec.includes('recycling')) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleProceedDirectToPathway('recycling')}
                                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <Recycle className="w-4 h-4 text-emerald-200" />
                                  <span>Select Recycling Agency & Request Pickup</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }
                            if (rec.includes('donation')) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleProceedDirectToPathway('donation')}
                                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <HeartHandshake className="w-4 h-4 text-amber-200" />
                                  <span>Proceed to Donation (Pickup or Drop-off)</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }
                            if (rec.includes('repair')) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleProceedDirectToPathway('repair')}
                                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <Wrench className="w-4 h-4 text-blue-200" />
                                  <span>Find Repair Technicians</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={handleProceedToRoutes}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <span>Proceed to Route Recommendation</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()
            ) : null}

          </div>

        </div>

      </div>

    </div>
  );
};
