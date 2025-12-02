document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const renderBoldMarkdown = (str) => {
    const safe = escapeHtml(str);
    return safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  };

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;
    const p = document.createElement("p");
    if (sender === "assistant") {
      p.innerHTML = renderBoldMarkdown(text);
    } else {
      p.innerText = text;
    }
    msgDiv.appendChild(p);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    try {
      if (typeof adjustMessagesHeight === "function") adjustMessagesHeight();
    } catch (e) { }
  };

  // Habilita/Desabilita o composer enquanto aguardamos resposta do bot
  function setComposerDisabled(state) {
    try {
      const composer = document.getElementById("composer");
      const inputEl = document.getElementById("input");
      const sendBtn = document.querySelector(".composer-send");

      if (inputEl) {
        inputEl.disabled = !!state;
        if (state) {
          inputEl.setAttribute("aria-disabled", "true");
          try {
            inputEl.blur();
          } catch (e) {}
        } else {
          inputEl.removeAttribute("aria-disabled");
          try {
            inputEl.focus();
          } catch (e) {}
        }
      }

      if (sendBtn) sendBtn.disabled = !!state;

      if (composer) {
        if (state) composer.classList.add("composer-disabled");
        else composer.classList.remove("composer-disabled");
      }
    } catch (e) {}
  }

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

    if (input && input.tagName && input.tagName.toLowerCase() === "textarea") {
      try {
        input.style.height = "auto";
      } catch (err) { }
    }

    addMessage("Digitando...", "assistant");
    const typingDiv = messages.lastElementChild;
    try {
      setComposerDisabled(true);
    } catch (e) {}

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

    if (typingDiv) {
      const p = typingDiv.querySelector("p");
      if (p) p.innerHTML = renderBoldMarkdown(reply);
      typingDiv.className = "message assistant";
      try {
        setComposerDisabled(false);
      } catch (e) {}
    } else {
      addMessage(reply, "assistant");
      try {
        setComposerDisabled(false);
      } catch (e) {}
    }

    if (input.tagName.toLowerCase() === "textarea") {
      input.rows = 1;
      try {
        input.style.height = "auto";
      } catch (err) { }
    }
  };

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

  //Evita composer ser empurrado pela área de mensagens
  function adjustMessagesHeight() {
    try {
      const chat = document.getElementById("chat");
      const composer = document.getElementById("composer");
      if (!chat || !messages || !composer) return;
      const compH = composer.offsetHeight || 80;
      messages.style.bottom = compH + "px";
      messages.style.overflowY = "auto";
    } catch (e) {
    }
  }

  window.addEventListener("resize", adjustMessagesHeight);
  try {
    const composerEl = document.getElementById("composer");
    const inputEl = document.getElementById("input");


    function autosizeTextarea() {
      if (!inputEl) return;
      try {
        inputEl.style.height = "auto";
        const computed = window.getComputedStyle(inputEl);
        let maxH = parseInt(computed.getPropertyValue("max-height"), 10);
        if (!maxH || Number.isNaN(maxH)) maxH = 200;
        const newH = Math.min(inputEl.scrollHeight, maxH);
        inputEl.style.height = newH + "px";
      } catch (err) { }
      adjustMessagesHeight();
    }

    if (inputEl) {
      autosizeTextarea();
      inputEl.addEventListener("input", autosizeTextarea);
      const inputMut = new MutationObserver(autosizeTextarea);
      inputMut.observe(inputEl, { characterData: true, childList: true, subtree: true });
    }

    if (window.ResizeObserver && composerEl) {
      const ro = new ResizeObserver(() => adjustMessagesHeight());
      ro.observe(composerEl);
    }
  } catch (e) { }
  try {
    const mo = new MutationObserver(() => {
      adjustMessagesHeight();
      if (messages) messages.scrollTop = messages.scrollHeight;
    });
    if (messages) mo.observe(messages, { childList: true });
  } catch (e) { }

  setTimeout(adjustMessagesHeight, 60);
});

