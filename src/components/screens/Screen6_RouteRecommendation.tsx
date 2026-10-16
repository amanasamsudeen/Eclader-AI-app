import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CircularRoute } from '../../types';
import { 
  Wrench, 
  RefreshCw, 
  HeartHandshake, 
  Layers, 
  Recycle, 
  CheckCircle2, 
  ArrowRight, 
  Leaf, 
  Coins, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface RouteOption {
  id: CircularRoute;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  estimatedReturn: string;
  co2eAbated: string;
  turnaround: string;
  pros: string[];
  tradeoffs: string[];
  recommendedByAi: boolean;
  nextStepDescription: string;
}

export const Screen6_RouteRecommendation: React.FC = () => {
  const { devices, activeDeviceId, setDeviceRoute, setActiveScreen } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const pathwayData = currentDevice?.geminiAssessment?.calculatedPathway;
  const aiRecommended = pathwayData?.recommendedPathway?.toLowerCase() 
    || currentDevice?.geminiAssessment?.preliminaryRecommendation?.toLowerCase() 
    || 'repair';

  const [selectedRoute, setSelectedRoute] = useState<CircularRoute>(
    (currentDevice?.selectedRoute as CircularRoute) || 'repair'
  );

  // Sync when current device changes
  React.useEffect(() => {
    if (currentDevice?.selectedRoute) {
      setSelectedRoute(currentDevice.selectedRoute as CircularRoute);
    } else if (aiRecommended.includes('repair')) {
      setSelectedRoute('repair');
    } else if (aiRecommended.includes('reuse') || aiRecommended.includes('resale')) {
      setSelectedRoute('reuse_resale');
    } else if (aiRecommended.includes('donation')) {
      setSelectedRoute('donation');
    } else if (aiRecommended.includes('parts') || aiRecommended.includes('recovery')) {
      setSelectedRoute('parts_recovery');
    } else if (aiRecommended.includes('recycling')) {
      setSelectedRoute('recycling');
    }
  }, [currentDevice?.id, currentDevice?.selectedRoute, aiRecommended]);

  const routes: RouteOption[] = [
    {
      id: 'repair',
      title: 'Component Repair',
      subtitle: 'Board micro-soldering, modular panel & battery renewal',
      icon: Wrench,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      estimatedReturn: 'Saves ~LKR 145,000 vs new device',
      co2eAbated: '~198 kg CO₂e avoided',
      turnaround: '24–48 hours',
      pros: [
        'Preserves maximum device utility and personal data',
        'Direct component sourcing from local Colombo salvage pool',
        'Backed by 90-day bench warranty',
      ],
      tradeoffs: [
        'Requires certified technician bench labor fee',
        'Subject to multimeter verification of motherboard rails',
      ],
      recommendedByAi: aiRecommended.includes('repair'),
      nextStepDescription: 'Matches you with certified NVQ Level 4 bench technicians in Colombo.',
    },
    {
      id: 'reuse_resale',
      title: 'Reuse & Resale',
      subtitle: 'Certified data sanitize & domestic marketplace resale',
      icon: RefreshCw,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
      estimatedReturn: 'LKR 45,000–60,000 estimated resale value',
      co2eAbated: '~175 kg CO₂e avoided',
      turnaround: '3–5 days',
      pros: [
        'Immediate cash return for owner',
        'Extends hardware active lifecycle in the Sri Lankan market',
        'DoD 5220.22-M certified cryptographic data sanitization',
      ],
      tradeoffs: [
        'Requires working motherboard or minor cosmetic grade',
        'Marketplace commission applies (8%)',
      ],
      recommendedByAi: aiRecommended.includes('reuse') || aiRecommended.includes('resale'),
      nextStepDescription: 'Direct dispatch to certified refurbishment partner for resale grading.',
    },
    {
      id: 'donation',
      title: 'Community Donation',
      subtitle: 'Refurbish for rural schools & vocational IT hubs',
      icon: HeartHandshake,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      estimatedReturn: 'Tax receipt & CSR Social Impact Credits',
      co2eAbated: '~190 kg CO₂e avoided',
      turnaround: '2–4 days',
      pros: [
        'Directly equips underserved students in Sri Lanka',
        'Eligible for government school digital literacy certificate',
        'Free doorstep logistics pickup sponsored by telecom partners',
      ],
      tradeoffs: [
        'No direct monetary payout to owner',
        'Device must meet minimum educational OS specs',
      ],
      recommendedByAi: aiRecommended.includes('donation'),
      nextStepDescription: 'Coordinates volunteer refurbishment and school recipient assignment.',
    },
    {
      id: 'parts_recovery',
      title: 'Parts Recovery',
      subtitle: 'Harvest functioning LCD, RAM, SSD, and ICs',
      icon: Layers,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      estimatedReturn: 'LKR 12,000–28,000 component credits',
      co2eAbated: '~140 kg CO₂e avoided',
      turnaround: '24 hours',
      pros: [
        'Extracts hard-to-import spare parts for other repairs',
        'Yields salvage credits usable for future repair discounts',
        'Zero electronic parts sent to municipal landfill',
      ],
      tradeoffs: [
        'Device chassis is permanently decommissioned',
        'Motherboard bare PCB routed to smelter recycling',
      ],
      recommendedByAi: aiRecommended.includes('parts') || aiRecommended.includes('recovery'),
      nextStepDescription: 'Sends hardware to local salvage bench for component testing and logging.',
    },
    {
      id: 'recycling',
      title: 'Responsible Recycling',
      subtitle: 'WEEE certified smelter & gold/copper demanufacturing',
      icon: Recycle,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      estimatedReturn: 'Scrap weight credit + Green Diverted Certificate',
      co2eAbated: '~85 kg CO₂e raw material recovery',
      turnaround: 'Same-day intake',
      pros: [
        '100% compliant with Central Environmental Authority (CEA) Sri Lanka',
        'Safe de-pollution of mercury, lead, and flame retardants',
        'Certified recovery of gold, silver, copper, and palladium',
      ],
      tradeoffs: [
        'Low financial payout (scrap metal weight index)',
        'Device cannot be reconstituted',
      ],
      recommendedByAi: aiRecommended.includes('recycling'),
      nextStepDescription: 'Issues official Central Environmental Authority (CEA) destruction manifest.',
    },
  ];

  const handleConfirmRoute = async () => {
    await setDeviceRoute(currentDevice.id, selectedRoute);
    
    // Exact Pathway Routing:
    if (selectedRoute === 'repair') {
      setActiveScreen(7); // Screen 7: Technician Matching & Collection
    } else if (selectedRoute === 'parts_recovery') {
      setActiveScreen(14); // Screen 14: Parts Recovery E-Waste Pickup
    } else if (selectedRoute === 'recycling') {
      setActiveScreen(13); // Screen 13: CEA Recycling Agencies Pickup
    } else if (selectedRoute === 'donation') {
      setActiveScreen(15); // Screen 15: Community Hardware Donation
    } else {
      setActiveScreen(8); // Screen 8: Device Tracking Timeline
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">{currentDevice.tagNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Choose the Circular Route for Your Hardware
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                AI recommends; you decide. Select from 5 circular paths optimized for Western Province logistics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(5)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Diagnostic
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Device summary bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentDevice.photoUrl}
              alt={currentDevice.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <div className="text-xs text-slate-500 font-medium">Selected Device:</div>
              <div className="text-sm font-bold text-slate-900">{currentDevice.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">AI Suggested Primary:</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {pathwayData?.recommendedPathway || currentDevice.geminiAssessment?.preliminaryRecommendation || 'Component Repair'}
            </span>
          </div>
        </div>

        {/* Tailored Reasoning Callout */}
        {pathwayData?.plainLanguageReason && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Tailored from your Intake Photo & Diagnostic Answers:
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {pathwayData.plainLanguageReason}
              </p>
            </div>
          </div>
        )}

        {/* 5 Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((rt) => {
            const isSelected = selectedRoute === rt.id;
            const IconComponent = rt.icon;

            return (
              <div
                key={rt.id}
                onClick={() => setSelectedRoute(rt.id)}
                className={`relative rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between border-2 ${
                  isSelected
                    ? 'bg-white border-emerald-600 shadow-lg scale-[1.01]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* AI recommendation badge */}
                {rt.recommendedByAi && (
                  <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Recommended (Highest Circular Yield)</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${rt.iconBg} ${rt.iconColor} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors">
                      {isSelected ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-transparent" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{rt.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{rt.subtitle}</p>

                  {/* Highlights */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" /> Economic:
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">{rt.estimatedReturn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Impact:
                      </span>
                      <span className="font-semibold text-emerald-700 text-[11px]">{rt.co2eAbated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Turnaround:
                      </span>
                      <span className="text-slate-700 text-[11px] font-medium">{rt.turnaround}</span>
                    </div>
                  </div>

                  {/* Pros & Trade-offs */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Advantages:</span>
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {rt.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade-offs:</span>
                      <ul className="mt-1 space-y-1 text-slate-500">
                        {rt.tradeoffs.map((t, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  {rt.nextStepDescription}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmation Footer Bar */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Selected Circular Route:</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 capitalize">
              {selectedRoute.replace('_', ' ')}
            </div>
            <p className="text-xs text-slate-600">
              {selectedRoute === 'repair' && 'Next step matches you with certified bench technicians for doorstep device collection and inspection.'}
              {selectedRoute === 'parts_recovery' && 'Next step connects you with verified recovery partners to request e-waste pickup for component salvage.'}
              {selectedRoute === 'recycling' && 'Next step allows you to select a CEA-licensed recycling agency and schedule e-waste collection.'}
              {selectedRoute === 'donation' && 'Next step allows you to select an educational NGO to request doorstep pickup or generate a drop-off voucher.'}
              {selectedRoute === 'reuse_resale' && 'Next step prepares certified data sanitization and domestic resale grading.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleConfirmRoute}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
