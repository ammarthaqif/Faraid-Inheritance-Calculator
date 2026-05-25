/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Relative } from '../types';
import { Sparkles, Plus, Check, Loader2, RefreshCw, HelpCircle, Users } from 'lucide-react';

interface SuggestedHeir {
  relationship: 'spouse' | 'son' | 'daughter' | 'father' | 'mother';
  suggestedName: string;
  gender: 'M' | 'F';
  reasoning: string;
}

interface SmartHeirSuggesterProps {
  deceasedName: string;
  deceasedGender: 'M' | 'F';
  currentRelatives: Relative[];
  onAddRelative: (relative: Relative) => void;
  onSetValidationMsg: (msg: string | null) => void;
  language?: 'EN' | 'AR' | 'MS';
}

const SUGGESTER_TRANSLATIONS = {
  EN: {
    suggesterTitle: "AI Smart Heir Suggester",
    suggesterBeta: "BETA",
    suggesterGenerating: "Generating first-degree Sharia primary heirs matching",
    suggesterRefresh: "Regenerate Names",
    suggesterAnalyzing: "Gemini is analyzing relationships & language status...",
    suggesterFailed: "Failed connecting to AI suggestion registry.",
    suggesterRetry: "Retry Connection",
    suggesterPropose: "Scan Deceased & Propose Heirs",
    suggesterAdded: "Added",
    suggesterAddBtn: "Add Heir",
    suggesterReady: "typical primary family members ready for entry.",
    suggesterPopulateBtn: "Populate All Suggested Heirs",
    suggesterAllAdded: "All recommended typical heirs are already registered in the directory.",
  },
  AR: {
    suggesterTitle: "مقترح الورثة الذكي بالذكاء الاصطناعي",
    suggesterBeta: "تجريبي",
    suggesterGenerating: "جاري توليد ورثة الدرجة الأولى الشرعيين لـ",
    suggesterRefresh: "إعادة توليد الأسماء",
    suggesterAnalyzing: "جاري تحليل روابط القرابة والشرعية بواسطة الذكاء الاصطناعي...",
    suggesterFailed: "فشل الاتصال بسجل مقترحات الذكاء الاصطناعي.",
    suggesterRetry: "إعادة المحاولة",
    suggesterPropose: "مسح المتوفى واقتراح الورثة الأساسيين",
    suggesterAdded: "تمت الإضافة",
    suggesterAddBtn: "إضافة وارث",
    suggesterReady: "من أقارب الدرجة الأولى جاهزون للإضافة في الشجرة.",
    suggesterPopulateBtn: "إدراج كافة الورثة المقترحين",
    suggesterAllAdded: "تم تسجيل كافة الورثة المقترحين بالفعل في الدليل.",
  },
  MS: {
    suggesterTitle: "Penyarat Waris Pintar AI",
    suggesterBeta: "BETA",
    suggesterGenerating: "Menjana waris darjah pertama Syariah sepadan",
    suggesterRefresh: "Jana Semula Nama",
    suggesterAnalyzing: "Gemini sedang menganalisis gaya bahasa & hubungan Syariah...",
    suggesterFailed: "Gagal menyambung ke daftar saranan AI.",
    suggesterRetry: "Cuba Semula Hubungan",
    suggesterPropose: "Imbas Maklumat Si Mati & Syorkan Waris",
    suggesterAdded: "Ditambahkan",
    suggesterAddBtn: "Tambah Waris",
    suggesterReady: "ahli keluarga utama bersedia untuk didaftarkan.",
    suggesterPopulateBtn: "Daftar Semua Waris Cadangan",
    suggesterAllAdded: "Semua waris utama yang disyorkan sudah berdaftar dalam direktori.",
  }
};

