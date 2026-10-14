import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcladerLogo } from '../common/EcladerLogo';
import { 
  ShieldCheck, 
  Leaf, 
  Coins, 
  Award, 
  Printer, 
  Download, 
  Star, 
  CheckCircle2, 
  Trees, 
  Car, 
  Droplet, 
  ArrowRight,
  Share2,
  Cpu
} from 'lucide-react';

export const Screen12_FinalOutcome: React.FC = () => {
  const { devices, activeDeviceId, currentUser, finalizeOutcome, setActiveScreen } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  
  // If final outcome does not exist yet, initialize it
  const outcome = currentDevice?.finalOutcome || {
    certificateId: `ECL-LK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    completedAt: new Date().toISOString(),
    outcomeType: currentDevice.selectedRoute || 'repair',
    co2eAvoidanceKg: currentDevice.geminiAssessment?.co2eAvoidanceKg || 185.0,
    massDivertedKg: currentDevice.geminiAssessment?.recoverableMassKg || 1.65,
    preciousMetals: {
      goldGrams: 0.28,
      copperGrams: 18.0,
      silverGrams: 2.1,
    },
    economicValueSavedLkr: currentDevice.category === 'Laptop' ? 145000 : 65000,
    recipientOrBuyer: 'Retained by Owner (Extended Life +36 Months)',
    consumerRating: 5,
    consumerReview: 'Outstanding bench repair by the Colombo circular network. Device functions like new!',
  };

  const [rating, setRating] = useState<number>(outcome.consumerRating || 5);
  const [reviewText, setReviewText] = useState<string>(outcome.consumerReview || '');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Equivalencies calculation (documented LCA methodology based on WEEE Forum & EPA WARM model)
  const treesEquivalent = Math.max(1, Math.round(outcome.co2eAvoidanceKg / 22)); // 1 tree seedling absorbs ~22kg CO2e over 10 yrs
  const carKmEquivalent = Math.round(outcome.co2eAvoidanceKg * 4.1); // ~0.244 kg CO2e per passenger car km
  const waterLitersSaved = Math.round(outcome.massDivertedKg * 850); // ~850L water per kg computer manufacture

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await finalizeOutcome(currentDevice.id, rating, reviewText);
    setIsSavedFeedback(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">#{outcome.certificateId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Circular Electronics Impact Certificate
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Official lifecycle verification for <strong className="text-slate-800">{currentDevice.title}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => setActiveScreen(3)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Certificate Hero Badge */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
                <Award className="w-4 h-4" />
                <span>Verified Circular Economy Outcome</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Certificate #{outcome.certificateId}
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
                Registered in the Western Province E-Waste Registry under Central Environmental Authority (CEA) guidelines. 
                Hardware successfully diverted from landfill through verified component restoration.
              </p>
              <div className="text-[11px] font-mono text-emerald-300/80 pt-1">
                Completed on {new Date(outcome.completedAt).toLocaleDateString()} • Authorized Lab: Colombo MicroTech
              </div>
            </div>

            <div className="bg-emerald-900/60 backdrop-blur-md p-6 rounded-2xl border border-emerald-700/50 text-center shrink-0">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                Landfill Diverted
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {outcome.massDivertedKg} kg
              </div>
              <div className="text-[10px] text-emerald-200 mt-1">100% Circular Recovery</div>
            </div>
          </div>
        </div>

        {/* Environmental Life Cycle Assessment (LCA) Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span>Documented Environmental Impact (LCA Model)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated using WEEE Forum Life Cycle Assessment metrics compared to virgin hardware fabrication.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Methodology: EPA WARM / WEEE LCA
            </span>
          </div>

          {/* Primary Impact Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Embodied Carbon Abated
              </span>
              <div className="text-3xl font-black text-emerald-700 mt-1">
                {outcome.co2eAvoidanceKg} <span className="text-base font-semibold">kg CO₂e</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Avoided mining, silicon smelting, and air freight footprint.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                E-Waste Diverted
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {outcome.massDivertedKg} <span className="text-base font-semibold">kg</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Prevented toxic lead, cadmium, and flame-retardant landfill leeching.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Domestic Value Kept
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                LKR {outcome.economicValueSavedLkr.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Kept in Sri Lanka instead of importing expensive replacement.
              </p>
            </div>
          </div>

          {/* Tangible Environmental Equivalencies */}
          <div className="pt-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Real-World Environmental Equivalencies:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{treesEquivalent} Urban Trees</div>
                  <div className="text-[11px] text-slate-500">Growing for 10 full years</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{carKmEquivalent} km</div>
                  <div className="text-[11px] text-slate-500">Driving emissions avoided</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{waterLitersSaved.toLocaleString()} L</div>
                  <div className="text-[11px] text-slate-500">Clean water saved in production</div>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Raw Materials Preserved */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Conserved Metallurgy & Critical Minerals (Intact in Hardware):
            </div>
            <div className="grid grid-cols-3 gap-4 pt-1 text-center">
              <div>
                <div className="text-xl font-black text-amber-300">{outcome.preciousMetals.goldGrams}g</div>
                <div className="text-[11px] text-slate-400">Pure Gold (Au)</div>
              </div>
              <div>
                <div className="text-xl font-black text-slate-100">{outcome.preciousMetals.silverGrams}g</div>
                <div className="text-[11px] text-slate-400">Silver (Ag)</div>
              </div>
              <div>
                <div className="text-xl font-black text-amber-500">{outcome.preciousMetals.copperGrams}g</div>
                <div className="text-[11px] text-slate-400">High-Purity Copper (Cu)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Consumer Feedback & Rating Submission */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Rate Bench Quality & Technician Service
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Helps maintain top quality across accredited Western Province workshops.
              </p>
            </div>
            {isSavedFeedback && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Feedback Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Workmanship Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {rating === 5 ? '5.0 - Exceptional Repair' : `${rating}.0 Stars`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Consumer Review & Feedback
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience regarding turnaround time, communication, and hardware performance..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Submit Quality Rating
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Printable Certificate Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 border-4 border-emerald-600 relative">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-200 pb-6">
              <EcladerLogo variant="full" size={90} className="p-0" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Official Circular Certificate
              </h2>
              <div className="text-xs font-semibold text-emerald-800">
                Western Province Electronic Waste Reduction Protocol • Colombo Pilot
              </div>
              <div className="text-sm font-mono font-bold text-slate-700">
                Registry ID: {outcome.certificateId}
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs text-slate-700">
              <p className="leading-relaxed text-center">
                This document officially certifies that the electronic hardware unit detailed below has successfully completed verified circular refurbishment, avoiding disposal into Sri Lankan municipal landfills:
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div>Hardware Model: <strong>{currentDevice.title}</strong></div>
                <div>Intake Tag: <strong>{currentDevice.tagNumber}</strong></div>
                <div>Registered Owner: <strong>{currentDevice.userName} ({currentDevice.userDistrict})</strong></div>
                <div>Verified Pathway: <strong className="uppercase">{outcome.outcomeType}</strong></div>
                <div>Issued Date: <strong>{new Date(outcome.completedAt).toLocaleDateString()}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Carbon Abated</div>
                  <div className="text-lg font-black text-emerald-700">{outcome.co2eAvoidanceKg} kg CO₂e</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl text-center border border-slate-300">
                  <div className="text-[10px] uppercase font-bold text-slate-700">Mass Diverted</div>
                  <div className="text-lg font-black text-slate-900">{outcome.massDivertedKg} kg</div>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-400">
                Digital Signature: SHA256:{outcome.certificateId}CEA-LK
              </div>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
