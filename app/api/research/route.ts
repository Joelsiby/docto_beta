import { generateJSON } from '@/lib/ai/provider'
import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const mimeType = file.type || 'application/pdf'

    let textContent = ''
    if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const parsedPdf = await pdf(fileBuffer)
      textContent = parsedPdf.text
    } else {
      textContent = fileBuffer.toString('utf-8')
    }

    const prompt = `
Analyze the following medical document and extract highly structured clinical insights.

Document Content:
${textContent}

OPERATIONAL CONSTRAINTS:
1. Strict Grounding: Base all answers primarily on the provided document. If the document is silent on a topic, explicitly state: "The provided document does not contain information on this specific aspect."
2. Citations: Every claim must include an in-line citation indicating the document name/section (e.g., [Document A, Intro]).
3. Clinical Perspective: When summarizing, prioritize Pathophysiology, Pharmacological Mechanism, Clinical Indications, Contraindications, and Adverse Effects.
4. Formatting: Use HTML tables for drug comparisons, dosage schedules, or symptom criteria. Use HTML bulleted lists for pathophysiological steps. Format your strings in pure HTML to be rendered safely inside a React application.

Please output your response as a pure JSON object (no markdown formatting, no \`\`\`json block) with the following exact structure:
{
  "title": "Title of the research paper or document",
  "executiveSummary": "<ul><li>bullet 1</li><li>bullet 2</li><li>bullet 3</li></ul>",
  "deepDive": "<h3>Pathophysiology</h3><p>...</p><h3>Pharmacology</h3><table>...</table>",
  "clinicalVignettes": "<h3>Case 1</h3><p>...</p><p><strong>Answer & Justification:</strong> ...</p>",
  "externalContext": "<p>Identification of conflicting or supporting consensus standards from major bodies (e.g., WHO, CDC, JAMA).</p>",
  "keyTakeaways": [
    "Short 1-sentence insight 1",
    "Short 1-sentence insight 2",
    "Short 1-sentence insight 3"
  ]
}

Only return the raw JSON object. Do not include any other text.
`

    const parsedResult = await generateJSON<any>(
      prompt,
      "You are an expert Academic Medical Assistant specializing in the synthesis of clinical guidelines, research papers, and case studies."
    )

    return NextResponse.json({
      success: true,
      title: parsedResult.title || file.name,
      executiveSummary: parsedResult.executiveSummary || '<p>Not available</p>',
      deepDive: parsedResult.deepDive || '<p>Not available</p>',
      clinicalVignettes: parsedResult.clinicalVignettes || '<p>Not available</p>',
      externalContext: parsedResult.externalContext || '<p>Not available</p>',
      keyTakeaways: parsedResult.keyTakeaways || [],
      rawText: textContent,
    })
  } catch (error: any) {
    console.error('Research API Error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to process document' }, { status: 500 })
  }
}
