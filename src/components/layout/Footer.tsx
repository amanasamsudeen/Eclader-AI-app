import React from 'react';
import { useApp } from '../../context/AppContext';
import { EcladerLogo } from '../common/EcladerLogo';

export const Footer: React.FC = () => {
  const { setActiveScreen } = useApp();

  return (
    <footer className="w-full bg-white border-t border-[#bdc9c2] py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-8 border-b border-[#bdc9c2]">
          
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="cursor-pointer" onClick={() => setActiveScreen(1)}>
              <EcladerLogo variant="horizontal" size={38} showSubtitle={false} />
            </div>
            
            <p className="text-xs text-[#3e4944] max-w-md leading-relaxed">
              Computational lifecycle triage, diagnostic AI, and automated material recovery infrastructure designed to power zero-waste electronic supply chains across municipal ecosystems.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setActiveScreen(6)}
                className="font-['Plus_Jakarta_Sans'] text-xs px-3 py-1 rounded-full bg-[#e2e7ff] text-[#131b2e] hover:bg-[#dae2fd] transition-colors cursor-pointer"
              >
                Repair First
              </button>
              <button
                onClick={() => setActiveScreen(6)}
                className="font-['Plus_Jakarta_Sans'] text-xs px-3 py-1 rounded-full bg-[#e2e7ff] text-[#131b2e] hover:bg-[#dae2fd] transition-colors cursor-pointer"
              >
                Subsystem Harvest
              </button>
              <button
                onClick={() => setActiveScreen(6)}
                className="font-['Plus_Jakarta_Sans'] text-xs px-3 py-1 rounded-full bg-[#e2e7ff] text-[#131b2e] hover:bg-[#dae2fd] transition-colors cursor-pointer"
              >
                Responsible Metallurgy
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#131b2e] uppercase tracking-wider font-semibold">
              Regional Operations
            </span>
            <div className="flex flex-col gap-1.5 text-[#3e4944] text-xs">
              <span className="hover:text-[#005f48] cursor-pointer" onClick={() => setActiveScreen(7)}>Colombo Municipal E-Hub 01</span>
              <span className="hover:text-[#005f48] cursor-pointer" onClick={() => setActiveScreen(7)}>Orugodawatta Sorting Facility</span>
              <span className="hover:text-[#005f48] cursor-pointer" onClick={() => setActiveScreen(8)}>Western Province Logistics Feed</span>
              <span className="hover:text-[#005f48] cursor-pointer" onClick={() => setActiveScreen(12)}>Ministry of Environment Pilot</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#131b2e] uppercase tracking-wider font-semibold">
              Compliance & Integrity
            </span>
            <div className="flex flex-col gap-1.5 text-[#3e4944] text-xs">
              <span>Basel Convention Alignment</span>
              <span>RoHS Verification Protocols</span>
              <span>Chain-of-Custody Auditing</span>
              <span>ISO 14001 Lifecycle Trace</span>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#3e4944]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#005f48]">verified</span>
            <span>Colombo Pilot Operational Sandbox • Real-time E-Waste Stream Telemetry</span>
          </div>
          <div className="font-mono text-[11px] text-[#3e4944]">
            © 2025 Eclader AI Platform. Environmental Data Integrity Verified.
          </div>
        </div>
      </div>
    </footer>
  );
};
