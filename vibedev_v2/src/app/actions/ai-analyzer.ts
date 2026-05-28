"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function analyzeCodeWithGroq(fileContent: string, fileName: string) {
  if (!process.env.GROQ_API_KEY) {
    return [
      {
        id: "env-missing",
        type: "error",
        metric: "API Configuration Missing",
        targetFile: fileName,
        description: "GROQ_API_KEY environment variable is missing on the server.",
        impactScore: 100,
        recommendation: "Add GROQ_API_KEY to your .env file and clear the cache."
      }
    ];
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a code reviewer. Analyze the file and return a strict valid JSON array containing objects matching this template:
          {
            "id": "unique-string",
            "type": "error" | "warning" | "info",
            "metric": "Issue Name",
            "targetFile": "${fileName}",
            "description": "Short code issue summary",
            "impactScore": 80,
            "recommendation": "Exact code fix"
          }
          Do not output markdown code blocks. Output raw JSON only.`
        },
        {
          role: "user",
          content: `File: ${fileName}\n\nCode:\n${fileContent}`
        }
      ],
      model: "llama-3.3-70b-versatile", // 🔥 Current highly-active stable production model
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    let responseText = chatCompletion.choices[0]?.message?.content || "[]";
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(responseText);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.insights && Array.isArray(parsed.insights)) return parsed.insights;
    
    return Object.keys(parsed).length > 0 ? [parsed] : [];

  } catch (error: any) {
    console.error("Groq Failure:", error);
    return [
      {
        id: "groq-api-exception",
        type: "error",
        metric: "Groq Cloud Exception",
        targetFile: fileName,
        description: error?.message || "Failed to process tokens with the versatile model cluster.",
        impactScore: 90,
        recommendation: "Ensure model endpoints align with your current Groq tier access."
      }
    ];
  }
}