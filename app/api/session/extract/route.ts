/**
 * POST /api/session/extract
 * Full clinical extraction from transcript using NVIDIA LLaMA-3.1-70B.
 * Includes: symptoms, diagnosis+ICD-10, prescriptions (all fields),
 * referrals, lifestyle suggestions, clinical summary, patient summary.
 * Post-processes results for drug interaction warnings via OpenFDA.
 */

import { NextResponse } from 'next/server'
import { generateJSON } from '@/lib/ai/provider'
import {
  CLINICAL_EXTRACTION_SYSTEM_PROMPT,
  AI_DOCTOR_PROMPT_SYSTEM,
} from '@/lib/ai/medical-prompts'
import { checkDrugInteractions } from '@/lib/medical/openfda'

export interface ClinicalExtractionResult {
  summary: string
  patient_summary: string
  issues: string[]
  diagnosis: Array<{
    condition: string
    icd10: string
    confidence: 'high' | 'medium' | 'low'
  }>
  prescriptions: Array<{
    id: string
    name: string
    dosage: string
    when_to_take: string[]
    timing: string[]
    meal_relation: 'before_meals' | 'after_meals' | 'with_meals' | 'any'
    duration_days: number
    notes: string
    actions: string
    confidence: 'high' | 'medium' | 'low'
    interactionWarning?: string
  }>
  referrals: string[]
  lifestyle_suggestions: Array<{
    category: string
    suggestion: string
  }>
}

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Step 1: Extract clinical data from transcript
    let extracted: ClinicalExtractionResult
    try {
      extracted = await generateJSON<ClinicalExtractionResult>(
        `Here is the clinical session transcript. Extract all medical data:\n\n${transcript}`,
        CLINICAL_EXTRACTION_SYSTEM_PROMPT
      )
    } catch (aiError) {
      console.error("AI extraction failed:", aiError)
      throw new Error("Failed to extract data from the transcript. Please try again or enter details manually.")
    }

    // Step 2: Post-process — validate and normalize prescriptions
    const normalizedPrescriptions = normalizePrescriptions(extracted.prescriptions || [])

    // Step 3: Check drug interactions via OpenFDA (free API)
    const prescriptionsWithWarnings = await checkDrugInteractions(normalizedPrescriptions)

    // Step 4: Generate a natural-language prompt for the doctor
    const aiPromptText = generateAiDoctorPrompt({
      symptomsCount: (extracted.issues || []).length,
      prescriptionsCount: normalizedPrescriptions.length,
      diagnosesCount: (extracted.diagnosis || []).length,
      referralsCount: (extracted.referrals || []).length,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...extracted,
        prescriptions: prescriptionsWithWarnings,
        aiPromptMessage: {
          message: aiPromptText,
          extractedCount: {
            symptoms: (extracted.issues || []).length,
            prescriptions: normalizedPrescriptions.length,
            diagnoses: (extracted.diagnosis || []).length,
            referrals: (extracted.referrals || []).length,
          },
        },
      },
    })
  } catch (error: any) {
    console.error('Clinical Extraction API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to extract clinical data' },
      { status: 500 }
    )
  }
}

/**
 * Normalize and validate extracted prescriptions.
 * Ensures IDs are unique, frequency arrays are valid, etc.
 */
function normalizePrescriptions(
  prescriptions: ClinicalExtractionResult['prescriptions']
) {
  const validWhenToTake = ['morning', 'afternoon', 'evening', 'night', 'as_needed']
  const validMealRelation = ['before_meals', 'after_meals', 'with_meals', 'any']

  return prescriptions.map((rx, index) => ({
    ...rx,
    id: rx.id || `rx_${index + 1}`,
    when_to_take: (rx.when_to_take || []).filter((w) =>
      validWhenToTake.includes(w)
    ),
    meal_relation: validMealRelation.includes(rx.meal_relation)
      ? rx.meal_relation
      : 'any',
    duration_days: typeof rx.duration_days === 'number' ? rx.duration_days : 0,
    notes: rx.notes || '',
    actions: rx.actions || '',
    confidence: rx.confidence || 'medium',
  }))
}

function generateAiDoctorPrompt(counts: {
  symptomsCount: number
  prescriptionsCount: number
  diagnosesCount: number
  referralsCount: number
}): string {
  const { symptomsCount, prescriptionsCount, diagnosesCount, referralsCount } = counts

  return `I've extracted ${symptomsCount} symptom(s), ${diagnosesCount} diagnosis, and ${prescriptionsCount} prescription(s)${referralsCount > 0 ? `, along with ${referralsCount} referral(s)` : ''}. Does this look complete?`
}
