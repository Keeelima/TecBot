
const API_URL = "/api/chat"; 

export async function getGeminiResponse(pergunta) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: pergunta }),
    });

    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.reply; 
  } catch (err) {
    console.error("Erro ao chamar API:", err);
    return "Erro ao conectar com o servidor.";
  }
}
