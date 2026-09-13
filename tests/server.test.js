const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePaciente, pacientes } = require('../server');

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

test('remove um paciente existente pelo id', () => {
    pacientes.push({
        id: 'paciente-1',
        nome: 'Maria Silva',
        procedimento: 'Limpeza',
    });

    const indice = pacientes.findIndex((paciente) => paciente.id === 'paciente-1');
    assert.notEqual(indice, -1);

    pacientes.splice(indice, 1);
    assert.equal(pacientes.length, 0);
});
