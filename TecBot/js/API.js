async function getGeminiResponse(text) {
  try {
    const GEMINI_KEY = process.env.GEMINI_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: text }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Resposta API:", data);

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui gerar resposta."
    );
  } catch (err) {
    console.error("Erro API:", err);
    return "Erro ao conectar com o Gemini.";
  }
}
