import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SparePartItem } from '../../types';
import { 
  Wrench, 
  Cpu, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Thermometer, 
  Battery, 
  Coins, 
  Clock,
  Camera
} from 'lucide-react';

export const Screen10_PhysicalInspection: React.FC = () => {
  const { devices, activeDeviceId, currentUser, submitInspectionQuote, setActiveScreen } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const existingQuote = currentDevice?.inspectionQuote;

  // Physical diagnostic fields
  const [multimeterStatus, setMultimeterStatus] = useState<'passed' | 'rail_short' | 'standby_fault'>(
    existingQuote?.multimeterStatus || 'passed'
  );
  const [thermalAnalysis, setThermalAnalysis] = useState(
    existingQuote?.thermalAnalysis || 'Thermal paste dry; CPU core at 62°C. Heatsink fins cleaned.'
  );
  const [batteryHealthPercent, setBatteryHealthPercent] = useState<number>(
    existingQuote?.batteryHealthPercent || 78
  );
  const [motherboardCondition, setMotherboardCondition] = useState(
    existingQuote?.motherboardCondition || 'No signs of liquid corrosion. 19V rail and 3.3V power rails verified healthy.'
  );

  // Root causes
  const [rootCauses, setRootCauses] = useState<string[]>(
    existingQuote?.rootCauses || ['Mechanical impact fractured display matrix', 'Thermal compound degradation']
  );
  const [newCauseInput, setNewCauseInput] = useState('');

  // Itemized parts list
  const [partsList, setPartsList] = useState<SparePartItem[]>(
    existingQuote?.partsList || [
      {
        id: 'part-1',
        name: '14.0" FHD IPS 1920x1080 30-Pin Matte Display Panel (Salvage Tier-A)',
        partNumber: 'FRU 01YN156 / LP140WF8',
        source: 'salvage_pool',
        costLkr: 14500,
      },
      {
        id: 'part-2',
        name: 'Shin-Etsu Industrial Thermal Interface Paste & Clean',
        source: 'new_oem',
        costLkr: 1800,
      },
    ]
  );

  // New part inputs
  const [newPartName, setNewPartName] = useState('');
  const [newPartCost, setNewPartCost] = useState('');
  const [newPartSource, setNewPartSource] = useState<'salvage_pool' | 'new_oem'>('salvage_pool');

  // Labor & turnaround
  const [laborCostLkr, setLaborCostLkr] = useState<number>(
    existingQuote?.laborCostLkr || 4500
  );
  const [turnaroundDays, setTurnaroundDays] = useState<number>(
    existingQuote?.estimatedTurnaroundDays || 2
  );
  const [technicianNotes, setTechnicianNotes] = useState(
    existingQuote?.technicianNotes ||
      'Motherboard tested with bench Fluke multimeter. Sourced salvage-pool tested OEM panel from Colombo inventory. Guaranteed 90-day bench warranty.'
  );

  // Calculations
  const partsSubtotal = partsList.reduce((acc, p) => acc + p.costLkr, 0);
  const totalQuoteLkr = partsSubtotal + laborCostLkr;

  const handleAddCause = () => {
    if (!newCauseInput.trim()) return;
    setRootCauses([...rootCauses, newCauseInput.trim()]);
    setNewCauseInput('');
  };

  const handleRemoveCause = (idx: number) => {
    setRootCauses(rootCauses.filter((_, i) => i !== idx));
  };

  const handleAddPart = () => {
    if (!newPartName.trim() || !newPartCost) return;
    const costNum = parseInt(newPartCost, 10);
    if (isNaN(costNum) || costNum <= 0) return;

    const newPart: SparePartItem = {
      id: `p-${Date.now()}`,
      name: newPartName.trim(),
      source: newPartSource,
      costLkr: costNum,
    };

    setPartsList([...partsList, newPart]);
    setNewPartName('');
    setNewPartCost('');
  };

  const handleRemovePart = (id: string) => {
    setPartsList(partsList.filter((p) => p.id !== id));
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    const quoteRecord = {
      id: `quote-${Date.now()}`,
      deviceId: currentDevice.id,
      technicianId: currentUser.id,
      technicianName: `${currentUser.name} (${currentUser.businessName || 'MicroTech Lab'})`,
      createdAt: new Date().toISOString(),
      multimeterStatus,
      thermalAnalysis,
      batteryHealthPercent,
      motherboardCondition,
      rootCauses,
      partsList,
      laborCostLkr,
      totalCostLkr: totalQuoteLkr,
      estimatedTurnaroundDays: turnaroundDays,
      technicianNotes,
      inspectionPhotos: [
        'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80',
      ],
      status: 'pending' as const,
    };

    await submitInspectionQuote(quoteRecord);
    setActiveScreen(11); // Advance to Screen 11: Quote Review and Repair Progress
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">#{currentDevice.tagNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Record Physical Inspection & Build Quote
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Target Hardware: <strong className="text-slate-800">{currentDevice.title}</strong> • Owner: {currentDevice.userName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(9)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                ← Back to Tech Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Core Verification Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center gap-3 mb-6">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              Bench Technician Rule:
            </span>
            <span className="text-slate-200 ml-1">
              &ldquo;AI recommends; qualified bench people verify.&rdquo; Record physical multimeter rail measurements and true salvage parts pricing.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmitQuote} className="space-y-8">
          
          {/* Section 1: Physical Multimeter & Diagnostics Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-emerald-600" />
                <span>1. Bench Diagnostic Findings & Multimeter Measurements</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record hardware telemetry observed through bench testing and thermal imaging.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Multimeter Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Multimeter Power Rail Status
                </label>
                <select
                  value={multimeterStatus}
                  onChange={(e) => setMultimeterStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-emerald-600"
                >
                  <option value="passed">Passed (All DC-DC rails within 5% tolerance)</option>
                  <option value="rail_short">Rail Short (Short to ground detected)</option>
                  <option value="standby_fault">Standby Fault (3.3V/5V standby IC defect)</option>
                </select>
              </div>

              {/* Battery Health Percent */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Battery Health Capacity (%)</span>
                  <span className="text-emerald-700 font-mono">{batteryHealthPercent}%</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={batteryHealthPercent}
                    onChange={(e) => setBatteryHealthPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600"
                  />
                  <Battery className="w-5 h-5 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Thermal Analysis */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thermal Camera & Heatsink Notes
                </label>
                <input
                  type="text"
                  value={thermalAnalysis}
                  onChange={(e) => setThermalAnalysis(e.target.value)}
                  placeholder="e.g. Dry thermal paste, fan clean required..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-emerald-600"
                />
              </div>

              {/* Motherboard condition */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mainboard Corrosion / Physical Check
                </label>
                <input
                  type="text"
                  value={motherboardCondition}
                  onChange={(e) => setMotherboardCondition(e.target.value)}
                  placeholder="e.g. No liquid marks, clean board..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-emerald-600"
                />
              </div>

            </div>

            {/* Root Causes List */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Identified Root Causes & Mechanical Faults
              </label>

              <div className="space-y-2 mb-3">
                {rootCauses.map((cause, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800">{cause}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCause(idx)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCauseInput}
                  onChange={(e) => setNewCauseInput(e.target.value)}
                  placeholder="Add confirmed defect..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCause}
                  className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add Defect
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Itemized Spare Parts Builder */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <span>2. Required Spare Parts & Sourcing</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritize components from the Sri Lanka circular salvage pool to reduce import costs and e-waste.
              </p>
            </div>

            {/* Parts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-2.5">Component Name / Spec</th>
                    <th className="py-2.5">Sourcing Tier</th>
                    <th className="py-2.5 text-right">Cost (LKR)</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partsList.map((part) => (
                    <tr key={part.id}>
                      <td className="py-3 font-medium text-slate-800">
                        {part.name}
                        {part.partNumber && (
                          <span className="block text-[10px] font-mono text-slate-400">
                            {part.partNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            part.source === 'salvage_pool'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {part.source === 'salvage_pool' ? 'Salvage Pool (Circular)' : 'New OEM'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">
                        {part.costLkr.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePart(part.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Part Form */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                + Add Itemized Component to Quote
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="Part name & FRU number..."
                  className="sm:col-span-6 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <select
                  value={newPartSource}
                  onChange={(e) => setNewPartSource(e.target.value as any)}
                  className="sm:col-span-3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="salvage_pool">Salvage Pool (Circular)</option>
                  <option value="new_oem">New OEM</option>
                </select>
                <input
                  type="number"
                  value={newPartCost}
                  onChange={(e) => setNewPartCost(e.target.value)}
                  placeholder="Price (LKR)"
                  className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="sm:col-span-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Bench Labor, Duration & Quote Total */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>3. Labor Fees, Turnaround & Transparency</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bench Labor Fee (LKR)
                </label>
                <input
                  type="number"
                  value={laborCostLkr}
                  onChange={(e) => setLaborCostLkr(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Estimated Repair Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={turnaroundDays}
                  onChange={(e) => setTurnaroundDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Technician Bench Notes & Transparency Statement
              </label>
              <textarea
                rows={3}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white"
              />
            </div>

            {/* Total Summary Box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                  Total Formal Quote to Consumer:
                </span>
                <div className="text-2xl font-black text-slate-900">
                  LKR {totalQuoteLkr.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  Parts: LKR {partsSubtotal.toLocaleString()} + Labor: LKR {laborCostLkr.toLocaleString()}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Expected Completion:</span>
                <div className="text-sm font-bold text-slate-800">{turnaroundDays} Business Days</div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveScreen(9)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Submit Official Quote to Consumer</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
