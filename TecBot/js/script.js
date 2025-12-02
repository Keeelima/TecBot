document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    const p = document.createElement("p");
    p.innerText = text;
    msgDiv.appendChild(p);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    try {
      if (typeof adjustMessagesHeight === "function") adjustMessagesHeight();
    } catch (e) { }
  };

  // Resposta simples caso API não funcione
  const getBotReply = (userText) => {
    let response = "Desculpe, não entendi. Sou uma demonstração.";
    const lowerText = userText.trim().toLowerCase();

    if (lowerText.includes("oi") || lowerText.includes("olá")) {
      response = "Olá! Como posso ajudar você hoje?";
    } else if (lowerText.includes("ajuda")) {
      response = "Estou aqui! Tente perguntar algo simples.";
    }

    return response;
  };

  // Função principal
  const handleSubmission = async () => {
    const userText = input.value.trim();
    if (!userText) return;

    addMessage(userText, "user");
    input.value = "";
    // após enviar, reset da altura do textarea (se aplicável)
    if (input && input.tagName && input.tagName.toLowerCase() === "textarea") {
      try {
        input.style.height = "auto";
      } catch (err) { }
    }

    addMessage("Digitando...", "assistant");
    const typingDiv = messages.lastElementChild;

    let reply = "";
    try {
      if (typeof getGeminiResponse === "function") {
        reply = await getGeminiResponse(userText);
      } else {
        reply = getBotReply(userText);
      }
    } catch (err) {
      reply = "Desculpe, ocorreu um erro ao obter a resposta.";
      console.error("Erro ao obter resposta:", err);
    }

    // Atualiza a mensagem do bot
    if (typingDiv) {
      const p = typingDiv.querySelector("p");
      if (p) p.innerText = reply;
      typingDiv.className = "message assistant";
    } else {
      addMessage(reply, "assistant");
    }

    if (input.tagName.toLowerCase() === "textarea") {
      input.rows = 1;
      try {
        input.style.height = "auto";
      } catch (err) { }
    }
  };

  // Envio pelo formulário
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSubmission();
    });
  }

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmission();
      }
    });
  }

  addMessage("Olá! Eu sou o TecBot. Como posso te ajudar?", "assistant");
  if (input) input.focus();

  // Ajuste dinâmico da altura da área de mensagens para evitar que a composer seja empurrada
  function adjustMessagesHeight() {
    try {
      const chat = document.getElementById("chat");
      const composer = document.getElementById("composer");
      if (!chat || !messages || !composer) return;
      // Como a composer é absoluta, definimos o bottom de messages
      const compH = composer.offsetHeight || 80;
      // define o espaço inferior que preserva a composer (mensagens rolam por baixo)
      messages.style.bottom = compH + "px";
      // garante que o scroll funcione
      messages.style.overflowY = "auto";
    } catch (e) {
      // silencioso
    }
  }

  window.addEventListener("resize", adjustMessagesHeight);
  // quando o conteúdo do composer muda (textarea cresce), reajusta
  try {
    const composerEl = document.getElementById("composer");
    const inputEl = document.getElementById("input");

    // Auto-resize do textarea: expande um pouco conforme o conteúdo,
    // respeitando o `max-height` definido no CSS.
    function autosizeTextarea() {
      if (!inputEl) return;
      try {
        inputEl.style.height = "auto";
        const computed = window.getComputedStyle(inputEl);
        // pega max-height definido no CSS (ex: "200px")
        let maxH = parseInt(computed.getPropertyValue("max-height"), 10);
        if (!maxH || Number.isNaN(maxH)) maxH = 200;
        // alguns paddings podem afetar scrollHeight, usamos scrollHeight
        const newH = Math.min(inputEl.scrollHeight, maxH);
        inputEl.style.height = newH + "px";
      } catch (err) { }
      // atualiza área de mensagens para não empurrar a composer
      adjustMessagesHeight();
    }

    if (inputEl) {
      // inicializa altura correta
      autosizeTextarea();
      inputEl.addEventListener("input", autosizeTextarea);
      // também em caso de mudanças de conteúdo programáticas
      const inputMut = new MutationObserver(autosizeTextarea);
      inputMut.observe(inputEl, { characterData: true, childList: true, subtree: true });
    }

    if (window.ResizeObserver && composerEl) {
      const ro = new ResizeObserver(() => adjustMessagesHeight());
      ro.observe(composerEl);
    }
  } catch (e) { }
  // observa mudanças em messages para ajustar imediatamente e manter scroll
  try {
    const mo = new MutationObserver(() => {
      adjustMessagesHeight();
      if (messages) messages.scrollTop = messages.scrollHeight;
    });
    if (messages) mo.observe(messages, { childList: true });
  } catch (e) { }

  // ajuste inicial após render
  setTimeout(adjustMessagesHeight, 60);
});

