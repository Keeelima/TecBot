/**
 * Função para obter resposta do TecBot via backend
 */
async function getGeminiResponse(userText) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });

        if (!response.ok) throw new Error('Erro na resposta do servidor');

        const data = await response.json();
        return data.reply || 'Desculpe, não entendi.';
    } catch (err) {
        console.error('Erro ao chamar API:', err);
        return 'Ocorreu um erro ao tentar responder.';
    }
}
