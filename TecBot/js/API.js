// TecBot/js/API.js

export async function enviarMensagemIA(texto) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: texto }),
    });

    const data = await response.json();
    return data.response || "Erro ao gerar resposta.";
  } catch (err) {
    console.error("Erro no fetch:", err);
    return "Erro ao conectar ao servidor.";
  }
}
