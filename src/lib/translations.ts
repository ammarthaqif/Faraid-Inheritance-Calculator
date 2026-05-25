/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  currencyText: string;
  langSelectLabel: string;
  tabInputs: string;
  tabBreakdown: string;
  tabTree: string;
  tabCertificate: string;
  presetsTitle: string;
  presetsSubtitle: string;
  vaultTitle: string;
  signOut: string;
  googleLogin: string;
  googleLoginSubtitle: string;
  scenarioTitle: string;
  btnSave: string;
  btnSaving: string;
  activeCloudCase: string;
  localWorkspace: string;
  savedAt: string;
  copyShareLink: string;
  linkCopied: string;
  scanQr: string;
  hideQr: string;
  scanToImportCase: string;
  part1DeceasedTitle: string;
  deceasedNameLabel: string;
  patriarchMale: string;
  matriarchFemale: string;
  grossEstateVal: string;
  funeralExpenses: string;
  outDebts: string;
  willsBequests: string;
  willsNote: string;
  willsWarning: string;
  netDistributedVal: string;
  part2RegisterHeirsTitle: string;
  relationshipLabel: string;
  relativeNameLabel: string;
  genderLabel: string;
  maleLabel: string;
  femaleLabel: string;
  vitalStatusLabel: string;
  aliveLabel: string;
  deceasedLabel: string;
  registerBtn: string;
  part3ActiveDirectoryTitle: string;
  searchPlaceholder: string;
  sortByLabel: string;
  sortByRecent: string;
  sortByName: string;
  sortByRelationship: string;
  legendTitle: string;
  legendAliveTitle: string;
  legendAliveDesc: string;
  legendDeceasedTitle: string;
  legendDeceasedDesc: string;
  tableHeadBeneficiary: string;
  tableHeadRelationship: string;
  tableHeadGender: string;
  tableHeadVitalStatus: string;
  tableHeadInteract: string;
  interactiveTreeTitle: string;
  interactiveTreeDesc: string;
  btnTogglePortrait: string;
  btnTogglePortraitActive: string;
  tierGrandparents: string;
  tierParents: string;
  tierSiblings: string;
  tierDeceasedRoot: string;
  tierChildrenSpouses: string;
  tierGrandchildren: string;
  camHeader: string;
  camBrowseFile: string;
  camCancel: string;
  camRetake: string;
  camSave: string;
  camTake: string;
  mathExplanationTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2DescPerfect: string;
  step2DescAwl: string;
  step2DescRadd: string;
  step3Title: string;
  step3Net: string;
  step3SharePercent: string;
  step3Alloc: string;
  mathExplanationFooter: string;
  exportCsvBtn: string;
  visualShareBreakdown: string;
  beneficiaryLedgerTitle: string;
  beneficiaryLedgerDesc: string;
  totalSharesEquals: string;
  tableHeadStatus: string;
  tableHeadFraction: string;
  tableHeadPercentage: string;
  tableHeadCapital: string;
  tableHeadBasis: string;
  tableHeadAuditMath: string;
  auditMathHide: string;
}

export type SupportedLanguages = 'EN' | 'AR' | 'MS';