/* PAINEL LATERAL DE AÇÕES */
(function () {
  const btnConfig = document.getElementById("btn-config");

  let hiddenHelpEls = [];

  const panel = document.getElementById("action-panel");
  if (!btnConfig || !panel) return;

  btnConfig.dataset.state = "closed";

  function showBackIcon() {
    btnConfig.dataset.state = "open";
    btnConfig.setAttribute("aria-label", "Voltar");
    btnConfig.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" 
                stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
  }

  function showConfigLabel() {
    btnConfig.dataset.state = "closed";
    btnConfig.setAttribute("aria-label", "Configurações");
    btnConfig.innerText = "Configurações";
  }

  async function openActions() {
    if (location.protocol === "file:") {
      try {
        panel.innerHTML =
          '<div class="settings-panel">' +
          '<p class="settings-desc">Não foi possível carregar as configurações porque os arquivos estão sendo abertos diretamente (file://). Rode um servidor local e abra via <code>http://localhost:8000/</code>. Exemplo (PowerShell):<br><code>cd "c:\\Users\\kevin\\Documents\\MeuProjetos\\TecBot\\TecBot"; python -m http.server 8000;</code></p>' +
          "</div>";
        showBackIcon();
      } catch (e) { }
      return;
    }

    const candidateRels = [
      "acoes.html",
      "./acoes.html",
      "home/acoes.html",
      "./home/acoes.html",
      "../acoes.html",
      "../home/acoes.html",
    ];
    let text = null;
    for (const rel of candidateRels) {
      try {
        const url = new URL(rel, location.href).href;
        const res = await fetch(url, { cache: "no-store" });
        if (res && res.ok) {
          text = await res.text();
          break;
        }
      } catch (err) { }
    }

    if (!text) {
      try {
        const origin =
          location.origin && location.origin !== "null"
            ? location.origin
            : location.protocol + "//" + location.host;
        const parts = location.pathname.split("/").filter(Boolean);
        const firstSeg = parts.length ? "/" + parts[0] : "";
        const rootCandidates = ["/home/acoes.html", "/acoes.html"];
        if (firstSeg) {
          rootCandidates.push(
            firstSeg + "/home/acoes.html",
            firstSeg + "/acoes.html"
          );
        }
        for (const p of rootCandidates) {
          try {
            const url = origin + p;
            const res = await fetch(url, { cache: "no-store" });
            if (res && res.ok) {
              text = await res.text();
              break;
            }
          } catch (e) { }
        }
      } catch (e) { }
    }
    if (!text) {
      try {
        panel.innerHTML =
          '<div class="settings-panel"><p class="settings-desc">Não foi possível carregar as configurações. Verifique se o servidor está rodando e tente novamente.</p></div>';
        showBackIcon();
      } catch (e) { }
      return;
    }
    const bodyMatch = text.match(/<body[^>]*>[\s\S]*<\/body>/i);

    let inner = text;
    if (bodyMatch) {
      inner = bodyMatch[0].replace(/<body[^>]*>/i, "").replace(/<\/body>/i, "");
    }

    try {
      inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
    } catch (err) { }
    panel.innerHTML = inner;
    panel.scrollIntoView({ behavior: "smooth" });

    try {
      const sidebar =
        document.querySelector("aside.sidebar") ||
        document.querySelector(".sidebar.right");
      const scope = sidebar || document;
      const candidates = scope.querySelectorAll(
        "button, .sidebar-btn, [aria-label]"
      );
      hiddenHelpEls = [];
      const hideTerms = ["ajuda", "novo chat"];
      candidates.forEach((el) => {
        const label = (el.getAttribute && el.getAttribute("aria-label")) || "";
        const text = (el.innerText || "").trim().toLowerCase();
        const labelLower = (label || "").toLowerCase();

        const shouldHide = hideTerms.some((term) => {
          return labelLower === term || text === term || text.includes(term);
        });

        if (shouldHide) {
          hiddenHelpEls.push({ el, prev: el.style.display });
          el.style.display = "none";
        }
      });
    } catch (e) { }
    showBackIcon();
  }

  function closeActions() {
    panel.innerHTML = "";

    try {
      hiddenHelpEls.forEach((o) => {
        if (o && o.el) o.el.style.display = o.prev || "";
      });
    } catch (e) { }
    hiddenHelpEls = [];
    showConfigLabel();
  }

  btnConfig.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (btnConfig.dataset.state === "closed") openActions();
    else closeActions();
  });
})();

