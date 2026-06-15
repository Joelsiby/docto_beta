  const { OpenAI } = require("openai");

const apiKey = "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";
const baseURL = "https://integrate.api.nvidia.com/v1";
const model = "moonshotai/kimi-k2.6";

async function run() {
  try {
    const openai = new OpenAI({ apiKey, baseURL });
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Hello!" }],
      temperature: 0.2,
      max_tokens: 100
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error calling Nvidia API:", err);
  }
}

run();
