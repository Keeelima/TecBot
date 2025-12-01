// FUNÇÕES PARA SALVAR E BUSCAR USUÁRIOS

function salvarUsuario(usuario, senha) {
    const dados = { usuario: usuario, senha: senha };
    localStorage.setItem("conta", JSON.stringify(dados));
}

function buscarUsuario() {
    const dados = localStorage.getItem("conta");
    return dados ? JSON.parse(dados) : null;
}

// TELA DE LOGIN

const formLogin = document.getElementById("form-login");
const erroLogin = document.getElementById("erro-login");

if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();

        const usuarioDigitado = document.getElementById("username").value;
        const senhaDigitada = document.getElementById("password").value;

        const conta = buscarUsuario();

        // LIMPA MENSAGEM ANTERIOR
        if (erroLogin) erroLogin.textContent = "";

        // ERROS ESPECÍFICOS 

        if (!conta) {
            if (erroLogin) erroLogin.textContent = "Nenhum usuário cadastrado. Crie uma conta primeiro.";
            return;
        }

        if (usuarioDigitado !== conta.usuario) {
            if (erroLogin) erroLogin.textContent = "Usuário incorreto.";
            return;
        }

        if (senhaDigitada !== conta.senha) {
            if (erroLogin) erroLogin.textContent = "Senha incorreta.";
            return;
        }

        // LOGIN OK
        window.location.href = "TecBot/home/home.html";

        // LIMPA CAMPOS
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

        const novoUsuario = novoUsuarioEl ? novoUsuarioEl.value : '';
        const novaSenha = novaSenhaEl ? novaSenhaEl.value : '';
        const confirmarSenha = confirmarSenhaEl ? confirmarSenhaEl.value : '';

        // LIMPA ERRO
        if (erroCadastro) erroCadastro.textContent = "";

        //  VALIDAÇÕES 

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

        salvarUsuario(novoUsuario, novaSenha);

        if (erroCadastro) {
            erroCadastro.style.color = "green";
            erroCadastro.textContent = "Cadastro realizado com sucesso!";
        }

        // LIMPA CAMPOS
        if (novoUsuarioEl) novoUsuarioEl.value = "";
        if (novaSenhaEl) novaSenhaEl.value = "";
        if (confirmarSenhaEl) confirmarSenhaEl.value = "";

        // VOLTA AO LOGIN DEPOIS DE 1 SEGUNDO
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

// BOTÕES DE TROCA ENTRE TELAS
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
