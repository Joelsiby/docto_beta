import { GoogleGenerativeAI } from "@google/generative-ai"
import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Helper to get active provider
function getProvider(): string {
  return (process.env.AI_PROVIDER || "google").toLowerCase()
}

// Lazy initializers for SDK clients to prevent errors when keys are missing
let genAIInstance: GoogleGenerativeAI | null = null
function getGeminiClient() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment variables.")
    }
    genAIInstance = new GoogleGenerativeAI(apiKey || "")
  }
  return genAIInstance
}

let anthropicInstance: Anthropic | null = null
function getAnthropicClient() {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn("ANTHROPIC_API_KEY is not defined in the environment variables.")
    }
    anthropicInstance = new Anthropic({ apiKey: apiKey || "" })
  }
  return anthropicInstance
}

let nvidiaInstance: OpenAI | null = null
function getNvidiaClient() {
  if (!nvidiaInstance) {
    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      console.warn("NVIDIA_API_KEY is not defined in the environment variables.")
    }
    nvidiaInstance = new OpenAI({
      apiKey: apiKey || "",
      baseURL: "https://integrate.api.nvidia.com/v1"
    })
  }
  return nvidiaInstance
}

/**
 * Generates text using the active AI provider.
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  history?: Message[]
): Promise<string> {
  const provider = getProvider()

  if (provider === "google") {
    const client = getGeminiClient()
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash"
    
    const model = client.getGenerativeModel({
      model: modelName,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {})
    })

    if (history && history.length > 0) {
      const formattedHistory = history
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))

      const chat = model.startChat({
        history: formattedHistory,
      })
      const result = await chat.sendMessage(prompt)
      return result.response.text().trim()
    } else {
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    }
  } 
  
  if (provider === "anthropic") {
    const client = getAnthropicClient()
    const modelName = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest"

    const messages: Anthropic.MessageParam[] = []
    
    if (history) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })
        }
      }
    }
    
    messages.push({ role: 'user', content: prompt })

    const response = await client.messages.create({
      model: modelName,
      system: systemPrompt,
      messages: messages,
      max_tokens: 4096
    })

    const textContent = response.content[0]
    if (textContent.type === 'text') {
      return textContent.text.trim()
    }
    return ""
  } 
  
  if (provider === "nvidia") {
    const client = getNvidiaClient()
    const modelName = process.env.NVIDIA_MODEL || "google/gemma-2-9b-it"

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt })
    }

    if (history) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }

    messages.push({ role: "user", content: prompt })

    const response = await client.chat.completions.create({
      model: modelName,
      messages: messages,
      temperature: 0.2,
      max_tokens: 4096
    })

    return (response.choices[0].message.content || "").trim()
  }

  throw new Error(`Unsupported AI provider: ${provider}`)
}

/**
 * Generates and parses a JSON object using the active AI provider.
 */
export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const provider = getProvider()

  // For NVIDIA (OpenAI SDK), we can enforce json_object if supported, 
  // but standard text generation with JSON cleanup is highly reliable across all models.
  const responseText = await generateText(prompt, systemPrompt)
  
  let cleanedText = responseText.trim()
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```$/, '').trim()
  }

  try {
    return JSON.parse(cleanedText) as T
  } catch (err) {
    console.error("Failed to parse JSON response:", responseText)
    throw new Error(`Invalid JSON format returned by provider: ${err}`)
  }
}
