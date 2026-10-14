import React from 'react';
import { useApp } from '../../context/AppContext';
import { EcladerLogo } from '../common/EcladerLogo';

export const Screen1_Landing: React.FC = () => {
  const { setActiveScreen, currentUser, setCurrentUser, users } = useApp();

  return (
    <div className="w-full bg-[#faf8ff] text-[#131b2e] font-sans antialiased overflow-x-hidden">
      
      {/* Top Notification & Pilot Status Banner */}
      <section className="w-full bg-[#f2f3ff] py-2 px-4 sm:px-10 border-b border-[#bdc9c2]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#95f5d2] text-[#002117]">
              <span className="material-symbols-outlined text-sm">hub</span>
            </span>
            <span className="text-[12px] text-[#005f48] uppercase tracking-wider font-semibold font-['Plus_Jakarta_Sans']">
              Colombo Pilot Initiative
            </span>
            <span className="hidden md:inline text-[#bdc9c2]">•</span>
            <span className="text-[13px] text-[#3e4944]">
              Western Province Urban Circularity Sandbox • Municipal Zone 01-07
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#005f48] bg-white px-2.5 py-0.5 rounded-full shadow-xs border border-[#005f48]/10 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#005f48] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005f48]"></span>
              </span>
              Live Stream: Gemini 1.5 Multimodal v2.4
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#faf8ff] via-[#f2f3ff]/40 to-[#faf8ff] py-10 lg:py-20">
        {/* Subtle Animated Background Ambient Floating Aura Gradients */}
        <div className="absolute -top-32 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-[#95f5d2]/25 to-[#6ffbbe]/20 rounded-full blur-3xl pointer-events-none animate-aura-1"></div>
        <div className="absolute top-1/3 -left-24 w-96 h-96 bg-gradient-to-tr from-[#c4dcff]/35 to-[#95f5d2]/20 rounded-full blur-3xl pointer-events-none animate-aura-2"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#005f48]/5 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              
              {/* Municipal Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-xs text-[#005f48] text-xs font-semibold border border-[#bdc9c2]/30 hover:shadow transition-shadow font-['Plus_Jakarta_Sans']">
                <EcladerLogo variant="icon" size={20} />
                <span>Colombo Municipality Circular Pilot Project</span>
                <span className="text-[#bdc9c2]">•</span>
                <span className="font-mono text-[#3e4944]">2025 Edition</span>
              </div>

              {/* Main Value Proposition Heading */}
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl lg:text-[3.5rem] lg:leading-[4.25rem] font-bold text-[#131b2e] tracking-tight text-balance">
                Give Your Electronics a{' '}
                <span className="text-[#005f48] relative inline-block">
                  Smarter Second Life
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#005f48] via-[#95f5d2] to-transparent rounded-full opacity-60"></span>
                </span>
              </h1>

              {/* Deep Subtitle */}
              <p className="text-base sm:text-lg text-[#3e4944] max-w-2xl text-balance leading-relaxed">
                Powered by multimodal Gemini AI. Upload high-fidelity inspection imagery to instantly triage your discarded smartphone, laptop, or PCB across 6 circular pathways:{' '}
                <span className="font-semibold text-[#005f48]">Repair, Reuse, Resale, Donation, Parts Recovery</span>, or{' '}
                <span className="font-semibold text-[#49607e]">Responsible Recycling</span>.
              </p>

              {/* CTAs & Trust Badges */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full pt-2">
                <button
                  onClick={() => setActiveScreen(4)} // Screen 4: Add Device / Photo Upload
                  className="shimmer-trigger group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#005f48] text-white font-semibold text-sm transition-all duration-300 hover:bg-[#007a5e] shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-['Plus_Jakarta_Sans']"
                >
                  <div className="shimmer-bar absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
                  <span className="relative z-10">Assess My Device</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1 relative z-10">
                    arrow_forward
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-[#95f5d2]/20 blur-md -z-10 group-hover:blur-lg transition-all"></div>
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#131b2e] font-semibold text-sm hover:bg-[#e2e7ff] transition-all duration-200 shadow-xs hover:shadow hover:-translate-y-0.5 font-['Plus_Jakarta_Sans']"
                >
                  <span className="material-symbols-outlined text-base text-[#49607e]">help_outline</span>
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Circular Route Pills Spectrum with Hover Transform */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="font-mono text-xs text-[#3e4944] font-medium mr-1">Pathways:</span>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#0D9488]/10 shadow-2xs"
                >
                  Repair
                </button>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#007A5E] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#007A5E]/10 shadow-2xs"
                >
                  Reuse
                </button>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#F0F9FF] text-[#0284C7] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#0284C7]/10 shadow-2xs"
                >
                  Resale
                </button>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#4F46E5]/10 shadow-2xs"
                >
                  Donation
                </button>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#D97706]/10 shadow-2xs"
                >
                  Parts Recovery
                </button>
                <button
                  onClick={() => setActiveScreen(6)}
                  className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#334155] text-xs font-semibold hover:scale-105 transition-transform duration-150 cursor-pointer border border-[#334155]/10 shadow-2xs"
                >
                  Responsible Recycling
                </button>
              </div>

            </div>

            {/* Hero Right Column: Dynamic Interactive AI Triage Hologram / Inspection Card */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#005f48]/15 via-[#95f5d2]/20 to-[#49607e]/15 rounded-2xl blur-xl animate-aura-1"></div>
              <div className="relative bg-white rounded-2xl border border-[#bdc9c2]/30 shadow-xl overflow-hidden p-6 flex flex-col gap-4 transition-shadow hover:shadow-2xl">
                
                {/* Inspection Window Top Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e7ff]/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#4edea3] animate-pulse"></span>
                    <span className="w-3 h-3 rounded-full bg-[#d2e4ff]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#dae2fd]"></span>
                    <span className="ml-2 font-mono text-xs text-[#131b2e] font-semibold tracking-wide">
                      GEMINI-VISION // LK-COLOMBO-LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e2e7ff] border border-[#bdc9c2]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005f48] animate-ping-slow"></span>
                    <span className="text-xs text-[#131b2e] font-semibold font-['Plus_Jakarta_Sans']">
                      94.8% Conf.
                    </span>
                  </div>
                </div>

                {/* Inspection Preview Target with Scanning Radar Bar & Bounding Tags */}
                <div 
                  onClick={() => setActiveScreen(5)}
                  className="relative rounded-xl overflow-hidden bg-[#f2f3ff] aspect-[4/3] flex items-center justify-center group shadow-inner cursor-pointer"
                >
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt="Dismantled modern high-end smartphone on an electronic technician's anti-static repair mat in a high-tech cleanroom laboratory in Colombo Sri Lanka"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH0uZGHvAaOrwihYC9NSGgyqMWwejwdVdoE9jSLDeTEqOOsIg7ZmZ9AYQ3flHnjaJD7r4a2xeE_qT8mGyi6Yz38DMNhUb78c4mQ0LGy0hYop39DLcNruo2cjWF4F0WHJsKskk2WmOZM8CiF5D790hywOeEMfmmbTsEa8ZRgyIR7dSyeKWrbt5YAGtOoJDTxQiJ3kWyAwi-3P3jMH1VzsTLuB-_JjRZXdrgJ-klwvxV1k7OxIe_PcO40Q"
                  />
                  {/* Scanning Laser Bar Overlay */}
                  <div className="absolute inset-x-0 h-16 pointer-events-none animate-scanline z-20 bg-gradient-to-b from-[#005f48]/0 via-[#95f5d2]/30 to-[#005f48]/0 border-b border-[#95f5d2] shadow-[0_4px_14px_rgba(0,122,94,0.45)]"></div>
                  {/* Telemetry Grid Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,95,72,0.12)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-60"></div>
                  {/* Target Reticle & Coordinate Corners */}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-[#005f48] bg-[#faf8ff]/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-[#005f48]/20 pointer-events-none z-10">
                    X: 06°55&apos;N | Y: 79°51&apos;E
                  </div>
                  {/* Overlay Bounding Box 1: OLED Panel */}
                  <div className="absolute top-4 left-4 p-2 rounded-lg bg-[#faf8ff]/90 backdrop-blur-md shadow-md max-w-[185px] border border-[#005f48]/30 z-20 transition-transform duration-200 hover:scale-105">
                    <div className="flex items-center gap-1.5 text-[#005f48] text-xs font-bold font-['Plus_Jakarta_Sans']">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#005f48] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005f48]"></span>
                      </span>
                      <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                      <span>OLED Panel</span>
                    </div>
                    <p className="font-mono text-[11px] text-[#131b2e] leading-tight mt-0.5">
                      Micro-cracks localized; touch digitizer intact.
                    </p>
                  </div>
                  {/* Overlay Bounding Box 2: Battery Cell */}
                  <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-[#faf8ff]/90 backdrop-blur-md shadow-md max-w-[195px] border border-[#007b54]/30 z-20 transition-transform duration-200 hover:scale-105">
                    <div className="flex items-center gap-1.5 text-[#007A5E] text-xs font-bold font-['Plus_Jakarta_Sans']">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#007A5E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#007A5E]"></span>
                      </span>
                      <span className="material-symbols-outlined text-sm">battery_charging_full</span>
                      <span>Li-ion Battery Cell</span>
                    </div>
                    <p className="font-mono text-[11px] text-[#131b2e] leading-tight mt-0.5">
                      82% cycle health. Recommended: Re-cell or Harvest.
                    </p>
                  </div>
                  {/* Center Scan Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#95f5d2]/80 animate-spin" style={{ animationDuration: '18s' }}></div>
                    <div className="w-12 h-12 rounded-full border border-[#005f48]/40 absolute animate-ping-slow"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#005f48] absolute"></div>
                  </div>
                </div>

                {/* Triage Path Recommendation */}
                <div className="bg-[#f2f3ff] rounded-xl p-4 flex flex-col gap-1 border border-[#bdc9c2]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#005f48] text-xl animate-spin" style={{ animationDuration: '12s' }}>
                        auto_awesome
                      </span>
                      <span className="text-base text-[#131b2e] font-semibold font-['Plus_Jakarta_Sans']">
                        Triage Verdict: Subsystem Harvest
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#005f48] text-white text-xs font-semibold shadow-2xs">
                      Primary Path
                    </span>
                  </div>
                  <p className="text-xs text-[#3e4944] leading-relaxed">
                    Optimal circular utility achieved via module re-extraction for Colombo Tech Cluster. Diverts ~182g e-waste and offsets 3.4kg CO₂e.
                  </p>
                  
                  {/* Animated Progress Spark */}
                  <div className="w-full bg-[#e2e7ff] rounded-full h-2 mt-1 overflow-hidden relative">
                    <div className="bg-gradient-to-r from-[#005f48] to-[#95f5d2] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '86%' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-beam-flow pointer-events-none"></div>
                  </div>

                  <div className="flex justify-between items-center font-mono text-[11px] text-[#3e4944] pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-[#131b2e]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#005f48]"></span>
                      Salvageable Value: LKR 14,800
                    </span>
                    <span className="text-[#005f48] font-semibold">Landfill Avoidance: 92%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Pilot Metrics Ribbon with Animated Pulse Indicators */}
      <section className="w-full bg-white py-6 shadow-xs border-y border-[#bdc9c2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            
            {/* Metric 1 */}
            <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-[#f2f3ff] transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-14 h-14 rounded-xl bg-[#95f5d2] flex items-center justify-center text-[#002117] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">devices_fold</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#131b2e] leading-tight font-['Plus_Jakarta_Sans']">
                    1,420+
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#005f48] animate-ping-slow"></span>
                </div>
                <span className="text-sm text-[#3e4944] font-medium font-['Plus_Jakarta_Sans']">
                  Devices Audited & Categorized
                </span>
                <span className="font-mono text-xs text-[#005f48] flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-xs">sensors</span> Western Province Smart Feed
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-[#f2f3ff] transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-14 h-14 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#007A5E] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#131b2e] leading-tight font-['Plus_Jakarta_Sans']">
                    68%
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#007A5E] font-bold font-mono">
                    +14% MoM
                  </span>
                </div>
                <span className="text-sm text-[#3e4944] font-medium font-['Plus_Jakarta_Sans']">
                  Landfill Diversion Rate
                </span>
                <span className="font-mono text-xs text-[#3e4944]">
                  Diverted from Meethotamulla & Karadiyana
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-[#f2f3ff] transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-14 h-14 rounded-xl bg-[#c4dcff] flex items-center justify-center text-[#49617f] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">engineering</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#131b2e] leading-tight font-['Plus_Jakarta_Sans']">
                    34
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#49607e] animate-pulse"></span>
                </div>
                <span className="text-sm text-[#3e4944] font-medium font-['Plus_Jakarta_Sans']">
                  Colombo Certified Tech Hubs
                </span>
                <span className="font-mono text-xs text-[#49607e]">
                  Orugodawatta & Pettah Network
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive 3-Step Workflow Section */}
      <section className="w-full py-16 bg-[#faf8ff] relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-[#e2e7ff] text-[#005f48] text-xs font-semibold uppercase tracking-wider mb-2 font-['Plus_Jakarta_Sans']">
              The Circular Lifecycle Protocol
            </span>
            <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight font-['Plus_Jakarta_Sans']">
              Three Steps from Electronic Waste to Regenerated Utility
            </h2>
            <p className="text-sm text-[#3e4944] mt-2 text-balance">
              Our zero-friction pipeline simplifies inspection. Every device undergoes precision image vector analysis, cross-referenced against regional recovery demand in Sri Lanka.
            </p>
          </div>

          {/* 3 Steps Grid with Animated Glowing Flow Line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Flowing Animated Connection Line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-[#dae2fd] -z-0 -translate-y-8 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-[#005f48] via-[#95f5d2] to-[#49607e] animate-beam-flow opacity-80"></div>
            </div>

            {/* Step 1 Card */}
            <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group border border-[#bdc9c2]/30">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#e2e7ff] flex items-center justify-center text-[#005f48] text-xl font-bold shadow-xs group-hover:bg-[#005f48] group-hover:text-white transition-colors font-['Plus_Jakarta_Sans']">
                    01
                  </span>
                  <span className="material-symbols-outlined text-[#49607e] text-2xl group-hover:scale-110 transition-transform">
                    photo_camera
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-[#131b2e] group-hover:text-[#005f48] transition-colors font-['Plus_Jakarta_Sans']">
                    Upload Device Photos
                  </h3>
                  <p className="text-xs text-[#3e4944] leading-relaxed">
                    Take quick snapshots of the device front, back, port slots, and labels. Multimodal Gemini extracts cosmetic wear, frame torsion, and serial credentials automatically.
                  </p>
                </div>
              </div>

              {/* Micro Visual Element */}
              <div className="mt-6 pt-4 bg-[#f2f3ff] rounded-xl p-3 border border-[#bdc9c2]/20">
                <div className="flex items-center gap-2 text-[#3e4944] font-mono text-xs">
                  <span className="material-symbols-outlined text-[#005f48] text-base">check_circle</span>
                  <span>Model & Chassis Identification</span>
                </div>
                <div className="flex items-center gap-2 text-[#3e4944] font-mono text-xs mt-1">
                  <span className="material-symbols-outlined text-[#005f48] text-base">check_circle</span>
                  <span>Port Degradation & Pin Corrosion</span>
                </div>
              </div>
            </div>

            {/* Step 2 Card (AI Assessment) */}
            <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group border border-[#005f48]/20 ring-1 ring-[#005f48]/10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#95f5d2] flex items-center justify-center text-[#002117] text-xl font-bold shadow-xs group-hover:bg-[#005f48] group-hover:text-white transition-colors font-['Plus_Jakarta_Sans']">
                    02
                  </span>
                  <span className="material-symbols-outlined text-[#005f48] text-2xl group-hover:rotate-12 transition-transform">
                    psychology
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-[#131b2e] group-hover:text-[#005f48] transition-colors font-['Plus_Jakarta_Sans']">
                    Gemini Multimodal Triage
                  </h3>
                  <p className="text-xs text-[#3e4944] leading-relaxed">
                    Generates a granular circularity index. Evaluates component viability, repair costs vs. residual value, hazardous element risk, and carbon offset quantification.
                  </p>
                </div>
              </div>

              {/* Inline Visual Metric Box with Animated Progress */}
              <div className="mt-6 pt-4 bg-[#f2f3ff] rounded-xl p-3 border border-[#bdc9c2]/20">
                <div className="flex justify-between items-center text-xs mb-1 font-['Plus_Jakarta_Sans']">
                  <span className="text-[#131b2e] font-semibold">Triage Accuracy</span>
                  <span className="text-[#005f48] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005f48] animate-ping-slow"></span>96.2% Conf.
                  </span>
                </div>
                <div className="w-full bg-[#e2e7ff] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#005f48] to-[#95f5d2] h-1.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <span className="block font-mono text-[11px] text-[#3e4944] mt-2 text-right">
                  Basel Convention Tier 2 Validated
                </span>
              </div>
            </div>

            {/* Step 3 Card (Select Pathway) */}
            <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group border border-[#bdc9c2]/30">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#d2e4ff] flex items-center justify-center text-[#001c37] text-xl font-bold shadow-xs group-hover:bg-[#49607e] group-hover:text-white transition-colors font-['Plus_Jakarta_Sans']">
                    03
                  </span>
                  <span className="material-symbols-outlined text-[#49607e] text-2xl group-hover:translate-x-1 transition-transform">
                    local_shipping
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-[#131b2e] group-hover:text-[#49607e] transition-colors font-['Plus_Jakarta_Sans']">
                    Engage Verified Partner
                  </h3>
                  <p className="text-xs text-[#3e4944] leading-relaxed">
                    Connect directly with vetted Colombo repair technicians, schedule eco-courier pickup, or route unrecoverable metallurgy to certified Orugodawatta smelters.
                  </p>
                </div>
              </div>

              {/* Micro Visual Element */}
              <div className="mt-6 pt-4 bg-[#f2f3ff] rounded-xl p-3 border border-[#bdc9c2]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[#131b2e] font-['Plus_Jakarta_Sans'] font-semibold">
                    <span className="material-symbols-outlined text-[#005f48] text-base">verified</span>
                    <span>34 Certified Drop-offs</span>
                  </div>
                  <span className="text-[#005f48] font-semibold text-xs">Pettah • Bambalapitiya</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#3e4944] font-mono border border-[#bdc9c2]/20">
                    Pick-up Available
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded text-[#3e4944] font-mono border border-[#bdc9c2]/20">
                    Drop-box 24/7
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Strategic Features Grid */}
      <section className="w-full py-16 bg-[#f2f3ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="flex flex-col items-start max-w-2xl mb-8">
            <span className="px-3 py-1 rounded-full bg-[#dae2fd] text-[#49607e] text-xs font-semibold uppercase tracking-wider mb-2 font-['Plus_Jakarta_Sans']">
              Engineered for Municipal Resilience
            </span>
            <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight font-['Plus_Jakarta_Sans']">
              Enterprise Circular Infrastructure Built on Vision AI
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border border-[#bdc9c2]/30 group">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#005f48]/10 flex items-center justify-center text-[#005f48] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <h3 className="text-base font-semibold text-[#131b2e] group-hover:text-[#005f48] transition-colors font-['Plus_Jakarta_Sans']">
                  Multimodal Gemini Vision Diagnostics
                </h3>
                <p className="text-sm text-[#3e4944] leading-relaxed">
                  High-resolution spatial modeling detects cracked solder joints, capacitor bulging, battery swelling, and liquid intrusion indicators before devices are opened.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e2e7ff]/50">
                <span className="font-mono text-xs text-[#005f48] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base animate-pulse">bolt</span> Sub-second inference latency
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border border-[#bdc9c2]/30 group">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#49607e]/10 flex items-center justify-center text-[#49607e] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">handshake</span>
                </div>
                <h3 className="text-base font-semibold text-[#131b2e] group-hover:text-[#49607e] transition-colors font-['Plus_Jakarta_Sans']">
                  Verified Colombo Technician Network
                </h3>
                <p className="text-sm text-[#3e4944] leading-relaxed">
                  Micro-enterprises across Colombo 01 to 15 receive pre-diagnosed work orders, reducing intake overhead and guaranteeing transparent, ethical component pricing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e2e7ff]/50">
                <span className="font-mono text-xs text-[#49607e] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base">verified_user</span> Skill-indexed artisan registry
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border border-[#bdc9c2]/30 group">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#006040]/10 flex items-center justify-center text-[#006040] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">co2</span>
                </div>
                <h3 className="text-base font-semibold text-[#131b2e] group-hover:text-[#006040] transition-colors font-['Plus_Jakarta_Sans']">
                  Measurable E-Waste & CO₂e Ledger
                </h3>
                <p className="text-sm text-[#3e4944] leading-relaxed">
                  Trace landfill diversion weights, scarce mineral recovery indices (Gold, Copper, Palladium), and audited Scope 3 carbon savings directly on municipal dashboards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e2e7ff]/50">
                <span className="font-mono text-xs text-[#006040] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base">analytics</span> Real-time Ministry of Env reporting
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Split Visual Showcase: Urban Colombo Circularity */}
      <section className="w-full py-16 bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md overflow-hidden border border-[#bdc9c2]/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#005f48] text-xs font-semibold uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                  <span className="material-symbols-outlined text-lg animate-pulse">public</span>
                  <span>Preventing Environmental Calamity</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight font-['Plus_Jakarta_Sans']">
                  Protecting Colombo’s Wetlands from Toxic Heavy Metals
                </h2>

                <p className="text-sm text-[#3e4944] leading-relaxed">
                  When discarded electronics enter the Meethotamulla or Karadiyana dumping zones, lead, mercury, and flame retardants leach into the Kelani River basin. Eclader AI intervenes upstream at the household and enterprise level, intercepting devices before they reach garbage trucks.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col border border-[#005f48]/20 hover:border-[#005f48]/40 transition-colors group">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-[#005f48] font-['Plus_Jakarta_Sans']">18.4 Tons</span>
                      <span className="w-2 h-2 rounded-full bg-[#005f48] animate-ping-slow"></span>
                    </div>
                    <span className="text-xs text-[#3e4944] font-medium mt-0.5">Toxic Leachate Prevented</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f2f3ff] flex flex-col border border-[#49607e]/20 hover:border-[#49607e]/40 transition-colors group">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-[#49607e] font-['Plus_Jakarta_Sans']">42.8 MWh</span>
                      <span className="w-2 h-2 rounded-full bg-[#49607e] animate-pulse"></span>
                    </div>
                    <span className="text-xs text-[#3e4944] font-medium mt-0.5">Embodied Energy Conserved</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[16/10] relative group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    alt="High-precision electronics circular workshop in Colombo Sri Lanka showing technicians testing circuit board diagnostic equipment"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGuoL_aFQqNYhLkhLhJ0zYgXU-ye_HNI97GUrFdFbD_t9qktbHgXepwrNZ9eUUApWXwzxOm7QByuIqrxvd-A9f8AsM1xkrOqSSjSS4xk2QIt1L28QGhrRA_B0z8sI4TLvgliFmy2y5MItJgOPSoTot38Ql5bIR2ruxJxU99dalKyRNgw6_ZfYCCWgiD0E8JfYhLWuhCp0qxpCdrPHEStly9XsSHwDOMNdFyJa3a3SwrztxiA6174Hhkg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#283044]/85 via-[#283044]/30 to-transparent flex items-end p-6 transition-opacity duration-300 group-hover:opacity-95">
                    <div className="text-white">
                      <p className="text-base font-semibold flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                        <span>Orugodawatta Sorting & Diagnostic Facility</span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#005f48] text-white font-mono">Active Hub</span>
                      </p>
                      <p className="text-xs text-white/80 mt-1">Serving 14 Colombo municipal wards with AI-assisted triage.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mandatory AI Diagnostic Disclaimer Banner */}
      <section className="w-full py-4 bg-[#dae2fd]/60 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-4 p-4 rounded-xl bg-white shadow-xs border border-[#bdc9c2]/30">
          <div className="w-10 h-10 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#005f48] shrink-0">
            <span className="material-symbols-outlined text-xl">info</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
            <p className="text-xs sm:text-sm text-[#131b2e] leading-normal">
              <strong className="font-semibold text-[#005f48]">Compliance Notice:</strong> AI recommendations generated by Gemini are preliminary diagnostic estimates based on external optical telemetry. Physical technician verification is mandatory prior to hardware repair, thermal rework, or lithium-ion battery safety clearance.
            </p>
            <button
              onClick={() => setActiveScreen(5)}
              className="text-xs font-semibold text-[#005f48] hover:underline whitespace-nowrap self-start sm:self-auto flex items-center gap-1 group font-['Plus_Jakarta_Sans'] cursor-pointer"
            >
              <span>Safety Protocols</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Call to Action Banner with Ambient Floating Halo */}
      <section className="relative w-full py-16 bg-gradient-to-b from-[#faf8ff] to-[#f2f3ff] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-gradient-to-tr from-[#95f5d2]/20 via-[#6ffbbe]/15 to-[#c4dcff]/20 rounded-full blur-3xl pointer-events-none animate-aura-1"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-10 text-center flex flex-col items-center gap-4 relative z-10">
          
          <div className="mb-2 hover:scale-105 transition-transform duration-300">
            <EcladerLogo variant="icon" size={84} />
          </div>

          <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight font-['Plus_Jakarta_Sans']">
            Ready to Assess Your Idle Hardware?
          </h2>

          <p className="text-base text-[#3e4944] max-w-xl text-balance">
            It takes less than 60 seconds. Upload a smartphone, tablet, monitor, or circuit board photo and let Colombo’s municipal circular intelligence do the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => setActiveScreen(4)} // Screen 4: Add Device / Photo Upload
              className="shimmer-trigger group relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#005f48] text-white font-semibold text-sm transition-all duration-300 hover:bg-[#007a5e] shadow-lg hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer font-['Plus_Jakarta_Sans']"
            >
              <div className="shimmer-bar absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></div>
              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform relative z-10">camera_alt</span>
              <span className="relative z-10">Start Free Device Assessment</span>
            </button>

            <button
              onClick={() => setActiveScreen(8)} // Screen 8: Track Devices
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-[#131b2e] font-semibold text-sm hover:bg-[#e2e7ff] transition-all duration-200 shadow-xs hover:shadow hover:-translate-y-0.5 cursor-pointer font-['Plus_Jakarta_Sans']"
            >
              <span className="material-symbols-outlined text-xl text-[#49607e]">inventory_2</span>
              <span>Track Municipal Devices</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#3e4944] font-mono text-xs pt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-[#005f48] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005f48]"></span>
            </span>
            <span>Zero fees for individual Colombo residents • Municipal pilot sponsored</span>
          </div>

        </div>
      </section>

    </div>
  );
};
