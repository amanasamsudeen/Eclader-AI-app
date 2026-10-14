import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Phone, 
  User, 
  Wrench, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  MessageSquare, 
  Send,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const Screen8_DeviceTracking: React.FC = () => {
  const { devices, activeDeviceId, technicians, setActiveScreen, updateDevice } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assignedTech = technicians.find((t) => t.id === currentDevice?.assignedTechnicianId);

  // Message chat state
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'System',
      text: `Tracking initialized for intake #${currentDevice.tagNumber}.`,
      time: '10:30 AM',
    },
    {
      sender: assignedTech?.name || 'Assigned Lab',
      text: 'Physical custody logged at our workbench. Initiating 3.3V / 19V rail multimeter diagnostics.',
      time: '11:15 AM',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: currentDevice.userName || 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');
  };

  const getNextActionPrompt = () => {
    switch (currentDevice.status) {
      case 'quote_submitted':
        return {
          title: 'Official Repair Quote Awaiting Your Approval',
          description: `Technician submitted an itemized quote of LKR ${currentDevice.inspectionQuote?.totalCostLkr.toLocaleString()}.`,
          actionText: 'Review & Authorize Quote',
          targetScreen: 11, // Screen 11: Quote Review
          color: 'bg-amber-500 hover:bg-amber-600 text-white',
        };
      case 'completed':
        return {
          title: 'Device Repair Completed & Certified',
          description: 'Your hardware has cleared final bench QA. Official circular impact certificate is ready.',
          actionText: 'View Circular Certificate',
          targetScreen: 12, // Screen 12: Final Outcome
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'repair_in_progress':
        return {
          title: 'Active Bench Repair in Progress',
          description: `Work is currently underway: ${currentDevice.repairProgress?.currentStage || 'Assembly & testing'}.`,
          actionText: 'View Repair Progress Checkpoints',
          targetScreen: 11,
          color: 'bg-teal-600 hover:bg-teal-700 text-white',
        };
      case 'route_selected':
        return {
          title: 'Route Selected: Assign Technician',
          description: 'Select an authorized technician bench in Colombo to begin physical inspection.',
          actionText: 'Match Technician Lab',
          targetScreen: 7,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      default:
        return {
          title: 'Bench Diagnostic in Progress',
          description: 'Multimeter & thermal check underway at the laboratory.',
          actionText: 'View Inspection Status',
          targetScreen: 10,
          color: 'bg-slate-900 hover:bg-slate-800 text-white',
        };
    }
  };

  const nextAction = getNextActionPrompt();

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-16 font-sans">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">#{currentDevice.tagNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {currentDevice.title}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Custody timeline and physical bench status across the Western Province circular network.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen(3)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Next Action Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Current Immediate Step
            </span>
            <h3 className="text-lg font-bold text-slate-900">{nextAction.title}</h3>
            <p className="text-xs text-slate-600">{nextAction.description}</p>
          </div>

          <button
            onClick={() => setActiveScreen(nextAction.targetScreen)}
            className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 ${nextAction.color}`}
          >
            <span>{nextAction.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Grid: Timeline on left, Lab info & Chat on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Milestones Timeline */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Device Custody & Lifecycle Milestones</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {currentDevice.milestones.length} Recorded Events
              </span>
            </div>

            <div className="mt-8 space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:content-['']">
              {currentDevice.milestones.map((ms, idx) => (
                <div key={ms.id || idx} className="relative flex items-start gap-4">
                  {/* Indicator Dot */}
                  <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{ms.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{ms.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ms.description}</p>
                    <div className="text-[10px] text-slate-400 font-medium pt-1">
                      Recorded by: <span className="text-slate-600">{ms.actor}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending upcoming milestone placeholder */}
              {currentDevice.status !== 'completed' && (
                <div className="relative flex items-start gap-4 opacity-60">
                  <div className="relative z-10 w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 flex-1">
                    <div className="text-xs font-bold text-slate-700">Upcoming: Final Quality Check & Certification</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Pending completion of current bench phase.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Assigned Technician Lab Card & Communication */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Technician Custody Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned Bench Laboratory
              </div>

              {assignedTech ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={assignedTech.avatarUrl}
                      alt={assignedTech.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{assignedTech.name}</h3>
                      <div className="text-xs text-slate-500">{assignedTech.businessName}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        NVQ Certified • {assignedTech.district}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{assignedTech.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{assignedTech.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setActiveScreen(7)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 underline underline-offset-4 cursor-pointer"
                    >
                      Change or Reassign Lab →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-500">No laboratory currently assigned.</p>
                  <button
                    onClick={() => setActiveScreen(7)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Select Technician
                  </button>
                </div>
              )}
            </div>

            {/* Direct Bench Messages */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Lab Communication Thread</span>
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  Secure Bench Log
                </span>
              </div>

              {/* Message scroll container */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700 text-[11px]">
                      <span>{m.sender}</span>
                      <span className="text-slate-400 text-[10px]">{m.time}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask a question or provide unlock code..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-emerald-600"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
