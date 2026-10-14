import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Coins, 
  Clock, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Send,
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Screen11_QuoteReview: React.FC = () => {
  const { devices, activeDeviceId, currentUser, respondToQuote, advanceRepairProgress, setActiveScreen } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const quote = currentDevice?.inspectionQuote;
  const progress = currentDevice?.repairProgress;

  const [clarifyMessage, setClarifyMessage] = useState('');
  const [showClarifyBox, setShowClarifyBox] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isApprovedOrProgress = currentDevice?.status === 'repair_in_progress' || (quote && quote.status === 'approved');

  const handleApprove = async () => {
    await respondToQuote(currentDevice.id, 'approve');
    setActionFeedback('Quote approved! Repair work is officially authorized.');
  };

  const handleReject = async () => {
    await respondToQuote(currentDevice.id, 'reject');
    setActionFeedback('Quote rejected. Device returned to route options.');
  };

  const handleSendClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyMessage.trim()) return;
    await respondToQuote(currentDevice.id, 'clarify', clarifyMessage);
    setShowClarifyBox(false);
    setActionFeedback('Clarification inquiry sent to technician bench.');
  };

  const handleAdvanceStage = async (stageIdx: number) => {
    await advanceRepairProgress(currentDevice.id, stageIdx);
  };

  const handleFinishRepair = () => {
    setActiveScreen(12); // Screen 12: Final Outcome & Environmental Impact Report
  };

  if (!quote) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <Clock className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Physical Inspection Pending</h2>
          <p className="text-xs text-slate-600">
            No official quote has been recorded for this device yet. The technician must first conduct multimeter bench testing.
          </p>
          <button
            onClick={() => setActiveScreen(10)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Conduct Physical Inspection
          </button>
        </div>
      </div>
    );
  }

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
                {isApprovedOrProgress ? 'Active Repair Progress & Bench Milestones' : 'Review Technician Repair Quote'}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Hardware: <strong className="text-slate-800">{currentDevice.title}</strong> • Prepared by: {quote.technicianName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Feedback alert */}
        {actionFeedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* If Quote is Pending Authorization: Display Decision Cards */}
        {!isApprovedOrProgress && (
          <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded">
                Action Required
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Consumer Authorization Required Before Any Bench Disassembly
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                The application strictly enforces explicit consumer consent. No repairs commence without your approval.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClarifyBox(!showClarifyBox)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask Question</span>
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Authorize Repair</span>
              </button>
            </div>
          </div>
        )}

        {/* Clarification Box */}
        {showClarifyBox && (
          <form onSubmit={handleSendClarification} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="text-xs font-bold text-slate-800">
              Submit Clarification Request to Technician
            </div>
            <textarea
              rows={2}
              value={clarifyMessage}
              onChange={(e) => setClarifyMessage(e.target.value)}
              placeholder="e.g. Can we use a lower-cost grade panel? Do you offer student discounts?"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClarifyBox(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Send Inquiry
              </button>
            </div>
          </form>
        )}

        {/* Active Repair Progress Tracker (Visible when approved) */}
        {isApprovedOrProgress && progress && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Live Bench Progress
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {progress.currentStage}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status updates broadcast directly from {quote.technicianName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-teal-700 font-mono">
                  {progress.currentPercent}%
                </span>
                <div className="text-[11px] text-slate-500 font-medium">Repair Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.currentPercent}%` }}
              />
            </div>

            {/* Stage Milestones Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {progress.stages.map((stage, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAdvanceStage(idx)}
                  className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    stage.completed
                      ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-500'
                  }`}
                  title="Click to toggle stage completion"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Stage {idx + 1}</span>
                    {stage.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Pending</span>
                    )}
                  </div>
                  <div className="font-semibold mt-1 text-slate-800">{stage.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stage.description}</div>
                </div>
              ))}
            </div>

            {/* Advance / Finish Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Authorized bench technicians can advance repair milestones above.
              </span>

              {progress.currentPercent >= 100 ? (
                <button
                  onClick={handleFinishRepair}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Issue Official Eclader Certificate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleAdvanceStage(progress.stages.findIndex((s) => !s.completed))}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Advance to Next Checkpoint →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Itemized Quote Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Official Itemized Repair Quote</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Quote #{quote.id}
            </span>
          </div>

          {/* Multimeter & Diagnostic Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Bench Verification Summary:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500">Multimeter Rail Test:</span>
                <div className="font-bold text-emerald-700 capitalize">{quote.multimeterStatus}</div>
              </div>
              <div>
                <span className="text-slate-500">Battery Health:</span>
                <div className="font-bold text-slate-800">{quote.batteryHealthPercent}% Capacity</div>
              </div>
              <div>
                <span className="text-slate-500">Estimated Turnaround:</span>
                <div className="font-bold text-slate-800">{quote.estimatedTurnaroundDays} Business Days</div>
              </div>
            </div>
            <p className="text-slate-600 pt-1 leading-relaxed">{quote.technicianNotes}</p>
          </div>

          {/* Itemized Parts Breakdown Table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Required Hardware Components & Sourcing:
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Component</th>
                    <th className="py-2.5 px-4">Sourcing Tier</th>
                    <th className="py-2.5 px-4 text-right">Price (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.partsList.map((part) => (
                    <tr key={part.id}>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {part.name}
                        {part.partNumber && (
                          <span className="block text-[10px] font-mono text-slate-400">
                            {part.partNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            part.source === 'salvage_pool'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {part.source === 'salvage_pool' ? 'Salvage Pool (Circular)' : 'New OEM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {part.costLkr.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      Certified Bench Labor & Thermal Repaste
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400">
                      Standard NVQ-4 Labor Rate
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {quote.laborCostLkr.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Total Summary */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Total Authorized Binding Quote:
              </span>
              <div className="text-2xl font-black text-white mt-0.5">
                LKR {quote.totalCostLkr.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                Inclusive of 90-day bench replacement warranty & circular recycling tax relief.
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-400 font-semibold">Avoided Hardware Cost:</span>
              <div className="text-base font-bold text-slate-100">~LKR 145,000 Saved</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
