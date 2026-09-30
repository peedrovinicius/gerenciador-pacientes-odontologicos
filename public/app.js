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
const detalhesPaciente = document.getElementById('detalhes-paciente');
const detalheNome = document.getElementById('detalhe-nome');
const detalheProcedimento = document.getElementById('detalhe-procedimento');
const detalheData = document.getElementById('detalhe-data');

const STORAGE_ODONTOGRAMA = 'gerenciador-odontologico-odontograma';
const STORAGE_TEMA = 'gerenciador-odontologico-tema';

const { cloneDemo, MAX_REGISTROS_DEMO } = window.DemoPatients;

const {
    DENTES_SUPERIORES,
    DENTES_INFERIORES,
    STATUS_CICLO,
    registroOdontograma,
    estadoInicialOdontograma,
    normalizarRegistroOdontograma,
    dadosCondicao,
    classeAnatomicaDente,
    nomeAnatomicoDente,
    carregarOdontograma: carregarOdontogramaModel,
    salvarOdontograma: salvarOdontogramaModel,
} = window.OdontogramModel;

let pacienteEmEdicao = null;
let pacientesCache = [];
let modoLocal = false;
let odontograma = carregarOdontograma();
let denteSelecionado = 16;


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
        const ativo = item.dataset.view === nome;
        item.classList.toggle('active', ativo);
        if (ativo) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });


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

    if (paciente.temporario) {
        const temporario = document.createElement('small');
        temporario.className = 'temporary-badge';
        temporario.textContent = 'temporário';
        textos.appendChild(temporario);
    }

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

    acoes.append(botaoVer, botaoEditar);
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

function carregarPacientesLocais() {
    return cloneDemo();
}

async function carregarPacientes() {
    try {
        const resposta = await fetch('/api/pacientes', {
            headers: { Accept: 'application/json' },
        });

        if (!resposta.ok) {
            throw new Error('API indisponível');
        }

        pacientesCache = await resposta.json();
        modoLocal = false;
    } catch {
        modoLocal = true;
        pacientesCache = carregarPacientesLocais();
    }

    aplicarBusca();
    renderizarDashboard(pacientesCache);
}

function salvarRegistroLocal(dados, editando) {
    if (!editando && pacientesCache.length >= MAX_REGISTROS_DEMO) {
        throw new Error(`Limite da demonstração atingido: máximo de ${MAX_REGISTROS_DEMO} registros por sessão.`);
    }

    if (editando) {
        pacientesCache = pacientesCache.map((paciente) =>
            paciente.id === pacienteEmEdicao
                ? { ...paciente, ...dados, temporario: true }
                : paciente);
        return;
    }

    pacientesCache = [
        ...pacientesCache,
        {
            id: `local-${Date.now()}`,
            ...dados,
            criadoEm: new Date().toISOString(),
            temporario: true,
        },
    ];
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagem.textContent = '';
    botaoSalvar.disabled = true;

    const dados = Object.fromEntries(new FormData(formulario));
    const editando = pacienteEmEdicao !== null;

    try {
        if (modoLocal) {
            salvarRegistroLocal(dados, editando);
        } else {
            const url = editando
                ? `/api/pacientes/${encodeURIComponent(pacienteEmEdicao)}`
                : '/api/pacientes';

            const resposta = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.erro || 'Não foi possível salvar o registro.');
            }
        }

        cancelarEdicao();

        if (modoLocal) {
            mensagem.textContent = editando
                ? 'Alteração temporária. Ao recarregar a página, o registro original será restaurado.'
                : 'Registro temporário. Ao recarregar a página, ele será removido.';
            aplicarBusca();
            renderizarDashboard(pacientesCache);
        } else {
            mensagem.textContent = editando
                ? 'Registro atualizado temporariamente na memória do servidor.'
                : 'Registro criado temporariamente na memória do servidor.';
            await carregarPacientes();
        }
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botaoSalvar.disabled = false;
    }
});

function carregarOdontograma() {
    return carregarOdontogramaModel(localStorage, STORAGE_ODONTOGRAMA);
}

function salvarOdontograma() {
    salvarOdontogramaModel(localStorage, STORAGE_ODONTOGRAMA, odontograma);
}

function nomeStatus(status) {
    if (status === 'planned') return 'Planejado';
    if (status === 'done') return 'Realizado';
    return 'Hígido';
}

function atualizarResumoOdontograma() {
    const valores = Object.values(odontograma).map((item) => normalizarRegistroOdontograma(item));

    document.getElementById('odonto-higidos').textContent =
        valores.filter((item) => item.status === 'healthy').length;
    document.getElementById('odonto-planejados').textContent =
        valores.filter((item) => item.status === 'planned').length;
    document.getElementById('odonto-realizados').textContent =
        valores.filter((item) => item.status === 'done').length;
}

