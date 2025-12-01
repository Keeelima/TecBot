async function enviarMensagem() {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  // mostrar no chat
  addMessage(texto, "user");
  input.value = "";

  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: texto }),
    });

    if (!resposta.ok) {
      console.error("Erro:", resposta.status);
      addMessage("Erro no servidor (" + resposta.status + ")", "bot");
      return;
    }

    const data = await resposta.json();

    addMessage(data.reply, "bot");
  } catch (err) {
    console.error(err);
    addMessage("Erro ao conectar ao servidor.", "bot");
  }
}

function addMessage(texto, tipo) {
  const box = document.getElementById("messages");

  const msg = document.createElement("div");
  msg.className = tipo === "user" ? "msg-user" : "msg-bot";
  msg.innerText = texto;

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}
