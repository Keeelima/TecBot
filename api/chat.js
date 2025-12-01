export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem não fornecida" });
    }

    // -----------------------------
    // SUA API AQUI
    // -----------------------------

    const resposta = "Você disse: " + message;

    return res.status(200).json({
      response: resposta,
    });
  } catch (error) {
    console.error("Erro no /api/chat:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
