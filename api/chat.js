export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;

    if (!GEMINI_KEY) {
      return res.status(500).json({
        error: "A variável GEMINI_KEY não está configurada no Vercel.",
      });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "O campo 'message' é obrigatório e deve ser texto.",
      });
    }

    // gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erro API Google:", errText);
      return res.status(500).json({
        error: "Erro ao chamar a API do Google.",
        details: errText,
      });
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("ERRO NO SERVERLESS:", err);
    return res.status(500).json({
      error: "Falha interna no servidor.",
      details: err.message,
    });
  }
}
