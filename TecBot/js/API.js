// API.js - cliente do endpoint serverless Gemini
// Certifique-se de que este arquivo esteja dentro de TecBot/js/ para ser servido pelo Vercel.
// Carregado via <script src="../js/API.js"></script> (sem type=module), portanto não usar export.

const API_URL = "/api/chat"; // relativo, funciona local e no Vercel

async function getGeminiResponse(pergunta) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: pergunta })
    });

    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Resposta vazia.";
  } catch (err) {
    console.error("Erro ao chamar API:", err);
    return "Erro ao conectar com o servidor.";
  }
}

// Disponibiliza para script.js
window.getGeminiResponse = getGeminiResponse;