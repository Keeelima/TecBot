// Arquivo de API para uso no navegador
// Chama o backend em /api/chat e retorna apenas o texto da resposta
(function () {
    async function getGeminiResponse(text) {
        try {
            const prompt = (text || "").toString().trim();
            if (!prompt) return "Digite uma mensagem para continuar.";

            if (location.protocol === "file:") {
                return "Servidor não detectado. Rode via http(s) e configure o backend (/api/chat).";
            }

            const url = new URL("/api/chat", window.location.origin).toString();

            const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
            const timeoutId = ctrl ? setTimeout(() => ctrl.abort(), 30000) : null; // 30s

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: prompt }),
                signal: ctrl ? ctrl.signal : undefined,
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (!res.ok) {
                let details = "";
                try {
                    const errJson = await res.json();
                    details = errJson?.error || JSON.stringify(errJson);
                } catch (_) {
                    try {
                        details = await res.text();
                    } catch (_) {}
                }
                console.error("Erro da API backend:", res.status, details);
                return `Erro ao obter resposta (HTTP ${res.status}).`;
            }

            const data = await res.json().catch(() => ({}));
            const reply = data?.reply;
            if (typeof reply === "string" && reply.trim()) return reply.trim();
            return "Sem resposta do modelo.";
        } catch (err) {
            if (err?.name === "AbortError") return "Tempo esgotado ao obter resposta.";
            console.error("Falha ao consultar backend:", err);
            return "Erro ao conectar ao servidor. Tente novamente.";
        }
    }

    // expõe globalmente para o script principal
    window.getGeminiResponse = getGeminiResponse;
})();
