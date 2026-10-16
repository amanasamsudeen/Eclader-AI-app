import { CircularRoute } from '../types';

export type NormalizedPathway = 'repair' | 'parts_recovery' | 'recycling' | 'donation' | 'resale' | 'reuse';

/**
 * Centralized pathway normalization function.
 * Ensures consistent routing decisions across Gemini AI output, user choices, and navigation.
 * 
 * Non-negotiable routing rules:
 * - Recycling MUST NEVER route to technicians.
 * - Parts recovery MUST NEVER route to technicians.
 * - Donation MUST NEVER route to technicians.
 * - Only Repair routes to technician matching.
 */
export function normalizePathway(raw: string | undefined | null): NormalizedPathway {
  if (!raw) return 'repair';
  const val = raw.toLowerCase().trim();

  // 1. Responsible Recycling (Highest Priority Check - Must Never Route to Technicians)
  if (
    val.includes('recycl') || 
    val.includes('e-waste recycling') || 
    val.includes('responsible recycling') || 
    val.includes('recyclable') ||
    val.includes('demanufactur') || 
    val.includes('hazardous waste') ||
    val.includes('shred') ||
    val.includes('zero landfill') ||
    val.includes('material extraction')
  ) {
    return 'recycling';
  }

  // 2. Parts Recovery & Salvage (Component Harvesting)
  if (
    val.includes('parts_recovery') ||
    val.includes('parts recovery') || 
    val.includes('component recovery') ||
    val.includes('recover reusable components') ||
    val.includes('salvage') || 
    val.includes('harvest') ||
    val.includes('sub-assembly') ||
    val.includes('spare parts')
  ) {
    return 'parts_recovery';
  }

  // 3. Donation (Community & Educational IT Empowerment)
  if (
    val.includes('donat') || 
    val.includes('charity') || 
    val.includes('school') ||
    val.includes('community') ||
    val.includes('student') ||
    val.includes('vocational')
  ) {
    return 'donation';
  }

  // 4. Resale (Secondary Marketplace)
  if (
    val.includes('resale') || 
    val.includes('secondary market') || 
    val.includes('trade-in') ||
    val.includes('sell')
  ) {
    return 'resale';
  }

  // 5. Reuse & Repurposing
  if (
    val.includes('reuse') || 
    val.includes('repurpose') ||
    val.includes('personal reuse') ||
    val.includes('re-use')
  ) {
    return 'reuse';
  }

  // 6. Repair (Technician Bench Service)
  if (
    val.includes('repair') || 
    val.includes('component repair') ||
    val.includes('fix') ||
    val.includes('rework') || 
    val.includes('micro-soldering') ||
    val.includes('refurbish')
  ) {
    return 'repair';
  }

  // Default fallback if ambiguous
  return 'repair';
}

/**
 * Maps normalized circular pathway to its designated application screen.
 * 
 * Strict destinations:
 * - repair -> Screen 7: Technician Matching
 * - recycling -> Screen 13: Recycling Agencies
 * - parts_recovery -> Screen 14: Parts Recovery Partners
 * - donation -> Screen 15: Donation Organizations
 * - resale & reuse -> Screen 16: Resale Marketplace & Reuse Options
 */
export function getScreenForPathway(pathway: NormalizedPathway | CircularRoute | string): number {
  const normalized = normalizePathway(pathway as string);
  switch (normalized) {
    case 'repair':
      return 7; // Technician Matching
    case 'recycling':
      return 13; // Recycling Agencies
    case 'parts_recovery':
      return 14; // Parts Recovery Partners
    case 'donation':
      return 15; // Donation Organizations
    case 'resale':
    case 'reuse':
      return 16; // Resale Marketplace
    default:
      return 6; // Circular Route Overview
  }
}

export interface PathwayMeta {
  pathway: NormalizedPathway;
  title: string;
  shortAction: string;
  badge: string;
  colorClass: string;
  buttonClass: string;
  description: string;
  pickupSupported: boolean;
}

export function getPathwayMeta(pathway: NormalizedPathway): PathwayMeta {
  switch (pathway) {
    case 'repair':
      return {
        pathway: 'repair',
        title: 'Component Repair',
        shortAction: 'Find Repair Technicians',
        badge: 'Technician Bench',
        colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        description: 'Match with certified NVQ Level 4 bench technicians for board micro-soldering, battery renewal, and panel replacement.',
        pickupSupported: true,
      };
    case 'parts_recovery':
      return {
        pathway: 'parts_recovery',
        title: 'Parts Recovery & Salvage',
        shortAction: 'Request E-Waste Pickup',
        badge: 'Component Salvage',
        colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
        buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
        description: 'Dispatch e-waste to verified recovery partners to salvage functional ICs, screen panels, chassis, and sub-assemblies.',
        pickupSupported: true,
      };
    case 'recycling':
      return {
        pathway: 'recycling',
        title: 'Responsible Recycling',
        shortAction: 'Find Recycling Agencies',
        badge: 'CEA Licensed Facility',
        colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
        buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
        description: 'Zero-landfill chemical recovery, precious metals refining, and non-hazardous demanufacturing by CEA-licensed agencies.',
        pickupSupported: true,
      };
    case 'donation':
      return {
        pathway: 'donation',
        title: 'Community Donation',
        shortAction: 'Donate Hardware',
        badge: 'Digital Empowerment',
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        description: 'Equip rural schools and vocational IT training labs in Sri Lanka with functional computers and peripherals.',
        pickupSupported: true,
      };
    case 'resale':
    case 'reuse':
      return {
        pathway: 'resale',
        title: 'Reuse & Resale',
        shortAction: 'Explore Resale Options',
        badge: 'Circular Secondary Market',
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        description: 'Cryptographic data sanitization (NIST 800-88) followed by domestic secondary marketplace listing to recover monetary value.',
        pickupSupported: false,
      };
  }
}
