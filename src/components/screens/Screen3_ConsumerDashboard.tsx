import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Cpu, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Leaf, 
  Coins, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Recycle,
  HeartHandshake,
  Truck
} from 'lucide-react';
import { DeviceStatus } from '../../types';

export const Screen3_ConsumerDashboard: React.FC = () => {
  const { devices, currentUser, pickupRequests, setActiveDeviceId, setActiveScreen } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter only devices belonging to this consumer or all if demo
  const userDevices = devices.filter(
    (d) => d.userId === currentUser.id || d.ownerUid === currentUser.uid || d.ownerUid === currentUser.id || currentUser.role === 'consumer'
  );

  const filteredDevices = userDevices.filter((dev) => {
    const matchesSearch =
      dev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.brandModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && dev.status !== 'completed' && dev.status !== 'recycled';
    if (statusFilter === 'completed') return matchesSearch && (dev.status === 'completed' || dev.status === 'recycled');
    return matchesSearch && dev.status === statusFilter;
  });

  // Calculate environmental and economic impact metrics
  const totalCo2Avoided = userDevices.reduce((acc, d) => {
    return acc + (d.finalOutcome?.co2eAvoidanceKg || d.geminiAssessment?.co2eAvoidanceKg || 0);
  }, 0);

  const totalMassDiverted = userDevices.reduce((acc, d) => {
    return acc + (d.finalOutcome?.massDivertedKg || d.geminiAssessment?.recoverableMassKg || 0);
  }, 0);

  const totalLkrSaved = userDevices.reduce((acc, d) => {
    return acc + (d.finalOutcome?.economicValueSavedLkr || (d.category === 'Laptop' ? 120000 : 45000));
  }, 0);

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'intake_pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">Intake Pending</span>;
      case 'ai_assessed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">AI Assessed</span>;
      case 'route_selected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Route Chosen</span>;
      case 'technician_assigned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Technician Assigned</span>;
      case 'physical_inspection_pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Bench Inspection</span>;
      case 'quote_submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">Quote Ready for Review</span>;
      case 'repair_in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">In Active Repair</span>;
      case 'quality_check':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">Final QA Check</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed & Certified</span>;
      case 'recycled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">Demanufactured</span>;
      default:
        return null;
    }
  };

  const handleDeviceAction = (dev: typeof devices[0]) => {
    setActiveDeviceId(dev.id);
    if (dev.status === 'quote_submitted') {
      setActiveScreen(11); // Quote review
    } else if (dev.status === 'completed') {
      setActiveScreen(12); // Final outcome certificate
    } else if (dev.status === 'ai_assessed' && !dev.selectedRoute) {
      setActiveScreen(5); // AI Assessment & simple questions triage
    } else if (dev.selectedRoute === 'parts_recovery') {
      setActiveScreen(14); // Screen 14: Parts Recovery E-Waste Pickup
    } else if (dev.selectedRoute === 'recycling') {
      setActiveScreen(13); // Screen 13: Recycling Agencies Pickup
    } else if (dev.selectedRoute === 'donation') {
      setActiveScreen(15); // Screen 15: Donation Organizations
    } else if (dev.status === 'route_selected' && (!dev.assignedTechnicianId || dev.selectedRoute === 'repair')) {
      setActiveScreen(7); // Tech matching
    } else {
      setActiveScreen(8); // Device tracking timeline
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Citizen Portal
                </span>
                <span className="text-xs text-slate-500">{currentUser.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Welcome back, {currentUser.name}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Manage your submitted electronics, view optical diagnostics, and authorize verified circular repairs.
              </p>
            </div>

            <button
              onClick={() => setActiveScreen(4)} // Screen 4: Add Device
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Submit New Device for Triage</span>
            </button>
          </div>

          {/* Eco-Impact Badges Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Devices</span>
                <Cpu className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{userDevices.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Logged in Colombo Registry</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avoided Carbon</span>
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {totalCo2Avoided.toFixed(1)} <span className="text-sm font-semibold">kg CO₂e</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Lifecycle emissions prevented</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mass Diverted</span>
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {totalMassDiverted.toFixed(2)} <span className="text-sm font-semibold">kg</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Zero electronic landfill waste</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kept Value</span>
                <Coins className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                LKR {(totalLkrSaved / 1000).toFixed(0)}k
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Compared to new replacement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

        {/* Circular Pathways & Services Hub Quick Access */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Western Province Circular Economy Network</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct access to certified repair benches, component salvage pools, CEA recycling plants, and school donation initiatives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen(4)}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              + AI Triage New Device
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Component Repair */}
            <div 
              onClick={() => setActiveScreen(7)}
              className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  1. Component Repair
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Certified NVQ Level 4 technicians for board micro-soldering, modular panels, and battery renewal.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-blue-100/60 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Find Technicians</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Parts Recovery */}
            <div 
              onClick={() => setActiveScreen(14)}
              className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  2. Parts Recovery
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Request e-waste pickup for component recovery. Harvest LCDs, RAM, SSDs, and ICs for salvage credits.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-purple-100/60 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Recovery Partners</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Responsible Recycling */}
            <div 
              onClick={() => setActiveScreen(13)}
              className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Recycle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  3. Responsible Recycling
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Central Environmental Authority (CEA) licensed agencies. Zero-landfill hazardous demanufacturing.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-emerald-100/60 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Recycling Agencies</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. Community Donation */}
            <div 
              onClick={() => setActiveScreen(15)}
              className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  4. Community Donation
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Equip rural school computer labs and youth vocational hubs. Doorstep pickup or verified drop-off.
                </p>
              </div>
              <div className="pt-3 mt-2 border-t border-amber-100/60 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Donation Hubs</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
        
        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by model, brand, or tag..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({userDevices.length})
            </button>
            <button
              onClick={() => setStatusFilter('quote_submitted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'quote_submitted'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Quotes to Review
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Completed / Diverted
            </button>
          </div>
        </div>

        {/* Devices List */}
        <div className="mt-6 space-y-4">
          {filteredDevices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No devices found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No electronics matching your current search filter. Add a new device to start Gemini optical triage.
              </p>
              <button
                onClick={() => setActiveScreen(4)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Device
              </button>
            </div>
          ) : (
            filteredDevices.map((dev) => (
              <div
                key={dev.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left: Device Image & Main Information */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={dev.photoUrl}
                        alt={dev.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        {dev.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {dev.tagNumber}
                        </span>
                        {getStatusBadge(dev.status)}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{dev.title}</h3>
                      
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">
                        {dev.observations || 'Registered for Western Province circular triage.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
                        <span>Age: <strong className="text-slate-700">{dev.lifecycleAge}</strong></span>
                        <span>•</span>
                        <span>Power: <strong className="text-slate-700">{dev.powerState}</strong></span>
                        {dev.geminiAssessment && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              AI Match: {dev.geminiAssessment.modelMatchConfidence}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Route, Quote or Direct Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Status Highlights */}
                    {dev.status === 'quote_submitted' && dev.inspectionQuote && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-right w-full sm:w-auto">
                        <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                          Inspection Quote Ready
                        </div>
                        <div className="text-base font-black text-slate-900">
                          LKR {dev.inspectionQuote.totalCostLkr.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-amber-700">
                          Estimated {dev.inspectionQuote.estimatedTurnaroundDays} days bench time
                        </div>
                      </div>
                    )}

                    {dev.status === 'repair_in_progress' && dev.repairProgress && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-right w-full sm:w-auto">
                        <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                          {dev.repairProgress.currentPercent}% Work Completed
                        </div>
                        <div className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                          {dev.repairProgress.currentStage}
                        </div>
                      </div>
                    )}

                    {dev.status === 'completed' && dev.finalOutcome && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-right w-full sm:w-auto">
                        <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          Certificate Issued
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {dev.finalOutcome.certificateId}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {dev.finalOutcome.co2eAvoidanceKg} kg CO₂e abated
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setActiveDeviceId(dev.id);
                          setActiveScreen(5); // View AI Assessment
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                        title="View Gemini AI Optical Report"
                      >
                        AI Diagnostic
                      </button>

                      <button
                        onClick={() => handleDeviceAction(dev)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          dev.status === 'quote_submitted'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : dev.status === 'completed'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>
                          {dev.status === 'quote_submitted'
                            ? 'Review Quote'
                            : dev.status === 'completed'
                            ? 'View Certificate'
                            : dev.status === 'ai_assessed' && !dev.selectedRoute
                            ? 'Choose Route'
                            : 'Track Device'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
