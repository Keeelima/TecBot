export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;

    if (!GEMINI_KEY) {
      return res.status(500).json({
        error: "GEMINI_KEY não está configurada no Vercel.",
      });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "'message' é obrigatório e deve ser texto.",
      });
    }

    // NOVO ENDPOINT OFICIAL
    const url =
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    console.log("RAW GEMINI ===>", JSON.stringify(data, null, 2));

    // Verifica se tem resposta
    const reply =
      data?.choices?.[0]?.message?.content || "Sem resposta da API.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("ERRO SERVERLESS:", err);
    return res.status(500).json({
      error: "Falha interna no servidor.",
      details: err.message,
    });
  }
}
