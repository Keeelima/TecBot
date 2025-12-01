// api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Mensagem não enviada" });
  }

  try {
    // Chamada para Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui gerar resposta.";

    return res.status(200).json({ response: reply });
  } catch (err) {
    console.error("Erro Servidor:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
