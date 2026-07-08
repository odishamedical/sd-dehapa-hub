import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientDetails, chiefComplaints } = body;

    if (!chiefComplaints) {
      return NextResponse.json({ error: "Chief complaints are required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
    }

    // Configure the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2, // Low temperature for clinical accuracy
      }
    });

    const prompt = `
You are an advanced Clinical Decision Support System (CDSS) for doctors.
A doctor is using a digital prescription pad and has entered the following patient context:

Patient Details: ${JSON.stringify(patientDetails || {})}
Chief Complaints / History: "${chiefComplaints}"

Based ONLY on the chief complaints provided, generate a highly probable clinical suggestion for the doctor.
You must return the response as a pure JSON object without any markdown formatting, backticks, or extra text.

The JSON MUST exactly match this structure:
{
  "suggestedDiagnosis": "Primary suspected diagnosis (e.g., Viral Fever, Dengue)",
  "suggestedLabs": ["Complete Blood Count (CBC)", "Test 2"],
  "suggestedMedicines": [
    {
      "name": "Medicine Name (e.g., Tab. Paracetamol 650mg)",
      "dosage": "Dosage (e.g., 1-1-1 or TDS)",
      "duration": "Duration (e.g., 3 days)"
    }
  ]
}

Keep the suggestions standard, safe, and generic (e.g. Paracetamol for fever, ORS for diarrhea). 
Do NOT return anything other than the raw JSON string.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up the response in case Gemini includes markdown JSON blocks
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", cleanedText);
      return NextResponse.json({ error: "AI returned invalid format." }, { status: 500 });
    }

    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error("CDSS API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestions.", details: error.message },
      { status: 500 }
    );
  }
}
