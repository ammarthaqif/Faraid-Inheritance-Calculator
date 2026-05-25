/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Relative, EstateDetails, CalculationResult } from './types';
import { PRESETS, ScenarioPreset } from './defaultData';
import { calculateFaraid } from './faraidEngine';
import FamilyTree from './components/FamilyTree';
import AIAdvisor from './components/AIAdvisor';
import LegalCertificate from './components/LegalCertificate';
import SmartHeirSuggester from './components/SmartHeirSuggester';
import ConfirmationModal from './components/ConfirmationModal';
import { TRANSLATIONS, SupportedLanguages } from './lib/translations';
import QRCode from 'qrcode';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  saveScenario,
  deleteScenario,
  fetchUserScenarios,
  SavedScenario
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import {
  Coins,
  DollarSign,
  Users,
  Plus,
  Trash2,
  BookOpen,
  Scale,
  Award,
  Sparkles,
  GitFork,
  FileSpreadsheet,
  Globe,
  Info,
  ChevronRight,
  HeartCrack,
  UserCheck,
  Share2,
  QrCode,
  Save,
  LogIn,
  LogOut,
  FolderOpen,
  Copy,
  CheckCircle,
  RefreshCw,
  X,
  Search,
  SlidersHorizontal,
  Clock,
  History,
  Calculator
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'SAR', symbol: 'SR', label: 'Saudi Riyal (SR)' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit (RM)' },
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah (Rp)' },
  { code: 'AED', symbol: 'DH', label: 'UAE Dirham (DH)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' }
];

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse (Husband / Wife)' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'full_brother', label: 'Full Brother' },
  { value: 'full_sister', label: 'Full Sister' },
  { value: 'consanguine_brother', label: 'Paternal Brother (Half-Bro)' },
  { value: 'consanguine_sister', label: 'Paternal Sister (Half-Sis)' },
  { value: 'uterine_brother', label: 'Maternal Brother (Uterine)' },
  { value: 'uterine_sister', label: 'Maternal Sister (Uterine)' },
  { value: 'grandson', label: "Grandson (Son's Son)" },
  { value: 'granddaughter', label: "Granddaughter (Son's Daughter)" },
  { value: 'grandfather', label: 'Paternal Grandfather' },
  { value: 'grandmother_maternal', label: 'Maternal Grandmother' },
  { value: 'grandmother_paternal', label: 'Paternal Grandmother' }
];

