const DEFAULT_API_URL = "/api/chat";
const DEFAULT_TIMEOUT = 10000; // ms

export async function getGeminiResponse(pergunta, options = {}) {
  const apiUrl = options.apiUrl || DEFAULT_API_URL;
  const timeout = typeof options.timeout === "number" ? options.timeout : DEFAULT_TIMEOUT;

  if (typeof pergunta !== "string" || pergunta.trim() === "") {
    throw new Error("Parâmetro 'pergunta' deve ser uma string não vazia.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: pergunta }), // mantém "message"
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      // tenta extrair mensagem de erro do corpo, se houver
      let errText = `Erro HTTP ${response.status}`;
      try {
        const errBody = await response.text();
        if (errBody) errText += `: ${errBody}`;
      } catch (e) {}
      throw new Error(errText);
    }

    const data = await response.json();

    if (!data || typeof data.reply !== "string") {
      throw new Error("Resposta inesperada da API: campo 'reply' ausente.");
    }

    return data.reply;
  } catch (error) {
    // log para debug (remova ou adapte em produção)
    console.error("getGeminiResponse erro:", error);
    if (error.name === "AbortError") {
      return "Tempo de conexão excedido.";
    }
    return "Erro ao conectar ao servidor.";
  } finally {
    clearTimeout(timer);
  }
}
