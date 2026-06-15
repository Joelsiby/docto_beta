/**
 * POST /api/session/voice-command
 * Parses doctor's voice command (English/Hindi) and updates the prescription list.
 * Uses NVIDIA LLaMA-3.1-70B for NLP parsing.
 */

import { NextResponse } from 'next/server'
import { generateJSON } from '@/lib/ai/provider'
import { VOICE_COMMAND_PRESCRIPTION_PROMPT } from '@/lib/ai/medical-prompts'

interface VoiceCommandRequest {
  command: string
  currentPrescriptions: any[]
  language?: 'en' | 'hi'
}

interface VoiceCommandResult {
  action: 'add' | 'update' | 'delete' | 'modify'
  parsed_command: string
  prescriptions: any[]
}

export async function POST(req: Request) {
  try {
    const { command, currentPrescriptions, language = 'en' }: VoiceCommandRequest =
      await req.json()

    if (!command || command.trim().length < 3) {
      return NextResponse.json({ error: 'Voice command too short' }, { status: 400 })
    }

    const prompt = `
Doctor's voice command (language: ${language}): "${command}"

Current prescription list:
${JSON.stringify(currentPrescriptions, null, 2)}

Parse the command and return the COMPLETE updated prescription list.
`

    const result = await generateJSON<VoiceCommandResult>(
      prompt,
      VOICE_COMMAND_PRESCRIPTION_PROMPT
    )

    // Assign unique IDs to any new prescriptions
    const updatedPrescriptions = (result.prescriptions || []).map((rx, index) => ({
      ...rx,
      id: rx.id || `rx_${Date.now()}_${index}`,
    }))

    return NextResponse.json({
      success: true,
      action: result.action,
      parsed_command: result.parsed_command,
      prescriptions: updatedPrescriptions,
    })
  } catch (error: any) {
    console.error('Voice Command API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process voice command' },
      { status: 500 }
    )
  }
}
