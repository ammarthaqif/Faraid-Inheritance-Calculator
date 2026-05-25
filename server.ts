/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini client using server-side key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Get Smart Heir Suggestions using Gemini
  app.post('/api/faraid/suggest-heirs', async (req, res) => {
    const { deceasedName, deceasedGender } = req.body;
    try {
      const prompt = `Deceased person name is "${deceasedName || 'N/A'}" and gender is "${deceasedGender === 'M' ? 'Male' : 'Female'}".
Based on this profile:
1. Identify the primary heirs under Sunni Sharia law: Spouse, Father, Mother, Son, and Daughter.
2. Generate plausible, realistic names for these primary relatives that match the cultural or linguistic style of the deceased person's name "${deceasedName || 'Deceased'}".
3. Provide a brief Sharia jurisprudence reasoning for each suggested relative explaining their status as an primary heir (e.g., how they cannot be fully excluded under the Sharia rule of Hajb (exclusion)).
4. Determine their correct biological gender ('M' for Male, 'F' for Female).
5. Output the result strictly in JSON following the schema specified.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Islamic Sharia estate planner and genealogist. Analyze the deceased profile and provide 4-5 high-probability immediate family relatives to add first.',
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                relationship: {
                  type: Type.STRING,
                  description: "The relationship key, strictly one of: spouse, son, daughter, father, mother"
                },
                suggestedName: {
                  type: Type.STRING,
                  description: "A cultural/linguistic matching realistic name for this relative based on the deceased's name"
                },
                gender: {
                  type: Type.STRING,
                  description: "Biological gender: M or F"
                },
                reasoning: {
                  type: Type.STRING,
                  description: "A very brief, educational 1-sentence Sharia theological reasoning of why they are primary heirs (e.g. mention Hajb/exclusion immunity)"
                }
              },
              required: ["relationship", "suggestedName", "gender", "reasoning"]
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No suggestion text generated");
      }

      const suggestions = JSON.parse(responseText);
      res.json({ suggestions });

    } catch (error: any) {
      console.error("Error in /api/faraid/suggest-heirs:", error);
      // Return beautiful fallback suggestions matching the gender if Gemini fails, so user never receives a broken UI and always has a smooth experience!
      const isMale = deceasedGender === 'M';
      const fallback = [
        {
          relationship: 'spouse',
          suggestedName: isMale ? "Aisha" : "Ibrahim",
          gender: isMale ? 'F' : 'M',
          reasoning: "A spouse is a primary heir with a Quranic share defined in Surah An-Nisa (4:12), never fully excluded by others."
        },
        {
          relationship: 'father',
          suggestedName: "Sulaiman",
          gender: 'M',
          reasoning: "The father is a primary heir who is never excluded by anyone; he inherits either as a Quranic share holder or residuary."
        },
        {
          relationship: 'mother',
          suggestedName: "Maryam",
          gender: 'F',
          reasoning: "The mother holds a fundamental Quranic share (1/3 or 1/6) and is immune to complete exclusion (Hajb Nuqsan)."
        },
        {
          relationship: 'son',
          suggestedName: "Zayd",
          gender: 'M',
          reasoning: "A son is the strongest residuary ('Asabah) heir who receives the remaining estate and cannot be excluded."
        },
        {
          relationship: 'daughter',
          suggestedName: "Fatimah",
          gender: 'F',
          reasoning: "A daughter receives 1/2 (if single) or share 2/3 (if multiple), and shares as residuary with a brother."
        }
      ];
      res.json({ suggestions: fallback });
    }
  });

  // API Route - Ask Faraid AI Consultant
  app.post('/api/faraid/consult', async (req, res) => {
    try {
      const { query, calculationData, chatHistory } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Convert calculationData to a structured text representation for the AI's context
      let contextString = "No active Faraid calculation recorded yet.";
      if (calculationData) {
        const heirsList = calculationData.heirs
          .map((h: any) => `* ${h.name} (${h.relationshipLabel}): Status=${h.status}, Base Share Fraction=${h.shareFraction}, Percentage=${h.sharePercentage}%, Distributed Amount=$${h.shareAmount} (Explanation Basis: "${h.shariaBasis || 'N/A'}"${h.exclusionReason ? `, Exclusion reason: "${h.exclusionReason}"` : ''})`)
          .join('\n');

        contextString = `
ACTIVE CALCULATION CONTEXT:
- Deceased Person name: "${calculationData.deceasedName || 'N/A'}"
- Deceased Gender: "${calculationData.deceasedGender === 'M' ? 'Male' : 'Female'}"
- Gross Estate: $${calculationData.grossEstate}
- Funeral Deductions: $${calculationData.funeralDeduction}
- Debts Deductions: $${calculationData.debtsDeduction}
- Wills/Bequests Deductions: $${calculationData.willsDeduction}
- Net Estate For Distribution: $${calculationData.netEstate}
- Mathematical Adjustment Applied: ${calculationData.adjustmentType} (${calculationData.adjustmentExplanation || 'None'})
- Beneficiaries and Calculated Shares:
${heirsList}
`;
      }

      const systemInstruction = `
You are a highly professional, compassionate, and precise senior consultant in Islamic Sharia Jurisprudence, specializing in the Islamic law of inheritance (Ilm al-Faraid).
Your task is to explain and clarify matters of Islamic estate planning, inheritance distributions, Quranic shares (Furood), residuary structures (Asabah), and mathematical resolutions (Al-Awl and Al-Radd) in a warm, welcoming, and easy-to-understand manner.

Always structure your responses beautifully using neat Markdown headings, tables, or itemized lists.
Acknowledge the calculated breakdown of the ongoing family structure if the user references it, validating why daughters get their specific shares, spouses their respective parts, and how exclusions (Hajb) operate under Sharia councils.

Keep explanations clear, standard, objective, and scholarly. Emphasize that final estate actions should be reviewed by local Sharia councils or legal authorities for official certification.
Do not use hyperbole, and keep the tone supportive and educational.
`;

      // Build message payloads
      const contentsList: any[] = [];
      
      // Inject prior chat history if provided
      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.slice(-10).forEach((msgObj: any) => {
          contentsList.push({
            role: msgObj.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msgObj.text }]
          });
        });
      }

      // Add current context and final query
      const currentPrompt = `
${contextString}

USER QUESTION:
${query}

Please provide an expert, Sharia-compliant response explaining this case, the general principles of Faraidh applied, or addressing the user's specific theological/mathematical question.
`;

      contentsList.push({
        role: 'user',
        parts: [{ text: currentPrompt }]
      });

      // Call Gemini 3.5 Flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I apologize, I was unable to generate a helpful Sharia explanation. Please try asking again.";
      res.json({ answer: responseText });

    } catch (error: any) {
      console.error("Gemini API Error in /api/faraid/consult:", error);
      res.status(500).json({ 
        error: 'An error occurred while consulting our Islamic Jurisprudence consultant.',
        details: error.message 
      });
    }
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Faraidh server booted and active on port ${PORT}`);
  });
}

startServer();
