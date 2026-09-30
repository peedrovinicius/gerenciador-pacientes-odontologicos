const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePaciente, pacientes, app } = require('../server');
const { DEMO_PACIENTES } = require('../public/demo-patients');

let server;
let baseUrl;

test.before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test.beforeEach(() => {
    pacientes.length = 0;
});

test('valida um paciente com os campos obrigatórios', () => {
    const result = validatePaciente({
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
    });

    assert.deepEqual(result, {
        valid: true,
        data: {
            nome: 'Maria Silva',
            procedimento: 'Limpeza',
        },
    });
});

test('rejeita campos ausentes', () => {
    const result = validatePaciente({ nome: 'Maria Silva' });

    assert.equal(result.valid, false);
    assert.equal(result.error, 'Nome e procedimento são obrigatórios.');
});

test('rejeita tipos inválidos', () => {
    const result = validatePaciente({
        nome: 123,
        procedimento: ['Limpeza'],
    });

    assert.equal(result.valid, false);
    assert.equal(result.error, 'Nome e procedimento são obrigatórios.');
});

test('remove espaços extras dos campos', () => {
    const result = validatePaciente({
        nome: '  Maria Silva  ',
        procedimento: '  Limpeza  ',
    });

    assert.deepEqual(result.data, {
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
    });
});

test('rejeita campos acima do limite de tamanho', () => {
    const result = validatePaciente({
        nome: 'A'.repeat(121),
        procedimento: 'Limpeza',
    });

    assert.equal(result.valid, false);
    assert.equal(result.error, 'Nome ou procedimento excede o tamanho permitido.');
});

test('mantém uma base fixa com 12 pacientes fictícios', () => {
    assert.equal(DEMO_PACIENTES.length, 12);
    assert.equal(new Set(DEMO_PACIENTES.map((paciente) => paciente.id)).size, 12);
    assert.ok(DEMO_PACIENTES.every((paciente) => paciente.nome && paciente.procedimento));
});

test('retorna o estado da aplicação no health check', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
});

test('retorna a lista de pacientes pela API', async () => {
    pacientes.push({
        id: 'teste-1',
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
        criadoEm: '2026-09-13T00:00:00.000Z',
    });

    const response = await fetch(`${baseUrl}/api/pacientes`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, pacientes);
});

test('cria um paciente pela API', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });

    const paciente = await response.json();

    assert.equal(response.status, 201);
    assert.equal(paciente.nome, 'Maria Silva');
    assert.equal(paciente.procedimento, 'Limpeza');
    assert.ok(paciente.id);
    assert.ok(paciente.criadoEm);
    assert.equal(pacientes.length, 1);
});

test('rejeita cadastro inválido pela API', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva' }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.erro, 'Nome e procedimento são obrigatórios.');
    assert.equal(pacientes.length, 0);
});

test('atualiza um paciente existente pela API', async () => {
    const createResponse = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });
    const paciente = await createResponse.json();

    const updateResponse = await fetch(`${baseUrl}/api/pacientes/${paciente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Santos', procedimento: 'Restauração' }),
    });
    const atualizado = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.equal(atualizado.id, paciente.id);
    assert.equal(atualizado.nome, 'Maria Santos');
    assert.equal(atualizado.procedimento, 'Restauração');
    assert.equal(atualizado.criadoEm, paciente.criadoEm);
    assert.equal(pacientes.length, 1);
});

test('rejeita atualização inválida pela API', async () => {
    const createResponse = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });
    const paciente = await createResponse.json();

    const updateResponse = await fetch(`${baseUrl}/api/pacientes/${paciente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva' }),
    });
    const body = await updateResponse.json();

    assert.equal(updateResponse.status, 400);
    assert.equal(body.erro, 'Nome e procedimento são obrigatórios.');
    assert.equal(pacientes[0].nome, 'Maria Silva');
    assert.equal(pacientes[0].procedimento, 'Limpeza');
});

test('retorna 404 ao tentar atualizar paciente inexistente', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes/id-inexistente`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.erro, 'Paciente não encontrado.');
});

test('bloqueia exclusão e preserva o registro existente', async () => {
    pacientes.push({
        id: 'teste-1',
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
        criadoEm: '2026-09-13T00:00:00.000Z',
    });

    const response = await fetch(`${baseUrl}/api/pacientes/teste-1`, {
        method: 'DELETE',
    });
    const body = await response.json();

    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, POST, PUT');
    assert.deepEqual(body, { erro: 'Exclusão desativada nesta demonstração.' });
    assert.equal(pacientes.length, 1);
});

test('retorna cabeçalhos básicos de segurança e impede cache da API', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    assert.equal(response.headers.get('x-powered-by'), null);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('pragma'), 'no-cache');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
});

test('retorna JSON controlado para corpo JSON malformado', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"nome":',
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, { erro: 'JSON inválido.' });
});

test('rejeita payload acima de 10kb com resposta JSON controlada', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: 'A'.repeat(11_000),
            procedimento: 'Limpeza',
        }),
    });
    const body = await response.json();

    assert.equal(response.status, 413);
    assert.deepEqual(body, { erro: 'Payload excede o limite de 10kb.' });
});

test('retorna 404 para uma rota inexistente', async () => {
    const response = await fetch(`${baseUrl}/api/rota-inexistente`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.erro, 'Recurso não encontrado.');
});


test('rejeita criação sem Content-Type application/json', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });
    const body = await response.json();

    assert.equal(response.status, 415);
    assert.deepEqual(body, { erro: 'Content-Type deve ser application/json.' });
    assert.equal(pacientes.length, 0);
});

test('rejeita atualização sem Content-Type application/json', async () => {
    pacientes.push({
        id: 'teste-1',
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
        criadoEm: '2026-09-13T00:00:00.000Z',
    });

    const response = await fetch(`${baseUrl}/api/pacientes/teste-1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ nome: 'Maria Santos', procedimento: 'Restauração' }),
    });
    const body = await response.json();

    assert.equal(response.status, 415);
    assert.deepEqual(body, { erro: 'Content-Type deve ser application/json.' });
    assert.equal(pacientes[0].nome, 'Maria Silva');
});
