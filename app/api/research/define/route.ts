import { generateText } from '@/lib/ai/provider'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text, action } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    let prompt = ''
    const conciseness = "\n\nKeep the response highly concise, clinical, and directly to the point. Do not exceed 3-4 short sentences or bullet points."
    
    if (action === 'meaning') {
      prompt = `Provide a concise, professional medical definition of the following term:\n\n"${text}"${conciseness}`
    } else if (action === 'meaning_context') {
      prompt = `Explain the meaning of the following term or phrase in a medical/clinical context:\n\n"${text}"${conciseness}`
    } else if (action === 'root') {
      prompt = `Provide the etymology and root words (e.g., Latin, Greek) of the following medical term, and explain how the root parts form the meaning:\n\n"${text}"${conciseness}`
    } else if (action === 'pronounce') {
      prompt = `Provide the phonetic pronunciation guide and a brief explanation of how to pronounce the following medical term:\n\n"${text}"${conciseness}`
    } else if (action === 'simplify') {
      prompt = `Translate/rewrite the following medical text in simple, plain, easy-to-understand layperson English (perfect for patient explanations):\n\n"${text}"${conciseness}`
    } else if (action === 'summarize') {
      prompt = `Summarize the following medical text concisely:\n\n"${text}"${conciseness}`
    } else if (action === 'function') {
      prompt = `Explain the function or significance of the following text within a broader clinical or medical paragraph/context:\n\n"${text}"${conciseness}`
    } else if (action === 'takeaways') {
      prompt = `Extract the key takeaways from the following clinical text in a concise bulleted list (max 3 bullets):\n\n"${text}"`
    } else {
      prompt = `Analyze the following text from a medical context:\n\n"${text}"${conciseness}`
    }

    const responseText = await generateText(prompt)

    return NextResponse.json({
      success: true,
      result: responseText,
    })
  } catch (error: any) {
    console.error('Define API Error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to process request' }, { status: 500 })
  }
}
