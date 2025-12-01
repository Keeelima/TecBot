const API_URL = "/api/chat";

export async function getGeminiResponse(pergunta) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: pergunta }), // <-- IMPORTANTE!
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar API");
    }

    const data = await response.json();
    return data.reply; // <-- tem que ser "reply"
  } catch (error) {
    console.error("Erro:", error);
    return "Erro ao conectar ao servidor.";
  }
}
