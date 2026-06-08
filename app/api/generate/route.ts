import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const IP_REPLACEMENT_MAP: Record<string, string> = {
  "iphone": "generic modern smartphone",
  "ipad": "modern tablet computer",
  "apple": "generic tech company",
  "lego": "colorful plastic interlocking toy bricks",
  "tesla": "minimalist electric car",
  "coca-cola": "generic cola soft drink glass bottle",
  "nike": "unbranded athletic running shoes",
  "adidas": "generic sports sneakers",
  "starbucks": "generic paper coffee cup",
  "disney": "fantasy cartoon style",
  "marvel": "futuristic heroic style",
  "vespa": "classic vintage European scooter",
  "honda": "generic modern motorcycle",
  "toyota": "generic contemporary sedan car",
  "instagram": "social media photo app interface",
  "facebook": "generic social network profile",
  "tiktok": "short video mobile application interface",
  "whatsapp": "generic mobile messaging app interface",
  "google": "generic tech search engine"
};

function sanitizeInput(text: string): string {
  if (!text) return "";
  let cleaned = text.toLowerCase();
  for (const [brand, generic] of Object.entries(IP_REPLACEMENT_MAP)) {
    cleaned = cleaned.replace(new RegExp(`\\b${brand}\\b`, 'g'), generic);
  }
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const { 
      rawPrompt, 
      category, 
      styleType, 
      layoutType, // SINKRONISASI DENGAN TOMBOL LAYOUT BARU FRONTEND BRAY
      backgroundType, 
      customColor, 
      lighting, 
      composition, 
      trend, 
      userApiKey,
      imageRef 
    } = await request.json();

    if (!userApiKey) {
      return NextResponse.json({ error: 'Kumpulan API Key tidak boleh kosong!' }, { status: 400 });
    }

    if (!imageRef && !rawPrompt) {
      return NextResponse.json({ error: 'Prompt dasar atau gambar referensi wajib diisi salah satu!' }, { status: 400 });
    }

    const sanitizedPrompt = rawPrompt ? sanitizeInput(rawPrompt) : "";
    const apiKeysPool = userApiKey.split(/[\n,]+/).map((k: string) => k.trim()).filter(Boolean);

    let backgroundPrompt = "";
    if (category === 'Vector') {
      if (backgroundType === 'white') backgroundPrompt = "isolated on a pure solid crisp white background";
      else if (backgroundType === 'chroma') backgroundPrompt = "isolated on a solid chroma key green background (#00FF00)";
      else if (backgroundType === 'custom') backgroundPrompt = `isolated on a solid ${customColor || 'soft pastel'} background`;
    } else if (category === 'PNG') {
      backgroundPrompt = "isolated on a pure 100% solid white background, zero shadows, clean edges";
    } else if (category === 'Video') {
      if (backgroundType === 'natural') backgroundPrompt = "natural realistic environmental background";
      else if (backgroundType === 'chroma') backgroundPrompt = "shot against a clean solid chroma key green screen";
      else if (backgroundType === 'black') backgroundPrompt = "shot against a solid pure pitch-black deep background";
    }

    // SYSTEM PROMPT PREMIUM SPEK ENTERPRISE DENGAN DUA SUNTIKAN SAKTI BARU
    const systemPrompt = `
      You are the ultimate Bulk Prompt & Visual Reverse Engineer for Adobe Stock commercial assets.
      
      CRITICAL AUTOMATIC TRANSLATION LAYER:
      The "Manual Concept Keyword" might be written in Indonesian language (e.g., "kucing", "anjing", "botol", "gadis"). You MUST automatically detect and instantly translate any Indonesian terms into high-quality commercial English concepts (e.g., "kucing" MUST become "cat", "anjing" become "dog", etc.) before expanding the variations. ABSOLUTELY FORBIDDEN to use raw Indonesian words in your final output array strings.
      
      YOUR MISSION:
      Generate EXACTLY 50 unique, highly diversified, and distinct commercial prompt variations in English. Count them carefully from 1 to 50. Do not stop at 40, 44, or any number less than 50.
      
      INPUT MODE SPECIFICATION:
      - If the user provides a reference image, carefully analyze its core subject matter, mood, visual composition, and embedded artistic style. Use that analysis as the foundational anchor, then spin out 50 commercial variations inside the required category format (${category}).
      - If no image is provided, base your generation on the user's manual concept text (translated to English) using the core style "${styleType}".

      LAYOUT & ARRANGEMENT CONTROL:
      You must structurally incorporate the requested asset layout arrangement: "${layoutType || 'Single Icon'}". 
      - If it specifies a grid or pattern (e.g., "4 Icons Grid", "8 Icons Grid", "Seamless Grid", "Pattern Graphic"), make sure the generated prompt describes a cohesive collection or array of items organized in that format.

      For each of the 50 variations, expand the concept creatively with different dynamic angles, alternative framing, and rich descriptors while strictly matching the required background: "${backgroundPrompt}". Each prompt must naturally blend the 8-Layer Prompt Formula.

      CRITICAL SAFETY & ADOBE COMPLIANCE RULES:
      1. NO copyrighted brands, names of real people, artist names, or platform trademarks.
      2. ABSOLUTELY FORBIDDEN WORDS: Do NOT use "photorealistic", "hyperrealistic", "stunning", "beautiful", "amazing", "trendy", "AI generated", "Midjourney", or "Stable Diffusion".
      3. Outfit & Anatomy Control: If human elements/characters are present, ensure clothes are perfectly neat ("shirt neatly tucked into trousers, wearing a plain solid-colored black belt with no branding, clean professional footwear") and hands are logically posed.

      Respond ONLY with a valid JSON object containing an array of exactly 50 strings:
      {
        "prompts": [
          "Variation 1 prompt text...",
          "Variation 2 prompt text...",
          ...
          "Variation 50 prompt text..."
        ]
      }
    `;

    const userMessageText = `
      Asset Format Wanted: ${category}
      Override Style Chosen (Ignored if image attached): ${styleType}
      Layout / Composition Arrangement Requirement: ${layoutType || 'Single Icon'}
      Enforced Background Rule: ${backgroundPrompt}
      Manual Concept Keyword (If no image attached): "${sanitizedPrompt}"
      Trend Injector: ${trend || "None"}
      Base Lighting Parameter: ${lighting}
      Base Composition Parameter: ${composition}
    `;

    let finalResponseData = null;
    let lastErrorDetail = '';

    for (let i = 0; i < apiKeysPool.length; i++) {
      const activeKey = apiKeysPool[i];
      let configuration: { apiKey: string; baseURL?: string } = { apiKey: activeKey };
      let modelName = 'gpt-4o-mini';

      if (activeKey.startsWith('AIzaSy')) {
        configuration.baseURL = "https://generativelanguage.googleapis.com/v1beta/openai/";
        modelName = "gemini-1.5-flash"; 
      } else if (activeKey.startsWith('gsk_')) {
        configuration.baseURL = "https://api.groq.com/openai/v1";
        modelName = imageRef ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
      } else if (activeKey.startsWith('sk-or-')) {
        configuration.baseURL = "https://openrouter.ai/api/v1";
        modelName = "google/gemini-2.5-flash"; 
      }

      try {
        console.log(`[ENGINE] Menggunakan Kunci ke-${i} [Model: ${modelName}]`);
        const openai = new OpenAI(configuration);

        let contentPayload: any = [{ type: 'text', text: userMessageText }];
        if (imageRef) {
          contentPayload.push({
            type: 'image_url',
            image_url: { url: imageRef }
          });
        }

        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentPayload }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4500 // BUMP TOKENS UNTUK KUOTA AMUNISI PANJANG BRAY
        });

        const parsedData = JSON.parse(response.choices[0].message.content || '{}');
        
        if (parsedData.prompts && Array.isArray(parsedData.prompts)) {
          let rawPromptsArray = parsedData.prompts;

          // JARING PENGAMAN UTAMA: JIKA AI MALAS DAN DI BAWAH 50, AUTO-PADDING HINGGA GENAP 50 ITEMS BRAY!
          if (rawPromptsArray.length < 50 && rawPromptsArray.length > 0) {
            console.log(`[SAFETY PADDING] AI malas mendeteksi hasil hanya ${rawPromptsArray.length}. Mengisi paksa kuota hingga 50.`);
            const originalLength = rawPromptsArray.length;
            for (let idx = originalLength; idx < 50; idx++) {
              rawPromptsArray.push(rawPromptsArray[idx % originalLength]);
            }
          } else if (rawPromptsArray.length > 50) {
            rawPromptsArray = rawPromptsArray.slice(0, 50);
          }

          const finalizedPrompts = rawPromptsArray.map((p: string) => {
            let finalP = p;
            if (category === 'Vector') finalP += `, professional vector asset, vector illustration, ${backgroundPrompt}, clean geometric lines, no gradients, flat solid colors, commercial digital art, marketplace ready`;
            else if (category === 'PNG') finalP += `, blank commercial asset template, pristine isolated element, ${backgroundPrompt}, perfectly formed edges, uniform lighting, ready for mockup placement`;
            else if (category === 'Video') finalP += `, 4k high definition footage, ultra-clear resolution, smooth frame delivery, ${backgroundPrompt}, high production value stock video`;
            return finalP;
          });

          finalResponseData = { success: true, prompts: finalizedPrompts };
          break;
        }
      } catch (error: any) {
        console.warn(`[ENGINE] Kunci ke-${i} Gagal: ${error.message}`);
        lastErrorDetail = error.message;
      }
    }

    if (!finalResponseData) {
      return NextResponse.json({ error: `Gagal bray! Error terakhir: ${lastErrorDetail}` }, { status: 500 });
    }

    return NextResponse.json(finalResponseData);

  } catch (error: any) {
    return NextResponse.json({ error: 'Gangguan internal sistem.' }, { status: 500 });
  }
}