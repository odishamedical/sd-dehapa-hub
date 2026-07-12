import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { patientNotes, vitals, currentMeds } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const prompt = `
You are an expert Medical AI Assistant designed to help doctors. 
Analyze the following patient data and suggest potential diagnoses and a recommended treatment plan (medications). 
Be concise and structure your response clearly. This is for a doctor's review, not a final prescription.

Patient Notes: ${patientNotes || 'None'}
Vitals: ${JSON.stringify(vitals || {})}
Current Medications: ${currentMeds || 'None'}

Please provide:
1. Top 3 Potential Diagnoses (with brief reasoning)
2. Recommended Treatment Plan / Medications (with dosage)
3. Any red flags or recommended lab tests
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch from Gemini");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis could be generated.";

    return NextResponse.json({ analysis: generatedText });
  } catch (error: any) {
    console.error("AI Diagnosis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
