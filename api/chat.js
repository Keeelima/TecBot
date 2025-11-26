// /api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Só aceitar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Pega a chave da API do Gemini do Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key não configurada" });
    }

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem ausente" });
    }

    // Inicializa o Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Gera a resposta
    const result = await model.generateContent(userMessage);
    const reply = result.response.text();

    // Retorna para o front-end
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
