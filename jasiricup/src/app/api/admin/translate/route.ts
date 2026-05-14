import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  // 1. Ensure only verified admins can use your API credits!
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const { title, content, metaDescription, targetLanguage } = await req.json();

    if (!content || !targetLanguage) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // We use gemini-1.5-flash because it is lightning fast and free
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // This forces Gemini to return strict JSON matching our exact needs
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            content: { type: SchemaType.STRING },
            metaDescription: { type: SchemaType.STRING },
          },
          required: ["title", "content", "metaDescription"],
        },
      }
    });

    // Map the language codes to full words for better AI comprehension
    const languageMap: Record<string, string> = {
      sw: "Swahili",
      fr: "French",
      de: "German",
      en: "English"
    };

    const target = languageMap[targetLanguage] || targetLanguage;

    const prompt = `
      You are a professional translator for an NGO called JasiriCup. Translate the following blog post data into ${target}.
      
      RULES:
      1. Keep all Markdown formatting (##, **, >, -, etc.) exactly intact in the 'content' field.
      2. Do not translate URLs, image links, or proper nouns (like JasiriCup or Kenya).
      3. Ensure the tone remains empowering, educational, and professional.
      4. Return the translated title, translated content, and translated meta description.

      DATA TO TRANSLATE:
      Title: ${title || ""}
      Meta Description: ${metaDescription || ""}
      Content: ${content}
    `;

    // Execute the translation
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the guaranteed JSON response
    const translatedData = JSON.parse(responseText);

    return NextResponse.json({ success: true, data: translatedData }, { status: 200 });

  } catch (error) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ success: false, error: "Translation failed. Check server logs." }, { status: 500 });
  }
}