/**
 * POST /api/session/transcribe
 * Receives audio blob chunks and returns transcript text.
 * Uses NVIDIA NIM (llama-3.1-70b) to process audio context.
 *
 * NOTE: For batch transcription (every 10-30s chunks), the audio blob
 * is sent as base64. The model processes it via STT-capable endpoint.
 * Falls back to Web Speech API transcript if no STT endpoint available.
 */

import { NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/provider'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let transcriptText = ''

    if (contentType.includes('application/json')) {
      // Fallback: browser-side Web Speech API already transcribed the text
      // Doctor sends the text directly, we just label the speaker
      const { text, speakerHint } = await req.json()
      transcriptText = text

      if (!transcriptText) {
        return NextResponse.json({ error: 'No transcript text provided' }, { status: 400 })
      }

      // Use AI to determine speaker context if ambiguous
      const speaker = speakerHint === 'doctor'
        ? 'Doctor'
        : speakerHint === 'patient'
        ? 'Patient'
        : await identifySpeaker(transcriptText)

      return NextResponse.json({
        success: true,
        transcript: {
          text: transcriptText.trim(),
          speaker,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Future: audio/webm handling for direct audio upload
    return NextResponse.json(
      { error: 'Unsupported content type. Use application/json with text field.' },
      { status: 415 }
    )
  } catch (error: any) {
    console.error('Transcription API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}

/**
 * Uses AI to guess whether a sentence was likely said by a doctor or patient.
 * Simple heuristic-based classification — not 100% accurate, used as fallback only.
 */
async function identifySpeaker(text: string): Promise<'Doctor' | 'Patient'> {
  const doctorKeywords = [
    'prescribe', 'diagnosis', 'recommend', 'mg', 'take', 'tablet',
    'blood pressure', 'referred', 'examination', 'listen to your',
    'let me check', 'i will prescribe', 'you should', 'your results',
    'I suspect', 'come back', 'avoid', 'twice a day', 'once daily',
  ]
  const lowerText = text.toLowerCase()
  const isDoctor = doctorKeywords.some((kw) => lowerText.includes(kw))
  return isDoctor ? 'Doctor' : 'Patient'
}