//Side bar
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
      const current = (localStorage.getItem('current_user') || '').toString();
      if (current) {
        const logoutBtn = panel.querySelector('[data-action="logout"]');
        if (logoutBtn) {
          if (!panel.querySelector('.current-account')) {
            const container = document.createElement('div');
            container.className = 'current-account';
            container.style.marginTop = '8px';
            container.style.textAlign = 'center';

            const label = document.createElement('div');
            label.className = 'current-account-label';
            label.innerText = 'Você está logado como';

            const name = document.createElement('div');
            name.className = 'current-account-name';
            name.innerText = current;

            container.appendChild(label);
            container.appendChild(name);

            if (logoutBtn.parentNode) logoutBtn.parentNode.insertBefore(container, logoutBtn.nextSibling);
          }
        }
      }
    } catch (e) {}

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

    const img = document.createElement("img");

    try {
      const p = window.location.pathname || "";

      img.src = "/TecBot/images/acss.png";


      img.onerror = () =>
        console.error("ERRO: imagem não carregou em", img.src);

    } catch (e) {
      console.error("Erro ao definir imagem:", e);
    }

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
        try { localStorage.removeItem('current_user'); } catch (e) {}
        window.location.href = "../../index.html";
        return;
      }

      const themeEl =
        clicked && clicked.closest
          ? clicked.closest('[data-action="toggle-theme"]')
          : null;
      if (themeEl) {

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

// Efeitos (css)
(function attachSidebarRipple() {
  function makeRipple(e) {
    try {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = x + 'px';
      span.style.top = y + 'px';
      btn.appendChild(span);

      setTimeout(() => {
        try { if (span && span.parentNode) span.parentNode.removeChild(span); } catch (err) {}
      }, 600);
    } catch (err) {}
  }

  function init() {
    const buttons = Array.from(document.querySelectorAll('.sidebar-btn'));
    buttons.forEach((b) => {
      b.removeEventListener('click', makeRipple);
      b.addEventListener('click', makeRipple);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
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

      mensagensEl.innerHTML = "";

      // Cria a mensagem inicial do bot
      const msgDiv = document.createElement("div");
      msgDiv.className = "message assistant";
      const p = document.createElement("p");
      p.innerText = textoInicial;
      msgDiv.appendChild(p);
      mensagensEl.appendChild(msgDiv);
      mensagensEl.scrollTop = mensagensEl.scrollHeight;

      if (inputEl) {
        inputEl.value = "";
        if (inputEl.tagName.toLowerCase() === "textarea") {
          inputEl.rows = 1;
          try {
            inputEl.style.height = "auto";
          } catch (err) { }
        }
        inputEl.focus();
        try { setComposerDisabled(false); } catch (e) {}
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNovoChat);
  } else {
    setupNovoChat();
  }
})();

// MOBILE
(function () {
  function setupNovoChatMobile() {
    const novoBtnMobile = document.querySelector('[data-action="novo-chat"]');
    const mensagensEl = document.getElementById("messages");
    const inputEl = document.getElementById("input");

    if (!novoBtnMobile || !mensagensEl) return;

    const textoInicial = "Olá! Eu sou o TecBot. Como posso te ajudar?";

    novoBtnMobile.addEventListener("click", (ev) => {
      ev.preventDefault();

      mensagensEl.innerHTML = "";

      // Adiciona a mensagem inicial do bot
      const msgDiv = document.createElement("div");
      msgDiv.className = "message assistant";
      const p = document.createElement("p");
      p.innerText = textoInicial;
      msgDiv.appendChild(p);
      mensagensEl.appendChild(msgDiv);

      mensagensEl.scrollTop = mensagensEl.scrollHeight;

      if (inputEl) {
        inputEl.value = "";
        if (inputEl.tagName.toLowerCase() === "textarea") {
          inputEl.rows = 1;
          inputEl.style.height = "auto";
        }
        inputEl.focus();
        try { setComposerDisabled(false); } catch (e) {}
      }

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


