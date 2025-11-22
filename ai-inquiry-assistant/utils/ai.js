import dotenv from "dotenv";
dotenv.config();

import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeInquiry = async (inquiry) => {
  const supportAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI inquiry triage assistant",
    system: ``,
  });

  const response =
    await supportAgent.run(`You are a medical triage AI agent. Always respond ONLY with valid JSON, no extra text, no markdown, and no code fences.

Analyse the following inquiry and provide a JSON object with:

urgency: One of "critical", "high", "medium", or "low"

requiredSpecialty: An array of medical specialties relevant to the symptoms

clinicalNotes: Clear notes for the provider, including likely differentials and what they should review first

deadline: A recommended response deadline, expressed as an ISO 8601 timestamp based on urgency

summary: A short 1 to 2 sentence summary of the issue

languageRecommendation: If the preferredLanguage differs from English, note it so the provider can communicate accordingly

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:


{
"urgency": "",
"requiredSpecialty": [],
"clinicalNotes": "",
"deadline": "",
"summary": "",
"languageRecommendation": ""
}

Patient inquiry:

Chief complaint: ${inquiry.chiefComplaint}

Symptoms: ${inquiry.symptoms}

Age: ${inquiry.patientAge}

Insurance: ${inquiry.insuranceType}

Preferred language: ${inquiry.preferredLanguage}`);
  const raw = response.output[0].context;

  try {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/i);
  const jsonString = match ? (match[1] || match[2]) : raw.trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.log("Failed to parse JSON from AI response" + e.message);
    return null; // watch out for this
  }
};

export default analyzeInquiry;
