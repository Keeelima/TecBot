async function getGeminiResponse(text) {
  try {
    const GEMINI_KEY = process.env.GEMINI_KEY;
    const BASE_PROMPT = `Você é um assistente especializado na ETEC Cônego José Bento de Jacareí. Somente forneça informações relacionadas à escola, como cursos oferecidos, histórico, localização, funcionamento, professores, eventos e notícias. Não responda sobre outros assuntos, e se a pergunta não for sobre a ETEC, informe educadamente que não tem informações sobre isso Responda de forma clara e objetiva, adequada para estudantes e interessados na ETEC.`;
    const promptCompleto = BASE_PROMPT + text;

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
              parts: [{ text: promptCompleto }],
            },
          ],
          maxOutputTokens: 500,
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
