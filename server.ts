import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not configured or uses the placeholder value.");
  }
} catch (error) {
  console.error("❌ Failed to initialize GoogleGenAI client:", error);
}

// API: Check status
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", activeGemini: !!ai });
});

// API: Cozy chat with Pogu (our mascot)
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "무슨 말이든 해봐구! 언제든 들을 준비가 되어있다구! 🐶" });
  }

  // Pre-configured warm replies if Gemini is not active
  const fallbackReplies = [
    "어머나! 정말 멋진 생각이구! 솜사탕처럼 달콤한 선물이 될 것 같아구. 🐶🌸 특별히 따뜻한 머그컵이나 꽃차 세트를 챙겨보는 건 어때구?",
    "생일은 세상에서 제일 소중한 날이구! 그 친구는 너의 편지만 받아도 코끝이 찡해질 만큼 기뻐할 거라구! 손편지도 꼭 써봐구! 💝",
    "그 나이대의 친구들은 의외로 실용적이면서도 일상에서 소소하게 힐링할 수 있는 소품(이를테면 실크 안대나 바디 크림)에 아주 큰 감동을 받는다구! 🐶🥞",
    "폭닥폭닥한 하루를 보내구 있니? 어른스러우면서도 귀여운 오르골 스탠드나 차분한 향의 인센스를 매치해보는 건 어때구? 추천 리스트도 같이 확인해봐구!",
  ];

  if (!ai) {
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return res.json({ reply: randomReply, usingFallback: true });
  }

  try {
    const formattedHistory = Array.isArray(chatHistory) 
      ? chatHistory.map((h: any) => `${h.sender === "user" ? "User" : "Pogu"}: ${h.text}`).join("\n")
      : "";

    const prompt = `너는 포근하고 사랑스러운 생일 선물 도우미 '포구'(Pogu)야. 하얗고 폭신폭신한 구름 모양 털을 가졌고, 성격은 매우 다정다감하고 귀여워. 
    말끝마다 '~구!', '~구?', '~라구!' 같은 포구 고유의 종결어구를 섞어가며 한국어로 귀엽고 친근한 공손함(반존댓말과 존댓말의 적절한 조합: 예: '~했다구!', '~해봐구!', '반갑다구!')으로 대답해줘.

    [대화 내역]
    ${formattedHistory}

    [새로운 대화 제안]
    사용자: "${message}"

    위 대화에 대해 포구로서 선물 팁을 전하거나 위로를 주는 포근한 답변을 2~3문장 이내로 작성해줘.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'Pogu', the world's coziest and fluffiest white cloud puppy gift assistant. Your replies are brief (2-3 sentences max), heartwarming, full of cute onomatopoeia like '폭닥폭닥', '노곤노곤', and end with your signature phrase extensions like '~구!', '~라구!', '~하구!'. Keep it sweet and comforting.",
        temperature: 1.0,
      }
    });

    const reply = response.text || "무슨 일인구? 잠시 생각에 빠졌다구! 🐶✨";
    return res.json({ reply: reply.trim(), usingFallback: false });

  } catch (error) {
    console.error("❌ Pogu chat error:", error);
    const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    return res.json({ reply: randomReply, usingFallback: true });
  }
});

// API: Generate specialized gift recommendations using Gemini
app.post("/api/recommend", async (req: Request, res: Response) => {
  const { age, gender, budget, tastes, relationship, vibe, additionalInfo } = req.body;

  // Build a warm default list of cozy gifts as fallback
  const fallbackGifts = [
    {
      name: "포근한 무봉제 파자마 세트",
      description: "살결에 닿는 느낌이 유연한 부드러운 순면 피치 기모 소재의 잠옷 세트입니다. 숙면을 돕고 집에 머무는 시간을 선물하세요.",
      priceRange: "30,000원 ~ 40,000원",
      whyItFits: `${relationship || "친구"}를 위한 편안한 일상을 제안해요. 특히 겨울뿐만 아니라 봄가을에도 활용도가 높아 실용적입니다.`,
      tips: "포근함을 더할 수 있도록 고급 포장 박스에 편지를 동봉해보세요.",
      cozyFactor: 5,
    },
    {
      name: "아로마 우드스틱 잔 향초워머",
      description: "불을 붙이지 않고 워머의 열로 은은하게 우드 심지 타는 소리를 즐길 수 있는 미니 워머와 캔들 세트입니다.",
      priceRange: "40,000원 ~ 50,000원",
      whyItFits: `${vibe === "healing" ? "힐링" : "분위기 있는"} 선물로 완벽하며, 방 안을 포근하게 변신시킵니다.`,
      tips: "심신 안정에 좋은 라벤더나 따뜻한 바닐라 향을 추천해요.",
      cozyFactor: 5,
    },
    {
      name: "맞춤형 찻잎 버라이어티 세트 & 세라믹 머그",
      description: "피로 해소에 지친 마음을 달래줄 디카페인 캐모마일, 은은한 허브티 조합과 동글동글한 모카 브라운 도자기 머그잔입니다.",
      priceRange: "20,000원 ~ 30,000원",
      whyItFits: `따뜻한 차 한 잔으로 ${age || "20대"} 연령대 누구나 폭닥폭닥 쉬어갈 수 있게 해줍니다.`,
      tips: "손글씨로 쓴 티타임 가이드를 조그만 리본 택과 함께 세팅하세요.",
      cozyFactor: 5,
    },
  ];

  if (!ai) {
    console.info("💡 Using mock recommendations due to missing GEMINI_API_KEY");
    return res.json({ gifts: fallbackGifts, usingFallback: true });
  }

  try {
    const tasteString = Array.isArray(tastes) ? tastes.join(", ") : (tastes || "미정");
    
    const prompt = `내 소중한 인연을 위해 특별한 생일선물을 고르고 있어. 아래 조건에 가장 잘 맞는 세세하고 정교한 맞춤 선물 3가지를 한국어로 아주 다정하고 포근하게 추천해줘:
    - 받는 사람 나이: ${age}
    - 성별: ${gender}
    - 예산/가격대: ${budget}
    - 취향 및 관심사: ${tasteString}
    - 나와의 관계: ${relationship}
    - 선물하는 무드/스타일: ${vibe}
    - 추가 요청/디테일 정보: ${additionalInfo || "없음"}

    [지침]
    1. 이 선물이 왜 추천되었는지, 어떤 점이 수령자에게 매력적일지 2줄 내외로 자세히 설명하는 'description'을 작성해줘.
    2. 현실적인 구매 가격대를 'priceRange'에 명시해줘 (원화 기준, 예: 35,000원 내외).
    3. 나와의 관계와 취향을 타겟하여 감동을 주는 포인트를 'whyItFits'에 정교하게 작성해줘.
    4. 선물을 더 빛나게 어필할 센스 있는 꿀팁이나 포장 팁을 'tips'에 제안해줘.
    5. 폭닥폭닥 포근한 느낌의 선물 강도를 'cozyFactor' 숫자로 (1에서 5까지) 평가해줘.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a warm, kind, and professional companion concierge named 'Pogu' (포구 - a fluffy cloud puppy/teddy bear mascot) who gives incredibly detailed and comforting gift advice. You must return result precisely structured in the requested JSON scheme.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { 
                type: Type.STRING, 
                description: "The recommended gift name clearly in Korean." 
              },
              description: { 
                type: Type.STRING, 
                description: "A cozy and attractive explanation of the gift item." 
              },
              priceRange: { 
                type: Type.STRING, 
                description: "Estimated pricing range." 
              },
              whyItFits: { 
                type: Type.STRING, 
                description: "Personalized reason based on recipient's traits, relationship, age and vibe." 
              },
              tips: { 
                type: Type.STRING, 
                description: "Sincere tips or ideas to make the gift presentation special." 
              },
              cozyFactor: { 
                type: Type.INTEGER, 
                description: "Cozy rating of the experience, between 1 and 5." 
              }
            },
            required: ["name", "description", "priceRange", "whyItFits", "tips", "cozyFactor"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    const gifts = JSON.parse(resultText);
    return res.json({ gifts, usingFallback: false });

  } catch (error) {
    console.error("❌ Gemini recommendation engine error:", error);
    // Graceful fallback so the client never crashes
    return res.json({ gifts: fallbackGifts, usingFallback: true });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌸 Cozy Gift App server running at http://localhost:${PORT}`);
  });
}

startServer();
