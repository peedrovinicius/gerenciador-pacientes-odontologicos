const formulario = document.getElementById('formulario-paciente');
const lista = document.getElementById('lista');
const mensagem = document.getElementById('mensagem');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');
const campoNome = document.getElementById('nome');
const campoProcedimento = document.getElementById('procedimento');
const busca = document.getElementById('busca');
const contadorRegistros = document.getElementById('contador-registros');
const tituloFormulario = document.getElementById('titulo-formulario');
const tituloPagina = document.getElementById('titulo-pagina');
const detalhesPaciente = document.getElementById('detalhes-paciente');
const detalheNome = document.getElementById('detalhe-nome');
const detalheProcedimento = document.getElementById('detalhe-procedimento');
const detalheData = document.getElementById('detalhe-data');

let pacienteEmEdicao = null;
let pacientesCache = [];

function iniciais(nome) {
    return String(nome || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() || '')
        .join('');
}

function formatarData(valor) {
    if (!valor) return 'Data não disponível';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'Data não disponível';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(data);
}

function textoTempo(valor) {
    if (!valor) return 'registro';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'registro';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
    }).format(data);
}

function mostrarView(nome) {
    document.querySelectorAll('.view').forEach((view) => {
        view.classList.toggle('active', view.id === `view-${nome}`);
    });

    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.view === nome);
    });

    const titulos = {
        dashboard: 'Dashboard',
        pacientes: 'Pacientes',
        agenda: 'Agenda',
        tratamentos: 'Tratamentos',
        odontograma: 'Odontograma',
        relatorios: 'Relatórios',
    };

    tituloPagina.textContent = titulos[nome] || 'Dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function abrirNovoRegistro() {
    mostrarView('pacientes');
    cancelarEdicao();
    document.getElementById('editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    campoNome.focus({ preventScroll: true });
}

function abrirDetalhes(paciente) {
    detalheNome.textContent = paciente.nome;
    detalheProcedimento.textContent = paciente.procedimento;
    detalheData.textContent = formatarData(paciente.criadoEm);
    detalhesPaciente.showModal();
}

function criarRegistro(paciente) {
    const item = document.createElement('article');
    item.className = 'patient-row';

    const principal = document.createElement('div');
    principal.className = 'patient-main';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = iniciais(paciente.nome);

    const textos = document.createElement('div');
    const nome = document.createElement('strong');
    nome.textContent = paciente.nome;
    const procedimento = document.createElement('span');
    procedimento.textContent = paciente.procedimento;
    textos.append(nome, procedimento);

    principal.append(avatar, textos);

    const acoes = document.createElement('div');
    acoes.className = 'patient-actions';

    const botaoVer = document.createElement('button');
    botaoVer.type = 'button';
    botaoVer.className = 'view-button';
    botaoVer.textContent = 'Ver ficha';
    botaoVer.addEventListener('click', () => abrirDetalhes(paciente));

    const botaoEditar = document.createElement('button');
    botaoEditar.type = 'button';
    botaoEditar.className = 'edit-button';
    botaoEditar.textContent = 'Editar';
    botaoEditar.addEventListener('click', () => iniciarEdicao(paciente));

    const botaoExcluir = document.createElement('button');
    botaoExcluir.type = 'button';
    botaoExcluir.className = 'delete-button';
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.addEventListener('click', () => excluirPaciente(paciente.id, botaoExcluir));

    acoes.append(botaoVer, botaoEditar, botaoExcluir);
    item.append(principal, acoes);
    return item;
}

function renderizarPacientes(pacientes) {
    lista.replaceChildren();
    contadorRegistros.textContent = `${pacientes.length} ${pacientes.length === 1 ? 'registro' : 'registros'}`;

    if (pacientes.length === 0) {
        const vazio = document.createElement('div');
        vazio.className = 'empty-state';
        vazio.textContent = busca.value.trim()
            ? 'Nenhum registro encontrado para esta busca.'
            : 'Nenhum registro cadastrado ainda.';
        lista.appendChild(vazio);
        return;
    }

    pacientes.forEach((paciente) => lista.appendChild(criarRegistro(paciente)));
}

