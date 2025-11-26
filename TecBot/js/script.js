document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('composer');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // Adiciona mensagem ao chat
    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    };

    // Envio da mensagem do usuário e resposta do bot
    const handleSubmission = async () => {
        const userText = input.value.trim();
        if (!userText) return;

        addMessage(userText, 'user');
        input.value = '';

        // Mensagem temporária "digitando..."
        addMessage('Digitando...', 'assistant');
        const typingDiv = messages.querySelector('.assistant:last-child');

        // Chamada à API
        const reply = await getGeminiResponse(userText);
        typingDiv.querySelector('p').innerText = reply;

        if (input.tagName.toLowerCase() === 'textarea') input.rows = 1;
    };

    // Eventos
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSubmission();
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmission();
        }
    });

    // Mensagem inicial do bot
    addMessage('Olá! Eu sou o TecBot. Como posso te ajudar?', 'assistant');
    input.focus();
});
