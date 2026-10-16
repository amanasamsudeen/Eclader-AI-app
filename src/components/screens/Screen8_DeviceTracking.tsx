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
  ExternalLink,
  Layers,
  Recycle,
  HeartHandshake,
  Truck,
  Building2,
  PackageCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { PickupRequestStatus } from '../../types';

export const Screen8_DeviceTracking: React.FC = () => {
  const { 
    devices, 
    activeDeviceId, 
    technicians, 
    pickupRequests,
    updatePickupRequestStatus,
    updateDevice,
    setActiveScreen 
  } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assignedTech = technicians.find((t) => t.id === currentDevice?.assignedTechnicianId);
  const activePickupRequest = pickupRequests.find((req) => req.deviceId === currentDevice?.id);

  // Message chat state
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'System',
      text: `Tracking initialized for intake #${currentDevice.tagNumber}.`,
      time: '10:30 AM',
    },
    {
      sender: activePickupRequest ? activePickupRequest.providerName : (assignedTech?.name || 'Assigned Logistics / Lab'),
      text: activePickupRequest 
        ? `Logistics ticket registered for ${activePickupRequest.pathwayType.replace('_', ' ')}. Preferred slot: ${activePickupRequest.preferredPickupDate} (${activePickupRequest.preferredTimeSlot}).`
        : 'Physical custody logged at our workbench. Initiating 3.3V / 19V rail multimeter diagnostics.',
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

  // Step advancement simulation for pickup requests
  const handleAdvancePickup = async () => {
    if (!activePickupRequest) return;
    const currentStatus = activePickupRequest.status;
    let nextStatus: PickupRequestStatus = 'completed';
    let note = '';

    if (currentStatus === 'pending') {
      nextStatus = 'collection_scheduled';
      note = 'Partner logistics coordinator confirmed collection appointment.';
    } else if (currentStatus === 'collection_scheduled') {
      nextStatus = 'collector_assigned';
      note = 'Collector Kamal WP-LG-4102 assigned to route.';
    } else if (currentStatus === 'collector_assigned') {
      nextStatus = 'collected';
      note = 'Driver safely collected the e-waste hardware from customer premises.';
    } else if (currentStatus === 'collected') {
      nextStatus = 'received_at_facility';
      note = 'Hardware custody logged at triage demanufacturing bay.';
    } else if (currentStatus === 'received_at_facility' || currentStatus === 'in_progress') {
      nextStatus = 'completed';
      note = 'Component recovery & processing completed. Green certificate issued.';
    }

    await updatePickupRequestStatus(activePickupRequest.id, nextStatus, note, activePickupRequest.providerName);
    
    // Also update device record status
    if (nextStatus === 'completed') {
      await updateDevice(currentDevice.id, { status: 'completed' });
    }
  };

  const getNextActionPrompt = () => {
    // If device has an associated pickup request (e.g. Parts Recovery, Recycling, Donation)
    if (activePickupRequest) {
      if (activePickupRequest.status === 'completed' || currentDevice.status === 'completed') {
        return {
          title: `E-Waste ${activePickupRequest.pathwayType.replace('_', ' ').toUpperCase()} Completed & Certified`,
          description: 'Custody processing has concluded. Zero landfill materials diverted. Official circular impact certificate ready.',
          actionText: 'View Environmental Certificate',
          actionType: 'navigate' as const,
          targetScreen: 12,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      }
      if (activePickupRequest.status === 'collected' || activePickupRequest.status === 'received_at_facility') {
        return {
          title: `Hardware In Processing with ${activePickupRequest.providerName}`,
          description: `Custody transferred. Facility triage underway: ${
            activePickupRequest.pathwayType === 'parts_recovery' 
              ? 'Extracting display panels, MOSFETs & memory chips'
              : activePickupRequest.pathwayType === 'recycling'
              ? 'Central Environmental Authority compliant chemical decomposition'
              : 'Refurbishing for rural secondary school computer hub'
          }.`,
          actionText: 'Simulate Processing Complete',
          actionType: 'advance_pickup' as const,
          color: 'bg-teal-600 hover:bg-teal-700 text-white',
        };
      }
      if (activePickupRequest.status === 'collector_assigned') {
        return {
          title: `Collector En Route: ${activePickupRequest.assignedCollectorName || 'Logistics Driver'}`,
          description: `Doorstep pickup scheduled for ${activePickupRequest.preferredPickupDate}. Vehicle in transit.`,
          actionText: 'Simulate Doorstep Handover',
          actionType: 'advance_pickup' as const,
          color: 'bg-purple-700 hover:bg-purple-800 text-white',
        };
      }
      return {
        title: `Collection Scheduled with ${activePickupRequest.providerName}`,
        description: `Scheduled Date: ${activePickupRequest.preferredPickupDate} (${activePickupRequest.preferredTimeSlot}) at ${activePickupRequest.pickupAddress}.`,
        actionText: 'Simulate Partner Dispatch',
        actionType: 'advance_pickup' as const,
        color: 'bg-purple-700 hover:bg-purple-800 text-white',
      };
    }

    // Default: Repair pathway
    switch (currentDevice.status) {
      case 'quote_submitted':
        return {
          title: 'Official Repair Quote Awaiting Your Approval',
          description: `Technician submitted an itemized quote of LKR ${currentDevice.inspectionQuote?.totalCostLkr.toLocaleString()}.`,
          actionText: 'Review & Authorize Quote',
          actionType: 'navigate' as const,
          targetScreen: 11, // Screen 11: Quote Review
          color: 'bg-amber-500 hover:bg-amber-600 text-white',
        };
      case 'completed':
        return {
          title: 'Device Repair Completed & Certified',
          description: 'Your hardware has cleared final bench QA. Official circular impact certificate is ready.',
          actionText: 'View Circular Certificate',
          actionType: 'navigate' as const,
          targetScreen: 12, // Screen 12: Final Outcome
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'repair_in_progress':
        return {
          title: 'Active Bench Repair in Progress',
          description: `Work is currently underway: ${currentDevice.repairProgress?.currentStage || 'Assembly & testing'}.`,
          actionText: 'View Repair Progress Checkpoints',
          actionType: 'navigate' as const,
          targetScreen: 11,
          color: 'bg-teal-600 hover:bg-teal-700 text-white',
        };
      case 'route_selected':
        return {
          title: 'Route Selected: Assign Technician',
          description: 'Select an authorized technician bench in Colombo to begin physical inspection.',
          actionText: 'Match Technician Lab',
          actionType: 'navigate' as const,
          targetScreen: 7,
          color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      default:
        return {
          title: 'Bench Diagnostic in Progress',
          description: 'Multimeter & thermal check underway at the laboratory.',
          actionText: 'View Inspection Status',
          actionType: 'navigate' as const,
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
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  #{currentDevice.tagNumber}
                </span>
                {activePickupRequest && (
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Pathway: {activePickupRequest.pathwayType.replace('_', ' ')}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {currentDevice.title}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Custody timeline and physical processing status across the Western Province circular network.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
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
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Current Immediate Step
            </span>
            <h3 className="text-lg font-bold text-slate-900">{nextAction.title}</h3>
            <p className="text-xs text-slate-600">{nextAction.description}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (nextAction.actionType === 'advance_pickup') {
                handleAdvancePickup();
              } else if (nextAction.targetScreen) {
                setActiveScreen(nextAction.targetScreen);
              }
            }}
            className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 ${nextAction.color}`}
          >
            <span>{nextAction.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Grid: Timeline on left, Custody Partner info & Chat on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Milestones Timeline */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Device Custody & Lifecycle Milestones</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {(currentDevice.milestones?.length || 0) + (activePickupRequest?.statusHistory?.length || 0)} Recorded Events
              </span>
            </div>

            <div className="mt-8 space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:content-['']">
              
              {/* If there are Pickup Request Status Events */}
              {activePickupRequest?.statusHistory?.map((ev, idx) => (
                <div key={`pickup-ev-${idx}`} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="bg-purple-50/60 border border-purple-200/70 rounded-xl p-4 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-purple-950 uppercase text-[11px] tracking-wider">
                        {ev.status.replace('_', ' ')}
                      </h4>
                      <span className="text-[10px] font-mono text-purple-700">{ev.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{ev.note}</p>
                    <div className="text-[10px] text-purple-800 font-medium pt-1">
                      Action actor: <span className="font-semibold">{ev.actor}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Standard Device Milestones */}
              {currentDevice.milestones?.map((ms, idx) => (
                <div key={ms.id || idx} className="relative flex items-start gap-4">
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

              {/* Final QA or Completed indicator */}
              {currentDevice.status === 'completed' ? (
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex-1">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Circular Process Certified Complete</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-1">
                      Device has completed its circular loop. Materials/components successfully salvaged and documented under CEA green guidelines.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-start gap-4 opacity-60">
                  <div className="relative z-10 w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <Circle className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4 flex-1">
                    <div className="text-xs font-bold text-slate-700">Upcoming: Final Processing QA & Environmental Certification</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Pending completion of current custody phase.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Custody Partner Card & Messages */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Custody Partner / Provider Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {activePickupRequest ? 'Assigned Circular E-Waste Partner' : 'Assigned Bench Laboratory'}
              </div>

              {activePickupRequest ? (
                /* Pickup Partner View */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl border border-purple-200 shrink-0">
                      {activePickupRequest.pathwayType === 'parts_recovery' ? (
                        <Layers className="w-7 h-7" />
                      ) : activePickupRequest.pathwayType === 'recycling' ? (
                        <Recycle className="w-7 h-7" />
                      ) : (
                        <HeartHandshake className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{activePickupRequest.providerName}</h3>
                      <div className="text-xs text-slate-500">{activePickupRequest.providerCategory || 'Authorized Partner'}</div>
                      <div className="text-[11px] text-purple-700 font-semibold mt-0.5 capitalize">
                        Status: {activePickupRequest.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{activePickupRequest.donationMethod === 'drop_off' ? 'Self Drop-Off' : 'Doorstep Pickup'}: {activePickupRequest.preferredPickupDate} ({activePickupRequest.preferredTimeSlot})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{activePickupRequest.pickupAddress}</span>
                    </div>
                    {activePickupRequest.providerPhone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{activePickupRequest.providerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500">Ref: #{activePickupRequest.id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (activePickupRequest.pathwayType === 'parts_recovery') setActiveScreen(14);
                        else if (activePickupRequest.pathwayType === 'recycling') setActiveScreen(13);
                        else if (activePickupRequest.pathwayType === 'donation') setActiveScreen(15);
                      }}
                      className="text-purple-700 font-semibold hover:underline cursor-pointer"
                    >
                      View Partner Hub →
                    </button>
                  </div>
                </div>
              ) : assignedTech ? (
                /* Technician View */
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
                      type="button"
                      onClick={() => setActiveScreen(7)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 underline underline-offset-4 cursor-pointer"
                    >
                      Change or Reassign Lab →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-500">No partner or laboratory currently assigned.</p>
                  <button
                    type="button"
                    onClick={() => setActiveScreen(6)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Select Pathway Route
                  </button>
                </div>
              )}
            </div>

            {/* Direct Communication Thread */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Logistics & Custody Log</span>
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  Verified Dispatch
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
                  placeholder="Send note to driver or facility coordinator..."
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