function renderizarDashboard(pacientes) {
    document.getElementById('stat-pacientes').textContent = pacientes.length;
    document.getElementById('stat-recentes').textContent = Math.min(pacientes.length, 5);

    const procedimentos = new Map();
    pacientes.forEach((paciente) => {
        const nome = paciente.procedimento.trim();
        const chave = nome.toLocaleLowerCase('pt-BR');
        const atual = procedimentos.get(chave) || { nome, quantidade: 0 };
        atual.quantidade += 1;
        procedimentos.set(chave, atual);
    });

    document.getElementById('stat-procedimentos').textContent = procedimentos.size;

    const recentes = document.getElementById('recentes');
    recentes.replaceChildren();

    if (pacientes.length === 0) {
        const vazio = document.createElement('div');
        vazio.className = 'empty-state';
        vazio.textContent = 'Cadastre o primeiro registro para começar a preencher o dashboard.';
        recentes.appendChild(vazio);
    } else {
        [...pacientes]
            .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0))
            .slice(0, 5)
            .forEach((paciente) => {
                const item = document.createElement('div');
                item.className = 'recent-item';

                const avatar = document.createElement('div');
                avatar.className = 'avatar';
                avatar.textContent = iniciais(paciente.nome);

                const info = document.createElement('div');
                const nome = document.createElement('strong');
                nome.textContent = paciente.nome;
                const procedimento = document.createElement('span');
                procedimento.textContent = paciente.procedimento;
                info.append(nome, procedimento);

                const tempo = document.createElement('time');
                tempo.textContent = textoTempo(paciente.criadoEm);

                item.append(avatar, info, tempo);
                recentes.appendChild(item);
            });
    }

    const resumo = document.getElementById('procedimentos-resumo');
    resumo.replaceChildren();

    const ranking = [...procedimentos.values()]
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

    if (ranking.length === 0) {
        const vazio = document.createElement('div');
        vazio.className = 'empty-state';
        vazio.textContent = 'Os procedimentos cadastrados aparecerão aqui.';
        resumo.appendChild(vazio);
        return;
    }

    const maior = Math.max(...ranking.map((item) => item.quantidade));
    ranking.forEach((item) => {
        const bloco = document.createElement('div');
        bloco.className = 'procedure-item';

        const meta = document.createElement('div');
        meta.className = 'procedure-meta';
        const nome = document.createElement('span');
        nome.textContent = item.nome;
        const qtd = document.createElement('span');
        qtd.textContent = `${item.quantidade}x`;
        meta.append(nome, qtd);

        const barra = document.createElement('div');
        barra.className = 'bar';
        const preenchimento = document.createElement('i');
        preenchimento.style.width = `${Math.max(14, (item.quantidade / maior) * 100)}%`;
        barra.appendChild(preenchimento);

        bloco.append(meta, barra);
        resumo.appendChild(bloco);
    });
}

function aplicarBusca() {
    const termo = busca.value.trim().toLocaleLowerCase('pt-BR');
    const filtrados = termo
        ? pacientesCache.filter((paciente) =>
            paciente.nome.toLocaleLowerCase('pt-BR').includes(termo)
            || paciente.procedimento.toLocaleLowerCase('pt-BR').includes(termo))
        : pacientesCache;

    renderizarPacientes(filtrados);
}

function iniciarEdicao(paciente) {
    mostrarView('pacientes');
    pacienteEmEdicao = paciente.id;
    campoNome.value = paciente.nome;
    campoProcedimento.value = paciente.procedimento;
    tituloFormulario.textContent = 'Editar registro';
    botaoSalvar.textContent = 'Salvar alterações';
    botaoCancelar.hidden = false;
    mensagem.textContent = 'Você está editando um registro existente.';
    document.getElementById('editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    campoNome.focus({ preventScroll: true });
}

function cancelarEdicao() {
    pacienteEmEdicao = null;
    formulario.reset();
    tituloFormulario.textContent = 'Novo registro';
    botaoSalvar.textContent = 'Salvar registro';
    botaoCancelar.hidden = true;
    mensagem.textContent = '';
}

async function carregarPacientes() {
    try {
        const resposta = await fetch('/api/pacientes', { headers: { Accept: 'application/json' } });
        if (!resposta.ok) throw new Error('Não foi possível carregar os registros.');

        pacientesCache = await resposta.json();
        aplicarBusca();
        renderizarDashboard(pacientesCache);
    } catch (erro) {
        mensagem.textContent = erro.message;
        renderizarPacientes([]);
        renderizarDashboard([]);
    }
}

async function excluirPaciente(id, botao) {
    if (!window.confirm('Excluir este registro demonstrativo?')) return;

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

        cancelarEdicao();
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

document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => mostrarView(item.dataset.view));
});

document.querySelectorAll('[data-view-target]').forEach((item) => {
    item.addEventListener('click', () => mostrarView(item.dataset.viewTarget));
});

document.getElementById('novo-paciente').addEventListener('click', abrirNovoRegistro);
document.getElementById('novo-paciente-topo').addEventListener('click', abrirNovoRegistro);
document.getElementById('fechar-detalhes').addEventListener('click', () => detalhesPaciente.close());
detalhesPaciente.addEventListener('click', (evento) => {
    if (evento.target === detalhesPaciente) detalhesPaciente.close();
});
botaoCancelar.addEventListener('click', cancelarEdicao);
busca.addEventListener('input', aplicarBusca);

carregarPacientes();
