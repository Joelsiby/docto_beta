/**
 * lib/medical/openfda.ts
 *
 * Drug interaction checking using OpenFDA API (free, no API key required).
 * Endpoint: https://api.fda.gov/drug/label.json
 *
 * We check for known interactions between prescribed medicines.
 * Results are used to display warnings in the prescription table.
 */

interface PrescriptionItem {
  id: string
  name: string
  [key: string]: any
}

interface DrugInteractionWarning {
  drug: string
  warning: string
}

/**
 * Checks OpenFDA for interaction warnings for each drug.
 * Annotates each prescription with an interactionWarning field if found.
 */
export async function checkDrugInteractions<T extends PrescriptionItem>(
  prescriptions: T[]
): Promise<T[]> {
  if (!prescriptions || prescriptions.length === 0) return prescriptions

  const results = await Promise.allSettled(
    prescriptions.map((rx) => fetchDrugWarning(rx.name))
  )

  return prescriptions.map((rx, index) => {
    const result = results[index]
    const warning =
      result.status === 'fulfilled' && result.value ? result.value : undefined
    return { ...rx, interactionWarning: warning }
  })
}

/**
 * Fetches the drug interaction / warning section from OpenFDA for a given drug name.
 * Returns a short warning string if found, null otherwise.
 */
async function fetchDrugWarning(drugName: string): Promise<string | null> {
  try {
    // Clean drug name: extract generic name (before any numbers/units)
    const cleanName = drugName
      .replace(/\d+\s*(mg|ml|mcg|iu|g|%)/gi, '')
      .trim()
      .split(' ')[0] // Take first word (generic name)

    if (!cleanName || cleanName.length < 3) return null

    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(cleanName)}"&limit=1`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Docto-Medical-Platform/1.0' },
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const data = await response.json()

    if (!data.results || data.results.length === 0) return null

    const label = data.results[0]

    // Extract most relevant warning section
    const warningText =
      label.drug_interactions?.[0] ||
      label.warnings_and_cautions?.[0] ||
      label.warnings?.[0] ||
      null

    if (!warningText) return null

    // Truncate to first 150 characters for display
    return warningText.length > 150
      ? warningText.substring(0, 150).trim() + '...'
      : warningText.trim()
  } catch (error) {
    // Silently fail — drug interaction check is supplementary, not critical
    return null
  }
}

/**
 * Quick check: are any two drugs in the list known to interact?
 * Uses a local rule-based list of common serious interactions for speed.
 */
export function checkLocalInteractions(prescriptions: PrescriptionItem[]): string[] {
  const warnings: string[] = []

  // Common clinically significant interaction pairs (partial list)
  const knownInteractions: Array<[string, string, string]> = [
    ['warfarin', 'aspirin', 'Increased bleeding risk: Warfarin + Aspirin'],
    ['warfarin', 'ibuprofen', 'Increased bleeding risk: Warfarin + NSAIDs'],
    ['metformin', 'alcohol', 'Risk of lactic acidosis: Metformin + Alcohol'],
    ['simvastatin', 'clarithromycin', 'Risk of myopathy: Simvastatin + Clarithromycin'],
    ['ciprofloxacin', 'antacid', 'Reduced absorption: Cipro + Antacids — take 2h apart'],
    ['ssri', 'tramadol', 'Risk of serotonin syndrome: SSRIs + Tramadol'],
    ['digoxin', 'amiodarone', 'Toxicity risk: Digoxin + Amiodarone — monitor closely'],
    ['lisinopril', 'potassium', 'Hyperkalemia risk: ACE inhibitors + Potassium supplements'],
    ['cetirizine', 'alcohol', 'Increased sedation: Antihistamines + Alcohol — avoid driving'],
  ]

  const drugNames = prescriptions.map((rx) => rx.name.toLowerCase())

  for (const [drug1, drug2, message] of knownInteractions) {
    const hasDrug1 = drugNames.some((n) => n.includes(drug1))
    const hasDrug2 = drugNames.some((n) => n.includes(drug2))
    if (hasDrug1 && hasDrug2) {
      warnings.push(message)
    }
  }

  return warnings
}