(function () {
  function createFloatingA11yButton() {
    if (document.getElementById("floating-accessibility")) return;

    const btn = document.createElement("button");
    btn.id = "floating-accessibility";
    btn.setAttribute("aria-label", "Acessibilidade");
    btn.type = "button";
    btn.className = "floating-accessibility";

    // CRIA UMA ÚNICA IMAGEM
    const img = document.createElement("img");

    try {
      const p = window.location.pathname || "";

      // Caminho correto a partir de /TecBot/home/
      img.src = "/TecBot/images/acss.png";


      // caso não carregue, mostra no console
      img.onerror = () =>
        console.error("ERRO: imagem não carregou em", img.src);

    } catch (e) {
      console.error("Erro ao definir imagem:", e);
    }

    // Adiciona a imagem no botão
    btn.appendChild(img);

    btn.addEventListener("click", (e) => e.preventDefault());

    btn.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") btn.click();
    });

    document.body.appendChild(btn);
  }

  function setupGlobalActionHandlers() {
    document.addEventListener("click", (e) => {
      let clicked = e.target;
      if (clicked && clicked.nodeType === Node.TEXT_NODE)
        clicked = clicked.parentElement;

      const logoutEl =
        clicked && clicked.closest
          ? clicked.closest('[data-action="logout"]')
          : null;
      if (logoutEl) {
        const btn = document.getElementById("floating-accessibility");
        if (btn) btn.classList.add("hidden");

        window.location.href = "../../index.html";
        return;
      }

      const themeEl =
        clicked && clicked.closest
          ? clicked.closest('[data-action="toggle-theme"]')
          : null;
      if (themeEl) {
        // toggle via centralized function
        const isLightNow = document.body.classList.contains("light");
        setTheme(!isLightNow);
        return;
      }

      const privacyEl =
        clicked && clicked.closest
          ? clicked.closest('[data-action="privacy"]')
          : null;
      if (privacyEl) {
        openPrivacyOverlay();
        return;
      }
    });
  }

  // CHAMADAS CORRETAS (SEM DUPLICAR)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      createFloatingA11yButton();
      setupGlobalActionHandlers();
    });
  } else {
    createFloatingA11yButton();
    setupGlobalActionHandlers();
  }
})();


