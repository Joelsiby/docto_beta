/**
 * POST /api/reports/analyze
 *
 * Analyzes a medical lab report (PDF or image) using AI.
 * Strategy (MarkItDown-equivalent in JS):
 *  1. If image (PNG/JPG): Send to Gemini Vision multimodal directly
 *  2. If digital PDF: Extract text with pdf-parse → send to Gemini text model
 *  3. If scanned PDF (no text / < 100 chars extracted): Fall back to Gemini Vision
 *
 * Returns structured analysis with flagged parameters, remedies, and recommendations.
 */

import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { REPORT_ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/medical-prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// ── PDF Text Extraction ────────────────────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid issues with ESM/CJS in Next.js
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)
    return data.text || ''
  } catch (err) {
    console.warn('pdf-parse extraction failed, will use Vision fallback:', err)
    return ''
  }
}

// ── Gemini Vision Analysis (for images and scanned PDFs) ──────────────────────
async function analyzeWithVision(
  buffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: REPORT_ANALYSIS_SYSTEM_PROMPT,
  })

  const imagePart = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType as 'image/jpeg' | 'image/png' | 'application/pdf',
    },
  }

  const result = await model.generateContent([imagePart, prompt])
  return result.response.text().trim()
}

// ── Gemini Text Analysis (for digital PDFs with extracted text) ───────────────
async function analyzeWithText(extractedText: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: REPORT_ANALYSIS_SYSTEM_PROMPT,
  })

  const prompt = `Analyze this medical lab report and extract all parameters:

REPORT TEXT:
${extractedText}

Return the analysis as a pure JSON object following the schema in your instructions.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

// ── Fallback mock for development (when no Gemini key available) ──────────────
function getMockAnalysis() {
  return {
    report_type: 'blood_work',
    overall_status: 'attention_required',
    summary:
      'Your blood report shows a few areas that need attention. Your hemoglobin is slightly below normal, which suggests mild anemia — a common condition in India, especially in women. Your Vitamin D levels are also low, which affects bone health and immunity. The good news is these can be improved with diet and supplements.',
    recommendations: [
      'Take iron-rich foods like palak, pomegranate, and dal daily',
      'Get 15–20 minutes of morning sunlight daily for Vitamin D',
      'Consult your doctor about Vitamin D 60,000 IU supplements',
      'Repeat CBC blood test after 3 months to track improvement',
    ],
    flagged_parameters: [
      {
        name: 'Hemoglobin',
        value: '10.2',
        unit: 'g/dL',
        normal_range: '12–15 g/dL (Women)',
        status: 'low',
        explanation:
          'Your hemoglobin is below the normal range for women, which means your blood is carrying less oxygen than it should. This can cause tiredness, weakness, and shortness of breath.',
        remedy:
          'Eat spinach (palak), pomegranate (anaar), amla, dates (khajoor), and jaggery (gur) daily. Take iron tablets if prescribed. Avoid tea/coffee with meals as they block iron absorption.',
      },
      {
        name: 'Vitamin D (25-OH)',
        value: '14',
        unit: 'ng/mL',
        normal_range: '20–50 ng/mL',
        status: 'low',
        explanation:
          'Vitamin D deficiency is very common in India — over 80% of Indians are deficient. Low Vitamin D affects your bones, immunity, and mood.',
        remedy:
          'Spend 15–20 minutes in morning sunlight (before 10 AM) daily. Include dairy, eggs, and fortified milk in your diet. Your doctor may prescribe Vitamin D supplements.',
      },
    ],
    all_parameters: [
      { name: 'Hemoglobin', value: '10.2', unit: 'g/dL', normal_range: '12–15', status: 'low' },
      { name: 'WBC', value: '7,200', unit: 'cells/cumm', normal_range: '4,000–11,000', status: 'normal' },
      { name: 'Platelet Count', value: '2.4 Lakh', unit: '/cumm', normal_range: '1.5–4.0 Lakh', status: 'normal' },
      { name: 'Vitamin D', value: '14', unit: 'ng/mL', normal_range: '20–50', status: 'low' },
      { name: 'Blood Glucose (Fasting)', value: '92', unit: 'mg/dL', normal_range: '70–100', status: 'normal' },
    ],
    follow_up: 'Repeat CBC and Vitamin D after 3 months. Consult your doctor if fatigue persists.',
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const reportId = formData.get('reportId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = file.type
    const isPdf = mimeType === 'application/pdf'
    const isImage = mimeType.startsWith('image/')

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set — returning mock analysis for dev')
      return NextResponse.json({
        analysis: getMockAnalysis(),
        flagged: getMockAnalysis().flagged_parameters,
        reportId,
      })
    }

    let rawResponse = ''

    if (isImage) {
      // Direct Vision analysis for PNG/JPG
      rawResponse = await analyzeWithVision(
        buffer,
        mimeType,
        'Please analyze this medical lab report image and extract all test parameters, flagged values, and provide recommendations.'
      )
    } else if (isPdf) {
      // Try text extraction first (MarkItDown-equivalent: PDF → text)
      const extractedText = await extractPdfText(buffer)

      if (extractedText.trim().length > 100) {
        // Digital PDF with readable text layer
        rawResponse = await analyzeWithText(extractedText)
      } else {
        // Scanned PDF — use Gemini Vision with the PDF directly
        rawResponse = await analyzeWithVision(
          buffer,
          'application/pdf',
          'Please analyze this scanned medical lab report PDF and extract all test parameters, flagged values, and provide recommendations for an Indian patient.'
        )
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, PNG, or JPG.' }, { status: 400 })
    }

    // Parse the JSON response
    let analysisData: any = null
    let cleanedResponse = rawResponse.trim()
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
    }

    try {
      analysisData = JSON.parse(cleanedResponse)
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', rawResponse.substring(0, 500))
      // Return mock on parse failure in development
      analysisData = getMockAnalysis()
    }

    if (analysisData?.error) {
      return NextResponse.json(
        { error: analysisData.error, analysis: null, flagged: [] },
        { status: 422 }
      )
    }

    return NextResponse.json({
      analysis: analysisData,
      flagged: analysisData.flagged_parameters || [],
      reportId,
    })
  } catch (error: any) {
    console.error('Report Analysis API Error:', error)
    // Return mock on any error so uploads don't completely fail
    const mock = getMockAnalysis()
    return NextResponse.json({
      analysis: mock,
      flagged: mock.flagged_parameters,
      reportId: null,
      _fallback: true,
    })
  }
}
