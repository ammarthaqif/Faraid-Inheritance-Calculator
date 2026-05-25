/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Relative, EstateDetails } from './types';

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  deceasedName: string;
  deceasedGender: 'M' | 'F';
  estate: EstateDetails;
  relatives: Relative[];
}

export const PRESETS: ScenarioPreset[] = [
  {
    id: 'standard_family',
    name: 'Standard Family (Patriarch)',
    description: 'Deceased father with a wife, one son, one daughter, and surviving parents. Distributes shares utilizing fixed-quota and 2:1 residuary rules.',
    deceasedName: 'Abdur-Rahman',
    deceasedGender: 'M',
    estate: {
      grossValue: 500000,
      funeralExpenses: 3000,
      debtsValue: 12000,
      willsValue: 15000,
    },
    relatives: [
      { id: '1', name: 'Layla (Wife)', relationship: 'spouse', gender: 'F', isAlive: true },
      { id: '2', name: 'Zayd (Son)', relationship: 'son', gender: 'M', isAlive: true },
      { id: '3', name: 'Yasmin (Daughter)', relationship: 'daughter', gender: 'F', isAlive: true },
      { id: '4', name: 'Ibrahim (Father)', relationship: 'father', gender: 'M', isAlive: true },
      { id: '5', name: 'Amina (Mother)', relationship: 'mother', gender: 'F', isAlive: true },
    ],
  },
  {
    id: 'gharrawain_case',
    name: 'Umariyyatain / Gharrawain Cases',
    description: 'Survivors include only the Wife, Mother, and Father. Triggers the historic Umar ibn al-Khattab ruling, where Mother receives 1/3 of the residue rather than the whole estate.',
    deceasedName: 'Uthman',
    deceasedGender: 'M',
    estate: {
      grossValue: 120000,
      funeralExpenses: 2000,
      debtsValue: 8000,
      willsValue: 0,
    },
    relatives: [
      { id: '1', name: 'Hafsah (Wife)', relationship: 'spouse', gender: 'F', isAlive: true },
      { id: '2', name: 'Tariq (Father)', relationship: 'father', gender: 'M', isAlive: true },
      { id: '3', name: 'Maryam (Mother)', relationship: 'mother', gender: 'F', isAlive: true },
    ],
  },
  {
    id: 'awl_case',
    name: 'Al-Awl Case (Fractions Exceeding 1.0)',
    description: 'Deceased wife leaves behind a Husband, two Daughters, Mother, and Father. The total Quranic shares exceed 1.0 (27/24). The denominator increases proportionally (to 27) to resolve this.',
    deceasedName: 'Fatimah',
    deceasedGender: 'F',
    estate: {
      grossValue: 270000,
      funeralExpenses: 4000,
      debtsValue: 6000,
      willsValue: 0,
    },
    relatives: [
      { id: '1', name: 'Suhail (Husband)', relationship: 'spouse', gender: 'M', isAlive: true },
      { id: '2', name: 'Ruqayyah (Daughter)', relationship: 'daughter', gender: 'F', isAlive: true },
      { id: '3', name: 'Zainab (Daughter)', relationship: 'daughter', gender: 'F', isAlive: true },
      { id: '4', name: 'Khadijah (Mother)', relationship: 'mother', gender: 'F', isAlive: true },
      { id: '5', name: 'Ali (Father)', relationship: 'father', gender: 'M', isAlive: true },
    ],
  },
  {
    id: 'radd_case',
    name: 'Al-Radd Case (Fractions Less than 1.0)',
    description: 'Deceased leaves maternal Mother and a single Daughter. Total Quranic shares (1/6 + 1/2) are less than 1.0, and since no Residuaries exist, the remaining estate is returned proportionally to them.',
    deceasedName: 'Zubair',
    deceasedGender: 'M',
    estate: {
      grossValue: 90000,
      funeralExpenses: 1500,
      debtsValue: 3500,
      willsValue: 5000,
    },
    relatives: [
      { id: '1', name: 'Kalthom (Mother)', relationship: 'mother', gender: 'F', isAlive: true },
      { id: '2', name: 'Safiyyah (Daughter)', relationship: 'daughter', gender: 'F', isAlive: true },
    ],
  },
];
