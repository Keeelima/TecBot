// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ESSENCIAL para receber JSON do front-end

// Inicializa o Gemini AI com a API Key do Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// -------------------- ROTAS --------------------

// Rota principal de chat
app.post("/api/chat", async (req, res) => {
  try {
    console.log("Mensagem recebida:", req.body.message);
    console.log(
      "API KEY carregada:",
      process.env.GEMINI_API_KEY ? "SIM" : "NÃO"
    );

    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem ausente" });
    }

    const result = await model.generateContent(userMessage);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota de teste rápida
app.get("/api/teste", (req, res) => {
  res.json({ ok: true });
});

// Exporta o app para o Vercel (não usar app.listen)
export default app;