export default function SmartHeirSuggester({
  deceasedName,
  deceasedGender,
  currentRelatives,
  onAddRelative,
  onSetValidationMsg,
  language = 'EN',
}: SmartHeirSuggesterProps) {
  const ts = SUGGESTER_TRANSLATIONS[language];
  const [suggestions, setSuggestions] = useState<SuggestedHeir[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Fetch suggestions from backend
  const fetchSuggestions = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch('/api/faraid/suggest-heirs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deceasedName,
          deceasedGender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI suggestions');
      }

      const data = await response.json();
      if (data && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error('Invalid JSON structure returned by AI');
      }
      setHasFetched(true);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Failed connecting to AI suggestion registry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keep suggestions updated when name/gender changes on 0-state
  useEffect(() => {
    if (currentRelatives.length === 0 && !hasFetched) {
      fetchSuggestions();
    }
  }, [deceasedName, deceasedGender, currentRelatives.length, hasFetched]);

  // Check if a relationship type has already been added to avoid duplicates where illegal (like father, mother, husband)
  const isHeirAlreadyAdded = (sug: SuggestedHeir) => {
    return currentRelatives.some(
      (r) => r.relationship === sug.relationship && r.name === sug.suggestedName && r.isAlive
    );
  };

  // Helper to verify if we can add this specific relationship based on current tree composition
  const canAddRelationship = (sug: SuggestedHeir): { allowed: boolean; reason?: string } => {
    const isWife = sug.relationship === 'spouse' && sug.gender === 'F';
    const isHusband = sug.relationship === 'spouse' && sug.gender === 'M';

    const activeSpouses = currentRelatives.filter((r) => r.relationship === 'spouse' && r.isAlive);
    const activeFathers = currentRelatives.filter((r) => r.relationship === 'father' && r.isAlive);
    const activeMothers = currentRelatives.filter((r) => r.relationship === 'mother' && r.isAlive);

    if (isHusband && deceasedGender === 'M') {
      return { allowed: false, reason: "Deceased of Male gender cannot have an active Husband." };
    }
    if (isWife && deceasedGender === 'F') {
      return { allowed: false, reason: "Deceased of Female gender cannot have an active Wife." };
    }
    if (isHusband && activeSpouses.some(s => s.gender === 'M')) {
      return { allowed: false, reason: "A deceased female can specify at most 1 active Husband." };
    }
    if (isWife && activeSpouses.filter(s => s.gender === 'F').length >= 4) {
      return { allowed: false, reason: "Maximum number of wives simultaneous under Sharia is 4." };
    }
    if (sug.relationship === 'father' && activeFathers.length >= 1) {
      return { allowed: false, reason: "Deceased can only have 1 biological Father." };
    }
    if (sug.relationship === 'mother' && activeMothers.length >= 1) {
      return { allowed: false, reason: "Deceased can only have 1 biological Mother." };
    }

    return { allowed: true };
  };

  // Add individual suggestion helper
  const handleAddIndividual = (sug: SuggestedHeir) => {
    const check = canAddRelationship(sug);
    if (!check.allowed) {
      onSetValidationMsg(check.reason || "This relative cannot be added due to existing family constraints.");
      return;
    }

    onSetValidationMsg(null);
    const newRel: Relative = {
      id: 'rel-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: sug.suggestedName,
      relationship: sug.relationship,
      gender: sug.gender,
      isAlive: true,
    };
    onAddRelative(newRel);
  };

  // Add all eligible suggestions
  const handleAddAll = () => {
    onSetValidationMsg(null);
    let addedCount = 0;
    const addedList: Relative[] = [];

    suggestions.forEach((sug, index) => {
      // Must not be already added
      if (isHeirAlreadyAdded(sug)) return;

      // Check constraints dynamically as we build the list
      const tempRelatives = [...currentRelatives, ...addedList];
      const isWife = sug.relationship === 'spouse' && sug.gender === 'F';
      const isHusband = sug.relationship === 'spouse' && sug.gender === 'M';

      const activeSpouses = tempRelatives.filter((r) => r.relationship === 'spouse' && r.isAlive);
      const activeFathers = tempRelatives.filter((r) => r.relationship === 'father' && r.isAlive);
      const activeMothers = tempRelatives.filter((r) => r.relationship === 'mother' && r.isAlive);

      if (isHusband && deceasedGender === 'M') return;
      if (isWife && deceasedGender === 'F') return;
      if (isHusband && activeSpouses.some(s => s.gender === 'M')) return;
      if (isWife && activeSpouses.filter(s => s.gender === 'F').length >= 4) return;
      if (sug.relationship === 'father' && activeFathers.length >= 1) return;
      if (sug.relationship === 'mother' && activeMothers.length >= 1) return;

      const newRel: Relative = {
        id: 'rel-' + (Date.now() + index) + '-' + Math.floor(Math.random() * 1000),
        name: sug.suggestedName,
        relationship: sug.relationship,
        gender: sug.gender,
        isAlive: true,
      };
      
      addedList.push(newRel);
      onAddRelative(newRel);
      addedCount++;
    });

    if (addedCount === 0) {
      onSetValidationMsg(ts.suggesterAllAdded);
    }
  };

  // Calculate if there are any suggested heirs still left to add
  const addableSuggestionsCount = suggestions.filter(sug => !isHeirAlreadyAdded(sug) && canAddRelationship(sug).allowed).length;

  return (
    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 md:p-5 mt-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 font-display flex items-center gap-1">
              {ts.suggesterTitle}
              <span className="text-[9px] bg-emerald-700/10 text-emerald-800 px-1.5 py-0.2 rounded font-mono">{ts.suggesterBeta}</span>
            </h4>
            <p className="text-[10px] text-emerald-800">
              {ts.suggesterGenerating} <strong className="text-emerald-900">"{deceasedName}"</strong>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="flex items-center gap-1 text-[10px] bg-white border border-emerald-200 text-emerald-800 px-2 py-1 rounded-md hover:bg-emerald-50 transition-all font-semibold disabled:opacity-40 cursor-pointer"
            title="Refresh suggests"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            {ts.suggesterRefresh}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-[10px] text-emerald-800 font-medium font-mono animate-pulse">
            {ts.suggesterAnalyzing}
          </span>
        </div>
      ) : errorStatus ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-[10px] text-rose-800 font-medium italic">⚠️ {errorStatus}</p>
          <button
            type="button"
            onClick={fetchSuggestions}
            className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded cursor-pointer font-bold"
          >
            {ts.suggesterRetry}
          </button>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={fetchSuggestions}
            className="text-xs bg-emerald-700 hover:bg-emerald-600 font-semibold text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ts.suggesterPropose}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((sug, idx) => {
              const checkConstraint = canAddRelationship(sug);
              const isAdded = isHeirAlreadyAdded(sug);
              const isDisabled = isAdded || !checkConstraint.allowed;

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border text-left transition-all ${
                    isAdded
                      ? 'bg-stone-50 border-stone-200 opacity-60 text-stone-500'
                      : !checkConstraint.allowed
                      ? 'bg-stone-50 border-dashed border-stone-200 opacity-50 text-stone-400'
                      : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-850">
                        {sug.suggestedName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-medium capitalize">
                        {sug.relationship.replace('_', ' ')}
                      </span>
                      <span className={`text-[9px] px-1 font-mono font-bold rounded ${
                        sug.gender === 'M' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                      }`}>
                        {sug.gender}
                      </span>
                    </div>
                    {sug.reasoning && (
                      <p className="text-[10px] text-stone-500 leading-relaxed italic pr-2">
                        {sug.reasoning}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleAddIndividual(sug)}
                    className={`shrink-0 flex items-center justify-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                        : !checkConstraint.allowed
                        ? 'bg-stone-100 text-stone-400 border border-transparent cursor-not-allowed line-through'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-3xs hover:shadow-2xs active:scale-95'
                    }`}
                    title={!checkConstraint.allowed ? checkConstraint.reason : "Click to add into tree"}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        {ts.suggesterAdded}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        {ts.suggesterAddBtn}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {addableSuggestionsCount > 0 && (
            <div className="pt-2 border-t border-emerald-100/60 flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-medium">
                ⚡ {addableSuggestionsCount} {ts.suggesterReady}
              </span>
              <button
                type="button"
                onClick={handleAddAll}
                className="flex items-center gap-1 bg-emerald-900 text-white rounded-lg px-3 py-1.5 font-bold text-[10px] shadow-sm hover:bg-emerald-800 active:scale-95 transition-all text-center cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                {ts.suggesterPopulateBtn}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
