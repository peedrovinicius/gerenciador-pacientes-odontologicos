const formulario = document.getElementById('formulario-paciente');
const lista = document.getElementById('lista');
const mensagem = document.getElementById('mensagem');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const campoNome = document.getElementById('nome');
const campoProcedimento = document.getElementById('procedimento');

let pacienteEmEdicao = null;

function criarRegistro(paciente) {
    const item = document.createElement('li');
    item.className = 'paciente';

    const nome = document.createElement('h3');
    nome.textContent = paciente.nome;

    const procedimento = document.createElement('p');
    procedimento.textContent = `Procedimento: ${paciente.procedimento}`;

    const botaoEditar = document.createElement('button');
    botaoEditar.type = 'button';
    botaoEditar.className = 'botao-editar';
    botaoEditar.textContent = 'Editar';
    botaoEditar.addEventListener('click', () => iniciarEdicao(paciente));

    const botaoExcluir = document.createElement('button');
    botaoExcluir.type = 'button';
    botaoExcluir.className = 'botao-excluir';
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.addEventListener('click', () => excluirPaciente(paciente.id, botaoExcluir));

    item.append(nome, procedimento, botaoEditar, botaoExcluir);
    return item;
}

function renderizarPacientes(pacientes) {
    lista.replaceChildren();

    if (pacientes.length === 0) {
        const vazio = document.createElement('li');
        vazio.className = 'vazio';
        vazio.textContent = 'Nenhum registro cadastrado.';
        lista.appendChild(vazio);
        return;
    }

    pacientes.forEach((paciente) => lista.appendChild(criarRegistro(paciente)));
}

function iniciarEdicao(paciente) {
    pacienteEmEdicao = paciente.id;
    campoNome.value = paciente.nome;
    campoProcedimento.value = paciente.procedimento;
    botaoSalvar.textContent = 'Salvar alterações';
    botaoCancelar.hidden = false;
    mensagem.textContent = 'Editando registro.';
    campoNome.focus();
}

function cancelarEdicao() {
    pacienteEmEdicao = null;
    formulario.reset();
    botaoSalvar.textContent = 'Salvar registro';
    botaoCancelar.hidden = true;
    mensagem.textContent = '';
}

async function carregarPacientes() {
    try {
        const resposta = await fetch('/api/pacientes');
        if (!resposta.ok) throw new Error('Não foi possível carregar os registros.');

        const pacientes = await resposta.json();
        renderizarPacientes(pacientes);
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

async function excluirPaciente(id, botao) {
    if (!window.confirm('Excluir este registro?')) return;

    botao.disabled = true;
    mensagem.textContent = '';

    try {
        const resposta = await fetch(`/api/pacientes/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        if (!resposta.ok) {
            const resultado = await resposta.json();
            throw new Error(resultado.erro || 'Não foi possível excluir o registro.');
        }

        if (pacienteEmEdicao === id) cancelarEdicao();
        mensagem.textContent = 'Registro excluído com sucesso.';
        await carregarPacientes();
    } catch (erro) {
        mensagem.textContent = erro.message;
        botao.disabled = false;
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagem.textContent = '';
    botaoSalvar.disabled = true;

    const dados = Object.fromEntries(new FormData(formulario));
    const editando = pacienteEmEdicao !== null;
    const url = editando
        ? `/api/pacientes/${encodeURIComponent(pacienteEmEdicao)}`
        : '/api/pacientes';
    const method = editando ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();
        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Não foi possível salvar o registro.');
        }

        formulario.reset();
        pacienteEmEdicao = null;
        botaoSalvar.textContent = 'Salvar registro';
        botaoCancelar.hidden = true;
        mensagem.textContent = editando
            ? 'Registro atualizado com sucesso.'
            : 'Registro salvo com sucesso.';
        await carregarPacientes();
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botaoSalvar.disabled = false;
    }
});

botaoCancelar.addEventListener('click', cancelarEdicao);
carregarPacientes();
