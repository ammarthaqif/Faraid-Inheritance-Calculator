/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult, HeirResult } from '../types';
import { Download, Printer, ShieldCheck, FileText, Landmark } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TRANSLATIONS } from '../lib/translations';

interface LegalCertificateProps {
  deceasedName: string;
  deceasedGender: 'M' | 'F';
  calculation: CalculationResult;
  currency: string;
  language?: 'EN' | 'AR' | 'MS';
}

const LEGAL_CERT_TRANSLATIONS = {
  EN: {
    basmala: "BISMILLAHIR RAHMANIR RAHIM",
    certTitle: "ISLAMIC ESTATE DISTRIBUTION CERTIFICATE",
    certSubtitle: "Kasf Al-Faraidh (Sharia-Compliant Resolution)",
    dateGenerated: "Date Generated:",
    docId: "Document ID:",
    deceasedIndividual: "DECEASED INDIVIDUAL",
    legalFoundation: "LEGAL FOUNDATION",
    mrMs: "Mr./Ms.",
    faraidConsensus: "Sunni Islamic Law (Faraid)",
    genderMale: "Male",
    genderFemale: "Female",
    genderLabel: "Gender:",
    jurisprudenceSchools: "Adhering strictly to classical Sunni law (Shafi’i, Hanafi)",
    part1Finance: "PART I: ESTATE FINANCIAL ACCOUNTING",
    grossEstateVal: "Gross Estate Value:",
    lessFuneral: "Less: Funeral & Burial Expenses (Buriah/Tajhiz):",
    lessDebts: "Less: Outstanding Liabilities & Personal Debts (Duyoon):",
    lessWills: "Less: Approved Third-Party Wills / Bequests (Wasiyyah):",
    maxWillsApp: "Max capped at 1/3 limit",
    maxWillsSuffix: " (Max 1/3 Limit Approved)",
    netTarkah: "Net Distributable Estate (Tarkah):",
    part2Table: "PART II: FINAL WEALTH ALLOCATION TABLE",
    hash: "#",
    beneficiaryRel: "Beneficiary & Relationship",
    gender: "Gender",
    status: "Status",
    fraction: "Share Fraction",
    percentage: "Share (%)",
    shareAmount: "Distributed Share Amount",
    adjActive: "Adjustment Active: ",
    adjSummary: "⚠️ Adjustment Summary: ",
    part3Theology: "PART III: THEOLOGICAL BASIS & STATUTORY REASONING",
    approvedShare: "Approved Share",
    excludedList: "Excluded Heirs List",
    scholarCert: "FARAIDH SCHOLAR CERTIFICATION",
    scholarSignature: "Faraidh Scholar Signature",
    officialSeal: "OFFICIAL SEAL / STAMP",
    officialMufti: "Islamic Council Appointed Mufti",
    officialCertifier: "Islamic Council Certifier",
    adheringStrictly: "Adhering strictly to Al-Faraid jurisprudence.",
    divineVerses: "This calculation adheres to the Divine verses of Surah an-Nisa (4:11, 4:12, 4:176).",
    verifiedSharia: "VERIFIED\nSHARIA\nCALC",
    topBarTitle: "Printable Legal Faraid Documentation",
    topBarDesc: "Generate a certified-format estate distribution report ready to export as PDF.",
    btnDownloadPdf: "Download PDF Report",
    btnPrintDoc: "Print Document",
  },
  AR: {
    basmala: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    certTitle: "شهادة توزيع التركة الشرعية",
    certSubtitle: "كشف الفرائض (قرار متوافق مع أحكام الشريعة الإسلامية)",
    dateGenerated: "تاريخ الإصدار:",
    docId: "معرف الوثيقة:",
    deceasedIndividual: "المتوفى صاحب التركة",
    legalFoundation: "الأساس القانوني والشرعي",
    mrMs: "الأستاذ / الأستاذة",
    faraidConsensus: "قوانين المواريث والفرائض السنية",
    genderMale: "ذكر",
    genderFemale: "أنثى",
    genderLabel: "الجنس:",
    jurisprudenceSchools: "موافق للمذاهب الفقهية الكبرى (الشافعي، الحنفي، المالكي، الحنبلي)",
    part1Finance: "الجزء الأول: المحاسبة المالية للتركة والخصومات",
    grossEstateVal: "قيمة التركة الإجمالية:",
    lessFuneral: "يخصم: مصاريف التجهيز والجنازة (تجهيز الميت):",
    lessDebts: "يخصم: الديون والالتزامات المالية المستحقة (الديون):",
    lessWills: "يخصم: الوصايا المعتمدة للغير (الوصية الشرعية):",
    maxWillsApp: "محددة بثلث التركة كحد أقصى للوصايا",
    maxWillsSuffix: " (الحد الأقصى للوصية الثلث المصدق)",
    netTarkah: "صافي التركة الموزعة شرعاً (التركة):",
    part2Table: "الجزء الثاني: جدول التوزيع النهائي للورثة الشرعيين",
    hash: "#",
    beneficiaryRel: "المستحق وصلة القرابة",
    gender: "الجنس",
    status: "الحالة",
    fraction: "الفرض الشرعي",
    percentage: "النسبة (%)",
    shareAmount: "النصيب المالي المحدد",
    adjActive: "التسوية النشطة: ",
    adjSummary: "⚠️ ملخص التسوية الحسابية: ",
    part3Theology: "الجزء الثالث: التأصيل الشرعي والمسوغات الفقهية",
    approvedShare: "الفرض المعتمد",
    excludedList: "قائمة المحجوبين من الإرث",
    scholarCert: "اعتماد عالم الفرائض المجاز",
    scholarSignature: "توقيع خبير الفرائض الشرعي",
    officialSeal: "الختم الرسمي / المصادقة",
    officialMufti: "مفتي معتمد من المجلس الإسلامي",
    officialCertifier: "موثق معتمد لدى المجلس الإسلامي لدور المواريث",
    adheringStrictly: "التزاماً دقيقاً بأحكام ومذاهب علم الفرائض والمواريث.",
    divineVerses: "تعتمد الحسابات الواردة على النصوص الصريحة في سورة النساء (4:11، 4:12، 4:176).",
    verifiedSharia: "تمديد\nشرعي\nموثق",
    topBarTitle: "وثيقة المواريث القانونية القابلة للطباعة",
    topBarDesc: "إنشاء تقرير توزيع تركة شرعي معتمد بتنسيق رسمي جاهز للتصدير كملف PDF.",
    btnDownloadPdf: "تحميل تقرير PDF",
    btnPrintDoc: "طباعة الوثيقة",
  },
  MS: {
    basmala: "BISMILLAHIR RAHMANIR RAHIM",
    certTitle: "SIJIL RASMI PEMBAHAGIAN HARTA PUSAKA ISLAM",
    certSubtitle: "Kasf Al-Faraidh (Penyelesaian Patuh Syariah)",
    dateGenerated: "Tarikh Dijana:",
    docId: "ID Dokumen:",
    deceasedIndividual: "MAKLUMAT SI MATI",
    legalFoundation: "ASAS UNDANG-UNDANG",
    mrMs: "Encik/Puan",
    faraidConsensus: "Undang-undang Faraid Islam Sunni",
    genderMale: "Lelaki",
    genderFemale: "Perempuan",
    genderLabel: "Jantina:",
    jurisprudenceSchools: "Mematuhi mazhab-mazhab fiqh utama (Shafi'i, Hanafi)",
    part1Finance: "BAHAGIAN I: PERAKAUNAN KEWANGAN HARTA PUSAKA",
    grossEstateVal: "Nilai Kasar Harta Pusaka:",
    lessFuneral: "Tolak: Kos Pengurusan Jenazah (Buriah/Tajhiz):",
    lessDebts: "Tolak: Pembayaran Liabiliti & Utang Peribadi (Duyoon):",
    lessWills: "Tolak: Wasiat Pihak Ketiga yang Diluluskan (Wasiyyah):",
    maxWillsApp: "Had maksimum 1/3 daripada baki harta pusaka",
    maxWillsSuffix: " (Had Maksimum 1/3 Diluluskan)",
    netTarkah: "Bersih Harta Pusaka (Tarkah Bersih):",
    part2Table: "BAHAGIAN II: JADUAL PENGIKTIRAFAN WARIS AKHIR",
    hash: "#",
    beneficiaryRel: "Penerima & Hubungan Kerabat",
    gender: "Jantina",
    status: "Status",
    fraction: "Pecahan Kadar",
    percentage: "Kadar Peratusan (%)",
    shareAmount: "Jumlah Anggaran Tunai Faraid",
    adjActive: "Pelarasan Matematik Aktif: ",
    adjSummary: "⚠️ Ringkasan Pelarasan Semula: ",
    part3Theology: "BAHAGIAN III: HUJAH SYARAK & SUMBER RUJUKAN TEOLOGI",
    approvedShare: "Bahagian Diluluskan",
    excludedList: "Senarai Waris Terhalang",
    scholarCert: "PENGESAHAN AHLI CERTIFIED FARAID",
    scholarSignature: "Tandatangan Pakar Faraid",
    officialSeal: "COP DAN METRUM RASMI",
    officialMufti: "Mufti Lantikan Majlis Agama Islam",
    officialCertifier: "Pemeriksa Sijil Majlis Agama Islam",
    adheringStrictly: "Mematuhi sepenuhnya undang-undang silsilah pembahagian Faraid.",
    divineVerses: "Pengiraan dan hujah ini berlandaskan ayat suci Surah an-Nisa (4:11, 4:12, 4:176).",
    verifiedSharia: "SAH\nSYARIAH\nDIKILAS",
    topBarTitle: "Dokumentasi Pusaka Faraid Boleh Cetak",
    topBarDesc: "Jana laporan pembahagian harta pusaka rasmi yang sedia untuk dieksport sebagai PDF.",
    btnDownloadPdf: "Muat Turun Laporan PDF",
    btnPrintDoc: "Cetak Dokumen",
  }
};

