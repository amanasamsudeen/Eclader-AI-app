import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Phone, 
  ArrowRight, 
  Search, 
  Filter, 
  BadgeCheck,
  Building,
  Coins
} from 'lucide-react';

export const Screen7_TechnicianMatching: React.FC = () => {
  const { technicians, devices, activeDeviceId, assignTechnician, setActiveScreen } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const [selectedTechId, setSelectedTechId] = useState<string>(
    currentDevice?.assignedTechnicianId || technicians[0].id
  );
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');

  const filteredTechs = technicians.filter((tech) => {
    if (filterSpecialty === 'all') return true;
    return tech.specialties.some((s) => s.toLowerCase().includes(filterSpecialty.toLowerCase()));
  });

  const handleConfirmAssignment = async (techId: string) => {
    setSelectedTechId(techId);
    await assignTechnician(currentDevice.id, techId);
    setActiveScreen(8); // Screen 8: Device Tracking Timeline
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-medium">Western Province Certified Bench Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Select a Qualified Bench Technician
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Targeting: {currentDevice.title} ({currentDevice.tagNumber})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(6)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ← Change Route
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Verification banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">
                100% NVQ & WEEE Accredited Technicians
              </span>
              <p className="text-slate-300 mt-0.5">
                Every listed laboratory maintains calibrated multimeters, ESD grounding benches, and provides itemized parts transparency in LKR.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-950 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-700 whitespace-nowrap">
            Colombo Pilot Certified
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Specialties:
          </span>
          <button
            onClick={() => setFilterSpecialty('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterSpecialty === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Specialists
          </button>
          <button
            onClick={() => setFilterSpecialty('micro-soldering')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterSpecialty === 'micro-soldering'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            BGA Micro-Soldering
          </button>
          <button
            onClick={() => setFilterSpecialty('power')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterSpecialty === 'power'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Power Rails & Charging
          </button>
          <button
            onClick={() => setFilterSpecialty('smartphone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterSpecialty === 'smartphone'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Smartphones & OLED
          </button>
        </div>

        {/* Technician Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechs.map((tech) => {
            const isAssigned = currentDevice.assignedTechnicianId === tech.id;
            const isSelected = selectedTechId === tech.id;

            return (
              <div
                key={tech.id}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col justify-between transition-all shadow-xs ${
                  isSelected
                    ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top: Avatar, Rating & Badges */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.avatarUrl}
                        alt={tech.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="text-base font-bold text-slate-900">{tech.name}</h3>
                          <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{tech.businessName}</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{tech.rating}</span>
                      <span className="text-[10px] text-amber-600 font-normal">({tech.completedJobsCount})</span>
                    </span>
                  </div>

                  {/* Address & Distance */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{tech.address}</span>
                    </span>
                    <span className="font-semibold text-slate-700 shrink-0">{tech.distanceKm} km away</span>
                  </div>

                  {/* Certifications */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tech.certifications.map((cert, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* Specialties */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Core Bench Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {tech.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate & Availability */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Bench Diagnostic Rate:</span>
                      <div className="font-bold text-slate-800">LKR {tech.hourlyLaborRateLkr.toLocaleString()} / hr</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      {tech.availability}
                    </span>
                  </div>
                </div>

                {/* Assignment Button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleConfirmAssignment(tech.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isAssigned
                        ? 'bg-slate-900 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <span>{isAssigned ? 'Assigned to This Lab (Track)' : 'Select & Assign Device'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