function renderizarDetalheDente() {
    const registro = normalizarRegistroOdontograma(odontograma[denteSelecionado]);
    const condicao = dadosCondicao(registro.condicao);

    document.getElementById('odonto-detalhe-numero').textContent = denteSelecionado;
    document.getElementById('odonto-detalhe-nome').textContent = nomeAnatomicoDente(denteSelecionado);
    document.getElementById('odonto-detalhe-condicao').textContent = condicao.label;
    document.getElementById('odonto-detalhe-descricao').textContent = condicao.descricao;

    const status = document.getElementById('odonto-detalhe-status');
    status.textContent = nomeStatus(registro.status);
    status.className = `detail-status ${registro.status}`;

    const forma = document.getElementById('odonto-detalhe-forma');
    forma.className = `detail-tooth-shape ${classeAnatomicaDente(denteSelecionado)} ${registro.status}`;
}

function criarDente(numero) {
    const registro = normalizarRegistroOdontograma(odontograma[numero]);
    const condicao = dadosCondicao(registro.condicao);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `tooth-button ${registro.status} ${numero === denteSelecionado ? 'selected' : ''}`;
    botao.setAttribute(
        'aria-label',
        `Dente ${numero}, ${nomeStatus(registro.status)}${registro.condicao ? `, ${condicao.label}` : ''}`,
    );
    botao.setAttribute('aria-pressed', numero === denteSelecionado ? 'true' : 'false');

    const forma = document.createElement('span');
    forma.className = `tooth-shape ${classeAnatomicaDente(numero)}`;
    forma.setAttribute('aria-hidden', 'true');

    const rotulo = document.createElement('span');
    rotulo.className = 'tooth-number';
    rotulo.textContent = numero;

    botao.append(forma, rotulo);

    if (registro.condicao) {
        const etiqueta = document.createElement('span');
        etiqueta.className = `tooth-condition ${registro.condicao}`;
        etiqueta.textContent = condicao.label;
        botao.appendChild(etiqueta);
    }

    botao.addEventListener('click', () => {
        denteSelecionado = numero;
        renderizarOdontograma();
    });

    return botao;
}

function renderizarOdontograma() {
    const superior = document.getElementById('arcada-superior');
    const inferior = document.getElementById('arcada-inferior');

    superior.replaceChildren(...DENTES_SUPERIORES.map(criarDente));
    inferior.replaceChildren(...DENTES_INFERIORES.map(criarDente));
    atualizarResumoOdontograma();
    renderizarDetalheDente();
}

function aplicarCondicaoSelecionada(condicaoId) {
    const condicao = dadosCondicao(condicaoId);

    odontograma[denteSelecionado] = registroOdontograma(condicao.status, condicaoId);
    salvarOdontograma();
    renderizarOdontograma();
}

function alternarStatusSelecionado() {
    const registro = normalizarRegistroOdontograma(odontograma[denteSelecionado]);
    const indice = STATUS_CICLO.indexOf(registro.status);
    registro.status = STATUS_CICLO[(indice + 1) % STATUS_CICLO.length];

    if (registro.status === 'healthy') {
        registro.condicao = null;
    }

    odontograma[denteSelecionado] = registro;
    salvarOdontograma();
    renderizarOdontograma();
}

function atualizarControleTema(escuro) {
    const botaoTema = document.getElementById('alternar-tema');
    botaoTema.setAttribute('aria-pressed', escuro ? 'true' : 'false');
    botaoTema.setAttribute(
        'aria-label',
        escuro ? 'Ativar tema claro' : 'Ativar tema escuro',
    );
}

function aplicarTemaSalvo() {
    const tema = localStorage.getItem(STORAGE_TEMA);
    const escuro = tema === 'dark';
    document.body.classList.toggle('dark-theme', escuro);
    atualizarControleTema(escuro);
}

function alternarTema() {
    const escuro = document.body.classList.toggle('dark-theme');
    localStorage.setItem(STORAGE_TEMA, escuro ? 'dark' : 'light');
    atualizarControleTema(escuro);
}

document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => mostrarView(item.dataset.view));
});

document.querySelectorAll('[data-view-target]').forEach((item) => {
    item.addEventListener('click', () => mostrarView(item.dataset.viewTarget));
});

document.getElementById('novo-paciente').addEventListener('click', abrirNovoRegistro);
document.getElementById('novo-paciente-topo').addEventListener('click', abrirNovoRegistro);
document.getElementById('alternar-tema').addEventListener('click', alternarTema);
document.getElementById('resetar-odontograma').addEventListener('click', () => {
    odontograma = estadoInicialOdontograma();
    denteSelecionado = 16;
    salvarOdontograma();
    renderizarOdontograma();
});

document.getElementById('alternar-status-dente').addEventListener('click', alternarStatusSelecionado);

document.querySelectorAll('[data-odontograma-condicao]').forEach((botao) => {
    botao.addEventListener('click', () => aplicarCondicaoSelecionada(botao.dataset.odontogramaCondicao));
});
document.getElementById('fechar-detalhes').addEventListener('click', () => detalhesPaciente.close());

detalhesPaciente.addEventListener('click', (evento) => {
    if (evento.target === detalhesPaciente) detalhesPaciente.close();
});

botaoCancelar.addEventListener('click', cancelarEdicao);
busca.addEventListener('input', aplicarBusca);

aplicarTemaSalvo();
renderizarOdontograma();
carregarPacientes();
