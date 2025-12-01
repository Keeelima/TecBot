async function getGeminiResponse(text) {
  try {
    const GEMINI_KEY = process.env.GEMINI_KEY;
    const fs = require("fs").promises;
    const fetch = require("node-fetch");
    const dados_json = await fs.readFile("../../etec.json", "utf-8");
    const jsonETEC = JSON.parse(dados_json);



    const BASE_PROMPT = `Você é um assistente especializado exclusivamente na ETEC Cônego José Bento de Jacareí.Use apenas os dados fornecidos neste JSON para responder perguntas.JSON: ${JSON.stringify(
      jsonETEC
    )}Se a pergunta não puder ser respondida com esse JSON, diga:"Desculpe, não tenho informações sobre isso."`;

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
