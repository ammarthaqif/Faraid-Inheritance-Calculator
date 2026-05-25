/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Relative, HeirResult, RelationshipType } from '../types';
import { User, ShieldAlert, Heart, RefreshCw, Layers, Camera, Check, X, RotateCcw, Upload } from 'lucide-react';
import { TRANSLATIONS } from '../lib/translations';

interface FamilyTreeProps {
  deceasedName: string;
  deceasedGender: 'M' | 'F';
  heirs: HeirResult[];
  relatives: Relative[];
  currency: string;
  onUpdateRelativePhoto?: (id: string, photo: string) => void;
  deceasedPhoto?: string;
  onUpdateDeceasedPhoto?: (photo: string) => void;
  language?: 'EN' | 'AR' | 'MS';
}

const TREE_LOCALIZATIONS = {
  EN: {
    deceasedBadge: "Deceased",
    excludedBadge: "Excluded (Hajb)",
    livingHeirBadge: "Living Heir",
    notParticipating: "Not participating",
    excludedByCloser: "Excluded by closer heirs.",
    spousesLineage: "Spouse(s)",
    noSpouseSurviving: "No spouse surviving",
    siblingsLineage: "Siblings Lineage",
    noSiblingsRegistered: "No siblings registered",
    deceasedRootBadge: "DECEASED",
    fileFallbackUpload: "File fallback upload",
  },
  AR: {
    deceasedBadge: "متوفى",
    excludedBadge: "محجوب (حجب)",
    livingHeirBadge: "وارث حي",
    notParticipating: "لا يرث",
    excludedByCloser: "محجوب من الإرث بوجود وارث أقرب.",
    spousesLineage: "الزوج/الزوجات",
    noSpouseSurviving: "لا يوجد زوج على قيد الحياة",
    siblingsLineage: "الإخوة والأخوات",
    noSiblingsRegistered: "لا يوجد إخوة مسجلين",
    deceasedRootBadge: "المتوفى صاحب التركة",
    fileFallbackUpload: "تحميل ملف كبديل للكاميرا",
  },
  MS: {
    deceasedBadge: "Meninggal",
    excludedBadge: "Terdinding (Hajb)",
    livingHeirBadge: "Waris Hidup",
    notParticipating: "Tidak mengambil bahagian",
    excludedByCloser: "Terdinding oleh waris yang lebih dekat.",
    spousesLineage: "Pasangan (Isteri/Suami)",
    noSpouseSurviving: "Tiada pasangan yang hidup",
    siblingsLineage: "Talian Saudara-saudara",
    noSiblingsRegistered: "Tiada saudara berdaftar",
    deceasedRootBadge: "SI MATI",
    fileFallbackUpload: "Muat naik file alternatif",
  }
};

