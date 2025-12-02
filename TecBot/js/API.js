async function getGeminiResponse(text) {
  try {
    const GEMINI_KEY = process.env.GEMINI_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateText?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: { text },
          temperature: 0.7,
          candidateCount: 1,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errText}`);
    }

    const data = await response.json();
    console.log("Resposta API:", data);

    return data.candidates?.[0]?.output || "Não consegui gerar resposta.";
  } catch (err) {
    console.error("Erro API:", err);
    return "Erro ao conectar com o Gemini.";
  }
}
