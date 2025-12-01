export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) {
      return res.status(500).json({ error: "GEMINI_KEY não configurada." });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Campo 'message' é obrigatório." });
    }

    // MODELO CORRETO + ENDPOINT CERTO (IMPORTANTE!)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("RAW DATA DO GEMINI ===>");
    console.log(JSON.stringify(data, null, 2));


    console.log("RAW GEMINI:", JSON.stringify(data, null, 2));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.outputText ||
      "Sem resposta.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("ERRO SERVERLESS:", error);
    return res
      .status(500)
      .json({ error: "Erro interno.", details: error.message });
  }
}