export default function LegalCertificate({
  deceasedName,
  deceasedGender,
  calculation,
  currency,
  language = 'EN',
}: LegalCertificateProps) {
  
  const t = TRANSLATIONS[language];
  const lc = LEGAL_CERT_TRANSLATIONS[language];
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let y = 20;

    // Helper to print text and advance y
    const checkPageOffset = (additionalHeight: number) => {
      if (y + additionalHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        drawBorder(doc);
      }
    };

    const drawBorder = (pdf: jsPDF) => {
      pdf.setDrawColor(220, 215, 205); // warm stone light
      pdf.setLineWidth(0.3);
      pdf.rect(margin - 5, margin - 5, pageWidth - ((margin - 5) * 2), pageHeight - ((margin - 5) * 2));
      
      pdf.setDrawColor(15, 118, 110); // emerald/teal
      pdf.setLineWidth(0.6);
      pdf.rect(margin - 3, margin - 3, pageWidth - ((margin - 3) * 2), pageHeight - ((margin - 3) * 2));
    };

    // Draw borders on first page
    drawBorder(doc);

    // Dynamic Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.basmala, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(16);
    doc.setTextColor(28, 25, 23);
    doc.text(lc.certTitle, pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.certSubtitle, pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7);
    doc.setTextColor(120, 110, 100);
    doc.text(`${lc.dateGenerated} ${new Date().toLocaleDateString()}   |   ${lc.docId} FRC-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Section 1: Metadata
    checkPageOffset(35);
    doc.setFillColor(250, 249, 246); // Warm white
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setDrawColor(210, 200, 190);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 22, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 90, 80);
    doc.text(lc.deceasedIndividual, margin + 5, y + 6);
    doc.text(lc.legalFoundation, pageWidth - margin - 5, y + 6, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(28, 25, 23);
    doc.text(`${lc.mrMs} ${deceasedName}`, margin + 5, y + 12);
    doc.text(lc.faraidConsensus, pageWidth - margin - 5, y + 12, { align: 'right' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text(`${lc.genderLabel} ${deceasedGender === 'M' ? lc.genderMale : lc.genderFemale}`, margin + 5, y + 17);
    doc.text(lc.jurisprudenceSchools, pageWidth - margin - 5, y + 17, { align: 'right' });
    y += 28;

    // Section 2: Estate Finances
    checkPageOffset(45);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.part1Finance, margin, y);
    y += 5;

    doc.setDrawColor(210, 200, 190);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 75, 70);

    const financials = [
      { label: lc.grossEstateVal, val: formatMoney(calculation.grossEstate), color: [28,25,23] },
      { label: lc.lessFuneral, val: `(${formatMoney(calculation.funeralDeduction)})`, color: [120,40,40], italic: true },
      { label: lc.lessDebts, val: `(${formatMoney(calculation.debtsDeduction)})`, color: [120,40,40], italic: true },
      { label: lc.lessWills, val: `(${formatMoney(calculation.willsDeduction)})`, color: [120,40,40], suffix: calculation.willsDeduction > 0 ? lc.maxWillsSuffix : "" },
    ];

    financials.forEach(item => {
      doc.setFont('Helvetica', item.italic ? 'oblique' : 'normal');
      doc.setTextColor(80, 75, 70);
      doc.text(item.label + (item.suffix || ""), margin + 2, y);
      
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(item.val, pageWidth - margin - 2, y, { align: 'right' });
      y += 6;
    });

    y += 1;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.netTarkah, margin + 2, y);
    doc.text(formatMoney(calculation.netEstate), pageWidth - margin - 2, y, { align: 'right' });
    y += 12;

    // Section 3: Allocation Table
    checkPageOffset(60);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.part2Table, margin, y);
    y += 5;

    // Table Headers
    doc.setFillColor(245, 244, 240);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setDrawColor(210, 200, 190);
    doc.rect(margin, y, contentWidth, 8, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 90, 80);
    doc.text(lc.hash, margin + 2, y + 5.5);
    doc.text(lc.beneficiaryRel, margin + 10, y + 5.5);
    doc.text(lc.gender, margin + 65, y + 5.5);
    doc.text(lc.status, margin + 85, y + 5.5);
    doc.text(lc.fraction, margin + 110, y + 5.5);
    doc.text(lc.percentage, margin + 135, y + 5.5);
    doc.text(lc.shareAmount, pageWidth - margin - 2, y + 5.5, { align: 'right' });
    y += 8;

    // Table Row Rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    calculation.heirs.forEach((h, idx) => {
      checkPageOffset(12);
      
      // Zebra shading for active heirs
      if (h.status === 'Heir') {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 249, 246);
      }
      doc.rect(margin, y, contentWidth, 10, 'F');
      
      // bottom row border line
      doc.setDrawColor(230, 225, 215);
      doc.line(margin, y + 10, pageWidth - margin, y + 10);

      doc.setTextColor(100, 100, 100);
      doc.text((idx + 1).toString(), margin + 2, y + 6.5);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(28, 25, 23);
      doc.text(h.name, margin + 10, y + 4.5);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 110, 100);
      doc.text(h.relationshipLabel, margin + 10, y + 8);

      doc.setFontSize(8);
      doc.setTextColor(80, 75, 70);
      doc.text(h.gender === 'M' ? lc.genderMale : lc.genderFemale, margin + 67, y + 6.5);
      
      const isHeir = h.status === 'Heir';
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(isHeir ? 15 : 120, isHeir ? 118 : 100, isHeir ? 110 : 80);
      doc.text(isHeir ? t.aliveLabel.toUpperCase() : h.status === 'Excluded' ? t.tableHeadStatus.toUpperCase() : t.deceasedLabel.toUpperCase(), margin + 85, y + 6.5);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(28, 25, 23);
      doc.text(isHeir ? h.shareFraction : '0', margin + 112, y + 6.5);
      doc.text(isHeir ? `${h.sharePercentage}%` : '0%', margin + 137, y + 6.5);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(isHeir ? 15 : 120, isHeir ? 118 : 100, isHeir ? 110 : 80);
      doc.text(isHeir ? formatMoney(h.shareAmount) : '$0.00', pageWidth - margin - 2, y + 6.5, { align: 'right' });
      
      y += 10;
    });

    if (calculation.adjustmentExplanation) {
      checkPageOffset(15);
      doc.setFillColor(245, 243, 235);
      doc.rect(margin, y + 2, contentWidth, 10, 'F');
      doc.setDrawColor(210, 200, 180);
      doc.rect(margin, y + 2, contentWidth, 10, 'S');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 80, 40);
      doc.text(`${lc.adjActive}${calculation.adjustmentExplanation}`, margin + 3, y + 8.5);
      y += 15;
    } else {
      y += 5;
    }

    // Section 4: Theological Basis
    checkPageOffset(35);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(lc.part3Theology, margin, y);
    y += 5;
    
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    calculation.heirs
      .filter(h => h.status === 'Heir' || h.status === 'Excluded')
      .forEach(h => {
        const text = h.status === 'Heir' ? h.shariaBasis : h.exclusionReason;
        const fullLabel = `${h.name} (${h.relationshipLabel}) - ${h.status === 'Heir' ? `${lc.approvedShare} (${h.shareFraction})` : lc.excludedList}`;
        
        // Wrap legal statement text beautifully inside margin limits
        const wrappedTextLines = doc.splitTextToSize(text, contentWidth - 8);
        const itemHeight = 6 + (wrappedTextLines.length * 4);

        checkPageOffset(itemHeight);

        // Green lateral bullet line
        doc.setDrawColor(15, 118, 110);
        doc.setLineWidth(0.8);
        doc.line(margin + 1, y, margin + 1, y + itemHeight - 3);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(28, 25, 23);
        doc.text(fullLabel, margin + 4, y + 3.5);

        doc.setFont('Helvetica', 'oblique');
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        
        let subY = y + 7.5;
        wrappedTextLines.forEach((line: string) => {
          doc.text(line, margin + 4, subY);
          subY += 4;
        });

        y += itemHeight;
      });

    // Section 5: Seal and Signatures
    checkPageOffset(45);
    y += 5;
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const signatureColWidth = contentWidth / 2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 110, 100);
    doc.text(lc.scholarCert, margin + (signatureColWidth / 2), y, { align: 'center' });
    doc.text(lc.officialSeal, margin + signatureColWidth + (signatureColWidth / 2), y, { align: 'center' });

    y += 15;
    doc.line(margin + 15, y, margin + signatureColWidth - 15, y);
    
    // Draw Seal Circle
    const sealX = margin + signatureColWidth + (signatureColWidth / 2);
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.3);
    doc.circle(sealX, y - 5, 8, 'S');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(15, 118, 110);
    
    const sealLines = lc.verifiedSharia.split('\n');
    if (sealLines.length >= 3) {
      doc.text(sealLines[0], sealX, y - 6.5, { align: 'center' });
      doc.text(sealLines[1], sealX, y - 4.5, { align: 'center' });
      doc.text(sealLines[2], sealX, y - 2.5, { align: 'center' });
    } else {
      doc.text("VERIFIED", sealX, y - 6.5, { align: 'center' });
      doc.text("SHARIA", sealX, y - 4.5, { align: 'center' });
      doc.text("CALC", sealX, y - 2.5, { align: 'center' });
    }

    y += 4;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 130, 120);
    doc.text(lc.officialMufti, margin + (signatureColWidth / 2), y, { align: 'center' });
    
    doc.setFont('Helvetica', 'oblique');
    doc.setFontSize(6.5);
    doc.text(lc.adheringStrictly, sealX, y, { align: 'center' });

    // Save PDF
    doc.save(`Faraid_Distribution_Certificate_${deceasedName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* Top action bar - shown on page, hidden in print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100 no-print gap-4">
        <div className="flex items-center gap-3">
          <Landmark className="w-6 h-6 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-950 font-display">{lc.topBarTitle}</h4>
            <p className="text-xs text-emerald-800">{lc.topBarDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-emerald-800 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            {lc.btnDownloadPdf}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-stone-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            {lc.btnPrintDoc}
          </button>
        </div>
      </div>

      {/* The Actual Document Certificate */}
      <div className="w-full bg-white p-8 md:p-12 rounded-xl shadow-xs border border-stone-200 print-card text-stone-900 leading-relaxed font-sans relative">
        
        {/* Aesthetic Islamic corner borders - elegant touch */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-stone-300 pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-stone-300 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-stone-300 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-stone-300 pointer-events-none" />

        {/* Certificate Headers */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-8 h-8 text-emerald-700" />
            <span className="font-display font-bold tracking-widest text-emerald-800 text-lg">{lc.basmala}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-850 font-display tracking-tight uppercase">
            {lc.certTitle}
          </h2>
          <p className="text-xs text-emerald-700 font-mono font-medium uppercase tracking-wider">
            {lc.certSubtitle}
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono pt-1">
            <span>{lc.dateGenerated} {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>{lc.docId} FRC-{Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <div className="w-24 h-0.5 bg-emerald-700 mx-auto mt-4" />
        </div>

        {/* SECTION 1: DECEASED METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-y border-stone-200 py-4 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">{lc.deceasedIndividual}</span>
            <div className="font-semibold text-stone-800 text-sm">{lc.mrMs} {deceasedName}</div>
            <div className="text-xs text-stone-500">{lc.genderLabel} {deceasedGender === 'M' ? lc.genderMale : lc.genderFemale}</div>
          </div>
          <div className="space-y-1 md:text-right">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">{lc.legalFoundation}</span>
            <div className="font-semibold text-stone-800 text-sm">{lc.faraidConsensus}</div>
            <div className="text-xs text-stone-500">{lc.jurisprudenceSchools}</div>
          </div>
        </div>

        {/* SECTION 2: ESTATE FINANCIAL AUDIT */}
        <div className="bg-stone-50 p-4 rounded-lg border border-stone-200/60 mb-6 space-y-3">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest font-mono">
            {lc.part1Finance}
          </h3>
          
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="text-stone-500">{lc.grossEstateVal}</div>
            <div className="text-right font-medium text-stone-800">{formatMoney(calculation.grossEstate)}</div>

            <div className="text-stone-500">{lc.lessFuneral}</div>
            <div className="text-right font-medium text-amber-900">({formatMoney(calculation.funeralDeduction)})</div>

            <div className="text-stone-500">{lc.lessDebts}</div>
            <div className="text-right font-medium text-amber-900">({formatMoney(calculation.debtsDeduction)})</div>

            <div className="text-stone-500">{lc.lessWills}</div>
            <div className="text-right font-semibold text-amber-900">
              ({formatMoney(calculation.willsDeduction)})
              {calculation.willsDeduction > 0 && <span className="text-[9px] font-normal text-stone-400 block italic">{lc.maxWillsApp}</span>}
            </div>

            <div className="grid-cols-2 col-span-2 border-t border-stone-200 my-1 h-px" />

            <div className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1">
              {lc.netTarkah}
            </div>
            <div className="text-right font-bold text-emerald-800 text-sm">{formatMoney(calculation.netEstate)}</div>
          </div>
        </div>

        {/* SECTION 3: TABULATED BENEFICIARIES */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest font-mono">
            {lc.part2Table}
          </h3>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="p-3">{lc.hash}</th>
                  <th className="p-3">{lc.beneficiaryRel}</th>
                  <th className="p-3">{lc.gender}</th>
                  <th className="p-3 text-center">{lc.fraction}</th>
                  <th className="p-3 text-right">{lc.percentage}</th>
                  <th className="p-3 text-right">{lc.shareAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                {calculation.heirs.map((h, index) => {
                  const isHeir = h.status === 'Heir';
                  return (
                    <tr key={h.id} className={isHeir ? 'bg-white' : 'bg-stone-50/50 text-stone-400'}>
                      <td className="p-3 font-mono font-medium">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold text-stone-850">{h.name}</div>
                        <div className="text-[10px] text-stone-500 font-medium">{h.relationshipLabel}</div>
                      </td>
                      <td className="p-3 uppercase font-mono">{h.gender === 'M' ? lc.genderMale : lc.genderFemale}</td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {isHeir ? h.shareFraction : '0'}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        {isHeir ? `${h.sharePercentage}%` : '0%'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-stone-900">
                        {isHeir ? formatMoney(h.shareAmount) : '$0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {calculation.adjustmentExplanation && (
            <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs leading-relaxed italic text-stone-600 font-medium whitespace-pre-line mt-2">
              {lc.adjSummary}{calculation.adjustmentExplanation}
            </div>
          )}
        </div>

        {/* SECTION 4: SHARIA ARGUMENTS & CITATIONS */}
        <div className="space-y-4 mb-10">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-widest font-mono">
            {lc.part3Theology}
          </h3>
          <div className="space-y-3">
            {calculation.heirs
              .filter(h => h.status === 'Heir' || h.status === 'Excluded')
              .map(h => (
                <div key={h.id} className="text-xs border-l-2 border-emerald-700 pl-3 py-1 space-y-1">
                  <span className="font-semibold text-stone-800 font-display">
                    {h.name} ({h.relationshipLabel}) — {h.status === 'Heir' ? `${lc.approvedShare}: ${h.shareFraction}` : lc.excludedList}
                  </span>
                  <p className="text-stone-600 text-[11px] leading-relaxed italic">
                    {h.status === 'Heir' ? h.shariaBasis : h.exclusionReason}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t-2 border-dashed border-stone-200 my-8 no-print" />

        {/* SECTION 5: SIGNATURES BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-100 text-xs">
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block font-mono">
              {lc.scholarSignature}
            </span>
            <div className="h-0.5 w-48 bg-stone-300 mt-1" />
            <div className="text-[11px] text-stone-500 font-medium">{lc.officialCertifier}</div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block font-mono">
              {lc.officialSeal}
            </span>
            {/* Elegant Vector Seal */}
            <div className="relative w-16 h-16 border-4 border-emerald-800/20 rounded-full flex items-center justify-center">
              <div className="absolute w-12 h-12 border border-emerald-800/10 rounded-full text-[7.5px] font-mono text-emerald-800/40 select-none animate-pulse flex items-center justify-center font-bold text-center leading-none whitespace-pre-line">
                {lc.verifiedSharia}
              </div>
            </div>
            <div className="text-[11px] text-stone-400 italic">{lc.divineVerses}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
