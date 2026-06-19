const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require('path');

// Manually extract and interpolate the system prompt
const promptsFileContent = fs.readFileSync('/Applications/Onestone/docto beta/docto_beta/lib/ai/medical-prompts.ts', 'utf8');

const groundingMatch = promptsFileContent.match(/const MEDICAL_GROUNDING_CONTEXT = `([\s\S]*?)`/);
const promptMatch = promptsFileContent.match(/export const CLINICAL_EXTRACTION_SYSTEM_PROMPT = `([\s\S]*?)`/);

if (!groundingMatch || !promptMatch) {
  console.error("Failed to extract prompts!");
  process.exit(1);
}

const groundingContext = groundingMatch[1];
const systemPrompt = promptMatch[1].replace('${MEDICAL_GROUNDING_CONTEXT}', groundingContext);

// Load env
const envFile = fs.readFileSync('/Applications/Onestone/docto beta/docto_beta/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const apiKey = env.GEMINI_API_KEY;
const modelName = "gemini-2.0-flash";

const transcript = "Doctor: Good morning. What brings you in today?\nPatient: Hello Doctor, I've had a bad cough for about 5 days, and I'm also running a mild fever since yesterday.\nDoctor: Okay. Are you having any shortness of breath or chest pain when you cough?\nPatient: No shortness of breath, but my chest feels a bit tight and sore from coughing so much. It's a dry cough mostly.\nDoctor: Let me listen to your lungs. Please take a deep breath... Lungs sound clear, but your throat is quite red. I suspect it's acute bronchitis, likely viral.\nPatient: Is it serious? Do I need antibiotics?\nDoctor: No antibiotics needed since it's viral. I'll prescribe Paracetamol 650mg twice daily for 3 days after food, and Levolin Syrup 5ml three times daily for 5 days after food. Also take Cetirizine 10mg once at night for the allergic component. Drink plenty of warm fluids and rest well.";

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt
    });

    console.log(`Calling Gemini ${modelName}...`);
    const start = Date.now();
    const result = await model.generateContent(`Here is the clinical session transcript. Extract all medical data:\n\n${transcript}`);
    const responseText = result.response.text();
    console.log("Duration:", ((Date.now() - start) / 1000).toFixed(2), "seconds");
    console.log("=== RAW RESPONSE ===");
    console.log(responseText);
    console.log("====================");

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    console.log("Parsed JSON:", JSON.stringify(JSON.parse(cleanedText), null, 2));
  } catch (err) {
    console.error("Error calling Gemini:", err);
  }
}

run();
