import fetch from "node-fetch";
import { google } from "googleapis";

/**
 * Função para obter resposta do Gemini 2.5 Flash
 * @param {string} text - texto da pergunta
 * @returns {Promise<string>} - resposta gerada pelo Gemini
 */
export async function getGeminiResponse(text) {
  try {
    // Pega o JSON da Service Account da variável de ambiente
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // Cria cliente de autenticação Google
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Faz a requisição para o Gemini 2.5 Flash
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({
          prompt: { text },
          temperature: 0.7,
          candidateCount: 1,
        }),
      }
    );

    // Se der erro HTTP
    if (!response.ok) {
      const errText = await response.text();
      console.error("Erro HTTP Gemini:", errText);
      return `Erro HTTP ${response.status}`;
    }

    // Pega o JSON da resposta
    const data = await response.json();
    console.log("Resposta API Gemini:", data);

    // Retorna o texto gerado
    return data.candidates?.[0]?.output || "Não consegui gerar resposta.";
  } catch (err) {
    console.error("Erro API Gemini:", err);
    return "Erro ao conectar com o Gemini.";
  }
}
