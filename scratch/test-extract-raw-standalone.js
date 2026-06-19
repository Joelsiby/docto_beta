const { OpenAI } = require("openai");
const fs = require("fs");
const path = require('path');

// Read the prompts file to get the exact prompt string
const promptsFileContent = fs.readFileSync('/Applications/Onestone/docto beta/docto_beta/lib/ai/medical-prompts.ts', 'utf8');

// Simple regex extraction of CLINICAL_EXTRACTION_SYSTEM_PROMPT
const promptMatch = promptsFileContent.match(/export const CLINICAL_EXTRACTION_SYSTEM_PROMPT = `([\s\S]*?)`/);
if (!promptMatch) {
  console.error("Could not extract system prompt!");
  process.exit(1);
}
const systemPrompt = promptMatch[1];

// Load env
const envFile = fs.readFileSync('/Applications/Onestone/docto beta/docto_beta/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const apiKey = env.NVIDIA_API_KEY;
const baseURL = "https://integrate.api.nvidia.com/v1";
const model = env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct";

const transcript = "Doctor: Good morning. What brings you in today?\nPatient: Hello Doctor, I've had a bad cough for about 5 days, and I'm also running a mild fever since yesterday.\nDoctor: Okay. Are you having any shortness of breath or chest pain when you cough?\nPatient: No shortness of breath, but my chest feels a bit tight and sore from coughing so much. It's a dry cough mostly.\nDoctor: Let me listen to your lungs. Please take a deep breath... Lungs sound clear, but your throat is quite red. I suspect it's acute bronchitis, likely viral.\nPatient: Is it serious? Do I need antibiotics?\nDoctor: No antibiotics needed since it's viral. I'll prescribe Paracetamol 650mg twice daily for 3 days after food, and Levolin Syrup 5ml three times daily for 5 days after food. Also take Cetirizine 10mg once at night for the allergic component. Drink plenty of warm fluids and rest well.";

async function run() {
  try {
    const openai = new OpenAI({ apiKey, baseURL });
    console.log("Calling NVIDIA Llama-3.3 with Clinical Extraction prompt...");
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the clinical session transcript. Extract all medical data:\n\n${transcript}` }
      ],
      temperature: 0.2,
      max_tokens: 4096
    });
    console.log("Duration:", ((Date.now() - start) / 1000).toFixed(2), "seconds");
    const raw = response.choices[0].message.content;
    console.log("=== RAW RESPONSE ===");
    console.log(raw);
    console.log("====================");

    let cleanedText = raw.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    console.log("Parsed JSON:", JSON.stringify(JSON.parse(cleanedText), null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
