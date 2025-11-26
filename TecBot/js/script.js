
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('composer');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        const p = document.createElement('p');
        p.innerText = text;
        msgDiv.appendChild(p);
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    };

    // Retorna uma resposta simples (sincrona) usada quando não há API externa
    const getBotReply = (userText) => {
        let response = 'Desculpe, não entendi. Sou uma demonstração.';
        const lowerText = userText.trim().toLowerCase();

        if (lowerText.includes('oi') || lowerText.includes('olá')) {
            response = 'Olá! Como posso ajudar você hoje?';
        } else if (lowerText.includes('ajuda')) {
            response = 'Estou aqui! Tente perguntar algo simples.';
        }

        return response;
    };

    // Função principal de envio (usa API se disponível, senão fallback local)
    const handleSubmission = async () => {
        const userText = input.value.trim();
        if (!userText) return;

        addMessage(userText, 'user');
        input.value = '';

        // Mensagem temporária "digitando..."
        addMessage('Digitando...', 'assistant');
        const typingDiv = messages.lastElementChild;

        let reply = '';
        try {
            if (typeof getGeminiResponse === 'function') {
                // Se existir a função de API externa, use-a
                reply = await getGeminiResponse(userText);
            } else {
                // fallback local
                reply = getBotReply(userText);
            }
        } catch (err) {
            reply = 'Desculpe, ocorreu um erro ao obter a resposta.';
            console.error('Erro ao obter resposta:', err);
        }

        if (typingDiv) {
            const p = typingDiv.querySelector('p');
            if (p) p.innerText = reply;
            typingDiv.className = 'message assistant';
        } else {
            addMessage(reply, 'assistant');
        }

        if (input.tagName.toLowerCase() === 'textarea') input.rows = 1;
    };

    // Envio pelo botão do formulário
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleSubmission();
        });
    }

    // Envio pelo Enter (sem Shift)
    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmission();
            }
        });
    }

    // Mensagem inicial do bot
    addMessage('Olá! Eu sou o TecBot. Como posso te ajudar?', 'assistant');
    if (input) input.focus();
    // Inicializa tema a partir do armazenamento
    try {
        if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
    } catch (e) {
        /* ignore storage errors */
    }
});

(function(){
            // código de ações removido — gerenciado em home/home.html
        })();

(function(){
            // Elementos
            const btnConfig = document.getElementById('btn-config');
            // garante id ao botão ajuda para seleção
            let btnHelp = document.querySelector('.sidebar-btn[aria-label="Ajuda"]');
            if (btnHelp && !btnHelp.id) btnHelp.id = 'btn-help';
            btnHelp = document.getElementById('btn-help');

            const panel = document.getElementById('action-panel');

            if (!btnConfig || !panel) return;

            // Estado: 'closed' ou 'open'
            btnConfig.dataset.state = 'closed';

            // Função para transformar o botão em ícone de voltar
            function showBackIcon() {
                btnConfig.dataset.state = 'open';
                btnConfig.setAttribute('aria-label', 'Voltar');
                btnConfig.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }

            function showConfigLabel() {
                btnConfig.dataset.state = 'closed';
                btnConfig.setAttribute('aria-label', 'Configurações');
                btnConfig.innerText = 'Configurações';
            }

            async function openActions() {
                try {
                    const res = await fetch('acoes.html', { cache: 'no-store' });
                    if (!res.ok) throw new Error('fetch falhou');
                    const text = await res.text();

                    const bodyMatch = text.match(/<body[^>]*>[\s\S]*<\/body>/i);
                    let inner = text;
                    if (bodyMatch) {
                        inner = bodyMatch[0].replace(/<body[^>]*>/i, '').replace(/<\/body>/i, '');
                    }

                    panel.innerHTML = inner;
                    panel.scrollIntoView({ behavior: 'smooth' });

                    // adiciona listener ao botão 'Sair' dentro do painel (quando injetado)
                    const logoutBtn = panel.querySelector('[data-action="logout"]');
                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => {
                            // volta para a página index na raiz do projeto
                            window.location.href = '../index.html';
                        });
                    }

                    // listener ao botão 'Mudar tema'
                    const themeBtn = panel.querySelector('[data-action="toggle-theme"]');
                    if (themeBtn) {
                        themeBtn.addEventListener('click', () => {
                            const isLight = document.body.classList.toggle('light');
                            try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) {}
                        });
                    }

                    // esconder botão Ajuda
                    if (btnHelp) btnHelp.style.display = 'none';
                    // mostrar voltar no lugar de configurações
                    showBackIcon();
                } catch (err) {
                    // fallback: navega para a página se fetch não funcionar
                    window.location.href = 'acoes.html';
                }
            }

            function closeActions() {
                panel.innerHTML = '';
                if (btnHelp) btnHelp.style.display = '';
                showConfigLabel();
            }

            // Clique principal: abre ou fecha conforme estado
            btnConfig.addEventListener('click', (e) => {
                if (btnConfig.dataset.state === 'closed') {
                    openActions();
                } else {
                    closeActions();
                }
            });

            // caso o conteúdo injetado precise de um botão de voltar interno,
            // ele pode disparar um evento 'acoes:close' para fechar o painel
            document.addEventListener('acoes:close', () => closeActions());
        })();