export type UserRole = 'consumer' | 'technician' | 'recycler' | 'recovery_partner' | 'donation_org';

export type CircularRoute = 
  | 'repair'
  | 'reuse_resale'
  | 'reuse'
  | 'resale'
  | 'donation'
  | 'parts_recovery'
  | 'recycling';

export type PickupPathwayType = 'parts_recovery' | 'recycling' | 'donation' | 'repair' | 'resale';

export type PickupRequestStatus = 
  | 'pending'
  | 'accepted'
  | 'collection_scheduled'
  | 'collector_assigned'
  | 'collected'
  | 'received_at_facility'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface PickupStatusEvent {
  status: PickupRequestStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface PickupRequest {
  id: string;
  userId: string;
  ownerUid?: string;
  deviceId: string;
  deviceTitle: string;
  deviceCategory: string;
  tagNumber: string;
  assessmentId?: string;
  pathwayType: PickupPathwayType;
  providerId: string;
  providerName: string;
  providerCategory?: string;
  providerAddress?: string;
  providerPhone?: string;
  pickupAddress: string;
  contactName: string;
  contactPhone: string;
  deviceQuantity: number;
  deviceCondition?: string;
  preferredPickupDate: string;
  preferredTimeSlot: string;
  additionalInstructions?: string;
  status: PickupRequestStatus;
  providerResponse?: string;
  confirmedPickupDate?: string;
  assignedCollectorName?: string;
  donationMethod?: 'pickup' | 'drop_off';
  createdAt: string;
  updatedAt: string;
  statusHistory: PickupStatusEvent[];
}

export interface RecyclingAgency {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  district: string;
  distanceKm: number;
  phone: string;
  email: string;
  operatingHours: string;
  acceptedCategories: string[];
  capabilities: string[];
  pickupAvailable: boolean;
  dropOffAvailable: boolean;
  verified: boolean;
  rating: number;
  imageUrl: string;
}

export interface PartsRecoveryPartner {
  id: string;
  name: string;
  businessName: string;
  address: string;
  district: string;
  distanceKm: number;
  phone: string;
  email: string;
  operatingHours: string;
  acceptedCategories: string[];
  harvestSpecialties: string[];
  pickupAvailable: boolean;
  verified: boolean;
  rating: number;
  imageUrl: string;
}

export interface DonationOrganization {
  id: string;
  name: string;
  initiativeName: string;
  mission: string;
  targetBeneficiaries: string;
  address: string;
  district: string;
  distanceKm: number;
  phone: string;
  email: string;
  acceptedCategories: string[];
  pickupAvailable: boolean;
  dropOffAvailable: boolean;
  dropOffInstructions?: string;
  verified: boolean;
  rating: number;
  imageUrl: string;
}

export interface ResaleListing {
  id: string;
  deviceId: string;
  userId: string;
  deviceTitle: string;
  category: string;
  brandModel: string;
  tagNumber: string;
  photoUrl: string;
  estimatedPriceLkr: number;
  askingPriceLkr: number;
  workingCondition: 'Fully Working' | 'Minor Faults / Cosmetic Wear' | 'Parts Only';
  accessoriesIncluded: string[];
  knownFaults: string[];
  warrantyOfferedDays: number;
  status: 'draft' | 'pending_review' | 'published' | 'sold' | 'withdrawn' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export type DeviceStatus =
  | 'intake_pending'
  | 'ai_assessed'
  | 'route_selected'
  | 'technician_assigned'
  | 'physical_inspection_pending'
  | 'quote_submitted'
  | 'repair_in_progress'
  | 'quality_check'
  | 'completed'
  | 'recycled';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  phone: string;
  avatarUrl?: string;
  businessName?: string;
  certificationNumber?: string;
  joinedDate: string;
  createdAt?: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'yes_no' | 'short_text';

export interface DynamicQuestion {
  id: string;
  text: string;
  reason: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  allowCustomInput?: boolean;
  answer?: string | string[];
}

export interface GeminiVisualAnalysis {
  isElectronicDevice: boolean;
  unclearMessage?: string;
  category: string;
  name: string;
  brand_or_model: string;
  visible_condition: string;
  visible_damage: string[];
  what_cannot_be_determined: string[];
  uncertainties: string[];
  safety_notes: string[];
  identification_confidence: 'high' | 'medium' | 'low';
  modelMatchConfidencePercent: number;
  recoverableMassKg: number;
  co2eAvoidanceKg: number;
  materialComposition?: string;
}

export interface FinalPersonalizedAssessment {
  identified_category: string;
  identified_device_name: string;
  visible_condition_summary: string;
  user_reported_operational_condition: string;
  confirmed_observations: string[];
  unverified_assumptions: string[];
  remaining_uncertainties: string[];
  recommended_route: string;
  confidence_score: number;
  alternative_routes: string[];
  reasoning: string[];
  key_decision_factors?: string[];
  potential_repair_or_reuse_considerations?: string;
  safety_notes: string[];
  next_step_advice: string;
  estimated_economic_impact?: string;
  co2e_avoidance_kg?: number;
  recoverable_mass_kg?: number;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  helperText?: string;
  options: string[];
}

export interface CalculatedPathwayResult {
  recommendedPathway: string;
  confidenceScore: number;
  plainLanguageReason: string;
  keyFactors?: string[];
  nextStepAdvice: string;
  alternativePathways: string[];
  estimatedEconomicImpact?: string;
  co2eAvoidanceKg?: number;
}

export interface GeminiAssessmentData {
  detectedEwasteObject?: string;
  ewasteCategory?: string;
  simpleDescription?: string;
  detectedObjectDescription?: string;
  identifiedHardwareModel: string;
  modelMatchConfidence: number;
  attributionRationale: string;
  deviceClass: string;
  visualMechanicalState: string;
  visibleDamagePoints: string[];
  preliminaryRecommendation: string;
  recommendationViabilityPercent: number;
  pathwayRationale: string;
  alternativePathways: string[];
  recoverableMassKg: number;
  materialCompositionSummary?: string;
  preciousMetalsEstimate?: string;
  co2eAvoidanceKg: number;
  safetyAndVerificationDisclaimer: string;
  suggestedFollowUpQuestions?: DiagnosticQuestion[];
  userAnswers?: Record<string, string>;
  calculatedPathway?: CalculatedPathwayResult;
  // Dynamic multi-turn fields
  visualAnalysis?: GeminiVisualAnalysis;
  dynamicQuestions?: DynamicQuestion[];
  dynamicConversationRounds?: Array<{
    round: number;
    questions: DynamicQuestion[];
  }>;
  dynamicAnswers?: Record<string, string | string[]>;
  finalPersonalizedAssessment?: FinalPersonalizedAssessment;
  isAnalyzing?: boolean;
}

export interface SparePartItem {
  id: string;
  name: string;
  partNumber?: string;
  source: 'salvage_pool' | 'new_oem';
  costLkr: number;
}

export interface InspectionQuote {
  id: string;
  deviceId: string;
  ownerUid?: string;
  technicianId: string;
  technicianUid?: string;
  technicianName: string;
  createdAt: string;
  updatedAt?: string;
  multimeterStatus: 'passed' | 'rail_short' | 'standby_fault';
  thermalAnalysis: string;
  batteryHealthPercent: number;
  motherboardCondition: string;
  rootCauses: string[];
  partsList: SparePartItem[];
  laborCostLkr: number;
  totalCostLkr: number;
  estimatedTurnaroundDays: number;
  technicianNotes: string;
  inspectionPhotos: string[];
  status: 'pending' | 'approved' | 'rejected' | 'clarification_requested';
  clarificationMessage?: string;
}

export interface TrackingMilestone {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  actor: string;
}

export interface RepairProgressStage {
  name: string;
  description: string;
  completed: boolean;
  timestamp?: string;
}

export interface DeviceRecord {
  id: string;
  tagNumber: string;
  userId: string;
  ownerUid?: string;
  userName: string;
  userPhone: string;
  userDistrict: string;
  title: string;
  category: 'Laptop' | 'Smartphone' | 'Tablet' | 'Desktop PC' | 'Monitor' | 'Audio/Appliance';
  brandModel: string;
  lifecycleAge: string;
  powerState: string;
  knownFlaws: string[];
  observations: string;
  photoUrl: string;
  createdAt: string;
  updatedAt?: string;
  status: DeviceStatus;
  selectedRoute?: CircularRoute;
  assignedTechnicianId?: string;
  assignedTechnicianUid?: string;
  geminiAssessment?: GeminiAssessmentData;
  inspectionQuote?: InspectionQuote;
  repairProgress?: {
    currentPercent: number;
    currentStage: string;
    stages: RepairProgressStage[];
    benchLogs: { timestamp: string; note: string; author: string }[];
  };
  finalOutcome?: {
    certificateId: string;
    completedAt: string;
    outcomeType: CircularRoute;
    co2eAvoidanceKg: number;
    massDivertedKg: number;
    preciousMetals: {
      goldGrams: number;
      copperGrams: number;
      silverGrams: number;
    };
    economicValueSavedLkr: number;
    recipientOrBuyer?: string;
    consumerRating?: number;
    consumerReview?: string;
  };
  milestones: TrackingMilestone[];
}

export interface TechnicianProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  businessName: string;
  address: string;
  district: string;
  serviceArea?: string;
  phone: string;
  rating: number;
  completedJobsCount: number;
  certifications: string[];
  specialties: string[];
  distanceKm: number;
  avatarUrl: string;
  hourlyLaborRateLkr: number;
  availability: 'Available Today' | 'Next Day' | 'In High Demand';
  profileStatus?: 'active' | 'pending_verification' | 'suspended';
}
