// /api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Permite apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Verifica se a mensagem existe
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem ausente" });
    }

    // Verifica se a chave está definida
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY não definida");
      return res.status(500).json({ error: "API key não configurada" });
    }

    // Inicializa Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Gera a resposta
    const result = await model.generateContent(userMessage);

    // Tenta extrair o texto da resposta de forma segura
    let reply = "Desculpe, não consegui gerar uma resposta.";
    if (result?.response?.[0]?.content?.[0]?.text) {
      reply = result.response[0].content[0].text;
    } else if (result?.output_text) {
      reply = result.output_text;
    }

    console.log("Mensagem recebida:", userMessage);
    console.log("Resposta gerada:", reply);

    // Retorna a resposta
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro na função /api/chat:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
