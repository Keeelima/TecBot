// FUNÇÕES PARA SALVAR E BUSCAR USUÁRIOS

function getContas() {
    try {
        const raw = localStorage.getItem('contas');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch (e) {
        return [];
    }
}

function saveContas(contas) {
    try {
        localStorage.setItem('contas', JSON.stringify(contas));
        return true;
    } catch (e) {
        return false;
    }
}

function salvarUsuario(usuario, senha) {
    const contas = getContas();
    const cleanUser = (usuario || '').trim();
    const exists = contas.some(c => (c.usuario || '').toLowerCase() === cleanUser.toLowerCase());
    if (exists) return { ok: false, message: 'Já existe uma conta com esse nome de usuário.' };
    contas.push({ usuario: cleanUser, senha: senha });
    const ok = saveContas(contas);
    return ok ? { ok: true } : { ok: false, message: 'Erro ao salvar conta.' };
}

function buscarUsuarioPorNome(usuario) {
    const contas = getContas();
    const cleanUser = (usuario || '').trim().toLowerCase();
    return contas.find(c => (c.usuario || '').toLowerCase() === cleanUser) || null;
}

// TELA DE LOGIN

const formLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();
        const usuarioDigitado = (document.getElementById("username").value || '').trim();
        const senhaDigitada = document.getElementById("password").value;

        if (erroLogin) erroLogin.textContent = "";

        const conta = buscarUsuarioPorNome(usuarioDigitado);
        if (!conta) {
            if (erroLogin) erroLogin.textContent = "Usuário não encontrado. Cadastre-se primeiro.";
            return;
        }

        if (senhaDigitada !== conta.senha) {
            if (erroLogin) erroLogin.textContent = "Senha incorreta.";
            return;
        }

        
        try {
            localStorage.setItem('current_user', (usuarioDigitado || '').trim());
        } catch (e) {}
        window.location.href = "/TecBot/home/home.html";


        const u = document.getElementById("username");
        const p = document.getElementById("password");
        if (u) u.value = "";
        if (p) p.value = "";
    });
}

// TELA DE CADASTRO

const formCadastro = document.getElementById("form-cadastro");
const erroCadastro = document.getElementById("erro-cadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", function (event) {
        event.preventDefault();

        const novoUsuarioEl = document.getElementById("novo-usuario");
        const novaSenhaEl = document.getElementById("nova-senha");
        const confirmarSenhaEl = document.getElementById("confirmar-senha");

        const novoUsuario = novoUsuarioEl ? novoUsuarioEl.value.trim() : '';
        const novaSenha = novaSenhaEl ? novaSenhaEl.value : '';
        const confirmarSenha = confirmarSenhaEl ? confirmarSenhaEl.value : '';

        if (erroCadastro) erroCadastro.textContent = "";


        if (novoUsuario.length < 3) {
            if (erroCadastro) erroCadastro.textContent = "O usuário deve ter pelo menos 3 caracteres.";
            return;
        }

        if (novaSenha.length < 4) {
            if (erroCadastro) erroCadastro.textContent = "A senha deve ter no mínimo 4 caracteres.";
            return;
        }

        if (novaSenha !== confirmarSenha) {
            if (erroCadastro) erroCadastro.textContent = "As senhas não estão iguais.";
            return;
        }

        const res = salvarUsuario(novoUsuario, novaSenha);
        if (!res.ok) {
            if (erroCadastro) erroCadastro.textContent = res.message || 'Erro ao cadastrar.';
            return;
        }

        if (erroCadastro) {
            erroCadastro.style.color = "green";
            erroCadastro.textContent = "Cadastro realizado com sucesso! Você já pode fazer login.";
        }

        if (novoUsuarioEl) novoUsuarioEl.value = "";
        if (novaSenhaEl) novaSenhaEl.value = "";
        if (confirmarSenhaEl) confirmarSenhaEl.value = "";

        setTimeout(() => {
            if (formCadastro) formCadastro.style.display = "none";
            if (formLogin) formLogin.style.display = "block";
            if (erroCadastro) {
                erroCadastro.textContent = "";
                erroCadastro.style.color = "#ff4d4d";
            }
        }, 800);
    });
}

const abrirCadastroBtn = document.getElementById("abrir-cadastro");
const voltarLoginBtn = document.getElementById("voltar-login");

if (abrirCadastroBtn) {
    abrirCadastroBtn.onclick = () => {
        if (formLogin) formLogin.style.display = "none";
        if (formCadastro) formCadastro.style.display = "block";
        if (erroLogin) erroLogin.textContent = "";
    };
}

if (voltarLoginBtn) {
    voltarLoginBtn.onclick = () => {
        if (formCadastro) formCadastro.style.display = "none";
        if (formLogin) formLogin.style.display = "block";
        if (erroCadastro) erroCadastro.textContent = "";
    };
}

function atualizarCorDoBotaoClose() {
    const tema = document.documentElement.getAttribute("data-theme");
    const btnClose = document.querySelector("#menuAcoes .btn-close");

    if (!btnClose) return;

    if (tema === "dark") {
        btnClose.style.filter = "invert(1) brightness(2)";  
    } else {
        btnClose.style.filter = "invert(0)";               
    }
}

document.querySelector("[data-action='toggle-theme']")
    .addEventListener("click", () => {

        const atual = document.documentElement.getAttribute("data-theme");
        const novoTema = atual === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", novoTema);

        atualizarCorDoBotaoClose();
    });


document.getElementById("menuAcoes")
    .addEventListener("shown.bs.offcanvas", atualizarCorDoBotaoClose);