(function () {
  const STORAGE_KEY = "tecbot_font_size";
  const MIN = 12;
  const MAX = 28;
  const STEP = 1;

  function getCurrentFontSize() {
    const el = document.documentElement;
    const inline = el.style.fontSize;
    if (inline) return parseInt(inline, 10);
    const computed = window.getComputedStyle(el).fontSize;
    return parseInt(computed, 10) || 16;
  }

  function setFontSize(px) {
    const size = Math.max(MIN, Math.min(MAX, Math.round(px)));
    document.documentElement.style.fontSize = size + "px";
    try {
      localStorage.setItem(STORAGE_KEY, String(size));
    } catch (e) { }
    const display = document.querySelector(".a11y-current-value");
    if (display) display.innerText = size + "px";
  }

  function applyStoredFont() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) setFontSize(parseInt(v, 10));
    } catch (e) { }
  }

  function createA11yOverlay() {
    if (document.getElementById("a11y-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "a11y-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const modal = document.createElement("div");
    modal.className = "a11y-modal";

    const title = document.createElement("h2");
    title.className = "a11y-title";
    title.innerText = "Acessibilidade";

    const current = document.createElement("div");
    current.className = "a11y-current";
    current.innerHTML = `Tamanho atual: <span class="a11y-current-value">${getCurrentFontSize()}px</span>`;

    const controls = document.createElement("div");
    controls.className = "a11y-controls";

    const btnDecrease = document.createElement("button");
    btnDecrease.type = "button";
    btnDecrease.className = "a11y-btn";
    btnDecrease.setAttribute("aria-label", "Diminuir fonte");
    btnDecrease.innerHTML = '<span class="a11y-icon">−</span>';

    const btnIncrease = document.createElement("button");
    btnIncrease.type = "button";
    btnIncrease.className = "a11y-btn";
    btnIncrease.setAttribute("aria-label", "Aumentar fonte");
    btnIncrease.innerHTML = '<span class="a11y-icon">+</span>';

    const close = document.createElement("button");
    close.type = "button";
    close.className = "a11y-close";
    close.setAttribute("aria-label", "Fechar janela de acessibilidade");
    close.innerText = "✕";

    controls.appendChild(btnDecrease);
    controls.appendChild(btnIncrease);

    modal.appendChild(close);
    modal.appendChild(title);
    modal.appendChild(current);
    modal.appendChild(controls);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    btnDecrease.addEventListener("click", () => {
      const cur = getCurrentFontSize();
      setFontSize(cur - STEP);
    });
    btnIncrease.addEventListener("click", () => {
      const cur = getCurrentFontSize();
      setFontSize(cur + STEP);
    });
    close.addEventListener("click", () => closeA11yOverlay());

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeA11yOverlay();
    });

    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        closeA11yOverlay();
      }
    });
  }

  function openA11yOverlay() {
    createA11yOverlay();
    const overlay = document.getElementById("a11y-overlay");
    if (!overlay) return;
    overlay.classList.add("open");

    const firstBtn = overlay.querySelector(".a11y-btn");
    if (firstBtn) firstBtn.focus();
  }

  function closeA11yOverlay() {
    const overlay = document.getElementById("a11y-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");

    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 180);
  }

  function attachFloatingToOpen() {
    const floatBtn = document.getElementById("floating-accessibility");
    if (!floatBtn) return;
    floatBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openA11yOverlay();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyStoredFont();
      attachFloatingToOpen();
    });
  } else {
    applyStoredFont();
    attachFloatingToOpen();
  }
})();

(function () {
  const THEME_KEY = "theme";

  function setTheme(isLight) {
    try {
      if (isLight) document.body.classList.add("light");
      else document.body.classList.remove("light");
      localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    } catch (e) { }
  }

  function applyStoredTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light") document.body.classList.add("light");
      else document.body.classList.remove("light");
    } catch (e) { }
  }

  window.setTheme = setTheme;
  window.applyStoredTheme = applyStoredTheme;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyStoredTheme);
  } else {
    applyStoredTheme();
  }
})();

