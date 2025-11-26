<<<<<<< HEAD
=======

>>>>>>> 44b97a1e1cb4f86d956ae0482d4201f58ad6bbc6
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('composer');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

<<<<<<< HEAD
    // Adiciona mensagem ao chat
=======

    /**
     * Adiciona uma mensagem.
     */
>>>>>>> 44b97a1e1cb4f86d956ae0482d4201f58ad6bbc6
    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
<<<<<<< HEAD
=======

>>>>>>> 44b97a1e1cb4f86d956ae0482d4201f58ad6bbc6
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    };

<<<<<<< HEAD
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
=======
    /**
     * Resposta Simples do Bot.
     */
    const getBotResponse = (userText) => {
        let response = 'Desculpe, não entendi. Sou uma demonstração.';
        const lowerText = userText.trim().toLowerCase();

        if (lowerText.includes('oi') || lowerText.includes('olá')) {
            response = 'Olá! Como posso ajudar você hoje?';
        } else if (lowerText.includes('ajuda')) {
            response = 'Estou aqui! Tente perguntar algo simples.';
        }

        setTimeout(() => addMessage(response, 'assistant'), 500);
    };

    // ---  Função de Envio Principal (Centralizada) ---

    const handleSubmission = () => {
        const userText = input.value.trim();

        if (userText) {
            addMessage(userText, 'user');
            getBotResponse(userText);
            
            input.value = ''; 
            if (input.tagName.toLowerCase() === 'textarea') {
                input.rows = 1; 
            }
        }
    };

    

    //  Envio pelo botão do formulário
>>>>>>> 44b97a1e1cb4f86d956ae0482d4201f58ad6bbc6
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSubmission();
    });

<<<<<<< HEAD
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
=======
    
    input.addEventListener('keydown', (event) => {
        
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); 
            handleSubmission(); 
        }
    });

    // --- . Inicialização ---
    
    addMessage('Olá! Eu sou o TecBot. Como posso te ajudar?', 'assistant');
    input.focus();
});
>>>>>>> 44b97a1e1cb4f86d956ae0482d4201f58ad6bbc6
