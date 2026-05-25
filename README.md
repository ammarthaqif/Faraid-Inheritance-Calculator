# 🕋 Al-Faraid Inheritance Calculator & Interactive Genealogy Assistant

[![License: Apache 2.5](https://img.shields.io/badge/License-Apache%202.5-emerald.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/Tech--Stack-React%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Firebase-teal)](https://react.dev)

A comprehensive, production-ready, Full-Stack **Sharia-Compliant Faraid Inheritance Calculator** featuring a dynamic genealogical representation hierarchy. Built with **React 18**, **TypeScript**, **Vite**, and **Firebase (Firestore & Authentication)**, it facilitates accurate, mathematically pristine estate distribution under Sunni Islamic jurisprudence, designed to be easily deployed or published onto GitHub.

---

## 🎨 Visual Preview & Design Philosophy

This application is designed around high-contrast, professional, and accessible aesthetics to combine classical Islamic law with state-of-the-art interactive structures:
- **Clean Editorial Typography:** Leverages pairs of modern sans-serif fonts alongside clean display tracking and classical Arabic displays.
- **Micro-interactivity:** Guided transitions, responsive button scales, real-time calculation previews, and contextual highlights.
- **Architectural Honesty:** Uncompromising digital workspaces focusing entirely on user-oriented utility — zero synthetic logging, tech-larping noise, or visual clutters.

---

## 🛠️ Key Architectural Features

### 1. 🧮 Sharia-Compliant Faraid Mathematics Engine
* Handles **all classical Sunni Quranic heirs** (Fard claimants) and residuary heirs (Asabah).
* Solves **Awl** scenarios (proportional estate scales down when individual entitlement claims exceed `1/1` limit).
* Solves **Radd** scenarios (proportional estate scales up when assets are left over and there is no Asabah).
* Simplifies fractions of daughter/son pairs cleanly without endless decimals.

### 2. 🌲 Interactive Family Tree Graph with Custom Portrait Mode
* Renders a chronological family hierarchy grid from Tier 1 (Grandparents) down to Tier 4 (Lineage Grandchildren).
* **Portrait / Camera Mode:** Enables integrated webcam stream access (`getUserMedia`) to crop and snap round profile images instantly. Supports files fall-back dragging or browsing for standard JPG/PNG files seamlessly.

### 3. 🛡️ Stored Cloud Inheritance Vault & Marriage Tree Merger
* Persist family scenario charts securely with one-click Google Sign-in.
* **Marriage Tree Merger:** Allows marrying lines to combine or import heirs between different saved cloud trees dynamically.
* **Guest Sharing & HUD:** Generate instant read-only public guest links paired with deep-linked QR Code vectors to scan and load cases on mobile.

### 4. 📄 Legal Certificate (jsPDF-Powered Client-side PDF Engine)
* Offers a clean dedicated legal document displaying classical basmala header, deceased context, estate details audit ledger, and final wealth allocation matrices.
* **Client-side PDF Exporter:** Generates an A4 standard PDF structure directly in-browser using full certificate canvas properties.

### 5. 📑 theological Study Presets & Multi-Scenario History
* **Preloaded Study Presets:** Explore textbook historical cases (e.g. *Al-Minbariyya*, *Al-Mushtarakah*) to observe how inheritance dynamics realign.
* **Scenario History Tracker:** A contextual sidebar allowing immediate, click-by-click comparisons between the active diagram and the last three calculation states.

### 6. 🌐 Real-Time Language and Currency Toggle
* Dynamic localized glossaries enabling complete visual toggle on-demand.
* Robust coverage across **English (EN)**, **العربية (AR)**, and **Bahasa Melayu (MS)**.
* Multi-currency system for financial estate inputs and corresponding payouts.

---

## 🚀 Local Deployment & Getting Started

Follow these steps to download, configure, and boot the application in your local development environment:

### Prerequisites
* **Node.js** (v18.0 or higher recommended)
* **npm** or similar package manager

### 1. Clone the GitHub Repository
```bash
git clone https://github.com/your-username/al-faraid-calculator.git
cd al-faraid-calculator
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Setup Secrets & External Integrations
Verify the environment variables file. Create `.env` in the root directory:
```env
# Database Credentials for Cloud Vault Persistence (Firestore + Auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Run Development Workspace
```bash
npm run dev
```
The dev server launches directly on `http://localhost:3000`.

### 5. Build for Production Compilation
Compile the static web assets to the distribution directory:
```bash
npm run build
```
The build produces high-efficiency, compressed index bundles inside the folders `dist/`.

---

## 🏛️ Sunni Jurisprudential Logic Notes

Sunni Faraid rules operate on a sequence of four stages of deductions from the total estate gross value:
1. **Burial/Tajhiz Expenses:** Deducted first.
2. **Liabilities/Duyoon:** Paid secondly.
3. **Bequeathals/Wasiyyah:** Capped at `1/3` of the remaining value unless heirs agree otherwise.
4. **Final Wealth Distribution:** Shares determined strictly under Sharia-mandated fractional quotas.

---

## 📄 Licensing & Permissions
Distributed under the **Apache License, Version 2.5**. See `metadata.json` and code header declarations for copyright details.
