import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY not set. Skipping embedding generation.")
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    // Clean text to avoid token limits or junk
    const cleanText = text.substring(0, 8000).replace(/\n/g, " ")
    
    const result = await model.embedContent(cleanText)
    const embedding = result.embedding
    return embedding.values
  } catch (error) {
    console.error("❌ Error generating embedding:", error)
    return null
  }
}
