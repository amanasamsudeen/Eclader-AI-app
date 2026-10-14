export type UserRole = 'consumer' | 'technician';

export type CircularRoute = 
  | 'repair'
  | 'reuse_resale'
  | 'donation'
  | 'parts_recovery'
  | 'recycling';

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
  suggestedFollowUpQuestions: DiagnosticQuestion[];
  userAnswers?: Record<string, string>;
  calculatedPathway?: CalculatedPathwayResult;
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