export const TRANSLATIONS: Record<SupportedLanguages, TranslationDictionary> = {
  EN: {
    appName: "Al-Faraid Inheritance Calculator",
    appSubtitle: "Sunni Jurisprudence Legal Distribution & Interactive Genealogy Tree Assistant",
    currencyText: "Valuation Currency",
    langSelectLabel: "Language",
    tabInputs: "Inputs & Active Family",
    tabBreakdown: "Inheritance Breakdown Table",
    tabTree: "Visual Family Tree Graph",
    tabCertificate: "Legal Certificate Document",
    presetsTitle: "Preloaded Theological Study Presets",
    presetsSubtitle: "Select classical juridical templates of Sunni inheritance models (Faraid) to study how different heirs shift distributed portions.",
    vaultTitle: "Secure Custom Inheritance Vault",
    signOut: "Sign Out",
    googleLogin: "Google Login",
    googleLoginSubtitle: "Sign in via Google to persist custom family charts, download reports, generate guest links, or merge two trees together.",
    scenarioTitle: "Scenario Title",
    btnSave: "Save",
    btnSaving: "Saving...",
    activeCloudCase: "ACTIVE: CLOUD CASE SYNCED",
    localWorkspace: "LOCAL WORKSPACE ONLY (CLICK SAVE)",
    savedAt: "Saved at",
    copyShareLink: "Copy Share Link",
    linkCopied: "Link Copied!",
    scanQr: "Scan QR",
    hideQr: "Hide QR",
    scanToImportCase: "Scan to Import Case",
    part1DeceasedTitle: "Part I: Deceased Patriarch & Total Estate Liquid Accounts",
    deceasedNameLabel: "Deceased Name",
    patriarchMale: "Patriarch (Male)",
    matriarchFemale: "Matriarch (Female)",
    grossEstateVal: "Gross Estate Value (Tarkah)",
    funeralExpenses: "Pre-Distribution Funeral Expenses",
    outDebts: "Outstanding Debts & Liabilities",
    willsBequests: "Wills & Bequests (Wasiyyah)",
    willsNote: "Quran cap: Max 1/3 of net assets",
    willsWarning: "⚠️ Capped at the maximum Sharia 1/3 limit.",
    netDistributedVal: "Net Distributed Value (Tarkah)",
    part2RegisterHeirsTitle: "Part II: Register Family Members & Heirs",
    relationshipLabel: "Relationship",
    relativeNameLabel: "Relative Name",
    genderLabel: "Gender",
    maleLabel: "Male",
    femaleLabel: "Female",
    vitalStatusLabel: "Vital Status",
    aliveLabel: "Alive",
    deceasedLabel: "Deceased",
    registerBtn: "Register Heir Into Tree",
    part3ActiveDirectoryTitle: "Part III: Active Registered Relatives Directory",
    searchPlaceholder: "Search heirs by name or relationship...",
    sortByLabel: "Sort By",
    sortByRecent: "Recent (Insertion Order)",
    sortByName: "Alphanumeric (A-Z Name)",
    sortByRelationship: "Relationship Model",
    legendTitle: "Vital Status Jurisprudential Legend",
    legendAliveTitle: "Alive Status (Active Participator)",
    legendAliveDesc: "Heir is living at the moment of the patriarch's passing. Under Sharia, they possess direct inheritance rights and can actively exclude others (Hajb) or reduce their shares.",
    legendDeceasedTitle: "Deceased Status (Predeceased)",
    legendDeceasedDesc: "Heir passed away before the patriarch. Islamic law operates on a strict non-representation model. Predeceased members receive 0.00%; they do not pass quotas, nor do they exercise exclusion rules.",
    tableHeadBeneficiary: "Beneficiary Name",
    tableHeadRelationship: "Relationship Label",
    tableHeadGender: "Gender",
    tableHeadVitalStatus: "Vital Status",
    tableHeadInteract: "Interaction Commands",
    interactiveTreeTitle: "Interactive Sharia Family Structure Tree",
    interactiveTreeDesc: "Visualizes the genealogical grid connecting the deceased person (root focus) with all relatives.",
    btnTogglePortrait: "Toggle Portrait Mode",
    btnTogglePortraitActive: "Portrait Mode: ACTIVE",
    tierGrandparents: "TIER 1: Grandparents",
    tierParents: "TIER 2: Biological Parents",
    tierSiblings: "TIER 2.5: Collateral Siblings Grid",
    tierDeceasedRoot: "DECEASED ROOT FOCUS",
    tierChildrenSpouses: "TIER 3: Core Spouses & Descendants",
    tierGrandchildren: "TIER 4: Lineage Grandchildren",
    camHeader: "Capture Profile Portrait",
    camBrowseFile: "Browse JPG or PNG file",
    camCancel: "Cancel",
    camRetake: "Retake",
    camSave: "Save Portrait",
    camTake: "Take Photo",
    mathExplanationTitle: "Math Allocation Derivation & Verification",
    step1Title: "Step 1: Quranic Baseline",
    step1Desc: "Determined as standard fard quota (like childless spouses, parents) or dynamic residuary (Asabah) formulas.",
    step2Title: "Step 2: Compliance Scale",
    step2DescPerfect: "Fractions naturally sum up to exactly one. No numerical rescale required.",
    step2DescAwl: "Sum exceeded 1. Fractions were downscaled proportionally (Awl) to avoid asset deficit.",
    step2DescRadd: "Sum fell short of 1 with no residue heirs left. Portion upscaled (Radd) to absorb remaining surplus.",
    step3Title: "Step 3: Multiplication Formula",
    step3Net: "Net Distributable:",
    step3SharePercent: "Calculated Share %:",
    step3Alloc: "Allocation Capital:",
    mathExplanationFooter: "Quran & Jurisprudential Basis",
    exportCsvBtn: "Export to CSV / Excel",
    visualShareBreakdown: "Visual Share Breakdown (%)",
    beneficiaryLedgerTitle: "Active Beneficiary Registry Ledger",
    beneficiaryLedgerDesc: "Each relative inherits based on fixed mathematical allocations (Fard) or residuary properties (Asabah) with absolute equity.",
    totalSharesEquals: "TOTAL SHARES EQUALS: 100%",
    tableHeadStatus: "Status",
    tableHeadFraction: "Fraction",
    tableHeadPercentage: "Percentage",
    tableHeadCapital: "Share Capital",
    tableHeadBasis: "Quranic Supporting Basis / Exclusion Factor",
    tableHeadAuditMath: "Audit Math",
    auditMathHide: "Hide",
  },
  AR: {
    appName: "حاسبة المواريث والفرائض",
    appSubtitle: "تقسيم التركة الشرعي وفق المذهب السني ومساعد شجرة العائلة التفاعلي",
    currencyText: "عملة التقييم",
    langSelectLabel: "اللغة",
    tabInputs: "المدخلات والعائلة النشطة",
    tabBreakdown: "جدول تقسيم المواريث",
    tabTree: "شجرة العائلة التفاعلية",
    tabCertificate: "وثيقة الشهادة الشرعية",
    presetsTitle: "حالات دراسية معدة مسبقاً",
    presetsSubtitle: "اختر نماذج كلاسيكية من الفرائض لدراسة كيفية انتقال النصيب بين الورثة المختلفين.",
    vaultTitle: "خزنة المواريث السحابية الآمنة",
    signOut: "تسجيل الخروج",
    googleLogin: "تسجيل الدخول بجوجل",
    googleLoginSubtitle: "سجل دخولك لحفظ شجرة العائلة وتنزيل التقارير ومشاركة الروابط ودمج الأشجار.",
    scenarioTitle: "عنوان الحالة",
    btnSave: "حفظ الحالة",
    btnSaving: "جاري الحفظ...",
    activeCloudCase: "نشط: تمت المزامنة سحابياً",
    localWorkspace: "مساحة عمل محلية فقط (اضغط حفظ)",
    savedAt: "تم الحفظ في",
    copyShareLink: "نسخ رابط المشاركة",
    linkCopied: "تم النسخ!",
    scanQr: "رمز QR",
    hideQr: "إخفاء الرمز",
    scanToImportCase: "امسح الرمز لاستيراد الحالة",
    part1DeceasedTitle: "الجزء الأول: المتوفى وتفاصيل التركة والديون والوصية",
    deceasedNameLabel: "اسم المتوفى",
    patriarchMale: "المتوفى (ذكر)",
    matriarchFemale: "المتوفاة (أنثى)",
    grossEstateVal: "قيمة التركة الإجمالية",
    funeralExpenses: "مصاريف التجهيز والجنازة",
    outDebts: "الديون والالتزامات المستحقة",
    willsBequests: "الوصايا الشرعية",
    willsNote: "الحد الشرعي: ثلث التركة كحد أقصى",
    willsWarning: "⚠️ تم تحديد الحد الأقصى بالثلث (1/3) امتثالاً للشرع.",
    netDistributedVal: "صافي التركة الموزعة",
    part2RegisterHeirsTitle: "الجزء الثاني: تسجيل أفراد العائلة والقرابة",
    relationshipLabel: "صلة القرابة",
    relativeNameLabel: "اسم القريب",
    genderLabel: "الجنس",
    maleLabel: "ذكر",
    femaleLabel: "أنثى",
    vitalStatusLabel: "حالة القريب",
    aliveLabel: "على قيد الحياة",
    deceasedLabel: "متوفى قبل المورث",
    registerBtn: "تسجيل الوارث في الشجرة",
    part3ActiveDirectoryTitle: "الجزء الثالث: دليل أقارب المتوفى المسجلين",
    searchPlaceholder: "ابحث عن وارث بالاسم أو القرابة...",
    sortByLabel: "ترتيب حسب",
    sortByRecent: "الأحدث (تاريخ الإضافة)",
    sortByName: "أبجدياً (أ-ي الاسم)",
    sortByRelationship: "حسب صلة القرابة",
    legendTitle: "دليل الحالة والمواريث الشرعي",
    legendAliveTitle: "على قيد الحياة (وارث مشارك)",
    legendAliveDesc: "الوارث حي وقت وفاة المورث. يستحق النصيب الشرعي مباشرة وقد يحجب غيره حجب حرمان أو حجب نقصان.",
    legendDeceasedTitle: "متوفى (توفى قبل المورث)",
    legendDeceasedDesc: "توفي القريب قبل المورث. الشريعة لا تعتمد التوريث بالتمثيل، يرث الحي بالحي والصنف المتوفى نصيبه 0.00%.",
    tableHeadBeneficiary: "اسم المستحق",
    tableHeadRelationship: "القرابة",
    tableHeadGender: "الجنس",
    tableHeadVitalStatus: "الحالة الحيوية",
    tableHeadInteract: "إجراءات التحكم",
    interactiveTreeTitle: "شجرة أنصبة المواريث والقرابة التفاعلية",
    interactiveTreeDesc: "توضيح للعلاقات الجينالوجية التي تربط المتوفى بجميع الورثة والأنصبة المفروضة.",
    btnTogglePortrait: "تفعيل وضع الصور الشخصية",
    btnTogglePortraitActive: "وضع الصور الشخصية: مفعّل",
    tierGrandparents: "المستوى الأول: الأجداد والجدات",
    tierParents: "المستوى الثاني: الأبوان",
    tierSiblings: "المستويات الجانبية: الإخوة والأخوات",
    tierDeceasedRoot: "المتوفى (بؤرة التركيز)",
    tierChildrenSpouses: "المستوى الثالث: الأزواج والفروع (الأولاد)",
    tierGrandchildren: "المستوى الرابع: فروع الفروع (الأحفاد)",
    camHeader: "التقاط صورة الملف الشخصي",
    camBrowseFile: "تصفح ملف JPG أو PNG مباشرة من جهازك",
    camCancel: "إلغاء",
    camRetake: "إعادة التقاط",
    camSave: "حفظ الصورة",
    camTake: "التقاط الصورة",
    mathExplanationTitle: "توضيح الحسابات الرياضية والتحقق الشرعي",
    step1Title: "الخطوة الأولى: أصل المسألة وفرض الوارث",
    step1Desc: "يتم تحديد فرضه المحدد قرآناً (كأصحاب الفروض) أو النصيب المتبقي تعصيباً (العصبات).",
    step2Title: "الخطوة الثانية: عول المسألة أو الرد",
    step2DescPerfect: "الفروض تساوى أصل المسألة تماماً. لا توجد تغييرات.",
    step2DescAwl: "مجموع السهام زاد عن أصل المسألة. يتم إدخال العول لتوزيع النقص نسبياً دون ضرر.",
    step2DescRadd: "مجموع السهام أقل من الأصل ولا يوجد عصبة. يتم رد الباقي على ذوي الفروض نسبياً.",
    step3Title: "الخطوة الثالثة: حساب وتوزيع التركة",
    step3Net: "التركة المتاحة للتوزيع:",
    step3SharePercent: "النصيب الفعلي %:",
    step3Alloc: "المقدار المالي:",
    mathExplanationFooter: "الأساس الشرعي والآيات القرآنية",
    exportCsvBtn: "تصدير إلى CSV / Excel",
    visualShareBreakdown: "التمثيل البصري للأنصبة (%)",
    beneficiaryLedgerTitle: "سجل وبيان المستحقين للتركة",
    beneficiaryLedgerDesc: "يرث كل وارث بناءً على الفروض المقدرة شرعاً أو التعصيب تحقيقاً للعدالة الإلهية في الإرث.",
    totalSharesEquals: "إجمالي السهام والأنصبة: 100%",
    tableHeadStatus: "الحالة",
    tableHeadFraction: "الكسر الشرعي",
    tableHeadPercentage: "النسبة",
    tableHeadCapital: "النصيب المالي",
    tableHeadBasis: "الأساس الشرعي للفرض / الحجب",
    tableHeadAuditMath: "مراجعة رياضية",
    auditMathHide: "إخفاء",
  },
  MS: {
    appName: "Kalkulator Waris Al-Faraid",
    appSubtitle: "Pembahagian Harta Pusaka Islam (Faraid) Berdasarkan Juri Sunni & Pembina Silsilah Interaktif",
    currencyText: "Mata Wang Penilaian",
    langSelectLabel: "Bahasa",
    tabInputs: "Input & Waris Aktif",
    tabBreakdown: "Jadual Pembahagian Waris",
    tabTree: "Graf Rajah Silsilah Keluarga",
    tabCertificate: "Dokumen Sijil Faraid",
    presetsTitle: "Senarai Kes Kajian Faraid Klasik",
    presetsSubtitle: "Sila pilih templat kes klasik undang-undang Sunni untuk mempelajari bagaimana kedudukan waris mempengaruhi peratusan pembahagian.",
    vaultTitle: "Gedung Simpanan Faraid Awan",
    signOut: "Log Keluar",
    googleLogin: "Log Masuk Google",
    googleLoginSubtitle: "Log masuk Google untuk menyimpan kes silsilah keluarga, muat turun rekod, jana pautan kongsi, atau gabungkan dua pokok waris.",
    scenarioTitle: "Nama Tajuk Kes",
    btnSave: "Simpan Kes",
    btnSaving: "Menyimpan Kes...",
    activeCloudCase: "AKTIF: REKOD AWAN DISINKRONISASI",
    localWorkspace: "FAIL TEMPATAN SAHAJA (KLIK SIMPAN)",
    savedAt: "Disimpan pada jam",
    copyShareLink: "Salin Pautan Kongsi",
    linkCopied: "Pautan Disalin!",
    scanQr: "Imbas QR",
    hideQr: "Tutup QR",
    scanToImportCase: "Imbas untuk Import Kes Waris",
    part1DeceasedTitle: "Bahagian I: Maklumat Si Mati, Utang, Wasiat & Jumlah Hartanah",
    deceasedNameLabel: "Nama Si Mati",
    patriarchMale: "Si Mati (Lelaki)",
    matriarchFemale: "Si Mati (Perempuan)",
    grossEstateVal: "Nilai Kasar Harta Pusaka",
    funeralExpenses: "Kos Pengurusan Jenazah",
    outDebts: "Bayaran Utang & Liabiliti",
    willsBequests: "Wasiat & Amal Jariah",
    willsNote: "Had Syariah: Maksimum 1/3 dari baki harta",
    willsWarning: "⚠️ Disekat pada had 1/3 untuk mematuhi undang-undang Syarak.",
    netDistributedVal: "Bersih Harta Pusaka (Tarkah)",
    part2RegisterHeirsTitle: "Bahagian II: Daftar Ahli Keluarga & Waris Terdekat",
    relationshipLabel: "Hubungan Kerabat",
    relativeNameLabel: "Nama Waris",
    genderLabel: "Jantina Bilogi",
    maleLabel: "Lelaki",
    femaleLabel: "Perempuan",
    vitalStatusLabel: "Status Hidup",
    aliveLabel: "Masih Hidup",
    deceasedLabel: "Meninggal Sebelum Si Mati",
    registerBtn: "Daftar Waris ke Silsilah",
    part3ActiveDirectoryTitle: "Bahagian III: Direktori Waris & Keluarga Berdaftar",
    searchPlaceholder: "Cari waris berdasarkan nama atau hubungan...",
    sortByLabel: "Susun mengikut",
    sortByRecent: "Baru ditambahkan",
    sortByName: "Nama Alfanumerik (A-Z)",
    sortByRelationship: "Model Hubungan Kerabat",
    legendTitle: "Keterangan Status Kehidupan Syariah",
    legendAliveTitle: "Status Hidup (Waris Layak)",
    legendAliveDesc: "Waris masih hidup ketika kematian si mati. Mempunyai hak mutlak dan boleh menghalang sebahagian waris lain (Hajb) atau mengurangkan bahagian mereka.",
    legendDeceasedTitle: "Status Meninggal (Predeceased)",
    legendDeceasedDesc: "Ahli keluarga meninggal sebelum si mati. Sistem Faraid tidak mempunyai konsep 'wakil'. Waris yang meninggal mendapat 0.00% dan tidak memindahkan bahagian kepada keturunan mereka.",
    tableHeadBeneficiary: "Nama Penerima",
    tableHeadRelationship: "Fungsi Hubungan",
    tableHeadGender: "Jantina",
    tableHeadVitalStatus: "Status Hidup",
    tableHeadInteract: "Tindakan Manual",
    interactiveTreeTitle: "Rajah Struktur Pokok Waris Faraid Syariah",
    interactiveTreeDesc: "Memvisualisasikan rajah silsilah yang menghubungkan arwah si mati dengan semua kerabat keluarga.",
    btnTogglePortrait: "Ubah Mode Potret",
    btnTogglePortraitActive: "Mode Potret: AKTIF",
    tierGrandparents: "PERINGKAT 1: Datuk & Nenek",
    tierParents: "PERINGKAT 2: Ibu & Bapa Kandung",
    tierSiblings: "SISI: Adik-Beradik / Saudara",
    tierDeceasedRoot: "SI MATI (FOKUS UTAMA)",
    tierChildrenSpouses: "PERINGKAT 3: Suami/Isteri & Anak-Anak",
    tierGrandchildren: "PERINGKAT 4: Cucu Silsilah",
    camHeader: "Tangkap Gambar Potret Profil",
    camBrowseFile: "Semak imbas fail imej JPG atau PNG",
    camCancel: "Batal",
    camRetake: "Ambil Semula",
    camSave: "Simpan Gambar",
    camTake: "Tangkap Gambar",
    mathExplanationTitle: "Terperinci Kerja Matematik & Penyahsesuaian Syariah",
    step1Title: "Langkah 1: Bahagian Asal (Fard)",
    step1Desc: "Menentukan kadar bahagian tetap di dalam Al-Quran (Fard) atau kadar baki harta (Asabah).",
    step2Title: "Langkah 2: Skala Pembetulan (Awl/Radd)",
    step2DescPerfect: "Jumlah pecahan tepat 1. Tiada pelarasan matematik diperlukan.",
    step2DescAwl: "Jumlah peratusan melebihi 1. Bahagian dikurangkan secara berkadar (Awl) untuk mengelakkan defisit.",
    step2DescRadd: "Jumlah baki harta berlebihan. Lebihan dipulangkan semula kepada waris fardu secara berkadar (Radd).",
    step3Title: "Langkah 3: Pengiraan Wang Bersih",
    step3Net: "Jumlah Bersih Tarkah:",
    step3SharePercent: "Bahagian Peratusan:",
    step3Alloc: "Anggaran Tunai Waris:",
    mathExplanationFooter: "Sumber Al-Quran & Hujah Syarak",
    exportCsvBtn: "Eksport ke CSV / Excel",
    visualShareBreakdown: "Pecahan Visual Waris (%)",
    beneficiaryLedgerTitle: "Daftar Waris & Penerima Pusaka Aktif",
    beneficiaryLedgerDesc: "Setiap kerabat mendapat peruntukan tetap yang berasaskan formula matematik Faraid yang adil dan telus.",
    totalSharesEquals: "JUMLAH KESELURUHAN SYER: 100%",
    tableHeadStatus: "Status",
    tableHeadFraction: "Pecahan",
    tableHeadPercentage: "Peratusan",
    tableHeadCapital: "Bahagian Tunai",
    tableHeadBasis: "Sokongan Dalil Quran / Alasan Sekat",
    tableHeadAuditMath: "Audit Math",
    auditMathHide: "Tutup",
  }
};