export default function FamilyTree({
  deceasedName,
  deceasedGender,
  heirs,
  relatives,
  currency,
  onUpdateRelativePhoto,
  deceasedPhoto,
  onUpdateDeceasedPhoto,
  language = 'EN',
}: FamilyTreeProps) {
  
  const t = TRANSLATIONS[language];
  const tl = TREE_LOCALIZATIONS[language];
  const [portraitMode, setPortraitMode] = useState<boolean>(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStartCamera = async (id: string) => {
    setActiveCameraId(id);
    setCaptured(null);
    setCamError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' }
      });
      setStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCamError("Webcam hardware not detected or frame sandbox blocked permissions. You can drag or browse a photo file directly instead!");
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setActiveCameraId(null);
    setCaptured(null);
    setCamError(null);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCaptured(dataUrl);
      }
    }
  };

  const handleSavePhoto = () => {
    if (!captured || !activeCameraId) return;
    if (activeCameraId === 'deceased') {
      if (onUpdateDeceasedPhoto) onUpdateDeceasedPhoto(captured);
    } else {
      if (onUpdateRelativePhoto) onUpdateRelativePhoto(activeCameraId, captured);
    }
    handleStopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setCaptured(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Group relatives by generation for structural display
  const getHeirDetails = (relType: RelationshipType, customId?: string) => {
    if (customId) {
      return heirs.find((h) => h.id === customId);
    }
    return heirs.find((h) => h.relationship === relType);
  };

  const getRelativeByRef = (relType: RelationshipType, isPaternal?: boolean) => {
    return relatives.filter((r) => {
      if (r.relationship !== relType) return false;
      return true;
    });
  };

  // Helper to format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render a node in the tree
  const NodeCard = ({ name, label, relType, status, percentage, amount, fraction, gender, exclusionReason, photo, memberId }: {
    name: string;
    label: string;
    relType: RelationshipType;
    status: 'Heir' | 'Excluded' | 'Deceased';
    percentage: number;
    amount: number;
    fraction: string;
    gender: 'M' | 'F';
    exclusionReason?: string;
    photo?: string;
    memberId?: string;
    key?: string;
  }) => {
    let bgStyle = 'bg-white border-stone-200 text-stone-800';
    let statusBadge = '';

    if (status === 'Deceased') {
      bgStyle = 'bg-stone-100 border-stone-300 text-stone-400 opacity-60 line-through';
      statusBadge = tl.deceasedBadge;
    } else if (status === 'Excluded') {
      bgStyle = 'bg-amber-50/50 border-amber-200 text-stone-600';
      statusBadge = tl.excludedBadge;
    } else if (status === 'Heir') {
      bgStyle = 'bg-emerald-50 border-emerald-300 text-stone-900 shadow-sm ring-1 ring-emerald-400/20';
      statusBadge = tl.livingHeirBadge;
    }

    return (
      <div 
        className={`relative flex flex-col p-3 rounded-lg border text-xs leading-relaxed transition-all duration-300 max-w-[170px] min-w-[130px] ${bgStyle}`}
        title={exclusionReason || `${name} (${label})`}
      >
        {/* Connection anchor */}
        <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-stone-300 border-2 border-white flex items-center justify-center text-[8px] text-white" />

        <div className="flex items-center justify-between gap-1 mb-1 font-semibold text-stone-500 font-display">
          <span className="truncate">{label}</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wide font-mono uppercase ${
            status === 'Heir'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'Excluded'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-stone-200 text-stone-600'
          }`}>
            {status === 'Heir' ? `${fraction}` : status === 'Excluded' ? '0' : 'Dec'}
          </span>
        </div>

        {portraitMode && (
          <div className="flex flex-col items-center justify-center my-2 relative">
            <div className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-stone-50 flex items-center justify-center shadow-inner relative shrink-0 ${
              status === 'Heir' ? 'border-emerald-500' : 'border-stone-350'
            }`}>
              {photo ? (
                <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-6 h-6 text-stone-400" />
              )}
            </div>
            {status !== 'Deceased' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCamera(memberId || '');
                }}
                className="absolute bottom-0 right-1/2 translate-x-7 bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded-full border border-white shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title="Capture camera profile picture"
              >
                <Camera className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

        <div className="font-medium text-stone-900 truncate font-sans text-sm mb-1 text-center">
          {name}
        </div>

        {status === 'Heir' ? (
          <div className="mt-1 pt-1.5 border-t border-emerald-100 font-mono text-center">
            <div className="text-[10px] text-emerald-800 font-semibold">{percentage}%</div>
            <div className="text-xs text-stone-700 font-bold">{formatMoney(amount)}</div>
          </div>
        ) : status === 'Excluded' ? (
          <div className="mt-1 pt-1 border-t border-amber-100 text-[10px] text-amber-700 italic truncate text-center" title={exclusionReason}>
            {exclusionReason || tl.excludedByCloser}
          </div>
        ) : (
          <div className="mt-1 pt-1 border-t border-stone-200 text-[9px] text-stone-400 italic text-center">
            {tl.notParticipating}
          </div>
        )}
      </div>
    );
  };

  // 1. Gather Gen 1: Grandparents
  const grandparents = [
    ...getRelativeByRef('grandfather'),
    ...getRelativeByRef('grandmother_maternal'),
    ...getRelativeByRef('grandmother_paternal'),
  ];

  // 2. Gather Gen 2: Parents
  const parents = [
    ...getRelativeByRef('father'),
    ...getRelativeByRef('mother'),
  ];

  // 3. Spouses
  const spouses = [
    ...getRelativeByRef('spouse'),
  ];

  // 4. Siblings
  const siblings = [
    ...getRelativeByRef('full_brother'),
    ...getRelativeByRef('full_sister'),
    ...getRelativeByRef('consanguine_brother'),
    ...getRelativeByRef('consanguine_sister'),
    ...getRelativeByRef('uterine_brother'),
    ...getRelativeByRef('uterine_sister'),
  ];

  // 5. Offspring
  const children = [
    ...getRelativeByRef('son'),
    ...getRelativeByRef('daughter'),
  ];

  // 6. Grandchildren
  const grandchildren = [
    ...getRelativeByRef('grandson'),
    ...getRelativeByRef('granddaughter'),
  ];

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white rounded-xl border border-stone-100 shadow-xs space-y-8 overflow-x-auto min-w-[700px]">
      
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-100 pb-4 gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-base font-semibold text-stone-800 font-display flex items-center justify-center md:justify-start gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            {t.interactiveTreeTitle}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {t.interactiveTreeDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPortraitMode(!portraitMode)}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
            portraitMode
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          {portraitMode ? t.btnTogglePortraitActive : t.btnTogglePortrait}
        </button>
      </div>

      {/* TIER 1: Grandparents */}
      {grandparents.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center gap-4">
            {grandparents.map((p) => {
              const h = getHeirDetails(p.relationship, p.id);
              if (!h) return null;
              return (
                <NodeCard
                  key={p.id}
                  name={p.name}
                  label={h.relationshipLabel}
                  relType={p.relationship}
                  status={h.status}
                  percentage={h.sharePercentage}
                  amount={h.shareAmount}
                  fraction={h.shareFraction}
                  gender={p.gender}
                  exclusionReason={h.exclusionReason}
                  photo={p.photo}
                  memberId={p.id}
                />
              );
            })}
          </div>
          {/* Connector line down to parents */}
          <div className="w-px h-6 bg-stone-200 mt-2" />
        </div>
      )}

      {/* TIER 2: Parents */}
      {parents.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center gap-6">
            {parents.map((p) => {
              const h = getHeirDetails(p.relationship, p.id);
              if (!h) return null;
              return (
                <NodeCard
                  key={p.id}
                  name={p.name}
                  label={h.relationshipLabel}
                  relType={p.relationship}
                  status={h.status}
                  percentage={h.sharePercentage}
                  amount={h.shareAmount}
                  fraction={h.shareFraction}
                  gender={p.gender}
                  exclusionReason={h.exclusionReason}
                  photo={p.photo}
                  memberId={p.id}
                />
              );
            })}
          </div>
          <div className="w-px h-6 bg-stone-200 mt-2" />
        </div>
      )}

      {/* TIER 3: The Deceased (Root) + Spouses & Siblings */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-center gap-8 bg-stone-50/50 p-4 rounded-xl border border-stone-200/60 max-w-4xl">
          
          {/* Left Wing: Spouses */}
          {spouses.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{tl.spousesLineage}</span>
              <div className="flex gap-2">
                {spouses.map((p) => {
                  const h = getHeirDetails(p.relationship, p.id);
                  if (!h) return null;
                  return (
                    <NodeCard
                      key={p.id}
                      name={p.name}
                      label={h.relationshipLabel}
                      relType={p.relationship}
                      status={h.status}
                      percentage={h.sharePercentage}
                      amount={h.shareAmount}
                      fraction={h.shareFraction}
                      gender={p.gender}
                      exclusionReason={h.exclusionReason}
                      photo={p.photo}
                      memberId={p.id}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-stone-400 italic">{tl.noSpouseSurviving}</div>
          )}

          {/* Golden/Emerald Connector Bridge */}
          <div className="h-px w-6 bg-stone-300" />

          {/* Central Root: The Deceased */}
          <div className="relative flex flex-col items-center p-4 rounded-xl border-2 border-emerald-600 bg-stone-900 text-white text-center shadow-md min-w-[150px]">
            <div className="absolute -top-2.5 px-2 py-0.5 rounded bg-emerald-600 text-[9px] font-semibold text-white tracking-widest uppercase">
              {tl.deceasedRootBadge}
            </div>
            {portraitMode ? (
              <div className="flex flex-col items-center justify-center my-2 relative">
                <div className="w-14 h-14 rounded-full border border-emerald-500 overflow-hidden bg-stone-850 flex items-center justify-center relative select-none">
                  {deceasedPhoto ? (
                    <img src={deceasedPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCamera('deceased');
                  }}
                  className="absolute bottom-0 right-1/2 translate-x-7 bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded-full border border-white shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  title="Capture camera profile picture"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <User className="w-8 h-8 text-emerald-400 mt-1 mb-1" />
            )}
            <div className="font-semibold text-sm truncate max-w-[130px]">{deceasedName}</div>
            <div className="text-[10px] text-stone-400">{deceasedGender === 'M' ? t.patriarchMale : t.matriarchFemale}</div>
          </div>

          <div className="h-px w-6 bg-stone-305" />

          {/* Right Wing: Siblings */}
          {siblings.length > 0 ? (
            <div className="flex flex-col items-center gap-2 max-w-[280px]">
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{tl.siblingsLineage}</span>
              <div className="flex flex-wrap gap-2 justify-center max-h-[140px] overflow-y-auto p-1">
                {siblings.map((p) => {
                  const h = getHeirDetails(p.relationship, p.id);
                  if (!h) return null;
                  return (
                    <NodeCard
                      key={p.id}
                      name={p.name}
                      label={h.relationshipLabel}
                      relType={p.relationship}
                      status={h.status}
                      percentage={h.sharePercentage}
                      amount={h.shareAmount}
                      fraction={h.shareFraction}
                      gender={p.gender}
                      exclusionReason={h.exclusionReason}
                      photo={p.photo}
                      memberId={p.id}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-stone-400 italic">{tl.noSiblingsRegistered}</div>
          )}

        </div>
        
        {/* Line down to children */}
        {(children.length > 0 || grandchildren.length > 0) && (
          <div className="w-px h-8 bg-stone-200 mt-2" />
        )}
      </div>

      {/* TIER 4: Children (Descendants) */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center gap-6">
            {children.map((p) => {
              const h = getHeirDetails(p.relationship, p.id);
              if (!h) return null;
              return (
                <NodeCard
                  key={p.id}
                  name={p.name}
                  label={h.relationshipLabel}
                  relType={p.relationship}
                  status={h.status}
                  percentage={h.sharePercentage}
                  amount={h.shareAmount}
                  fraction={h.shareFraction}
                  gender={p.gender}
                  exclusionReason={h.exclusionReason}
                  photo={p.photo}
                  memberId={p.id}
                />
              );
            })}
          </div>
          {grandchildren.length > 0 && (
            <div className="w-px h-6 bg-stone-200 mt-2" />
          )}
        </div>
      )}

      {/* TIER 5: Grandchildren */}
      {grandchildren.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center gap-4">
            {grandchildren.map((p) => {
              const h = getHeirDetails(p.relationship, p.id);
              if (!h) return null;
              return (
                <NodeCard
                  key={p.id}
                  name={p.name}
                  label={h.relationshipLabel}
                  relType={p.relationship}
                  status={h.status}
                  percentage={h.sharePercentage}
                  amount={h.shareAmount}
                  fraction={h.shareFraction}
                  gender={p.gender}
                  exclusionReason={h.exclusionReason}
                  photo={p.photo}
                  memberId={p.id}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Camera Interactive Session Overlay */}
      {activeCameraId !== null && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in no-print">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="text-sm font-extrabold text-stone-850 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                {t.camHeader}
              </h4>
              <button 
                onClick={handleStopCamera}
                className="text-stone-400 hover:text-stone-750 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center">
              {captured ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-48 h-48 rounded-full border-4 border-emerald-500 overflow-hidden shadow-md">
                    <img src={captured} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-xs text-stone-500 font-medium">{t.btnTogglePortraitActive}</span>
                </div>
              ) : camError ? (
                <div className="flex flex-col items-center py-4 text-center space-y-3">
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 p-3.5 rounded-xl text-xs leading-relaxed font-sans">
                    {camError}
                  </div>
                </div>
              ) : (
                <div className="relative w-48 h-48 rounded-full border-4 border-emerald-600 overflow-hidden bg-stone-900 shadow-md">
                  <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="w-full h-full object-cover scale-x-[-1]" 
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full pointer-events-none" />
                </div>
              )}
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col items-center space-y-1 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-500">{tl.fileFallbackUpload}</span>
              <label className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                {t.camBrowseFile}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={handleStopCamera}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                {t.camCancel}
              </button>
              
              {captured ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCaptured(null)}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t.camRetake}
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t.camSave}
                  </button>
                </>
              ) : (
                !camError && (
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Camera className="w-4 h-4" />
                    {t.camTake}
                  </button>
                )
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
