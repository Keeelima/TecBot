import fetch from "node-fetch";
import { google } from "googleapis";

export async function getGeminiResponse(text) {
  try {
    // Lê a service account da variável de ambiente
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // Cria auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Chamada ao Gemini
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

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.output || "Não consegui gerar resposta.";
  } catch (err) {
    console.error("Erro API:", err);
    return "Erro ao conectar com o Gemini.";
  }
}
