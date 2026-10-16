import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PartsRecoveryPartner, PickupRequest } from '../../types';
import { 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Filter, 
  Truck, 
  Cpu, 
  HardDrive, 
  Sparkles, 
  Coins, 
  Check, 
  X,
  FileCheck2,
  Lock,
  Leaf
} from 'lucide-react';

export const Screen14_PartsRecoveryPickup: React.FC = () => {
  const { 
    partsRecoveryPartners, 
    devices, 
    activeDeviceId, 
    currentUser, 
    addPickupRequest, 
    setDeviceRoute,
    setActiveScreen 
  } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assessment = currentDevice?.geminiAssessment;

  // Search & Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<PartsRecoveryPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [pickupAddress, setPickupAddress] = useState<string>(currentUser.location || 'No. 14 Flower Road, Colombo 07');
  const [contactName, setContactName] = useState<string>(currentUser.name || 'Citizen User');
  const [contactPhone, setContactPhone] = useState<string>(currentUser.phone || '+94 77 123 4567');
  const [deviceQuantity, setDeviceQuantity] = useState<number>(1);
  const [harvestPreferences, setHarvestPreferences] = useState<string[]>([
    'Modular Power MOSFETs & ICs',
    'Tested Functional RAM / SSD Storage',
    'Chassis, Hinges & Casing Assemblies',
  ]);
  const [requestSanitizationCert, setRequestSanitizationCert] = useState<boolean>(true);
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [preferredSlot, setPreferredSlot] = useState<string>('Morning (09:00 - 12:00)');
  const [additionalNotes, setAdditionalNotes] = useState<string>('Device power circuit is non-functional, display panel and internal memory modules are intact.');
  const [confirmedTerms, setConfirmedTerms] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Filter partners
  const filteredPartners = partsRecoveryPartners.filter((partner) => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.harvestSpecialties.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'all' || 
      partner.acceptedCategories.some((cat) => 
        cat.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        (currentDevice && cat.toLowerCase().includes(currentDevice.category.toLowerCase()))
      );

    return matchesSearch && matchesCategory;
  });

  const handleOpenPickupModal = (partner: PartsRecoveryPartner) => {
    setSelectedPartner(partner);
    setFormError(null);
    setConfirmedTerms(false);
    setSubmittedRequestId(null);
    setIsModalOpen(true);
  };

  const toggleHarvestPreference = (item: string) => {
    setHarvestPreferences((prev) => 
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmitPickupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPartner) return;
    if (!pickupAddress.trim()) {
      setFormError('Please enter a valid doorstep collection address.');
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setFormError('Contact name and telephone number are required.');
      return;
    }
    if (!preferredDate) {
      setFormError('Please select a preferred pickup date.');
      return;
    }
    if (!confirmedTerms) {
      setFormError('Please confirm that you authorize component recovery triage.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = `req-recov-${Date.now().toString().slice(-6)}`;

      const newRequest: PickupRequest = {
        id: requestId,
        userId: currentUser.id,
        ownerUid: currentUser.uid || currentUser.id,
        deviceId: currentDevice?.id || 'dev-unknown',
        deviceTitle: currentDevice?.title || 'Salvage Electronics',
        deviceCategory: currentDevice?.category || 'Hardware',
        tagNumber: currentDevice?.tagNumber || 'ECL-SALVAGE',
        assessmentId: assessment?.preliminaryRecommendation || 'asm-salvage',
        pathwayType: 'parts_recovery',
        providerId: selectedPartner.id,
        providerName: selectedPartner.name,
        providerCategory: 'Verified Component Salvage Partner',
        providerAddress: selectedPartner.address,
        providerPhone: selectedPartner.phone,
        pickupAddress: pickupAddress.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        deviceQuantity: Number(deviceQuantity) || 1,
        deviceCondition: `${additionalNotes} | Salvage priority: ${harvestPreferences.join(', ')} | Storage Sanitization: ${requestSanitizationCert ? 'Required' : 'None'}`,
        preferredPickupDate: preferredDate,
        preferredTimeSlot: preferredSlot,
        additionalInstructions: additionalNotes.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: `E-waste pickup request submitted to ${selectedPartner.name} for component recovery triage.`,
            actor: currentUser.name,
          },
        ],
      };

      await addPickupRequest(newRequest);
      if (currentDevice?.id) {
        await setDeviceRoute(currentDevice.id, 'parts_recovery');
      }
      setSubmittedRequestId(requestId);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Failed to submit parts recovery pickup request:', err);
      setFormError(err?.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
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
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-600" /> Pathway: Parts Recovery & Component Salvage
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  #{currentDevice?.tagNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                E-Waste Pickup for Component Recovery
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Harvest functioning display panels, ICs, power MOSFETs, and storage drives for certified local repair pools.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveScreen(6)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ← Back to Routes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* Device & Salvage Diagnostic Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-purple-800/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Device Info & Photo */}
            <div className="lg:col-span-4 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-400/30 bg-purple-950/50 shrink-0">
                <img
                  src={currentDevice?.photoUrl}
                  alt={currentDevice?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-purple-950/80 text-[10px] font-mono text-purple-200">
                  {currentDevice?.category}
                </div>
              </div>
              <div>
                <div className="text-xs text-purple-300 font-medium">Assessed Hardware:</div>
                <div className="text-base font-bold text-white leading-tight">
                  {currentDevice?.title}
                </div>
                <div className="text-xs text-purple-200/80 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Gemini Salvage Rating: High Harvest Yield</span>
                </div>
              </div>
            </div>

            {/* Estimated Component Credits & Eco Impact */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-purple-700/50 pt-4 lg:pt-0 lg:pl-6">
              
              <div className="bg-purple-950/60 rounded-2xl p-3.5 border border-purple-500/30">
                <div className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Estimated Salvage Credits
                </div>
                <div className="text-lg font-black text-amber-300 mt-1">
                  LKR 12,000 – 28,000
                </div>
                <div className="text-[11px] text-purple-200/70 mt-0.5">
                  Redeemable for future bench repairs
                </div>
              </div>

              <div className="bg-purple-950/60 rounded-2xl p-3.5 border border-purple-500/30">
                <div className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Carbon Avoidance
                </div>
                <div className="text-lg font-black text-emerald-300 mt-1">
                  ~140 kg CO₂e
                </div>
                <div className="text-[11px] text-purple-200/70 mt-0.5">
                  Replaces virgin silicon manufacturing
                </div>
              </div>

              <div className="bg-purple-950/60 rounded-2xl p-3.5 border border-purple-500/30">
                <div className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-400" /> Data Sanitization
                </div>
                <div className="text-lg font-black text-blue-300 mt-1">
                  DoD 5220.22-M
                </div>
                <div className="text-[11px] text-purple-200/70 mt-0.5">
                  Cryptographic wipe certificate included
                </div>
              </div>

            </div>

          </div>

          {/* Harvestable Subsystems Pills */}
          <div className="mt-5 pt-4 border-t border-purple-800/60">
            <div className="text-xs font-semibold text-purple-200 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-300" /> Verified Subsystems Slated for Safe Extraction:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Motherboard Power MOSFETs & VRM Chokes',
                'Dual-Channel DDR Memory Sticks',
                'OEM FHD/QHD Display Panel & Inverter',
                'Tested SATA / NVMe High-Speed Solid-State Storage',
                'Modular Copper Heatpipe & MagLev Thermal Fan',
                'Structural Hinge Assemblies & Magnesium Chassis Plates'
              ].map((subsystem, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-purple-800/50 border border-purple-400/20 text-xs text-purple-100 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{subsystem}</span>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by partner name, district, or harvested specialty..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-purple-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {['all', 'Laptop', 'Smartphone', 'Desktop PC', 'Tablet'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'All Hardware' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recovery Partners Directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs hover:shadow-md flex flex-col overflow-hidden group"
            >
              {/* Partner Banner Image */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={partner.imageUrl}
                  alt={partner.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-purple-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Verified Salvage Partner</span>
                </div>

                <div className="absolute top-3 right-3 bg-purple-700 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
                  <span>★ {partner.rating}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-mono text-purple-200">{partner.businessName}</div>
                  <div className="text-base font-extrabold leading-snug drop-shadow-sm">{partner.name}</div>
                </div>
              </div>

              {/* Partner Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{partner.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{partner.operatingHours} • ~{partner.distanceKm} km away</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{partner.phone}</span>
                  </div>

                  {/* Harvest Specialties */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" /> Harvest Specialties:
                    </div>
                    <ul className="space-y-1">
                      {partner.harvestSpecialties.slice(0, 3).map((spec, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Accepted Categories */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {partner.acceptedCategories.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => handleOpenPickupModal(partner)}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Truck className="w-4 h-4" />
                  <span>Request E-Waste Pickup</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Booking Drawer / Modal */}
      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-purple-200 hover:text-white p-1 rounded-lg hover:bg-purple-700/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-200 mb-1">
                <Truck className="w-4 h-4 text-purple-300" />
                <span>Doorstep E-Waste Collection Booking</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                Request Pickup with {selectedPartner.name}
              </h2>
              <p className="text-xs text-purple-200/90 mt-1">
                {selectedPartner.address} • Certified Zero-Landfill Harvest Facility
              </p>
            </div>

            {submittedRequestId ? (
              /* Success View */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  E-Waste Pickup Requested!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your parts recovery collection request has been dispatched to <strong className="text-purple-700">{selectedPartner.name}</strong>. Their logistics driver will contact you prior to arrival.
                </p>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tracking Reference:</span>
                    <span className="font-mono font-bold text-purple-800">{submittedRequestId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800">{preferredDate} ({preferredSlot})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pickup Address:</span>
                    <span className="font-semibold text-slate-800">{pickupAddress}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-200">
                    <span className="text-slate-500">Estimated Salvage Credits:</span>
                    <span className="font-black text-amber-700">LKR 12,000 – 28,000</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveScreen(8); // Go to Device Tracking
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Track Collection Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveScreen(3); // Dashboard
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmitPickupRequest} className="p-6 space-y-5">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Device Pill */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentDevice?.photoUrl}
                      alt={currentDevice?.title}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{currentDevice?.title}</div>
                      <div className="text-[11px] text-slate-500">Tag #{currentDevice?.tagNumber} • {currentDevice?.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    Parts Recovery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Contact Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Pickup Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Doorstep Pickup Address
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Street address, apartment, city (Western Province)"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Pickup Date
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (13:00 - 16:00)">Afternoon (13:00 - 16:00)</option>
                      <option value="Evening (16:00 - 18:00)">Evening (16:00 - 18:00)</option>
                    </select>
                  </div>

                  {/* Component Harvest Preferences */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target Subsystems for Component Recovery (Select Priorities):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Modular Power MOSFETs & ICs',
                        'Tested Functional RAM / SSD Storage',
                        'Chassis, Hinges & Casing Assemblies',
                        'Display Panel & Backlight Assemblies',
                        'Cooling Fans & Thermal Heatpipes'
                      ].map((item) => {
                        const isSelected = harvestPreferences.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => toggleHarvestPreference(item)}
                            className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-50 border-purple-300 text-purple-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{item}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data sanitization toggle */}
                  <div className="sm:col-span-2 p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-purple-950">
                      <input
                        type="checkbox"
                        checked={requestSanitizationCert}
                        onChange={(e) => setRequestSanitizationCert(e.target.checked)}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold">Cryptographic Data Sanitization Certificate</span>
                        <p className="text-[11px] text-purple-800/80 mt-0.5">
                          Conduct certified DoD 5220.22-M magnetic/flash storage overwrite before any harvested drive or memory is reused.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Additional Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Driver Access & Component Condition Notes
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Any loose screws, taped parts, or special gate entry instructions..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                </div>

                {/* Confirm terms */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={confirmedTerms}
                      onChange={(e) => setConfirmedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>
                      I authorize {selectedPartner.name} to collect this hardware for component recovery, salvage pool grading, and certified zero-landfill triage.
                    </span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Confirm Doorstep Pickup Request'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
