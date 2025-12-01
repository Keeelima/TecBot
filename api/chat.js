export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) {
      return res.status(500).json({
        error: "A variável GEMINI_KEY não está configurada.",
      });
    }

    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "O campo 'message' é obrigatório e deve ser texto.",
      });
    }

    // Endpoint atualizado (ajuste o modelo se necessário)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5:generate?key=${encodeURIComponent(
      GEMINI_KEY
    )}`;

    const payload = {
      prompt: {
        text: message,
      },
      temperature: 0.2,
      maxOutputTokens: 512,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Ler como texto e tentar parsear (melhor debug quando API retorna erro HTML)
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { raw };
    }

    if (!response.ok) {
      console.error("GEMINI API ERROR:", response.status, data);
      return res.status(response.status).json({
        error: "Erro na API Gemini",
        details: data,
      });
    }

    console.log("RESP GEMINI:", data);

    // Extração robusta do texto em vários formatos possíveis de resposta
    const reply =
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      data?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text ||
      data?.output?.[0]?.content?.text ||
      data?.reply ||
      (typeof data === "string" ? data : null) ||
      data?.raw ||
      "Sem resposta da API.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("ERRO SERVERLESS:", err);
    return res.status(500).json({
      error: "Falha interna no servidor.",
      details: err?.message || String(err),
    });
  }
}
