const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePaciente, pacientes, app } = require('../server');

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

test('remove um paciente existente pela API', async () => {
    const createResponse = await fetch(`${baseUrl}/api/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Maria Silva', procedimento: 'Limpeza' }),
    });
    const paciente = await createResponse.json();

    const deleteResponse = await fetch(`${baseUrl}/api/pacientes/${paciente.id}`, {
        method: 'DELETE',
    });

    assert.equal(deleteResponse.status, 204);
    assert.equal(pacientes.length, 0);
});

test('retorna 404 ao tentar excluir paciente inexistente', async () => {
    const response = await fetch(`${baseUrl}/api/pacientes/id-inexistente`, {
        method: 'DELETE',
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.erro, 'Paciente não encontrado.');
});
