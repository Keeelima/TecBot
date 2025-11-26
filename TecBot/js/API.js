// API.js
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/chat";

export async function getGeminiResponse(pergunta) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: pergunta }),
    });

    if (!response.ok) throw new Error("Erro na resposta do servidor");

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Erro ao chamar API:", error);
    return "Erro ao conectar com o servidor.";
  }
}
