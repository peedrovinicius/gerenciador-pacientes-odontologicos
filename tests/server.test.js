const test = require('node:test');
const assert = require('node:assert/strict');

const { validatePaciente } = require('../server');

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
