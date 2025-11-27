// /api/chat.js
// Função Serverless para Vercel: recebe POST { message }
// Usa @google/generative-ai com modelo Gemini 1.5 para resposta de texto

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensagem ausente" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY não definida");
      return res.status(500).json({ error: "API key não configurada" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });

    // Parsing robusto do retorno
    const candidate = result?.response?.candidates?.[0];
    let reply = "Desculpe, não consegui gerar uma resposta.";
    if (candidate?.content?.parts?.length) {
      reply = candidate.content.parts
        .map((p) => (typeof p.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n");
    } else if (typeof result?.response?.text === "function") {
      // SDK expõe response.text()
      reply = await result.response.text();
    }

    console.log("Mensagem recebida:", message);
    console.log("Resposta gerada:", reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro na função /api/chat:", error);
    // Erro de cota/chave/validação
    const code = error?.status || error?.code;
    return res.status(500).json({ error: "Erro interno no servidor", details: code });
  }
}
