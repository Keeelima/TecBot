async function getGeminiResponse(text) {
  try {
    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) {
      console.error("GEMINI_KEY não definido em process.env");
      return "Erro: chave Gemini não configurada.";
    }

    if (typeof globalThis.fetch !== "function") {
      try {
        const nf = await import("node-fetch");
        globalThis.fetch = nf.default || nf;
      } catch (e) {
        console.error(
          "fetch não disponível. Instale node-fetch ou use Node 18+.",
          e
        );
        return "Erro interno: fetch indisponível.";
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateText?key=${encodeURIComponent(
      GEMINI_KEY
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: { text },
        temperature: 0.7,
        candidateCount: 1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status} - ${errText}`);
    }

    const data = await response.json().catch(() => null);
    console.log("Resposta API:", data);

    // suportar variações de formato de resposta
    const candidate = data?.candidates?.[0];
    const result =
      candidate?.output ||
      candidate?.content?.[0]?.text ||
      data?.output ||
      (typeof data === "string" ? data : null);

    return result || "Não consegui gerar resposta.";
  } catch (err) {
    console.error("Erro API:", err);
    return "Erro ao conectar com o Gemini.";
  }
}

module.exports = { getGeminiResponse };
