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

formLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuarioDigitado = document.getElementById("username").value;
    const senhaDigitada = document.getElementById("password").value;

    const conta = buscarUsuario();

    // LIMPA MENSAGEM ANTERIOR
    erroLogin.textContent = "";

    // ERROS ESPECÍFICOS 

    if (!conta) {
        erroLogin.textContent = "Nenhum usuário cadastrado. Crie uma conta primeiro.";
        return;
    }

    if (usuarioDigitado !== conta.usuario) {
        erroLogin.textContent = "Usuário incorreto.";
        return;
    }

    if (senhaDigitada !== conta.senha) {
        erroLogin.textContent = "Senha incorreta.";
        return;
    }

    // LOGIN OK
    window.location.href = "home/home.html";

    // LIMPA CAMPOS
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
});

// TELA DE CADASTRO

const formCadastro = document.getElementById("form-cadastro");
const erroCadastro = document.getElementById("erro-cadastro");

formCadastro.addEventListener("submit", function (event) {
    event.preventDefault();

    const novoUsuario = document.getElementById("novo-usuario").value;
    const novaSenha = document.getElementById("nova-senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    // LIMPA ERRO
    erroCadastro.textContent = "";

    //  VALIDAÇÕES 

    if (novoUsuario.length < 3) {
        erroCadastro.textContent = "O usuário deve ter pelo menos 3 caracteres.";
        return;
    }

    if (novaSenha.length < 4) {
        erroCadastro.textContent = "A senha deve ter no mínimo 4 caracteres.";
        return;
    }

    if (novaSenha !== confirmarSenha) {
        erroCadastro.textContent = "As senhas não estão iguais.";
        return;
    }

    salvarUsuario(novoUsuario, novaSenha);

    erroCadastro.style.color = "green";
    erroCadastro.textContent = "Cadastro realizado com sucesso!";

    // LIMPA CAMPOS
    document.getElementById("novo-usuario").value = "";
    document.getElementById("nova-senha").value = "";
    document.getElementById("confirmar-senha").value = "";

    // VOLTA AO LOGIN DEPOIS DE 1 SEGUNDO
    setTimeout(() => {
        formCadastro.style.display = "none";
        formLogin.style.display = "block";
        erroCadastro.textContent = "";
        erroCadastro.style.color = "#ff4d4d";
    }, 800);
});

// BOTÕES DE TROCA ENTRE TELAS
document.getElementById("abrir-cadastro").onclick = () => {
    formLogin.style.display = "none";
    formCadastro.style.display = "block";
    erroLogin.textContent = "";
};

document.getElementById("voltar-login").onclick = () => {
    formCadastro.style.display = "none";
    formLogin.style.display = "block";
    erroCadastro.textContent = "";
};
