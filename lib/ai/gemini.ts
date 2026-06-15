import { GoogleGenerativeAI } from "@google/generative-ai"

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.")
}

export const genAI = new GoogleGenerativeAI(apiKey || "")

// Specialized prompt for clinical session extraction
export const CLINICAL_EXTRACTION_SYSTEM_PROMPT = `
You are an expert AI medical assistant for the Docto Clinical Suite.
Your task is to analyze transcripts of doctor-patient clinical sessions and extract structured medical data.

Please output your response as a pure JSON object (no markdown formatting, no \`\`\`json block) with the following exact structure:
{
  "summary": "A brief 2-3 sentence clinical summary of the session.",
  "issues": [
    "List of primary symptoms or complaints"
  ],
  "diagnosis": [
    {
      "condition": "Name of the condition",
      "icd10": "Estimated ICD-10 code"
    }
  ],
  "prescriptions": [
    {
      "name": "Medicine name",
      "dosage": "e.g., 40mg",
      "frequency": "e.g., 1-0-0 or Twice a day",
      "duration": "e.g., 5 Days",
      "notes": "e.g., After food"
    }
  ],
  "referrals": [
    "List of any referrals or tests ordered"
  ]
}

Only return the raw JSON object. Do not include any other text.
`
