/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RelationshipType =
  | 'spouse'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'full_brother'
  | 'full_sister'
  | 'consanguine_brother'
  | 'consanguine_sister'
  | 'uterine_brother'
  | 'uterine_sister'
  | 'grandson'
  | 'granddaughter'
  | 'grandfather'
  | 'grandmother_maternal'
  | 'grandmother_paternal';

export interface Relative {
  id: string;
  name: string;
  relationship: RelationshipType;
  gender: 'M' | 'F';
  isAlive: boolean;
  photo?: string;
}

export interface EstateDetails {
  grossValue: number;
  funeralExpenses: number;
  debtsValue: number;
  willsValue: number; // Max 1/3 of remainder
}

export interface HeirResult {
  id: string;
  name: string;
  relationship: RelationshipType;
  relationshipLabel: string;
  gender: 'M' | 'F';
  shareFraction: string; // e.g., "1/8", "2/3", or "Residue"
  sharePercentage: number; // e.g., 12.5%
  shareAmount: number; // e.g., $12,500
  status: 'Heir' | 'Excluded' | 'Deceased';
  exclusionReason?: string; // Standard Sharia rule why they got excluded
  shariaBasis: string; // Dynamic Quranic/Hadith justification for this specific rate
}

export interface CalculationResult {
  netEstate: number;
  grossEstate: number;
  funeralDeduction: number;
  debtsDeduction: number;
  willsDeduction: number;
  totalDistributed: number;
  residueAmount: number;
  heirs: HeirResult[];
  adjustmentType: 'Perfect' | 'Awl' | 'Radd';
  adjustmentExplanation?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