export default function App() {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState<SupportedLanguages>('EN');
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'inputs' | 'tree' | 'breakdown' | 'certificate'>('inputs');

  // Deceased State
  const [deceasedName, setDeceasedName] = useState('Abdur-Rahman');
  const [deceasedGender, setDeceasedGender] = useState<'M' | 'F'>('M');

  // Estate Financials
  const [estate, setEstate] = useState<EstateDetails>({
    grossValue: 500000,
    funeralExpenses: 3000,
    debtsValue: 12000,
    willsValue: 15000,
  });

  // Living/Registered Relatives State
  const [relatives, setRelatives] = useState<Relative[]>(PRESETS[0].relatives);

  // Search and Sort State for Heirs Directory
  const [listSearch, setListSearch] = useState('');
  const [listSortBy, setListSortBy] = useState<'recent' | 'name' | 'relationship'>('recent');

  const [expandedHeirs, setExpandedHeirs] = useState<Record<string, boolean>>({});
  const [historyList, setHistoryList] = useState<{
    timestamp: string;
    calculation: CalculationResult;
    relativesCount: number;
    description: string;
  }[]>([]);

  const filteredAndSortedRelatives = useMemo(() => {
    let result = [...relatives];

    // Filter by search term
    if (listSearch.trim() !== '') {
      const query = listSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.relationship.toLowerCase().includes(query)
      );
    }

    // Sort
    if (listSortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (listSortBy === 'relationship') {
      result.sort((a, b) => a.relationship.localeCompare(b.relationship));
    }

    return result;
  }, [relatives, listSearch, listSortBy]);

  // New Relative Register State
  const [newRelRelationship, setNewRelRelationship] = useState<string>('son');
  const [newRelName, setNewRelName] = useState<string>('');

  // Firebase Auth & Scenarios State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSourceScenarioId, setMergeSourceScenarioId] = useState<string>('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [deceasedPhoto, setDeceasedPhoto] = useState<string | undefined>(undefined);
  const handleUpdateRelativePhoto = (id: string, photo: string) => {
    setRelatives(prev => prev.map(r => r.id === id ? { ...r, photo } : r));
  };

  useEffect(() => {
    if (showQrCode && qrCanvasRef.current && activeScenarioId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?scenarioId=${activeScenarioId}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        shareUrl,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#1c1917',
            light: '#fcfbf7'
          }
        },
        (error) => {
          if (error) console.error("QR Code Error:", error);
        }
      );
    }
  }, [showQrCode, activeScenarioId]);

  // Confirmation Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRelGender, setNewRelGender] = useState<'M' | 'F'>('M');
  const [newRelIsAlive, setNewRelIsAlive] = useState<boolean>(true);

  // Active validation warning messages
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  // Authentication Setup & Initial Shared Param Scan
  useEffect(() => {
    // Initial fetch of any shared scenarioId from url query param
    const checkSharedLink = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedId = urlParams.get('scenarioId');
      if (sharedId) {
        try {
          const docSnap = await getDoc(doc(db, 'scenarios', sharedId));
          if (docSnap.exists()) {
            const data = docSnap.data() as SavedScenario;
            setDeceasedName(data.deceasedName);
            setDeceasedGender(data.deceasedGender);
            setEstate({
              grossValue: data.grossValue,
              funeralExpenses: data.funeralExpenses,
              debtsValue: data.debtsValue,
              willsValue: data.willsValue,
            });
            setRelatives(data.relatives);
            setCurrency(data.currency || 'USD');
            setActiveScenarioId(sharedId);
            setNewScenarioName(data.title);
            setValidationMsg(`Loaded shared inheritance scenario: "${data.title}" successfully.`);
          }
        } catch (error) {
          console.error("Failed to load shared scenario URL:", error);
        }
      }
    };
    checkSharedLink();

    // Listen to Firebase auth changes
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const list = await fetchUserScenarios();
          setSavedScenarios(list);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSavedScenarios([]);
        setActiveScenarioId(null);
      }
    });

    return () => unsub();
  }, []);

  // Refresh scenarios list
  const loadScenariosList = async () => {
    try {
      const list = await fetchUserScenarios();
      setSavedScenarios(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      await loadScenariosList();
    } catch (e) {
      console.error("Login issue:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setActiveScenarioId(null);
      setNewScenarioName('');
      setLastSavedTime(null);
    } catch (e) {
      console.error("Logout issue:", e);
    }
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setValidationMsg("Please log in with Google to persist your family scenarios.");
      return;
    }
    const title = newScenarioName.trim() || `Scenario for ${deceasedName}`;
    setIsSaving(true);
    setValidationMsg(null);
    try {
      const resultId = await saveScenario({
        title,
        deceasedName,
        deceasedGender,
        grossValue: estate.grossValue,
        funeralExpenses: estate.funeralExpenses,
        debtsValue: estate.debtsValue,
        willsValue: estate.willsValue,
        currency,
        relatives,
      }, activeScenarioId || undefined);

      if (resultId) {
        setActiveScenarioId(resultId);
        setNewScenarioName(title);
        setLastSavedTime(new Date().toLocaleTimeString());
        await loadScenariosList();
      }
    } catch (err: any) {
      setValidationMsg(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    try {
      await deleteScenario(id);
      if (activeScenarioId === id) {
        setActiveScenarioId(null);
        setNewScenarioName('');
        setLastSavedTime(null);
      }
      await loadScenariosList();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLoadScenarioObj = (scen: SavedScenario) => {
    setDeceasedName(scen.deceasedName);
    setDeceasedGender(scen.deceasedGender);
    setEstate({
      grossValue: scen.grossValue,
      funeralExpenses: scen.funeralExpenses,
      debtsValue: scen.debtsValue,
      willsValue: scen.willsValue,
    });
    setRelatives(scen.relatives);
    setCurrency(scen.currency || 'USD');
    setActiveScenarioId(scen.id);
    setNewScenarioName(scen.title);
    setValidationMsg(null);
    setActiveTab('inputs');
  };

  const handleShareLink = () => {
    if (!activeScenarioId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?scenarioId=${activeScenarioId}`;
    navigator.clipboard.writeText(shareUrl);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 4000);
  };

  const handleMergeScenario = (sourceId: string) => {
    const sourceScen = savedScenarios.find(s => s.id === sourceId);
    if (!sourceScen) return;

    setValidationMsg(null);
    const originalCount = relatives.length;
    let addedCount = 0;

    // Merge relatives with active name validation and Sharia-caps validation
    const updatedRelatives = [...relatives];

    sourceScen.relatives.forEach((item) => {
      // Prevent duplicate names
      const isNameDup = updatedRelatives.some(
        (r) => r.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
      if (isNameDup) return;

      // Ensure we don't violate single parent/limit controls
      const activeFathers = updatedRelatives.filter((r) => r.relationship === 'father' && r.isAlive).length;
      const activeMothers = updatedRelatives.filter((r) => r.relationship === 'mother' && r.isAlive).length;
      const activeWives = updatedRelatives.filter((r) => r.relationship === 'spouse' && r.gender === 'F' && r.isAlive).length;
      const activeHusbands = updatedRelatives.filter((r) => r.relationship === 'spouse' && r.gender === 'M' && r.isAlive).length;

      if (item.relationship === 'father' && activeFathers >= 1) return;
      if (item.relationship === 'mother' && activeMothers >= 1) return;
      if (item.relationship === 'spouse') {
        if (item.gender === 'F' && activeWives >= 4) return;
        if (item.gender === 'M' && activeHusbands >= 1) return;
      }

      const mergedRel: Relative = {
        ...item,
        id: 'merged-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      };

      updatedRelatives.push(mergedRel);
      addedCount++;
    });

    setRelatives(updatedRelatives);
    setValidationMsg(`Merged family tree: ported ${addedCount} non-duplicate relatives from "${sourceScen.title}" into your current tree successfully.`);
    setIsMerging(false);
  };

  // Apply scenario preset
  const handleApplyPreset = (preset: ScenarioPreset) => {
    setDeceasedName(preset.deceasedName);
    setDeceasedGender(preset.deceasedGender);
    setEstate(preset.estate);
    setRelatives(preset.relatives);
    setActiveTab('inputs');
  };

  // Run Calculations
  const calculation: CalculationResult = useMemo(() => {
    return calculateFaraid(deceasedGender, deceasedName, relatives, estate);
  }, [deceasedGender, deceasedName, relatives, estate]);

  const prevCalcref = React.useRef<CalculationResult | null>(null);

  useEffect(() => {
    if (!calculation) return;
    
    if (!prevCalcref.current) {
      prevCalcref.current = calculation;
      return;
    }

    const isNewNetEstate = prevCalcref.current.netEstate !== calculation.netEstate;
    const isNewHeirsCount = prevCalcref.current.heirs.length !== calculation.heirs.length;
    const isAnyShareChanged = prevCalcref.current.heirs.some((h, idx) => {
      const match = calculation.heirs[idx];
      return !match || match.shareAmount !== h.shareAmount;
    });

    if (isNewNetEstate || isNewHeirsCount || isAnyShareChanged) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let description = "Modified financials";
      if (prevCalcref.current.heirs.length !== calculation.heirs.length) {
        const diff = calculation.heirs.length - prevCalcref.current.heirs.length;
        description = diff > 0 ? `Registered +${diff} family member(s)` : `Removed ${Math.abs(diff)} member(s)`;
      } else {
        description = "Adjusted estate values";
      }

      setHistoryList(prev => {
        const updated = [{
          timestamp,
          calculation: prevCalcref.current!,
          relativesCount: prevCalcref.current!.heirs.length,
          description
        }, ...prev];
        return updated.slice(0, 3);
      });

      prevCalcref.current = calculation;
    }
  }, [calculation]);

  // Handle financial input changes
  const handleFinancialChange = (key: keyof EstateDetails, value: number) => {
    setEstate((prev) => ({
      ...prev,
      [key]: value < 0 ? 0 : value,
    }));
  };

  // Enforce Co-dependent logical constraints for the Form UI
  const getGenderForRelationship = (rel: string): 'M' | 'F' => {
    if (rel === 'son' || rel === 'father' || rel === 'full_brother' || rel === 'consanguine_brother' || rel === 'uterine_brother' || rel === 'grandson' || rel === 'grandfather') {
      return 'M';
    }
    if (rel === 'daughter' || rel === 'mother' || rel === 'full_sister' || rel === 'consanguine_sister' || rel === 'uterine_sister' || rel === 'granddaughter' || rel === 'grandmother_maternal' || rel === 'grandmother_paternal') {
      return 'F';
    }
    // Spouse matches opposite of Deceased gender
    return deceasedGender === 'M' ? 'F' : 'M';
  };

  const handleRelationshipChange = (rel: string) => {
    setNewRelRelationship(rel);
    setNewRelGender(getGenderForRelationship(rel));
  };

  // Add Relative Handler
  const handleAddRelative = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);

    const relName = newRelName.trim() || `${newRelRelationship.charAt(0).toUpperCase() + newRelRelationship.slice(1).replace('_', ' ')} #${relatives.filter(r => r.relationship === newRelRelationship).length + 1}`;

    // Apply strict maximum Sharia relationship constraints in the input form:
    const husbandCount = relatives.filter(r => r.relationship === 'spouse' && r.gender === 'M' && r.isAlive).length;
    const wifeCount = relatives.filter(r => r.relationship === 'spouse' && r.gender === 'F' && r.isAlive).length;
    const fatherCount = relatives.filter(r => r.relationship === 'father' && r.isAlive).length;
    const motherCount = relatives.filter(r => r.relationship === 'mother' && r.isAlive).length;
    const grandfatherCount = relatives.filter(r => r.relationship === 'grandfather' && r.isAlive).length;

    // 1. Spouses
    if (newRelRelationship === 'spouse') {
      if (deceasedGender === 'M') {
        if (newRelGender === 'M') {
          setValidationMsg("Deceased of Male gender cannot have a husband.");
          return;
        }
        if (wifeCount >= 4 && newRelIsAlive) {
          setValidationMsg("Islamic rule restricts to a maximum of 4 active wives simultaneously.");
          return;
        }
      } else {
        if (newRelGender === 'F') {
          setValidationMsg("Deceased of Female gender cannot have a wife.");
          return;
        }
        if (husbandCount >= 1 && newRelIsAlive) {
          setValidationMsg("Islamic rules restrict to 1 husband simultaneously.");
          return;
        }
      }
    }

    // 2. Parents & Grandfather
    if (newRelRelationship === 'father' && fatherCount >= 1 && newRelIsAlive) {
      setValidationMsg("Deceased can only have 1 biological Father.");
      return;
    }
    if (newRelRelationship === 'mother' && motherCount >= 1 && newRelIsAlive) {
      setValidationMsg("Deceased can only have 1 biological Mother.");
      return;
    }
    if (newRelRelationship === 'grandfather' && grandfatherCount >= 1 && newRelIsAlive) {
      setValidationMsg("Maximum of 1 paternal grandfather represented.");
      return;
    }

    const newId = 'rel-' + Date.now();
    const newRelative: Relative = {
      id: newId,
      name: relName,
      relationship: newRelRelationship as any,
      gender: newRelGender,
      isAlive: newRelIsAlive,
    };

    setRelatives((prev) => [...prev, newRelative]);
    setNewRelName('');
    
    // Clear and reset form relation based on locks
    setNewRelRelationship('son');
    setNewRelGender('M');
    setNewRelIsAlive(true);

    // Clear search filter so that the newly added relative is visible in the directory
    setListSearch('');

    // Automatically scroll to the new entry
    setTimeout(() => {
      const el = document.getElementById(`relative-entry-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Briefly apply a high-contrast highlight styling block
        el.classList.add('bg-emerald-50/70', 'ring-2', 'ring-emerald-500/20');
        setTimeout(() => {
          el.classList.remove('bg-emerald-50/70', 'ring-2', 'ring-emerald-500/20');
        }, 1800);
      }
    }, 150);
  };

  // Remove relative
  const handleRemoveRelative = (id: string) => {
    setRelatives((prev) => prev.filter((r) => r.id !== id));
  };

  const triggerRemoveConfirm = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      handleRemoveRelative(deleteTargetId);
      setDeleteTargetId(null);
    }
    setIsDeleteModalOpen(false);
  };

  const handleToggleAlive = (id: string) => {
    setRelatives((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAlive: !r.isAlive } : r))
    );
  };

  // Get active currency details
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // CSV Exporter for local data download
  const downloadCSV = () => {
    const headers = [
      'Beneficiary Name',
      'Relationship',
      'Biological Gender',
      'Sharia Status',
      'Faraid Share Fraction',
      'Fraction Value (%)',
      `Allocated Cash Value (${currency})`,
      'Sharia Supporting Rationale / Exclusion Basis'
    ];

    const rows = calculation.heirs.map((h) => [
      h.name,
      h.relationshipLabel,
      h.gender,
      h.status,
      h.status === 'Heir' ? h.shareFraction : '0',
      h.status === 'Heir' ? `${h.sharePercentage}%` : '0%',
      h.status === 'Heir' ? h.shareAmount : 0,
      h.status === 'Heir' ? h.shariaBasis : (h.exclusionReason || 'Excluded')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Faraid_Distribution_${deceasedName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      
      {/* Decorative Sharia Top Rail Header */}
      <header className="no-print bg-stone-900 border-b border-stone-800 text-white shadow-md relative overflow-hidden">
        
        {/* Subtle geometric background motif */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700/80 p-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-center">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display tracking-tight text-white">{t.appName}</h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono tracking-wider font-semibold">SHARIA COMPLIANT</span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-stone-400">{t.langSelectLabel}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguages)}
                className="bg-stone-850 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-505 font-semibold cursor-pointer"
              >
                <option value="EN">English</option>
                <option value="AR">العربية (Arabic)</option>
                <option value="MS">Bahasa Melayu (Malay)</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-stone-400">{t.currencyText}:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-stone-850 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 font-semibold cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Container Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6 relative">
        
        {/* Left main column: Tabs controls & Scenario Details */}
        <div className="flex-1 flex flex-col space-y-6">
               {/* Top Panel Grid: Study Presets & Cloud Scenarios Persistence Layer */}
          <div className="no-print grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className="xl:col-span-6 bg-white rounded-xl p-5 border border-stone-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  {t.presetsTitle}
                </h3>
                <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                  {t.presetsSubtitle}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="group relative flex flex-col p-2.5 rounded-lg border border-stone-200 text-left bg-stone-55 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer"
                    >
                      <div className="font-semibold text-xs text-stone-850 group-hover:text-emerald-950 font-display flex items-center justify-between">
                        <span>{preset.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-all" />
                      </div>
                      <p className="text-[9px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Right Col: Cloud Scenario Persist & Merge Tree */}
            <section className="xl:col-span-6 bg-white rounded-xl p-5 border border-stone-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-105 pb-2 mb-3">
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse animate-duration-3000" />
                    {t.vaultTitle}
                  </h3>
                  {currentUser ? (
                    <button
                      onClick={handleLogout}
                      className="text-[10px] text-stone-500 hover:text-stone-800 font-bold uppercase flex items-center gap-1 border border-stone-200 rounded px-1.5 py-0.5 bg-stone-50 bg-opacity-70 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      {t.signOut}
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold uppercase flex items-center gap-1 border border-emerald-300 rounded px-1.5 py-0.5 bg-emerald-50 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      {t.googleLogin}
                    </button>
                  )}
                </div>

                {!currentUser ? (
                  <div className="flex flex-col justify-center items-center py-4 text-center">
                    <p className="text-xs text-stone-500 leading-relaxed max-w-sm mb-3">
                      {t.googleLoginSubtitle}
                    </p>
                    <button
                      onClick={handleLogin}
                      className="text-xs font-bold px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs border border-emerald-800"
                    >
                      <LogIn className="w-4 h-4" />
                      {t.googleLogin}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Save form */}
                    <form onSubmit={handleSaveScenario} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/50 flex gap-2 items-center">
                      <div className="flex-1 min-w-0">
                        <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{t.scenarioTitle}</label>
                        <input
                          type="text"
                          placeholder="e.g. Al-Faraidh Case Tree..."
                          value={newScenarioName}
                          onChange={(e) => setNewScenarioName(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-stone-200 p-1 text-stone-900 focus:outline-hidden focus:border-emerald-600 rounded"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="text-xs font-bold px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded flex items-center gap-1.5 h-10 cursor-pointer self-end-override"
                        title="Save Changes"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? t.btnSaving : t.btnSave}
                      </button>
                    </form>

                    {/* HUD Status / Share option */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[10px] text-stone-500 border-b border-stone-100 pb-3">
                      <div>
                        {activeScenarioId ? (
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                            {t.activeCloudCase}
                          </span>
                        ) : (
                          <span className="bg-stone-150 text-stone-600 px-1.5 py-0.5 rounded font-mono text-[9px]">
                            {t.localWorkspace}
                          </span>
                        )}
                        {lastSavedTime && <span className="ml-2 font-mono">{t.savedAt} {lastSavedTime}</span>}
                      </div>

                      {activeScenarioId && (
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={handleShareLink}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250 rounded px-2 py-1 font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="Generate Shareable Public Link"
                            >
                              <Share2 className="w-3 h-3" />
                              {shareSuccess ? t.linkCopied : t.copyShareLink}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowQrCode(!showQrCode)}
                              className={`border rounded px-2  py-1 font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                showQrCode 
                                  ? 'bg-emerald-800 text-white border-emerald-900' 
                                  : 'bg-stone-55 hover:bg-stone-100 text-stone-700 border-stone-250'
                              }`}
                              title="Generate QR Code"
                            >
                              <QrCode className="w-3 h-3" />
                              {showQrCode ? t.hideQr : t.scanQr}
                            </button>
                          </div>
                          
                          {showQrCode && (
                            <div className="bg-[#FAF9F6] p-2.5 rounded-lg border border-stone-250 mt-1 flex flex-col items-center shadow-3xs text-center">
                              <canvas ref={qrCanvasRef} className="w-[110px] h-[110px] rounded border border-stone-200 bg-white" />
                              <span className="text-[8px] font-mono font-bold text-stone-500 mt-1 uppercase tracking-wide">
                                {t.scanToImportCase}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scenario Selector, Delete & Merge options */}
                    {savedScenarios.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                            Stored Cloud Scenario Directory
                          </label>
                          <span className="text-[9px] font-mono font-bold text-emerald-700">
                            {savedScenarios.length} cases
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select
                            onChange={(e) => {
                              const s = savedScenarios.find(item => item.id === e.target.value);
                              if (s) handleLoadScenarioObj(s);
                            }}
                            value={activeScenarioId || ''}
                            className="flex-1 bg-stone-50 border border-stone-200 text-stone-800 text-xs rounded p-2 focus:outline-hidden focus:border-emerald-500 font-semibold"
                          >
                            <option value="">-- Choose a Saved Scenario --</option>
                            {savedScenarios.map((scen) => (
                              <option key={scen.id} value={scen.id}>
                                {scen.title} ({scen.relatives.length} relatives)
                              </option>
                            ))}
                          </select>

                          {activeScenarioId && (
                            <button
                              type="button"
                              onClick={() => handleDeleteScenario(activeScenarioId)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 p-2 rounded cursor-pointer transition-all"
                              title="Delete Stored Scenario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Integration: Combining/Merging multiple family trees */}
                        <div className="bg-emerald-50/10 p-2.5 rounded-lg border border-emerald-10/20 mt-1.5">
                          <div className="flex justify-between items-center mb-1 bg-emerald-50/40 p-1.5 rounded">
                            <span className="text-[10px] font-bold text-emerald-950 font-mono flex items-center gap-1">
                              <GitFork className="w-3.5 h-3.5 text-emerald-600 shrink-0 rotate-90" />
                              Marriage Tree Merger Engine
                            </span>
                            <span className="text-[9px] text-emerald-800 italic">Combine family members</span>
                          </div>
                          <p className="text-[9px] text-stone-500 mb-2 leading-normal">
                            When relatives of two different trees marry, easily incorporate all distinct relatives from another saved scenario in a single click!
                          </p>
                          <div className="flex gap-1.5">
                            <select
                              value={mergeSourceScenarioId}
                              onChange={(e) => setMergeSourceScenarioId(e.target.value)}
                              className="flex-1 bg-white border border-stone-200 text-[10px] rounded p-1 focus:outline-hidden text-stone-800 font-semibold"
                            >
                              <option value="">-- Select tree to merge --</option>
                              {savedScenarios.filter(s => s.id !== activeScenarioId).map((scen) => (
                                <option key={scen.id} value={scen.id}>
                                  {scen.title}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                if (mergeSourceScenarioId) handleMergeScenario(mergeSourceScenarioId);
                              }}
                              disabled={!mergeSourceScenarioId}
                              className="text-[10px] font-bold px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded flex items-center gap-1 cursor-pointer transition-all"
                            >
                              Merge Trees
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Navigation tabs row - Hidden in print */}
          <div className="no-print flex border-b border-stone-200 gap-2">
            {[
              { id: 'inputs', label: t.tabInputs, icon: Users },
              { id: 'breakdown', label: t.tabBreakdown, icon: Award },
              { id: 'tree', label: t.tabTree, icon: GitFork },
              { id: 'certificate', label: t.tabCertificate, icon: FileSpreadsheet },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-display text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                      : 'border-transparent text-stone-500 hover:text-stone-850 hover:border-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT 1: INPUTS */}
          {activeTab === 'inputs' && (
            <div className="no-print flex flex-col md:grid md:grid-cols-12 gap-6">
              
              {/* Deceased & Estate Accounts Form */}
              <div className="md:col-span-6 bg-white p-6 rounded-xl border border-stone-200/60 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-stone-850 font-display flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  {t.part1DeceasedTitle}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.deceasedNameLabel}</label>
                    <input
                      type="text"
                      value={deceasedName}
                      onChange={(e) => setDeceasedName(e.target.value)}
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.genderLabel}</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeceasedGender('M');
                          // Filter out husband from spouse list if changing deceased gender to male
                          setRelatives((prev) => prev.filter(r => !(r.relationship === 'spouse' && r.gender === 'M')));
                        }}
                        className={`flex-1 text-xs py-2 px-4 rounded-lg font-semibold transition-all border cursor-pointer ${
                          deceasedGender === 'M'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {t.patriarchMale}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeceasedGender('F');
                          // Filter out wives from spouse list if changing deceased gender to female
                          setRelatives((prev) => prev.filter(r => !(r.relationship === 'spouse' && r.gender === 'F')));
                        }}
                        className={`flex-1 text-xs py-2 px-4 rounded-lg font-semibold transition-all border cursor-pointer ${
                          deceasedGender === 'F'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {t.matriarchFemale}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-stone-100 my-2 pt-3">
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.grossEstateVal} ({currentCurrency.symbol})</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-stone-400 text-xs">{currentCurrency.symbol}</span>
                      </div>
                      <input
                        type="number"
                        value={estate.grossValue}
                        onChange={(e) => handleFinancialChange('grossValue', Number(e.target.value))}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-8 p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600 font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.funeralExpenses}</label>
                      <input
                        type="number"
                        value={estate.funeralExpenses}
                        onChange={(e) => handleFinancialChange('funeralExpenses', Number(e.target.value))}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.outDebts}</label>
                      <input
                        type="number"
                        value={estate.debtsValue}
                        onChange={(e) => handleFinancialChange('debtsValue', Number(e.target.value))}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{t.willsBequests}</label>
                      <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded italic">{t.willsNote}</span>
                    </div>
                    <input
                      type="number"
                      value={estate.willsValue}
                      onChange={(e) => handleFinancialChange('willsValue', Number(e.target.value))}
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                    {estate.willsValue > (estate.grossValue - estate.funeralExpenses - estate.debtsValue) / 3 && (
                      <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                        {t.willsWarning}
                      </span>
                    )}
                  </div>
                </div>

                {/* Post-calculation simple tally */}
                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">{t.netDistributedVal}</span>
                    <span className="text-base font-bold text-stone-900 font-mono">{formatMoney(calculation.netEstate)}</span>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-full text-emerald-800">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Heirs registry form */}
              <div className="md:col-span-6 bg-white p-6 rounded-xl border border-stone-200/60 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-stone-850 font-display flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  {t.part2RegisterHeirsTitle}
                </h3>

                {validationMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                    <HeartCrack className="w-4 h-4 text-rose-700" />
                    <span>{validationMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddRelative} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.relationshipLabel}</label>
                      <select
                        value={newRelRelationship}
                        onChange={(e) => handleRelationshipChange(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600"
                      >
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.relativeNameLabel}</label>
                      <input
                        type="text"
                        placeholder="e.g. Fatima, Bilal..."
                        value={newRelName}
                        onChange={(e) => setNewRelName(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:outline-hidden focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.genderLabel}</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRelGender('M')}
                          disabled={newRelRelationship !== 'spouse'} // lock is co-dependent except spouse
                          className={`flex-1 text-center text-xs p-1.5 rounded transition-all border cursor-pointer ${
                            newRelGender === 'M'
                              ? 'bg-stone-850 text-white border-stone-900'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 disabled:opacity-40'
                          }`}
                        >
                          {t.maleLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRelGender('F')}
                          disabled={newRelRelationship !== 'spouse'}
                          className={`flex-1 text-center text-xs p-1.5 rounded transition-all border cursor-pointer ${
                            newRelGender === 'F'
                              ? 'bg-stone-850 text-white border-stone-900'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 disabled:opacity-40'
                          }`}
                        >
                          {t.femaleLabel}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">{t.vitalStatusLabel}</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRelIsAlive(true)}
                          className={`flex-1 text-center text-xs p-1.5 rounded transition-all border cursor-pointer ${
                            newRelIsAlive
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {t.aliveLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRelIsAlive(false)}
                          className={`flex-1 text-center text-xs p-1.5 rounded transition-all border cursor-pointer ${
                            !newRelIsAlive
                              ? 'bg-rose-700 text-white border-rose-800'
                              : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {t.deceasedLabel}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full text-xs font-semibold py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-850 rounded-lg flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer mt-4 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t.registerBtn}
                  </button>
                </form>

                <SmartHeirSuggester
                  deceasedName={deceasedName}
                  deceasedGender={deceasedGender}
                  currentRelatives={relatives}
                  onAddRelative={(newRel) => setRelatives((prev) => [...prev, newRel])}
                  onSetValidationMsg={setValidationMsg}
                  language={language}
                />
                          {/* List of currently registered relatives */}
              <div className="col-span-12 bg-white rounded-xl border border-stone-200/60 p-6 shadow-xs">
                <h3 className="text-sm font-semibold text-stone-850 font-display flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-4">
                  <GitFork className="w-5 h-5 text-emerald-600" />
                  {t.part3ActiveDirectoryTitle} ({relatives.length})
                </h3>

                {relatives.length > 0 && (
                  <div className="no-print mb-5 bg-[#FAF9F6]/80 p-4 rounded-xl border border-stone-150 space-y-4">
                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="flex-1 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Search className="h-4 w-4 text-stone-400" />
                        </span>
                        <input
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={listSearch}
                          onChange={(e) => setListSearch(e.target.value)}
                          className="w-full text-xs bg-white border border-stone-200 pl-9 pr-4 py-2 text-stone-900 focus:outline-hidden focus:border-emerald-600 rounded-lg shadow-2xs font-medium"
                        />
                        {listSearch && (
                          <button
                            type="button"
                            onClick={() => setListSearch('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          {t.sortByLabel}
                        </span>
                        <select
                          value={listSortBy}
                          onChange={(e) => setListSortBy(e.target.value as any)}
                          className="bg-white border border-stone-200 text-stone-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 font-semibold shadow-2xs cursor-pointer"
                        >
                          <option value="recent">{t.sortByRecent}</option>
                          <option value="name">{t.sortByName}</option>
                          <option value="relationship">{t.sortByRelationship}</option>
                        </select>
                      </div>
                    </div>

                    {/* Detailed Theological Status Legend */}
                    <div className="bg-white p-3.5 rounded-lg border border-stone-200/50 space-y-3 shadow-3xs">
                      <div className="flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                        <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono">
                          {t.legendTitle}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-stone-600">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 shrink-0 select-none" />
                            <span className="font-bold text-emerald-800 uppercase tracking-wide text-[10px] font-mono">
                              {t.legendAliveTitle}
                            </span>
                          </div>
                          <p className="text-stone-500 pl-4 font-normal leading-normal">
                            {t.legendAliveDesc}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600 shrink-0 select-none" />
                            <span className="font-bold text-rose-800 uppercase tracking-wide text-[10px] font-mono">
                              {t.legendDeceasedTitle}
                            </span>
                          </div>
                          <p className="text-stone-500 pl-4 font-normal leading-normal">
                            {t.legendDeceasedDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {relatives.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 italic">
                    No family relatives added yet. Click preset templates above to see mock scenarios or construct your family tree below.
                  </div>
                ) : filteredAndSortedRelatives.length === 0 ? (
                  <div className="text-center py-6 text-xs text-stone-400 italic bg-stone-50 rounded-lg border border-dashed border-stone-200">
                    No registered heirs match your search filter: "{listSearch}".
                  </div>
                ) : (
                  <>
                    {/* SCREEN VIEW (TABLE SYSTEM) */}
                    <div className="overflow-x-auto print:hidden">
                      <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-mono">
                          <tr>
                            <th className="p-3">{t.tableHeadBeneficiary}</th>
                            <th className="p-3">{t.tableHeadRelationship}</th>
                            <th className="p-3 text-center">{t.tableHeadGender}</th>
                            <th className="p-3 text-center">{t.tableHeadVitalStatus}</th>
                            <th className="p-3 text-right">{t.tableHeadInteract}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                          {filteredAndSortedRelatives.map((rel) => (
                            <tr key={rel.id} id={`relative-entry-${rel.id}`} className="hover:bg-stone-50/50 transition-all select-all-target">
                              <td className="p-3 font-semibold text-stone-850">{rel.name}</td>
                              <td className="p-3 font-medium text-stone-500">
                                {rel.relationship.charAt(0).toUpperCase() + rel.relationship.slice(1).replace('_', ' ')}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                  rel.gender === 'M' ? 'bg-blue-50 text-blue-800' : 'bg-pink-50 text-pink-800'
                                }`}>
                                  {rel.gender === 'M' ? t.maleLabel : t.femaleLabel}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAlive(rel.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border cursor-pointer transition-all ${
                                    rel.isAlive
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {rel.isAlive ? t.aliveLabel : t.deceasedLabel}
                                </button>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => triggerRemoveConfirm(rel.id)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                  title="Remove relative"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* PRINT VIEW (MORE READABLE CARD GRID OVERRIDE FORMAT) */}
                    <div className="hidden print:grid print:grid-cols-2 print:gap-4 w-full pt-2">
                      {filteredAndSortedRelatives.map((rel) => (
                        <div 
                          key={`print-card-${rel.id}`} 
                          className="p-3.5 rounded-lg border border-stone-300 bg-white shadow-none space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-center border-b border-stone-250 pb-1.5">
                            <span className="font-extrabold text-stone-900 text-[13px] tracking-tight">{rel.name}</span>
                            <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 border rounded ${
                              rel.gender === 'M' ? 'bg-blue-50/50 text-blue-900 border-blue-200' : 'bg-pink-50/50 text-pink-900 border-pink-200'
                            }`}>
                              {rel.gender === 'M' ? t.maleLabel : t.femaleLabel}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-stone-400 font-bold font-mono leading-none mb-1">{t.tableHeadRelationship}</span>
                              <span className="font-bold text-stone-850">
                                {rel.relationship.charAt(0).toUpperCase() + rel.relationship.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-stone-400 font-bold font-mono leading-none mb-1">{t.tableHeadVitalStatus}</span>
                              <span className={`font-bold ${rel.isAlive ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {rel.isAlive ? t.aliveLabel : t.deceasedLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>    </div>

            </div>
          )}

          {/* TAB CONTENT 2: BREAKDOWN TABLE */}
          {activeTab === 'breakdown' && (() => {
            const chartData = calculation.heirs
              .filter((h) => h.status === 'Heir' && h.sharePercentage > 0)
              .map((h) => ({
                name: h.name,
                role: h.relationshipLabel,
                value: h.sharePercentage,
                amount: h.shareAmount,
              }));

            const PIE_COLORS = [
              '#0f766e', // deep teal
              '#0d9488', // teal
              '#14b8a6', // bright teal
              '#0284c7', // light blue
              '#0369a1', // dark blue
              '#2563eb', // royal blue
              '#3b82f6', // blue
              '#10b981', // emerald
              '#059669', // dark emerald
              '#4ade80'  // light green
            ];

            return (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Main calculations & breakdown (8 cols) */}
                <div className="xl:col-span-8 bg-white p-6 rounded-xl border border-stone-200/60 shadow-xs space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-base font-semibold text-stone-850 font-display">
                        Formal Sharia Calculations & Math Adjustments
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Displays final percentages and fractional divisions assigned directly by Quranic quotas or residuary divisions.
                      </p>
                    </div>
                    
                    <button
                      onClick={downloadCSV}
                      className="no-print flex items-center justify-center gap-1.5 bg-stone-105 hover:bg-stone-200 text-stone-800 text-xs px-3.5 py-2 rounded-lg border border-stone-200 cursor-pointer active:scale-95 transition-all text-center font-semibold"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      Export to CSV / Excel
                    </button>
                  </div>

                  {/* Summary Pie Chart / Data Visualization */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-stone-50/50 p-5 rounded-xl border border-stone-150">
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white rounded-lg border border-stone-200/60 p-4 min-h-[290px]">
                      <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider font-mono mb-3 text-center">
                        Visual Share Breakdown (%)
                      </h4>
                      {chartData.length === 0 ? (
                        <div className="text-center text-stone-400 py-12 text-xs italic">
                          No active heirs found with non-zero shares.
                        </div>
                      ) : (
                        <div className="w-full h-[210px] relative flex justify-center items-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any, name: any, props: any) => [
                                  `${value}% (${formatMoney(props.payload.amount)})`,
                                  name
                                ]}
                                contentStyle={{
                                  background: '#1c1917',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontSize: '11px',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Center donut text */}
                          <div className="absolute text-center pointer-events-none">
                            <span className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-widest block font-sans">Net Tarkah</span>
                            <span className="text-xs font-extrabold text-stone-800 font-mono block mt-0.5">{formatMoney(calculation.netEstate)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider font-mono mb-1">
                          Active Beneficiary Registry Ledger
                        </h4>
                        <p className="text-[11px] text-stone-500 leading-relaxed mb-3">
                          Each relative inherits based on fixed mathematical allocations (Fard) or residuary properties (Asabah) with absolute equity in Islamic inheritance jurisprudence.
                        </p>
                        
                        {chartData.length === 0 ? (
                          <div className="text-xs text-stone-400 italic py-6">
                            No family members qualify as legitimate heirs.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[175px] overflow-y-auto pr-1">
                            {chartData.map((item, index) => (
                              <div 
                                key={index} 
                                className="bg-white px-3 py-2 rounded-lg border border-stone-200/55 flex items-center justify-between shadow-2xs hover:shadow-xs transition-with-all"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span 
                                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/5" 
                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-850 truncate">{item.name}</p>
                                    <p className="text-[9px] text-stone-400 truncate">{item.role}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2 font-mono">
                                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {item.value}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-200/60 mt-4 flex justify-between items-center text-[10px] font-mono text-stone-400">
                        <span>LEGEND: SHARIA COLOR CHIPS</span>
                        <span>TOTAL SHARES EQUALS: 100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Adjustment Notice */}
                  {calculation.adjustmentExplanation && (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl flex gap-3 text-xs leading-relaxed text-stone-700">
                      <Info className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 font-display">Adjustment type active: {calculation.adjustmentType}</span>
                        <p className="mt-0.5 text-stone-605">{calculation.adjustmentExplanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Heirs table */}
                  <div className="overflow-x-auto border border-stone-100 rounded-lg">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-500 uppercase tracking-widest text-[9px] font-mono">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Name & Role</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-center">Fraction</th>
                          <th className="p-3 text-center">Percentage</th>
                          <th className="p-3 text-right">Share Capital</th>
                          <th className="p-3">Quranic Supporting Basis / Exclusion Factor</th>
                          <th className="p-3 text-center">Audit Math</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700 leading-relaxed">
                        {calculation.heirs.map((h, idx) => {
                          const isExpanded = !!expandedHeirs[h.id];
                          return (
                            <React.Fragment key={h.id}>
                              <tr className={h.status === 'Heir' ? 'bg-white font-medium' : 'bg-stone-50/50 text-stone-400'}>
                                <td className="p-3 font-mono text-[11px]">{idx + 1}</td>
                                <td className="p-3">
                                  <div className="font-bold text-stone-850 text-[12.5px]">{h.name}</div>
                                  <div className="text-[10px] text-stone-400 font-medium">{h.relationshipLabel}</div>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    h.status === 'Heir'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : h.status === 'Excluded'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-stone-200 text-stone-600'
                                  }`}>
                                    {h.status === 'Heir' ? 'HEIR' : h.status === 'Excluded' ? 'EXCLUDED' : 'DECEASED'}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono font-extrabold text-stone-850">
                                  {h.status === 'Heir' ? h.shareFraction : '0'}
                                </td>
                                <td className="p-3 text-center font-mono text-stone-850">
                                  {h.status === 'Heir' ? `${h.sharePercentage}%` : '0%'}
                                </td>
                                <td className="p-3 text-right font-mono font-bold text-stone-900 text-xs shrink-0">
                                  {h.status === 'Heir' ? formatMoney(h.shareAmount) : '$0.00'}
                                </td>
                                <td className="p-3 text-[11px] leading-normal text-stone-500 italic max-w-xs">
                                  {h.status === 'Heir' ? h.shariaBasis : h.exclusionReason}
                                </td>
                                <td className="p-3 text-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedHeirs(prev => ({ ...prev, [h.id]: !prev[h.id] }))}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                                      isExpanded
                                        ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-800'
                                        : 'bg-stone-100 hover:bg-stone-205 text-stone-705 border-stone-250 hover:shadow-2xs'
                                    }`}
                                  >
                                    {isExpanded ? 'Hide' : 'Audit Math'}
                                  </button>
                                </td>
                              </tr>
                              
                              {isExpanded && (
                                <tr className="bg-emerald-50/10">
                                  <td colSpan={8} className="p-4 border-t border-stone-200/60 font-sans text-xs text-stone-750">
                                    <div className="bg-[#FAF9F6] p-4 rounded-xl border border-stone-200 shadow-3xs space-y-3">
                                      <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                                        <span className="font-extrabold text-[11px] text-emerald-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                                          <Calculator className="w-4 h-4 text-emerald-600 shrink-0" />
                                          Math Allocation Derivation & Verification
                                        </span>
                                        <span className="text-[10px] text-stone-400 font-mono">Code Ref: {h.id}</span>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Step 1: Base Fractional Allocation */}
                                        <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                                          <div className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">
                                            Step 1: Quranic Baseline
                                          </div>
                                          <p className="font-bold text-stone-850 text-xs">
                                            Sharia Fraction: <span className="text-emerald-800 font-mono text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{h.status === 'Heir' ? h.shareFraction : '0'}</span>
                                          </p>
                                          <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                                            Determined as standard fard quota (like childless spouses, parents) or dynamic residuary (Asabah) formulas.
                                          </p>
                                        </div>

                                        {/* Step 2: System Scale Factor */}
                                        <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                                          <div className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">
                                            Step 2: Compliance Scale
                                          </div>
                                          <p className="font-bold text-stone-850 text-xs">
                                            Adjustment Class: <span className="text-stone-700 font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded border border-stone-150">{calculation.adjustmentType}</span>
                                          </p>
                                          <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                                            {calculation.adjustmentType === 'Perfect' ? (
                                              "Fractions naturally sum up to exactly one. No numerical rescale required."
                                            ) : calculation.adjustmentType === 'Awl' ? (
                                              "Sum exceeded 1. Fractions were downscaled proportionally (Awl) to avoid asset deficit."
                                            ) : (
                                              "Sum fell short of 1 with no residue heirs left. Portion upscaled (Radd) to absorb remaining surplus."
                                            )}
                                          </p>
                                        </div>

                                        {/* Step 3: Exact Multiplication Formula */}
                                        <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                                          <div className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-widest font-mono">
                                            Step 3: Multiplication
                                          </div>
                                          <div className="font-mono text-[11px] text-stone-800 space-y-1 font-medium">
                                            <div className="flex justify-between border-b border-stone-100 pb-0.5">
                                              <span className="text-[10px] text-stone-400 font-sans">Net Distributable:</span>
                                              <span>{formatMoney(calculation.netEstate)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-stone-100 py-0.5">
                                              <span className="text-[10px] text-stone-400 font-sans">Calculated Share %:</span>
                                              <span>{h.status === 'Heir' ? `${h.sharePercentage}%` : '0%'}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-emerald-800 pt-0.5 text-xs">
                                              <span className="text-[10px] font-sans">Allocation Capital:</span>
                                              <span>{h.status === 'Heir' ? formatMoney(h.shareAmount) : '$0.00'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-[10.5px] bg-white p-2.5 rounded-lg border border-stone-200 border-l-3 border-l-emerald-600 block leading-relaxed italic text-stone-605">
                                        <strong>Quran & Jurisprudential Basis:</strong> {h.status === 'Heir' ? h.shariaBasis : h.exclusionReason}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Calculation History Sidebar (4 cols) */}
                <div className="xl:col-span-4 bg-white p-6 rounded-xl border border-stone-200/60 shadow-xs space-y-4 no-print">
                  <div>
                    <h3 className="text-sm font-bold text-stone-850 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-stone-150 pb-2">
                      <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                      Calculations History snapshot
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                      Compares the current live scenario against up to 3 previous states to audit how member removals impact distributions.
                    </p>
                  </div>

                  {historyList.length === 0 ? (
                    <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-stone-400 text-xs leading-relaxed py-8">
                      <History className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                      No previous calculations found in current session. Make alterations (add/remove family members or edit finances) to record states.
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {historyList.map((item, index) => (
                        <div key={index} className="p-3.5 bg-stone-50/50 rounded-xl border border-stone-200/80 hover:border-emerald-600/30 transition-all space-y-2.5 relative">
                          <div className="flex justify-between items-center bg-stone-100/70 px-2 py-1 rounded-md">
                            <span className="text-[10px] font-bold text-stone-500 font-mono">
                              SNAPSHOT {index + 1}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono bg-white px-1.5 py-0.5 rounded shadow-3xs">
                              {item.timestamp}
                            </span>
                          </div>
                          
                          <div className="text-[11.5px] font-sans">
                            <p className="font-bold text-stone-750">
                              Primary Action: <span className="text-emerald-850 font-semibold">{item.description}</span>
                            </p>
                            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mt-1 border-b border-stone-200/50 pb-1.5 font-medium">
                              <span>Net Distributable (Tarkah):</span>
                              <span className="font-extrabold text-stone-800">{formatMoney(item.calculation.netEstate)}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <span className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-widest block font-mono">
                              Portion Shifts vs Current:
                            </span>
                            <div className="divide-y divide-stone-200/40">
                              {item.calculation.heirs.map(prevHeir => {
                                const curHeir = calculation.heirs.find(ch => ch.id === prevHeir.id);
                                const prevShare = prevHeir.status === 'Heir' ? prevHeir.sharePercentage : 0;
                                const curShare = curHeir && curHeir.status === 'Heir' ? curHeir.sharePercentage : 0;
                                const diff = curShare - prevShare;
                                
                                return (
                                  <div key={prevHeir.id} className="flex justify-between items-center py-1.5 text-[11px]">
                                    <span className="font-semibold text-stone-700 truncate max-w-[120px]" title={prevHeir.name}>
                                      {prevHeir.name} <span className="text-[9.5px] text-stone-400 font-normal">({prevHeir.relationshipLabel})</span>
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-stone-400 font-mono text-[10px]">{prevShare}%</span>
                                      <span className="text-stone-300">→</span>
                                      <span className="font-bold text-stone-850 font-mono text-[10px]">{curShare}%</span>
                                      {diff !== 0 && (
                                        <span className={`font-mono text-[9px] px-1 py-0.5 rounded leading-none font-bold ${
                                          diff > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          {diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400 leading-relaxed italic bg-stone-50/50 p-2.5 rounded-lg border border-stone-150">
                    💡 <strong>Jurisprudential Fact:</strong> If any close core relatives (like children) are removed or deceased, the residue (Asabah) increases and expands wider to include siblings or collateral heirs.
                  </div>
                </div>

              </div>
            )})()}

          {/* TAB CONTENT 3: FAMILY TREE GRAPH */}
          {activeTab === 'tree' && (
            <FamilyTree
              deceasedName={deceasedName}
              deceasedGender={deceasedGender}
              heirs={calculation.heirs}
              relatives={relatives}
              currency={currency}
              onUpdateRelativePhoto={handleUpdateRelativePhoto}
              deceasedPhoto={deceasedPhoto}
              onUpdateDeceasedPhoto={setDeceasedPhoto}
              language={language}
            />
          )}

          {/* TAB CONTENT 4: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <LegalCertificate
              deceasedName={deceasedName}
              deceasedGender={deceasedGender}
              calculation={calculation}
              currency={currency}
              language={language}
            />
          )}

        </div>

        {/* Right main column sidebar: Faraid AI Consultant (Always visible except when printing) */}
        <div className="no-print w-full lg:w-[350px] shrink-0 sticky top-6">
          <AIAdvisor
            calculationData={calculation}
            deceasedName={deceasedName}
            deceasedGender={deceasedGender}
          />
        </div>

      </main>

      <footer className="no-print mt-auto bg-stone-900 border-t border-stone-800 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Sharia estate planners group. Al-Faraidh mathematical calculator conforms strictly to Quran Surah An-Nisa (4:11, 12, 176).</p>
          <p className="mt-1 text-stone-600 text-[10px]">Important: Faraid certificate generation is meant for personal learning and local draft documentation. Secure certification must be executed by certified Sharia courts or local registry administrators.</p>
        </div>
      </footer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Remove Family Heirs"
        message="Are you sure you want to remove this family member from the active directory? Their assigned shares will be re-calculated."
        confirmText="Remove Member"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

    </div>
  );
}
