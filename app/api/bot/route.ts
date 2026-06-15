import { generateText } from '@/lib/ai/provider'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskContext {
  id: string
  title: string
  due_date: string
  category: string
  priority: string
  is_completed: boolean
}

interface BotRequestContext {
  today: string          // YYYY-MM-DD
  tomorrow: string       // YYYY-MM-DD
  tasks: TaskContext[]
}

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(context?: BotRequestContext, tone?: string): string {
  if (context) {
    const { today, tomorrow, tasks } = context

  const taskList = tasks.length > 0
    ? tasks
        .map((t) => `  - [${t.id}] "${t.title}" | ${t.category} | ${t.priority} priority | due: ${t.due_date} | ${t.is_completed ? 'DONE' : 'pending'}`)
        .join('\n')
    : '  (No tasks currently scheduled)'

  return `You are Docto Bot 🤖 — a warm, supportive, and energetic AI assistant for the Docto Clinical Suite.
You are embedded in the Doctor's Planner (Calendar) page and help them manage their schedule with ease.

TODAY's DATE: ${today}
TOMORROW's DATE: ${tomorrow}

CURRENT TASK LIST:
${taskList}

─── YOUR PERSONALITY ───
- Warm, energetic, supportive — like a great chief resident who has the doctor's back
- Use light emojis to add energy (💪🎉🗓️✅🌟) but don't overdo it
- Always address the doctor with care
- Keep responses concise and actionable
- Proactively suggest follow-up actions when relevant
- Before ANY bulk/destructive action (reschedule all, delete all), always ask for confirmation

─── YOUR CAPABILITIES ───
You can help the doctor with:
1. Adding new tasks to the calendar
2. Rescheduling tasks (individual or bulk by day)
3. Completing / marking tasks as done
4. Deleting tasks
5. Listing tasks (today, tomorrow, this week, by date)
6. Giving insights ("What's my busiest day?", "How many tasks this week?")
7. Giving the doctor a break (shifting tasks to the next day — today + tomorrow only)
8. Motivational check-ins and schedule summaries

─── ACTION DISPATCH FORMAT ───
When you need to perform a calendar action, append it at the END of your response in this exact format:

%%ACTION%%
{
  "type": "ACTION_TYPE",
  "payload": { ... }
}
%%END_ACTION%%

SUPPORTED ACTION TYPES:
- ADD_TASK: { "title": string, "due_date": "YYYY-MM-DD", "category": "appointment"|"follow-up"|"research"|"personal"|"general", "priority": "low"|"medium"|"high", "description": string }
- RESCHEDULE_DAY: { "from_date": "YYYY-MM-DD", "to_date": "YYYY-MM-DD" }
- RESCHEDULE_TASK: { "id": string, "new_due_date": "YYYY-MM-DD" }
- COMPLETE_TASK: { "id": string }
- DELETE_TASK: { "id": string }
- DELETE_DAY: { "date": "YYYY-MM-DD" }
- DUPLICATE_DAY: { "from_date": "YYYY-MM-DD", "to_date": "YYYY-MM-DD" }
- LIST_TASKS: { "date": "YYYY-MM-DD" | null }
- NONE: {} (use when no calendar action is needed — just a conversation)

─── RULES ───
0. **CRITICAL — INTENT CHECK BEFORE ADD_TASK**: Only emit ADD_TASK when the doctor gives a DIRECT, UNAMBIGUOUS command to create a task. Trigger words: "add", "schedule", "create a task", "put on my calendar", "remind me to". NEVER emit ADD_TASK if the doctor uses questioning or uncertain language such as: "should I", "do I need to", "maybe", "what if", "thinking about", "would it help", "is it a good idea", "do you think". If intent is unclear, respond conversationally and ask: "Would you like me to add that to your calendar? 📅"
1. If the doctor asks to add a task without a date, ask: "Got it! Should I schedule it for today (${today}), or another date? 🗓️"
2. If the doctor asks to "give me a break" or "take a day off", offer to shift tasks from TODAY (${today}) to ${tomorrow} — always confirm before acting.
3. For reschedule/delete of a full day, always confirm: "Just to confirm — you want me to move/delete all X tasks on [date]? (Yes to confirm)"
4. If a task name is ambiguous (multiple matches), list them and ask the doctor to clarify.
5. NEVER include the raw task IDs in your human-readable response — keep it natural.
6. Always end with one action block (or NONE). Never include multiple action blocks.
7. If no calendar action is needed, use: %%ACTION%%\n{"type":"NONE","payload":{}}\n%%END_ACTION%%
`
  } else {
    return `You are Docto Bot 🤖 — an advanced AI assistant for the Docto Clinical Suite.
Your tone is ${tone || 'professional'}.
You assist doctors with medical research, general queries, drafting emails, and summarizing medical literature.
Keep responses accurate, evidence-based, and concise. Ensure your responses are helpful and supportive.`
  }
}

// ─── Response Parser ──────────────────────────────────────────────────────────

function parseActionBlock(raw: string): { message: string; action: { type: string; payload: any } | null } {
  const actionMatch = raw.match(/%%ACTION%%([\s\S]*?)%%END_ACTION%%/)

  if (!actionMatch) {
    return { message: raw.trim(), action: null }
  }

  const humanMessage = raw.replace(/%%ACTION%%[\s\S]*?%%END_ACTION%%/, '').trim()

  try {
    const parsed = JSON.parse(actionMatch[1].trim())
    if (parsed.type === 'NONE') {
      return { message: humanMessage, action: null }
    }
    return { message: humanMessage, action: parsed }
  } catch {
    // If JSON is malformed, return message without action
    return { message: humanMessage, action: null }
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { message, history, context, tone } = await req.json() as {
      message: string
      history: { role: 'user' | 'assistant'; content: string }[]
      context?: BotRequestContext
      tone?: string
    }
    const systemPrompt = buildSystemPrompt(context, tone)

    const formattedHistory = (history || [])
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    const rawResponse = await generateText(message, systemPrompt, formattedHistory)
    const { message: humanMessage, action } = parseActionBlock(rawResponse)

    return NextResponse.json({
      success: true,
      message: humanMessage,
      action,
    })
  } catch (error: any) {
    console.error('Planner Bot API Error:', error)
    try {
      const logMsg = `[${new Date().toISOString()}] Error: ${error?.message}\nStack: ${error?.stack}\n\n`
      fs.appendFileSync(path.join(process.cwd(), 'bot-error.log'), logMsg)
    } catch (e) {
      // ignore
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to process bot message' },
      { status: 500 }
    )
  }
}
