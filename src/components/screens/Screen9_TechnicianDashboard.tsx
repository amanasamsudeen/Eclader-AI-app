import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Layers, 
  TrendingUp, 
  Search,
  Filter,
  Plus
} from 'lucide-react';

export const Screen9_TechnicianDashboard: React.FC = () => {
  const { devices, currentUser, setCurrentUser, users, setActiveDeviceId, setActiveScreen } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending_inspection' | 'pending_approval' | 'active_repair' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Switch to technician role if needed
  const handleSwitchToTechnician = () => {
    const techUser = users.find((u) => u.role === 'technician') || users[1];
    setCurrentUser(techUser);
  };

  const isTechnician = currentUser.role === 'technician';

  // Filter devices assigned to this lab or all for testing
  const benchDevices = devices.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'pending_inspection') {
      return d.status === 'technician_assigned' || d.status === 'physical_inspection_pending';
    }
    if (activeTab === 'pending_approval') {
      return d.status === 'quote_submitted';
    }
    if (activeTab === 'active_repair') {
      return d.status === 'repair_in_progress' || d.status === 'quality_check';
    }
    if (activeTab === 'completed') {
      return d.status === 'completed' || d.status === 'recycled';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-300 font-medium">
                  {currentUser.businessName || 'MicroTech Hardware Lab & Circular Bench'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Technician Dispatch & Inspection Portal
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Authorized bench technician: <strong className="text-emerald-400">{currentUser.name}</strong> • NVQ Level 4 Certified
              </p>
            </div>

            {/* Persona Switcher Warning / Quick Toggle */}
            {!isTechnician ? (
              <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="text-amber-200 font-bold">Currently in Citizen Mode</div>
                  <div className="text-amber-300/80">Switch persona to test technician authorization.</div>
                </div>
                <button
                  onClick={handleSwitchToTechnician}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Switch to Tech
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-medium">
                  <UserCheck className="w-4 h-4" /> Lab Session Active
                </span>
              </div>
            )}
          </div>

          {/* Workbench Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Bench Tickets</span>
              <div className="text-2xl font-black text-white mt-1">
                {devices.filter((d) => d.status !== 'completed' && d.status !== 'recycled').length}
              </div>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">Queued at Colombo Bench</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed This Month</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {devices.filter((d) => d.status === 'completed').length + 18}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">100% QA Passed</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Diagnostic Turnaround</span>
              <div className="text-2xl font-black text-white mt-1">
                26.4 <span className="text-sm font-normal text-slate-400">hours</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Multimeter & thermal check</span>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Component Salvage Yield</span>
              <div className="text-2xl font-black text-teal-400 mt-1">91.8%</div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">High local reuse efficiency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Tab Filters & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Hardware ({devices.length})
            </button>
            <button
              onClick={() => setActiveTab('pending_inspection')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'pending_inspection'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Needs Inspection
            </button>
            <button
              onClick={() => setActiveTab('pending_approval')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'pending_approval'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Quotes Pending
            </button>
            <button
              onClick={() => setActiveTab('active_repair')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'active_repair'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              On Active Bench
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Certified / Dispatched
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tag, model, or customer..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-600"
            />
          </div>
        </div>

        {/* Workbench Ticket Queue */}
        <div className="space-y-4">
          {benchDevices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No workbench tickets matching criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try switching tabs or resetting search query.</p>
            </div>
          ) : (
            benchDevices.map((dev) => (
              <div
                key={dev.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-6 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Device & Intake Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={dev.photoUrl}
                    alt={dev.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {dev.tagNumber}
                      </span>
                      <span className="text-xs text-slate-500">Owner: {dev.userName} ({dev.userDistrict})</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{dev.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                      {dev.observations || 'Intake logged in Colombo system.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-slate-500">
                      <span>Reported Power: <strong className="text-slate-700">{dev.powerState}</strong></span>
                      <span>•</span>
                      <span>Route: <strong className="text-emerald-700 capitalize">{dev.selectedRoute || 'Triage pending'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Badges & Bench Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Status Indicator */}
                  {dev.status === 'quote_submitted' && (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
                      Quote Pending Customer Review
                    </span>
                  )}
                  {dev.status === 'repair_in_progress' && (
                    <span className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                      {dev.repairProgress?.currentPercent}% Active Bench Work
                    </span>
                  )}
                  {dev.status === 'completed' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> QA Completed
                    </span>
                  )}

                  {/* Contextual Actions */}
                  <button
                    onClick={() => {
                      setActiveDeviceId(dev.id);
                      setActiveScreen(8); // Track
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Custody Log
                  </button>

                  <button
                    onClick={() => {
                      setActiveDeviceId(dev.id);
                      setActiveScreen(10); // Screen 10: Physical Inspection & Repair Quote Builder
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>
                      {dev.inspectionQuote ? 'Edit Inspection & Quote' : 'Conduct Bench Inspection'}
                    </span>
                  </button>

                  {dev.status === 'repair_in_progress' && (
                    <button
                      onClick={() => {
                        setActiveDeviceId(dev.id);
                        setActiveScreen(11); // Review & Progress
                      }}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Update Bench Milestones
                    </button>
                  )}

                  {dev.status === 'completed' && (
                    <button
                      onClick={() => {
                        setActiveDeviceId(dev.id);
                        setActiveScreen(12); // Certificate
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
