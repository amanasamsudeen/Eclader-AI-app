import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecyclingAgency, PickupRequest } from '../../types';
import { 
  Recycle, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Filter, 
  Building2, 
  Truck, 
  FileText, 
  X, 
  Check, 
  Info,
  Navigation,
  Sparkles
} from 'lucide-react';

export const Screen13_RecyclingAgencies: React.FC = () => {
  const { 
    recyclingAgencies, 
    devices, 
    activeDeviceId, 
    currentUser, 
    addPickupRequest, 
    setActiveScreen 
  } = useApp();

  const currentDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];
  const assessment = currentDevice?.geminiAssessment;

  // Search & Filter state
  const [userLocationInput, setUserLocationInput] = useState<string>(currentUser.location || 'Colombo, Western Province');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchAgencyTerm, setSearchAgencyTerm] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Selected agency for viewing details / booking
  const [selectedAgency, setSelectedAgency] = useState<RecyclingAgency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Collection Request Form State
  const [pickupAddress, setPickupAddress] = useState<string>(currentUser.location || 'No. 14 Flower Road, Colombo 07');
  const [contactName, setContactName] = useState<string>(currentUser.name || 'Citizen User');
  const [contactPhone, setContactPhone] = useState<string>(currentUser.phone || '+94 77 123 4567');
  const [deviceQuantity, setDeviceQuantity] = useState<number>(1);
  const [deviceConditionNote, setDeviceConditionNote] = useState<string>(
    currentDevice?.observations || assessment?.visualMechanicalState || 'Unrepairable electronic hardware intake.'
  );
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [preferredSlot, setPreferredSlot] = useState<string>('Morning (09:00 - 12:00)');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('Please call 15 minutes before arrival at gate.');
  const [confirmedTerms, setConfirmedTerms] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Filter agencies
  const filteredAgencies = recyclingAgencies.filter((agency) => {
    const matchesSearch = 
      agency.name.toLowerCase().includes(searchAgencyTerm.toLowerCase()) ||
      agency.address.toLowerCase().includes(searchAgencyTerm.toLowerCase()) ||
      agency.district.toLowerCase().includes(searchAgencyTerm.toLowerCase());

    const matchesCategory = 
      selectedCategoryFilter === 'all' ||
      agency.acceptedCategories.some((cat) => 
        cat.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        (currentDevice && cat.toLowerCase().includes(currentDevice.category.toLowerCase()))
      );

    return matchesSearch && matchesCategory;
  });

  // Handle Geolocation with user permission
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocationInput(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Colombo District)`);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission denied or error:', err);
      }
    );
  };

  const handleOpenCollectionModal = (agency: RecyclingAgency) => {
    setSelectedAgency(agency);
    setFormError(null);
    setConfirmedTerms(false);
    setSubmittedRequestId(null);
    setIsModalOpen(true);
  };

  const handleSubmitCollectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedAgency) return;
    if (!pickupAddress.trim()) {
      setFormError('Please enter a valid pickup address.');
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
      setFormError('Please confirm that you are requesting collection of electronic waste.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = `req-rec-${Date.now().toString().slice(-6)}`;

      const newRequest: PickupRequest = {
        id: requestId,
        userId: currentUser.id,
        ownerUid: currentUser.uid || currentUser.id,
        deviceId: currentDevice.id,
        deviceTitle: currentDevice.title,
        deviceCategory: currentDevice.category,
        tagNumber: currentDevice.tagNumber,
        pathwayType: 'recycling',
        providerId: selectedAgency.id,
        providerName: selectedAgency.name,
        providerCategory: 'CEA Licensed E-Waste Demanufacturer',
        providerAddress: selectedAgency.address,
        providerPhone: selectedAgency.phone,
        pickupAddress: pickupAddress.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        deviceQuantity: Number(deviceQuantity) || 1,
        deviceCondition: deviceConditionNote,
        preferredPickupDate: preferredDate,
        preferredTimeSlot: preferredSlot,
        additionalInstructions: additionalInstructions.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: `E-waste collection request submitted to ${selectedAgency.name}. Awaiting agency dispatch review.`,
            actor: currentUser.name,
          },
        ],
      };

      await addPickupRequest(newRequest);
      setSubmittedRequestId(requestId);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Failed to submit recycling collection request:', err);
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
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  Pathway 5: Responsible Recycling
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  #{currentDevice?.tagNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Central Environmental Authority (CEA) Licensed Recycling Agencies
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Zero-landfill chemical decomposition, precious metal reclamation, and certified hazardous e-waste demanufacturing.
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
        
        {/* Step A: Recycling Recommendation Assessment Callout */}
        <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
              <img
                src={currentDevice?.photoUrl}
                alt={currentDevice?.title}
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-1 right-1 bg-purple-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                {currentDevice?.category}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Recycle className="w-4 h-4" />
                <span>Recommended: End-of-Life Responsible Demanufacturing</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{currentDevice?.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {assessment?.pathwayRationale || 
                 assessment?.finalPersonalizedAssessment?.next_step_advice || 
                 'Severe board degradation or catastrophic mechanical destruction makes refurbishment unviable. Responsible recycling recaptures copper, gold, and aluminum while preventing heavy metal soil contamination.'}
              </p>

              {/* Safety & Handling Precautions */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Do not crush battery pouch</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Est. Avoided CO₂e: {assessment?.co2eAvoidanceKg || 180} kg</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                  <span>Recyclable Mass: {assessment?.recoverableMassKg || 1.5} kg</span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href="#agencies-list"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer w-full md:w-auto text-center"
            >
              <span>Explore Verified Agencies Below</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Location & Category Filter Controls */}
        <div id="agencies-list" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Location selector */}
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Your Collection District / Address:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userLocationInput}
                  onChange={(e) => setUserLocationInput(e.target.value)}
                  placeholder="Enter your town, street, or district (e.g. Colombo 03, Dehiwala, Nugegoda)..."
                  className="w-full pl-9 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                />
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isLocating ? 'Locating...' : 'Use GPS'}</span>
                </button>
              </div>
            </div>

            {/* Keyword search */}
            <div className="w-full md:w-64">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search Agency:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchAgencyTerm}
                  onChange={(e) => setSearchAgencyTerm(e.target.value)}
                  placeholder="Name or keyword..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                />
              </div>
            </div>

          </div>

          {/* Quick Category filter buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategoryFilter === 'all'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All E-Waste Streams
            </button>
            <button
              onClick={() => setSelectedCategoryFilter(currentDevice?.category || 'Laptop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategoryFilter === currentDevice?.category
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Matches {currentDevice?.category} ({currentDevice?.category})
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('Batteries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategoryFilter === 'Batteries'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hazardous Batteries
            </button>
          </div>
        </div>

        {/* Agency Cards List */}
        <div className="space-y-4">
          {filteredAgencies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Licensed Recycling Agencies Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No verified e-waste recyclers match your query in this district. Try broadening your location search or select all categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSearchAgencyTerm('');
                  setUserLocationInput('Colombo District');
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-6 shadow-xs transition-all hover:shadow-md space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left: Agency Photo & Badges */}
                  <div className="flex items-start gap-4">
                    <img
                      src={agency.imageUrl}
                      alt={agency.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {agency.licenseNumber}
                        </span>
                        {agency.verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>CEA Verified Facility</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>~{agency.distanceKm} km from {userLocationInput.split(',')[0]}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{agency.name}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <span>{agency.address}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agency.operatingHours}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{agency.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Direct Request Button */}
                  <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-end gap-2 pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCollectionModal(agency)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Request E-Waste Collection</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Doorstep truck collection available</span>
                  </div>

                </div>

                {/* Capabilities list */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Specialized Capabilities:
                  </span>
                  {agency.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>

                {/* Accepted Categories */}
                <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Accepted Streams:
                  </span>
                  {agency.acceptedCategories.map((cat, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        currentDevice && cat.toLowerCase().includes(currentDevice.category.toLowerCase())
                          ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* STEP C: REQUEST E-WASTE COLLECTION MODAL FORM */}
      {/* ==================================================================== */}
      {isModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-purple-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-purple-800 text-purple-200 rounded">
                    Official Dispatch Manifest
                  </span>
                </div>
                <h3 className="text-xl font-bold">Request E-Waste Collection</h3>
                <p className="text-xs text-purple-200">
                  Target Agency: <strong>{selectedAgency.name}</strong> ({selectedAgency.licenseNumber})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-purple-800 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {submittedRequestId ? (
              /* Success Receipt View */
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900">Collection Request Submitted!</h4>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your electronic waste pickup request has been received by <strong>{selectedAgency.name}</strong>.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block text-left mt-2">
                    <div className="text-xs text-slate-500 font-mono">Request Reference ID:</div>
                    <div className="text-base font-mono font-bold text-purple-800">#{submittedRequestId}</div>
                    <div className="text-xs text-slate-600 mt-1">Status: <strong>Pending Agency Dispatch Scheduling</strong></div>
                    <div className="text-xs text-slate-600">Preferred Date: <strong>{preferredDate} ({preferredSlot})</strong></div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  A verification confirmation has been recorded in your circular timeline. The licensed agency dispatch will contact your phone ({contactPhone}) prior to truck arrival.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveScreen(8); // Device Tracking
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* Collection Request Form */
              <form onSubmit={handleSubmitCollectionRequest} className="p-6 sm:p-8 space-y-6">
                
                {formError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Device & Agency Summary Card */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                    Hardware Item for Recycling Demanufacturing:
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={currentDevice?.photoUrl}
                      alt={currentDevice?.title}
                      className="w-12 h-12 rounded-lg object-contain bg-slate-900 border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{currentDevice?.title}</div>
                      <div className="text-xs text-slate-600">
                        Category: <strong>{currentDevice?.category}</strong> · Tag: <strong>#{currentDevice?.tagNumber}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Contact Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone (for Driver) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Collection Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Collection / Pickup Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="House/Unit #, Street, City, District..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Item Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={deviceQuantity}
                      onChange={(e) => setDeviceQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Preferred Pickup Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (13:00 - 16:00)">Afternoon (13:00 - 16:00)</option>
                      <option value="Evening (16:00 - 18:00)">Evening (16:00 - 18:00)</option>
                    </select>
                  </div>

                  {/* Additional Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Additional Handling Instructions / Access Notes
                    </label>
                    <textarea
                      rows={2}
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="e.g. Broken glass taped; battery detached; security gate instructions..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-purple-600"
                    />
                  </div>

                </div>

                {/* Confirmation Checkbox */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={confirmedTerms}
                      onChange={(e) => setConfirmedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-600 cursor-pointer"
                    />
                    <span>
                      I confirm that I am requesting doorstep collection and responsible chemical/material recycling of this electronic equipment under the Central Environmental Authority (CEA) guidelines.
                    </span>
                  </label>
                </div>

                {/* Form Action Buttons */}
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
                    className="w-full sm:w-auto px-6 py-3 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Confirm & Submit Collection Request'}</span>
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
