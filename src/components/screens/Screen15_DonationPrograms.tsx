import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DonationOrganization, PickupRequest } from '../../types';
import { 
  HeartHandshake, 
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
  Sparkles, 
  Leaf, 
  GraduationCap, 
  Award, 
  Check, 
  X,
  FileText,
  QrCode,
  Building2,
  Lock
} from 'lucide-react';

export const Screen15_DonationPrograms: React.FC = () => {
  const { 
    donationOrganizations, 
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
  const [selectedOrg, setSelectedOrg] = useState<DonationOrganization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Booking Form State
  const [donationMethod, setDonationMethod] = useState<'pickup' | 'drop_off'>('pickup');
  const [pickupAddress, setPickupAddress] = useState<string>(currentUser.location || 'No. 14 Flower Road, Colombo 07');
  const [donorName, setDonorName] = useState<string>(currentUser.name || 'Citizen Donor');
  const [donorPhone, setDonorPhone] = useState<string>(currentUser.phone || '+94 77 123 4567');
  const [deviceQuantity, setDeviceQuantity] = useState<number>(1);
  const [includedAccessories, setIncludedAccessories] = useState<string[]>([
    'Original Power Adapter / Charging Cable',
  ]);
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [preferredSlot, setPreferredSlot] = useState<string>('Morning (09:00 - 12:00)');
  const [additionalNotes, setAdditionalNotes] = useState<string>('Device powers on normally. Cleaned and factory reset. Ready for school lab deployment.');
  const [confirmedTerms, setConfirmedTerms] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  // Filter organizations
  const filteredOrgs = donationOrganizations.filter((org) => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.initiativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.mission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.targetBeneficiaries.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'all' || 
      org.acceptedCategories.some((cat) => 
        cat.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        (currentDevice && cat.toLowerCase().includes(currentDevice.category.toLowerCase()))
      );

    return matchesSearch && matchesCategory;
  });

  const handleOpenDonationModal = (org: DonationOrganization) => {
    setSelectedOrg(org);
    // If org only supports drop off (e.g. Suwa Sevana), default to drop off
    if (!org.pickupAvailable && org.dropOffAvailable) {
      setDonationMethod('drop_off');
    } else {
      setDonationMethod('pickup');
    }
    setFormError(null);
    setConfirmedTerms(false);
    setSubmittedRequestId(null);
    setIsModalOpen(true);
  };

  const toggleAccessory = (acc: string) => {
    setIncludedAccessories((prev) => 
      prev.includes(acc) ? prev.filter((i) => i !== acc) : [...prev, acc]
    );
  };

  const handleSubmitDonationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedOrg) return;
    if (donationMethod === 'pickup' && !pickupAddress.trim()) {
      setFormError('Please enter a valid doorstep collection address.');
      return;
    }
    if (!donorName.trim() || !donorPhone.trim()) {
      setFormError('Donor contact name and phone number are required.');
      return;
    }
    if (!preferredDate) {
      setFormError('Please select a preferred scheduled date.');
      return;
    }
    if (!confirmedTerms) {
      setFormError('Please confirm the community donation pledge.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = `req-don-${Date.now().toString().slice(-6)}`;

      const newRequest: PickupRequest = {
        id: requestId,
        userId: currentUser.id,
        ownerUid: currentUser.uid || currentUser.id,
        deviceId: currentDevice?.id || 'dev-unknown',
        deviceTitle: currentDevice?.title || 'Donated Electronic Device',
        deviceCategory: currentDevice?.category || 'Hardware',
        tagNumber: currentDevice?.tagNumber || 'ECL-DONATION',
        assessmentId: assessment?.preliminaryRecommendation || 'asm-donation',
        pathwayType: 'donation',
        donationMethod: donationMethod,
        providerId: selectedOrg.id,
        providerName: selectedOrg.name,
        providerCategory: selectedOrg.initiativeName,
        providerAddress: selectedOrg.address,
        providerPhone: selectedOrg.phone,
        pickupAddress: donationMethod === 'pickup' ? pickupAddress.trim() : `DROP-OFF: ${selectedOrg.address}`,
        contactName: donorName.trim(),
        contactPhone: donorPhone.trim(),
        deviceQuantity: Number(deviceQuantity) || 1,
        deviceCondition: `${additionalNotes} | Accessories: ${includedAccessories.join(', ') || 'Unit only'}`,
        preferredPickupDate: preferredDate,
        preferredTimeSlot: preferredSlot,
        additionalInstructions: additionalNotes.trim(),
        status: donationMethod === 'pickup' ? 'pending' : 'collection_scheduled',
        confirmedPickupDate: donationMethod === 'drop_off' ? `${preferredDate} (${preferredSlot})` : undefined,
        assignedCollectorName: donationMethod === 'drop_off' ? `${selectedOrg.name} Receiving Desk` : undefined,
        providerResponse: donationMethod === 'drop_off' 
          ? `Drop-off voucher registered. Present code ${requestId} at the receiving desk.` 
          : `Donation pickup scheduled with ${selectedOrg.name} volunteer logistics team.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: donationMethod === 'pickup' ? 'pending' : 'collection_scheduled',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: donationMethod === 'pickup'
              ? `Doorstep donation pickup requested for ${selectedOrg.name}. Volunteer dispatch in progress.`
              : `Self drop-off registered at ${selectedOrg.name} drop-off center. Donor voucher issued.`,
            actor: currentUser.name,
          },
        ],
      };

      await addPickupRequest(newRequest);
      if (currentDevice?.id) {
        await setDeviceRoute(currentDevice.id, 'donation');
      }
      setSubmittedRequestId(requestId);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Failed to submit donation request:', err);
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
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> Pathway: Community Hardware Donation
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  #{currentDevice?.tagNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Equip Underprivileged Students & Rural Tech Labs
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Request doorstep donation collection or choose a verified drop-off center in Colombo. Certified data sanitized & tax-exempt receipt provided.
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

        {/* Social Impact & Educational Readiness Card */}
        <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-amber-800/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Device Info & Photo */}
            <div className="lg:col-span-4 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/30 bg-amber-950/50 shrink-0">
                <img
                  src={currentDevice?.photoUrl}
                  alt={currentDevice?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-950/80 text-[10px] font-mono text-amber-200">
                  {currentDevice?.category}
                </div>
              </div>
              <div>
                <div className="text-xs text-amber-300 font-medium">Eligible Device:</div>
                <div className="text-base font-bold text-white leading-tight">
                  {currentDevice?.title}
                </div>
                <div className="text-xs text-amber-200/80 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gemini Triage: Certified Educational Reuse Grade</span>
                </div>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-amber-700/50 pt-4 lg:pt-0 lg:pl-6">
              
              <div className="bg-amber-950/60 rounded-2xl p-3.5 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Educational Reach
                </div>
                <div className="text-lg font-black text-amber-300 mt-1">
                  1 Student Year
                </div>
                <div className="text-[11px] text-amber-200/70 mt-0.5">
                  Digital classroom computer access
                </div>
              </div>

              <div className="bg-amber-950/60 rounded-2xl p-3.5 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Carbon Avoided
                </div>
                <div className="text-lg font-black text-emerald-300 mt-1">
                  ~190 kg CO₂e
                </div>
                <div className="text-[11px] text-amber-200/70 mt-0.5">
                  100% life extension vs early disposal
                </div>
              </div>

              <div className="bg-amber-950/60 rounded-2xl p-3.5 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-400" /> Tax Credit Voucher
                </div>
                <div className="text-lg font-black text-teal-300 mt-1">
                  CSR Certified
                </div>
                <div className="text-[11px] text-amber-200/70 mt-0.5">
                  Official registered charity receipt
                </div>
              </div>

            </div>

          </div>

          {/* Data Sanitization Guarantee */}
          <div className="mt-5 pt-4 border-t border-amber-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span><strong>Guaranteed Cryptographic Sanitization:</strong> All storage drives undergo DoD 5220.22-M overwrite before student handover.</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
              Zero Personal Data Risk
            </span>
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
              placeholder="Search by school project, initiative, or district..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-amber-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Category:
            </span>
            {['all', 'Laptop', 'Tablet', 'Desktop PC', 'Monitor'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'all' ? 'All Hardware' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Directory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs hover:shadow-md flex flex-col overflow-hidden group"
            >
              {/* Org Banner Image */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={org.imageUrl}
                  alt={org.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified NGO / Initiative</span>
                </div>

                <div className="absolute top-3 right-3 bg-amber-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
                  <span>★ {org.rating}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-amber-300">{org.initiativeName}</div>
                  <div className="text-base font-extrabold leading-snug drop-shadow-sm">{org.name}</div>
                </div>
              </div>

              {/* Org Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  
                  {/* Mission & Target */}
                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-amber-400 pl-2.5">
                    "{org.mission}"
                  </p>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Target Beneficiaries:
                    </div>
                    <div className="text-xs text-amber-950 font-medium mt-0.5">
                      {org.targetBeneficiaries}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{org.address} • ~{org.distanceKm} km</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{org.phone}</span>
                  </div>

                  {/* Badges for Collection Options */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {org.pickupAvailable && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-medium flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Doorstep Pickup Available
                      </span>
                    )}
                    {org.dropOffAvailable && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Verified Drop-Off Center
                      </span>
                    )}
                  </div>

                  {/* Drop-off Note if available */}
                  {org.dropOffInstructions && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong>Drop-off Desk:</strong> {org.dropOffInstructions}
                    </div>
                  )}

                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => handleOpenDonationModal(org)}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Donate Hardware (Pickup or Drop-Off)</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Booking Drawer / Modal */}
      {isModalOpen && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-700 to-orange-800 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-600/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200 mb-1">
                <HeartHandshake className="w-4 h-4 text-amber-200" />
                <span>Hardware Donation Pledge</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                Donate to {selectedOrg.name}
              </h2>
              <p className="text-xs text-amber-100/90 mt-1">
                Initiative: {selectedOrg.initiativeName} • Beneficiaries: {selectedOrg.targetBeneficiaries}
              </p>
            </div>

            {submittedRequestId ? (
              /* Success View */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {donationMethod === 'drop_off' ? 'Drop-Off Voucher Generated!' : 'Donation Pickup Requested!'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for empowering underserved students with digital education. Your donation pledge to <strong className="text-amber-700">{selectedOrg.name}</strong> is registered.
                </p>

                {/* Drop-Off QR Card Simulation */}
                {donationMethod === 'drop_off' && (
                  <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl max-w-md mx-auto flex items-center gap-4 text-left">
                    <div className="w-16 h-16 bg-white border border-amber-300 rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-900 uppercase">On-Site Intake Pass</div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Show this pass at the receiving desk: <br />
                        <strong className="text-slate-900">{selectedOrg.address}</strong>
                      </div>
                      <div className="text-[11px] font-mono text-amber-700 mt-1">
                        Pass ID: {submittedRequestId}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Donation Method:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {donationMethod === 'pickup' ? 'Free Doorstep Logistics Pickup' : 'Self Drop-Off at Receiving Desk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-semibold text-slate-800">{preferredDate} ({preferredSlot})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pledge ID:</span>
                    <span className="font-mono font-bold text-slate-800">{submittedRequestId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Tax Exemption:</span>
                    <span className="font-bold text-emerald-700">Official CSR Receipt Included</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveScreen(8); // Go to Device Tracking
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Track Donation Progress</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setActiveScreen(12); // Environmental Impact Report
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>View Impact Certificate</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Donation Pledge Form */
              <form onSubmit={handleSubmitDonationRequest} className="p-6 space-y-5">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Method Selector: Doorstep Pickup vs Drop-Off */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select How You Wish to Hand Over the Hardware:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Option 1: Pickup */}
                    <button
                      type="button"
                      disabled={!selectedOrg.pickupAvailable}
                      onClick={() => setDonationMethod('pickup')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        donationMethod === 'pickup'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : selectedOrg.pickupAvailable
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                          <Truck className="w-4 h-4 text-amber-600" /> Doorstep Collection
                        </span>
                        {donationMethod === 'pickup' && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {selectedOrg.pickupAvailable 
                          ? 'Volunteer courier collects from your home/office in Colombo.'
                          : 'Doorstep pickup not currently available for this NGO.'}
                      </p>
                    </button>

                    {/* Option 2: Drop-Off */}
                    <button
                      type="button"
                      disabled={!selectedOrg.dropOffAvailable}
                      onClick={() => setDonationMethod('drop_off')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        donationMethod === 'drop_off'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                          : selectedOrg.dropOffAvailable
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                          <Building2 className="w-4 h-4 text-blue-600" /> Verified Drop-Off Center
                        </span>
                        {donationMethod === 'drop_off' && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Drop off directly at their verified desk. Instant verification & receipt voucher.
                      </p>
                    </button>

                  </div>
                </div>

                {/* Drop-Off Location Information Card if Drop-Off Selected */}
                {donationMethod === 'drop_off' && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-700" />
                      <span>Drop-off Location: {selectedOrg.address}</span>
                    </div>
                    <div className="text-[11px] text-blue-800">
                      <strong>Operating Desk:</strong> {selectedOrg.dropOffInstructions || 'Open Mon-Fri 9:00 AM - 5:00 PM.'}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Donor Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Donor / Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
                    />
                  </div>

                  {/* Donor Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
                    />
                  </div>

                  {/* Address if Doorstep Pickup */}
                  {donationMethod === 'pickup' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Doorstep Collection Address
                      </label>
                      <input
                        type="text"
                        required
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Street address, apartment, city (Western Province)"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
                      />
                    </div>
                  )}

                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {donationMethod === 'pickup' ? 'Preferred Pickup Date' : 'Target Drop-Off Date'}
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
                    />
                  </div>

                  {/* Preferred Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time Slot
                    </label>
                    <select
                      value={preferredSlot}
                      onChange={(e) => setPreferredSlot(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
                    >
                      <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                      <option value="Afternoon (13:00 - 16:00)">Afternoon (13:00 - 16:00)</option>
                      <option value="Evening (16:00 - 18:00)">Evening (16:00 - 18:00)</option>
                    </select>
                  </div>

                  {/* Included Accessories */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Included Accessories (Helps student computer lab setup):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Original Power Adapter / Charging Cable',
                        'External USB Mouse / Keyboard',
                        'Device Protective Sleeve or Bag',
                        'HDMI / DisplayPort Cable',
                      ].map((item) => {
                        const isSelected = includedAccessories.includes(item);
                        return (
                          <button
                            type="button"
                            key={item}
                            onClick={() => toggleAccessory(item)}
                            className={`p-2 rounded-xl border text-xs font-medium text-left flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{item}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes for Refurbishment & School Hub
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Any passwords removed, device history, or special wishes for the student recipient..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-amber-600"
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
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>
                      I pledge to donate this hardware to {selectedOrg.name} for educational community refurbishment. I understand all persistent storage will undergo certified DoD sanitization before deployment.
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
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>
                      {isSubmitting 
                        ? 'Confirming Pledge...' 
                        : donationMethod === 'pickup' 
                        ? 'Submit Doorstep Pickup Request' 
                        : 'Generate Drop-Off Intake Voucher'}
                    </span>
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
