/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Relative, EstateDetails, CalculationResult, HeirResult, RelationshipType } from './types';

// Helper to calculate greatest common divisor to simplify fractions if needed
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Convert any numerical ratio between 0 and 1 into its simplest fraction representation
function toFraction(val: number): string {
  if (val <= 0) return '0';
  if (val >= 1) return '1';
  
  const maxDenom = 2000;
  let bestNum = 1;
  let bestDenom = 1;
  let minDiff = Infinity;
  
  for (let d = 2; d <= maxDenom; d++) {
    const n = Math.round(val * d);
    const diff = Math.abs(val - n / d);
    if (diff < minDiff) {
      minDiff = diff;
      bestNum = n;
      bestDenom = d;
    }
    if (diff < 1e-10) {
      break;
    }
  }
  
  if (bestNum === bestDenom) return '1';
  return `${bestNum}/${bestDenom}`;
}

// Convert fraction representation
function fractionStr(num: number, denom: number): string {
  if (num === 0) return '0';
  return toFraction(num / denom);
}

export function calculateFaraid(
  deceasedGender: 'M' | 'F',
  deceasedName: string,
  relatives: Relative[],
  estate: EstateDetails
): CalculationResult {
  const grossEstate = estate.grossValue;
  const funeralDeduction = estate.funeralExpenses;
  const debtsDeduction = estate.debtsValue;
  
  // Post-funeral and debts estate
  const estateAfterDebts = Math.max(0, grossEstate - funeralDeduction - debtsDeduction);
  
  // Wills deduction is legally capped at 1/3 of the remaining estate after funeral and debts
  const maxAllowableWills = estateAfterDebts / 3;
  const willsDeduction = Math.min(estate.willsValue, maxAllowableWills);
  
  const netEstate = Math.max(0, estateAfterDebts - willsDeduction);

  // Initialize all heirs
  const results: HeirResult[] = relatives.map((r) => ({
    id: r.id,
    name: r.name,
    relationship: r.relationship,
    relationshipLabel: getRelationshipLabel(r.relationship, r.gender),
    gender: r.gender,
    shareFraction: '0',
    sharePercentage: 0,
    shareAmount: 0,
    status: r.isAlive ? 'Excluded' : 'Deceased',
    shariaBasis: '',
  }));

  // Identify who is alive
  const aliveRelatives = relatives.filter((r) => r.isAlive);
  const findAlive = (rel: RelationshipType) => aliveRelatives.filter((r) => r.relationship === rel);

  // Alive category lists
  const husbands = deceasedGender === 'F' ? findAlive('spouse') : [];
  const wives = deceasedGender === 'M' ? findAlive('spouse') : [];
  const sons = findAlive('son');
  const daughters = findAlive('daughter');
  const father = findAlive('father')[0];
  const mother = findAlive('mother')[0];
  const grandsons = findAlive('grandson');
  const granddaughters = findAlive('granddaughter');
  const grandfather = findAlive('grandfather')[0];
  const grandmothersMaternal = findAlive('grandmother_maternal');
  const grandmothersPaternal = findAlive('grandmother_paternal');
  const fullBrothers = findAlive('full_brother');
  const fullSisters = findAlive('full_sister');
  const paternalBrothers = findAlive('consanguine_brother');
  const paternalSisters = findAlive('consanguine_sister');
  const uterineBrothers = findAlive('uterine_brother');
  const uterineSisters = findAlive('uterine_sister');

  // Boolean helper indicators
  const hasSons = sons.length > 0;
  const hasDaughters = daughters.length > 0;
  const hasChildren = hasSons || hasDaughters;
  const hasGrandsons = grandsons.length > 0;
  const hasGranddaughters = granddaughters.length > 0;
  const hasDescendants = hasChildren || hasGrandsons || hasGranddaughters;
  
  const totalSiblingsCount = 
    fullBrothers.length + fullSisters.length +
    paternalBrothers.length + paternalSisters.length +
    uterineBrothers.length + uterineSisters.length;

  const hasSiblings = totalSiblingsCount > 0;

  // Let's establish base exclusions (Hajb Hirman)
  const exclusions = new Map<string, string>(); // relativeId -> reason

  // 1. Father excludes paternal grandfather and paternal grandmothers
  if (father) {
    grandmothersPaternal.forEach(gm => {
      exclusions.set(gm.id, "Excluded by the Father (established Sharia exclusion).");
    });
    if (grandfather) {
      exclusions.set(grandfather.id, "Excluded by the Father (direct ascendant).");
    }
    // Father also excludes siblings
    fullBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Father (direct male ascendant)."));
    fullSisters.forEach(s => exclusions.set(s.id, "Excluded by the Father (direct male ascendant)."));
    paternalBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Father."));
    paternalSisters.forEach(s => exclusions.set(s.id, "Excluded by the Father."));
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Father."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Father."));
  }

  // 2. Mother excludes all grandmothers (both maternal and paternal)
  if (mother) {
    grandmothersMaternal.forEach(gm => exclusions.set(gm.id, "Excluded by the Mother (maternal link)."));
    grandmothersPaternal.forEach(gm => exclusions.set(gm.id, "Excluded by the Mother (direct maternal ascendant rule)."));
  }

  // 3. Paternal Grandfather (if alive and father is deceased) acts as ascendant and excludes siblings in dominant view
  if (grandfather && !father) {
    fullBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandfather under Sunni jurisprudence."));
    fullSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandfather."));
    paternalBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandfather."));
    paternalSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandfather."));
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandfather."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandfather."));
  }

  // 4. Sons exclude grandsons, granddaughters, and siblings
  if (hasSons) {
    grandsons.forEach(gs => exclusions.set(gs.id, "Excluded by the Son (closer male descendant)."));
    granddaughters.forEach(gd => exclusions.set(gd.id, "Excluded by the Son (closer male descendant)."));
    fullBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Son (descendant block)."));
    fullSisters.forEach(s => exclusions.set(s.id, "Excluded by the Son."));
    paternalBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Son."));
    paternalSisters.forEach(s => exclusions.set(s.id, "Excluded by the Son."));
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Son."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Son."));
  }

  // 5. Grandsons exclude distant descendants and siblings
  if (hasGrandsons && !hasSons) {
    fullBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandson."));
    fullSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandson."));
    paternalBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandson."));
    paternalSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandson."));
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Grandson."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Grandson."));
  }

  // 6. Daughters exclude uterine siblings. Plus if multiple daughters (2+), they exclude granddaughters unless made Asabah
  if (hasDaughters) {
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Daughter (descendant block)."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Daughter."));
    
    if (daughters.length >= 2 && !hasSons && grandsons.length === 0) {
      granddaughters.forEach(gd => exclusions.set(gd.id, "Excluded as daughters have exhausted the maximum 2/3 female descendant share, and there is no male descendant of equal or lower rank to make her a residuary."));
    }
  }
  
  // 7. Granddaughters also exclude uterine siblings, etc., if they inherit
  if (hasGranddaughters && !hasChildren) {
    uterineBrothers.forEach(b => exclusions.set(b.id, "Excluded by the Granddaughter."));
    uterineSisters.forEach(s => exclusions.set(s.id, "Excluded by the Granddaughter."));
  }

  // 8. Full Brother excludes paternal siblings
  if (fullBrothers.length > 0) {
    paternalBrothers.forEach(pb => exclusions.set(pb.id, "Excluded by the Full Brother (stronger blood relationship)."));
    paternalSisters.forEach(ps => exclusions.set(ps.id, "Excluded by the Full Brother."));
  }

  // 9. Full Sister, if she becomes an Asabah (Residuary with daughters/granddaughters - Ma'al Ghayr), excludes paternal siblings
  const fullSisterIsResiduaryWithFemaleDescendants = (hasDaughters || hasGranddaughters) && !hasSons && grandsons.length === 0 && fullBrothers.length === 0;
  if (fullSisterIsResiduaryWithFemaleDescendants && fullSisters.length > 0) {
    paternalBrothers.forEach(pb => exclusions.set(pb.id, "Excluded by Full Sisters who act as Residuaries alongside daughters."));
    paternalSisters.forEach(ps => exclusions.set(ps.id, "Excluded by Full Sisters who act as Residuaries alongside daughters."));
  }

  // 10. Multiple Full Sisters (2+) exclude paternal sisters, unless there is a paternal brother to couple them
  if (fullSisters.length >= 2 && paternalBrothers.length === 0) {
    paternalSisters.forEach(ps => exclusions.set(ps.id, "Excluded: full sisters have exhausted the maximum sibling fixed share (2/3)."));
  }

  // --- START CALCULATIONS ---
  // Core Common Denominator of calculations: 24 is the standard Sharia base. We will calculate in "portions of 24" (or higher if required).
  let baseDenom = 24;
  const portions = new Map<string, number>(); // relativeId -> share portions out of baseDenom

  // Helper to register fixed quota share
  const setPortions = (id: string, fraction: number, basis: string) => {
    portions.set(id, fraction * baseDenom);
    const item = results.find(r => r.id === id);
    if (item) {
      item.status = 'Heir';
      item.shareFraction = fractionStr(fraction * baseDenom, baseDenom);
      item.shariaBasis = basis;
    }
  };

  // 1. Spouses (Exclusion cannot apply to Husband/Wife)
  if (husbands.length > 0) {
    const h = husbands[0];
    const fraction = hasDescendants ? 1/4 : 1/2;
    const basis = hasDescendants 
      ? "Receives 1/4 because the deceased has children/descendants (Quran 4:12)."
      : "Receives 1/2 because the deceased has no children or descendants (Quran 4:12).";
    setPortions(h.id, fraction, basis);
  }
  
  if (wives.length > 0) {
    const fraction = hasDescendants ? 1/8 : 1/4;
    const shareEachCap = fraction / wives.length;
    wives.forEach((w) => {
      const basis = hasDescendants
        ? `Receives equal portion of 1/8 (${fractionStr(1, 8 * wives.length)} each) because the deceased has descendants (Quran 4:12).`
        : `Receives equal portion of 1/4 (${fractionStr(1, 4 * wives.length)} each) because the deceased has no descendants (Quran 4:12).`;
      setPortions(w.id, shareEachCap, basis);
    });
  }

  // 2. Mother (Exclusion cannot apply)
  let motherFixedFraction = 0;
  if (mother) {
    // Check Umariyyatain (Gharrawain) case: Survivors are only (Husband + Mother + Father) or (Wife/Wives + Mother + Father)
    const aliveExceptSpouseMotherFather = aliveRelatives.filter(
      r => r.relationship !== 'father' && r.relationship !== 'mother' && r.relationship !== 'spouse'
    );
    const isGharrawain = aliveExceptSpouseMotherFather.length === 0 && (husbands.length > 0 || wives.length > 0) && !!father;

    if (isGharrawain) {
      if (husbands.length > 0) {
        // Spouse = 1/2. Remaining = 1/2. Mother gets 1/3 of 1/2 = 1/6. Father gets residue (1/3).
        motherFixedFraction = 1/6;
        setPortions(mother.id, 1/6, "Gharrawain Case: Receives 1/3 of the residue after husband's share (which equals 1/6 of total).");
      } else {
        // Spouse = 1/4. Remaining = 3/4. Mother gets 1/3 of 3/4 = 1/4. Father gets residue (1/2).
        motherFixedFraction = 1/4;
        setPortions(mother.id, 1/4, "Gharrawain Case: Receives 1/3 of the residue after wives' share (which equals 1/4 of total).");
      }
    } else {
      motherFixedFraction = (hasDescendants || totalSiblingsCount >= 2) ? 1/6 : 1/3;
      const basis = (hasDescendants || totalSiblingsCount >= 2)
        ? "Receives 1/6 because there are descendants or multiple siblings (Quran 4:11)."
        : "Receives 1/3 because there are no descendants and less than 2 siblings (Quran 4:11).";
      setPortions(mother.id, motherFixedFraction, basis);
    }
  }

  // 3. Father (Exclusion cannot apply) - can be Fixed share, Residuary or both
  let fatherIsPureResiduary = false;
  if (father) {
    if (hasSons || hasGrandsons) {
      // PURE Fixed share
      setPortions(father.id, 1/6, "Receives 1/6 fixed quota share because there are male descendants surviving (Quran 4:11).");
    } else if (hasDaughters || hasGranddaughters) {
      // Fixed share + Residuary
      setPortions(father.id, 1/6, "Receives 1/6 as fixed quota (Quran 4:11) plus acts as a Residuary (Asabah) to take leftovers since there are only female descendants.");
    } else {
      // Pure residuary
      fatherIsPureResiduary = true;
      const basis = "Acts as Residuary (Asabah) because the deceased has no offspring or male descendants (Al-Bukhari).";
      const item = results.find(r => r.id === father.id);
      if (item) {
        item.status = 'Heir';
        item.shareFraction = 'Residue';
        item.shariaBasis = basis;
      }
    }
  }

  // 4. Daughters (Quota if no Sons)
  if (daughters.length > 0 && !hasSons) {
    const fraction = daughters.length === 1 ? 1/2 : 2/3;
    const shareEach = fraction / daughters.length;
    daughters.forEach((d) => {
      const basis = daughters.length === 1
        ? "Only living daughter: Receives 1/2 fixed quota share (Quran 4:11)."
        : `Daughters share 2/3 equally (${fractionStr(2, 3 * daughters.length)} each) as there are no living sons (Quran 4:11).`;
      setPortions(d.id, shareEach, basis);
    });
  }

  // 5. Granddaughters (Inherits if not excluded and no son/daughter/grandson)
  const aliveGranddaughters = granddaughters.filter(g => !exclusions.has(g.id));
  if (aliveGranddaughters.length > 0 && !hasSons && grandsons.length === 0) {
    if (daughters.length === 0) {
      // She inherits like a daughter
      const fraction = aliveGranddaughters.length === 1 ? 1/2 : 2/3;
      const shareEach = fraction / aliveGranddaughters.length;
      aliveGranddaughters.forEach(gd => {
        const basis = aliveGranddaughters.length === 1
          ? "No sons/daughters exist: Receives 1/2 fixed quota as only granddaughter of son lineage."
          : `No sons/daughters exist: Shared 2/3 fixed quota equally (${fractionStr(2, 3 * aliveGranddaughters.length)} each).`;
        setPortions(gd.id, shareEach, basis);
      });
    } else if (daughters.length === 1) {
      // Completes 2/3 with daughter's 1/2. So granddaughters share 1/6.
      const fraction = 1/6;
      const shareEach = fraction / aliveGranddaughters.length;
      aliveGranddaughters.forEach(gd => {
        setPortions(gd.id, shareEach, `Completes the maximum 2/3 quota for female children alongside 1 daughter, receiving an equal share of 1/6 (which equals ${fractionStr(1, 6 * aliveGranddaughters.length)} each).`);
      });
    }
  }

  // 6. Grandparents
  if (grandfather && !exclusions.has(grandfather.id) && !father) {
    if (hasSons || hasGrandsons) {
      setPortions(grandfather.id, 1/6, "In absence of father, grandfather receives 1/6 fixed share due to male descendants.");
    } else if (hasDaughters || hasGranddaughters) {
      setPortions(grandfather.id, 1/6, "In absence of father, grandfather receives 1/6 fixed share and acts as Residuary (Asabah) since only female descendants survive.");
    } else {
      fatherIsPureResiduary = true; // Grandfather acts as pure residuary
      const item = results.find(r => r.id === grandfather.id);
      if (item) {
        item.status = 'Heir';
        item.shareFraction = 'Residue';
        item.shariaBasis = "In absence of the father, acts as pure Residuary (Asabah) as no descendants survive.";
      }
    }
  }

  // Grandmothers Maternal and Paternal sharing 1/6
  const aliveMaternalGMs = grandmothersMaternal.filter(g => !exclusions.has(g.id));
  const alivePaternalGMs = grandmothersPaternal.filter(g => !exclusions.has(g.id));
  const totalGrandmothers = [...aliveMaternalGMs, ...alivePaternalGMs];
  if (totalGrandmothers.length > 0) {
    const fraction = 1/6;
    const shareEach = fraction / totalGrandmothers.length;
    totalGrandmothers.forEach(gm => {
      setPortions(gm.id, shareEach, `Grandmother shares 1/6 fixed quota equally with other eligible grandmothers (${fractionStr(1, 6 * totalGrandmothers.length)} each - Sunnah of the Prophet).`);
    });
  }

  // 7. Full Sisters (Quota if no brothers, no father, no sons, no daughters/granddaughters)
  const aliveFullSisters = fullSisters.filter(s => !exclusions.has(s.id));
  const fullSistersAreQuotaHeirs = aliveFullSisters.length > 0 && !father && !hasSons && !hasGrandsons && fullBrothers.length === 0 && !hasDaughters && !hasGranddaughters;
  
  if (fullSistersAreQuotaHeirs) {
    const fraction = aliveFullSisters.length === 1 ? 1/2 : 2/3;
    const shareEach = fraction / aliveFullSisters.length;
    aliveFullSisters.forEach(s => {
      const basis = aliveFullSisters.length === 1
        ? "Only full sister surviving and no primary block: Receives 1/2 fixed quota (Quran 4:176)."
        : `Full sisters share 2/3 fixed quota equally (${fractionStr(2, 3 * aliveFullSisters.length)} each) (Quran 4:176).`;
      setPortions(s.id, shareEach, basis);
    });
  }

  // 8. Consanguine Sisters (Quota if no full-sisters, full-brothers, paternal brothers, descendants, etc.)
  const alivePaternalSisters = paternalSisters.filter(s => !exclusions.has(s.id));
  const paternalSistersAreQuotaHeirs = 
    alivePaternalSisters.length > 0 && !father && !hasSons && !hasGrandsons && !hasDaughters && !hasGranddaughters &&
    fullBrothers.length === 0 && paternalBrothers.length === 0;

  if (paternalSistersAreQuotaHeirs) {
    if (aliveFullSisters.length === 0) {
      const fraction = alivePaternalSisters.length === 1 ? 1/2 : 2/3;
      const shareEach = fraction / alivePaternalSisters.length;
      alivePaternalSisters.forEach(s => {
        const basis = alivePaternalSisters.length === 1
          ? "No full siblings survive: Receives 1/2 fixed quota as paternal half-sister (Quran 4:176)."
          : `No full siblings survive: Paternal half-sisters share 2/3 fixed quota equally (${fractionStr(2, 3 * alivePaternalSisters.length)} each).`;
        setPortions(s.id, shareEach, basis);
      });
    } else if (aliveFullSisters.length === 1) {
      // Completes 2/3 alongside 1 full sister, taking 1/6
      const fraction = 1/6;
      const shareEach = fraction / alivePaternalSisters.length;
      alivePaternalSisters.forEach(s => {
        setPortions(s.id, shareEach, `Completes maximum 2/3 female sibling share alongside 1 full sister, receiving an equal share of 1/6 (${fractionStr(1, 6 * alivePaternalSisters.length)} each).`);
      });
    }
  }

  // 9. Uterine Siblings (Quota if no children, grandchildren, father, grandfather)
  const aliveUterineBrothers = uterineBrothers.filter(b => !exclusions.has(b.id));
  const aliveUterineSisters = uterineSisters.filter(s => !exclusions.has(s.id));
  const totalUterines = [...aliveUterineBrothers, ...aliveUterineSisters];
  if (totalUterines.length > 0) {
    const fraction = totalUterines.length === 1 ? 1/6 : 1/3;
    const shareEach = fraction / totalUterines.length; // Divided EQUALLY between males and females in Sharia
    totalUterines.forEach(ut => {
      const basis = totalUterines.length === 1
        ? "Single uterine sibling: Receives 1/6 fixed quota (Quran 4:12)."
        : `Multiple uterine siblings: Share 1/3 fixed quota equally (${fractionStr(1, 3 * totalUterines.length)} each) irrespective of gender (Quran 4:12).`;
      setPortions(ut.id, shareEach, basis);
    });
  }

  // Apply exclusions inside the output
  exclusions.forEach((reason, id) => {
    const item = results.find(r => r.id === id);
    if (item) {
      item.status = 'Excluded';
      item.exclusionReason = reason;
      item.shareFraction = '0';
      item.sharePercentage = 0;
      item.shareAmount = 0;
    }
  });

  // Calculate sum of fixed quota portions
  let sumFixedPortions = 0;
  portions.forEach((val) => {
    sumFixedPortions += val;
  });

  // --- RESIDUARY CALCULATIONS (Asabah) ---
  // Those who inherit whatever remains after fixed portions are fulfilled.
  // Group 1: Sons and Daughters (Asabah Bil-Ghayr)
  const activeSons = sons.filter(s => !exclusions.has(s.id));
  const activeDaughters = daughters.filter(d => !exclusions.has(d.id));
  
  // Group 2: Grandsons and Granddaughters (Asabah Bil-Ghayr)
  const activeGrandsons = grandsons.filter(s => !exclusions.has(s.id));
  const activeGranddaughters = granddaughters.filter(d => !exclusions.has(d.id));

  // Group 3: Father / Grandfather (receiving residual of female descendant case)
  // Group 4: Full Brothers and Sisters
  const activeFullBrothers = fullBrothers.filter(b => !exclusions.has(b.id));
  const activeFullSisters = fullSisters.filter(s => !exclusions.has(s.id));

  // Group 5: Paternal Sibling Asabah
  const activePaternalBrothers = paternalBrothers.filter(b => !exclusions.has(b.id));
  const activePaternalSisters = paternalSisters.filter(s => !exclusions.has(s.id));

  // Let's check if there is an active residuary group. Sharia states residuaries inherit in strict order of proximity:
  // 1. Son(s) + Daughter(s) (always have highest priority if both/any alive)
  // 2. Grandson(s) + Granddaughter(s)
  // 3. Father (acting as residuary in Gharrawain or if there are children or no descendants)
  // 4. Grandfather
  // 5. Full Brother(s) + Full Sister(s)
  // 6. Paternal Brother(s) + Paternal Sister(s)

  let residuaryGroup: 'None' | 'Children' | 'Grandchildren' | 'Father' | 'Grandfather' | 'Siblings' | 'PaternalSiblings' = 'None';
  let totalResiduaryPortions = 0; // standard portions of 24
  let residuaryMembers: { id: string; relative: Relative; weight: number }[] = [];

  if (activeSons.length > 0) {
    residuaryGroup = 'Children';
    // Son weight = 2, Daughter weight = 1
    activeSons.forEach(s => residuaryMembers.push({ id: s.id, relative: s, weight: 2 }));
    activeDaughters.forEach(d => residuaryMembers.push({ id: d.id, relative: d, weight: 1 }));
  } else if (activeGrandsons.length > 0) {
    residuaryGroup = 'Grandchildren';
    activeGrandsons.forEach(gs => residuaryMembers.push({ id: gs.id, relative: gs, weight: 2 }));
    activeGranddaughters.forEach(gd => residuaryMembers.push({ id: gd.id, relative: gd, weight: 1 }));
  } else if (father && (fatherIsPureResiduary || hasDaughters || hasGranddaughters)) {
    residuaryGroup = 'Father';
    residuaryMembers.push({ id: father.id, relative: father, weight: 1 });
  } else if (grandfather && !exclusions.has(grandfather.id) && !father && (fatherIsPureResiduary || hasDaughters || hasGranddaughters)) {
    residuaryGroup = 'Grandfather';
    residuaryMembers.push({ id: grandfather.id, relative: grandfather, weight: 1 });
  } else if (activeFullBrothers.length > 0) {
    residuaryGroup = 'Siblings';
    activeFullBrothers.forEach(b => residuaryMembers.push({ id: b.id, relative: b, weight: 2 }));
    activeFullSisters.forEach(s => residuaryMembers.push({ id: s.id, relative: s, weight: 1 }));
  } else if (activeFullSisters.length > 0 && (hasDaughters || hasGranddaughters)) {
    // Sis acts as Asabah Ma'al Ghayr (takes remaining after kids)
    residuaryGroup = 'Siblings';
    activeFullSisters.forEach(s => residuaryMembers.push({ id: s.id, relative: s, weight: 1 }));
  } else if (activePaternalBrothers.length > 0) {
    residuaryGroup = 'PaternalSiblings';
    activePaternalBrothers.forEach(b => residuaryMembers.push({ id: b.id, relative: b, weight: 2 }));
    activePaternalSisters.forEach(s => residuaryMembers.push({ id: s.id, relative: s, weight: 1 }));
  } else if (activePaternalSisters.length > 0 && (hasDaughters || hasGranddaughters)) {
    // Paternal sisters act as Asabah Ma'al Ghayr
    residuaryGroup = 'PaternalSiblings';
    activePaternalSisters.forEach(s => residuaryMembers.push({ id: s.id, relative: s, weight: 1 }));
  }

  // Let's resolve the state of the math: Perfect, Awl, or Radd.
  let adjustmentType: 'Perfect' | 'Awl' | 'Radd' = 'Perfect';
  let adjustmentExplanation = '';

  const totalFixedPortions = Math.round(sumFixedPortions * 1000) / 1000;

  if (totalFixedPortions > baseDenom) {
    // CASE 1: AL-AWL (Fractions exceed 1)
    // All portions are reduced proportionately by increasing the denominator.
    // Base denominator increases to sum of all fixed portions.
    adjustmentType = 'Awl';
    const oldDenom = baseDenom;
    baseDenom = Math.round(totalFixedPortions);
    adjustmentExplanation = `Al-Awl (Proportionate reduction): Total fixed shares (${fractionStr(oldDenom, oldDenom)} + ${fractionStr(Math.round(totalFixedPortions - oldDenom), oldDenom)}) exceed 1. Sum of numerators increases the base denominator from ${oldDenom} to ${baseDenom}, reducing each beneficiary's share proportionally to ensure perfect distribution.`;

    // Residuaries get 0
    residuaryMembers.forEach(m => {
      portions.set(m.id, 0);
      const item = results.find(r => r.id === m.id);
      if (item) {
        item.status = 'Excluded';
        item.shareFraction = '0';
        item.exclusionReason = "Excluded because the fixed-quota shares (Furood) completely exhausted the estate, invoking Al-Awl.";
      }
    });

  } else if (totalFixedPortions < baseDenom && residuaryMembers.length > 0) {
    // CASE 2: PERFECT / HAS RESIDUARY (Fractions less than 1, leftovers go to Residuaries)
    const residuePortions = baseDenom - totalFixedPortions;
    const totalWeights = residuaryMembers.reduce((acc, m) => acc + m.weight, 0);

    residuaryMembers.forEach(m => {
      // Residuary gets portion = (weight / totalWeights) * residuePortions
      const userPortion = (m.weight / totalWeights) * residuePortions;
      
      // If already has fixed share (e.g. Father has 1/6 + Residue), add to it!
      const current = portions.get(m.id) || 0;
      portions.set(m.id, current + userPortion);

      const item = results.find(r => r.id === m.id);
      if (item) {
        item.status = 'Heir';
        
        let basis = '';
        if (residuaryGroup === 'Children') {
          basis = m.relative.relationship === 'son'
            ? "Acts as primary residuary (Asabah bil-ghayr) receiving 2 portions for every 1 portion a daughter receives (Quran 4:11)."
            : "Acts as primary residuary alongside brothers, receiving a 1 portion weight ratio.";
        } else if (residuaryGroup === 'Grandchildren') {
          basis = "Acts as residuary of son lineage, receiving shares in a 2:1 brother-sister ratio.";
        } else if (residuaryGroup === 'Father') {
          basis = "Receives remaining residue of the estate as Father Residuary after fulfilling fixed daughter/grandmother quotas.";
        } else if (residuaryGroup === 'Grandfather') {
          basis = "Receives remaining residue of the estate as Grandfather Residuary in absence of the father.";
        } else if (residuaryGroup === 'Siblings') {
          basis = m.relative.relationship === 'full_brother'
            ? "Acts as Residuary (Asabah), receiving residue in a 2:1 sibling ratio."
            : "Acts as Residuary (Asabah) alongside brothers, or as Residuary with daughters (Ma'al Ghayr).";
        } else {
          basis = "Acts as paternal sibling Residuary, receiving remaining residue in 2:1 paternal ratio.";
        }

        item.shariaBasis = current > 0 
          ? `${item.shariaBasis} Additionally takes remaining residue portion of the estate.`
          : basis;
          
        item.shareFraction = fractionStr(current + userPortion, baseDenom);
      }
    });

  } else if (totalFixedPortions < baseDenom && residuaryMembers.length === 0) {
    // CASE 3: AL-RADD (Fractions less than 1, and NO Residuaries to absorb residue)
    // The residue is returned to all fixed heirs except the spouse.
    adjustmentType = 'Radd';
    
    // Check if there are only spouses
    const nonSpouseHeirs = Array.from(portions.keys()).filter(id => {
      const rel = relatives.find(r => r.id === id);
      return rel && rel.relationship !== 'spouse';
    });

    if (nonSpouseHeirs.length === 0) {
      // Spouse takes 100% in modern legal frameworks if no other relatives, but under traditional Faraid, Residue goes to treasury (Bayt al-Mal).
      // We will award it as a custom return to the spouse since modern estates do this, but explain clearly.
      const spouseHeir = Array.from(portions.keys())[0];
      portions.set(spouseHeir, baseDenom);
      const item = results.find(r => r.id === spouseHeir);
      if (item) {
        item.shareFraction = '1/1';
        item.shariaBasis = `${item.shariaBasis} Since no blood relatives exist, modern statutory rules return the entire residue to the surviving spouse.`;
      }
      adjustmentExplanation = "Al-Radd: No blood relatives exist. The entire remaining residue is returned to the surviving spouse.";
    } else {
      // Standard Radd: Spouse keeps their base share. The entire remainder is split among non-spouse heirs proportionally.
      // 1. Identify spouse portions
      let spousePortions = 0;
      Array.from(portions.keys()).forEach(id => {
        const rel = relatives.find(r => r.id === id);
        if (rel && rel.relationship === 'spouse') {
          spousePortions += portions.get(id) || 0;
        }
      });

      const portionsForNonSpouse = baseDenom - spousePortions;
      let nonSpouseSumPortions = 0;
      nonSpouseHeirs.forEach(id => {
        nonSpouseSumPortions += portions.get(id) || 0;
      });

      // Scale each non-spouse heir's portion so that their sum equals portionsForNonSpouse
      nonSpouseHeirs.forEach(id => {
        const current = portions.get(id) || 0;
        const adjusted = (current / nonSpouseSumPortions) * portionsForNonSpouse;
        portions.set(id, adjusted);

        const item = results.find(r => r.id === id);
        if (item) {
          item.shariaBasis = `${item.shariaBasis} (Included in Al-Radd return distribution of residual estate).`;
          item.shareFraction = fractionStr(adjusted, baseDenom);
        }
      });

      adjustmentExplanation = `Al-Radd (Proportionate distribution of leftovers): Total fixed quotas were less than 1. No residuaries exist. The remaining surplus of ${fractionStr(baseDenom - totalFixedPortions, baseDenom)} is proportionally returned to the blood quota-heirs, excluding the spouse (Standard Sharia Council practice).`;
    }
  }

  // Final compilation and currency allocation
  let sumDistributed = 0;
  results.forEach((r) => {
    // If Deceased
    const relative = relatives.find((rel) => rel.id === r.id);
    if (relative && !relative.isAlive) {
      r.status = 'Deceased';
      r.shareFraction = '0';
      r.sharePercentage = 0;
      r.shareAmount = 0;
      return;
    }

    const portion = portions.get(r.id) || 0;
    const finalRatio = portion / baseDenom;
    
    if (portion > 0) {
      r.status = 'Heir';
      r.sharePercentage = Math.round(finalRatio * 10000) / 100;
      r.shareAmount = Math.round(finalRatio * netEstate * 100) / 100;
      r.shareFraction = r.shareFraction !== 'Residue' ? fractionStr(portion, baseDenom) : 'Residue';
      sumDistributed += r.shareAmount;
    } else {
      if (r.status !== 'Excluded') {
        r.status = 'Excluded';
        r.exclusionReason = r.exclusionReason || "Excluded by closer surviving relatives according to Sharia rules (Al-Hajb).";
      }
      r.shareFraction = '0';
      r.sharePercentage = 0;
      r.shareAmount = 0;
    }
  });

  const residueAmount = Math.max(0, netEstate - sumDistributed);

  return {
    grossEstate,
    netEstate,
    funeralDeduction,
    debtsDeduction,
    willsDeduction,
    totalDistributed: sumDistributed,
    residueAmount,
    heirs: results,
    adjustmentType,
    adjustmentExplanation,
  };
}

function getRelationshipLabel(rel: RelationshipType, gender: 'M' | 'F'): string {
  switch (rel) {
    case 'spouse':
      return gender === 'M' ? 'Husband' : 'Wife';
    case 'father':
      return 'Father';
    case 'mother':
      return 'Mother';
    case 'son':
      return 'Son';
    case 'daughter':
      return 'Daughter';
    case 'full_brother':
      return 'Full Brother';
    case 'full_sister':
      return 'Full Sister';
    case 'consanguine_brother':
      return 'Paternal Half-Brother';
    case 'consanguine_sister':
      return 'Paternal Half-Sister';
    case 'uterine_brother':
      return 'Maternal Half-Brother';
    case 'uterine_sister':
      return 'Maternal Half-Sister';
    case 'grandson':
      return "Son's Son (Grandson)";
    case 'granddaughter':
      return "Son's Daughter (Granddaughter)";
    case 'grandfather':
      return 'Paternal Grandfather';
    case 'grandmother_maternal':
      return 'Maternal Grandmother';
    case 'grandmother_paternal':
      return 'Paternal Grandmother';
    default:
      return 'Relative';
  }
}