(function () {
  function closeExistingPrivacy() {
    const ex = document.getElementById("privacy-overlay");
    if (ex && ex.parentNode) ex.parentNode.removeChild(ex);
  }

  function openPrivacyOverlay() {
    closeExistingPrivacy();
    const overlay = document.createElement("div");
    overlay.id = "privacy-overlay";
    overlay.className = "a11y-overlay open";

    const wrapper = document.createElement("div");
    wrapper.className = "privacy-modal";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "a11y-close";
    close.setAttribute("aria-label", "Fechar janela de privacidade");
    close.innerText = "✕";

    const small = document.createElement("p");
    small.className = "privacy-text";
    small.innerText =
      "Seus dados estão protegidos e processados localmente quando possível. Não coletamos informações sensíveis sem consentimento.";

    const note = document.createElement("div");
    note.className = "privacy-note";
    note.innerText = "Essa IA é respondida por um modelo da Gemini";

    wrapper.appendChild(close);
    wrapper.appendChild(small);
    wrapper.appendChild(note);

    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    close.addEventListener("click", () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.parentNode)
        overlay.parentNode.removeChild(overlay);
    });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener("keydown", onKey);
      }
    });
  }

  window.openPrivacyOverlay = openPrivacyOverlay;
})();

(function () {
  function setupNovoChat() {
    // Seleciona o botão corretamente
    const novoBtn =
      document.querySelector('.sidebar-btn[aria-label="Novo Chat"]') ||
      Array.from(document.querySelectorAll(".sidebar-btn")).find(
        (b) => (b.innerText || "").trim().toLowerCase() === "novo chat"
      );

    const mensagensEl = document.getElementById("messages");
    const inputEl = document.getElementById("input");

    if (!novoBtn || !mensagensEl) return;

    const textoInicial = "Olá! Eu sou o TecBot. Como posso te ajudar?";

    novoBtn.addEventListener("click", (ev) => {
      ev.preventDefault();

      // Limpa todas as mensagens
      mensagensEl.innerHTML = "";

      // Cria a mensagem inicial do bot
      const msgDiv = document.createElement("div");
      msgDiv.className = "message assistant";
      const p = document.createElement("p");
      p.innerText = textoInicial;
      msgDiv.appendChild(p);
      mensagensEl.appendChild(msgDiv);

      // Scroll para o final
      mensagensEl.scrollTop = mensagensEl.scrollHeight;

      // Limpa e foca no input
      if (inputEl) {
        inputEl.value = "";
        if (inputEl.tagName.toLowerCase() === "textarea") {
          inputEl.rows = 1;
          try {
            inputEl.style.height = "auto";
          } catch (err) { }
        }
        inputEl.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNovoChat);
  } else {
    setupNovoChat();
  }
})();

// --- NOVO CHAT MOBILE ---
(function () {
  function setupNovoChatMobile() {
    const novoBtnMobile = document.querySelector('[data-action="novo-chat"]');
    const mensagensEl = document.getElementById("messages");
    const inputEl = document.getElementById("input");

    if (!novoBtnMobile || !mensagensEl) return;

    const textoInicial = "Olá! Eu sou o TecBot. Como posso te ajudar?";

    novoBtnMobile.addEventListener("click", (ev) => {
      ev.preventDefault();

      // Limpa todas as mensagens
      mensagensEl.innerHTML = "";

      // Adiciona a mensagem inicial do bot
      const msgDiv = document.createElement("div");
      msgDiv.className = "message assistant";
      const p = document.createElement("p");
      p.innerText = textoInicial;
      msgDiv.appendChild(p);
      mensagensEl.appendChild(msgDiv);

      // Scroll para o final
      mensagensEl.scrollTop = mensagensEl.scrollHeight;

      // Limpa e foca no input
      if (inputEl) {
        inputEl.value = "";
        if (inputEl.tagName.toLowerCase() === "textarea") {
          inputEl.rows = 1;
          inputEl.style.height = "auto";
        }
        inputEl.focus();
      }

      // Fecha o offcanvas automaticamente (Bootstrap)
      const offcanvasEl = document.getElementById("menuAcoes");
      if (offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) bsOffcanvas.hide();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNovoChatMobile);
  } else {
    setupNovoChatMobile();
  }
})();


