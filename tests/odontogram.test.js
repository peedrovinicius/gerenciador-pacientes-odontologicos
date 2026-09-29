const test = require('node:test');
const assert = require('node:assert/strict');

const {
    estadoInicialOdontograma,
    normalizarRegistroOdontograma,
    classeAnatomicaDente,
    nomeAnatomicoDente,
    carregarOdontograma,
    salvarOdontograma,
} = require('../public/odontogram-model.js');

function fakeStorage(initial = {}) {
    const values = new Map(Object.entries(initial));

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        },
    };
}

test('odontograma inicial contém 32 dentes e exemplos fictícios', () => {
    const estado = estadoInicialOdontograma();

    assert.equal(Object.keys(estado).length, 32);
    assert.deepEqual(estado[16], { status: 'planned', condicao: 'carie' });
    assert.deepEqual(estado[12], { status: 'done', condicao: 'restauracao' });
    assert.deepEqual(estado[24], { status: 'planned', condicao: 'canal' });
    assert.deepEqual(estado[36], { status: 'done', condicao: 'profilaxia' });
});

test('normaliza estado legado salvo apenas como string', () => {
    assert.deepEqual(normalizarRegistroOdontograma('planned'), {
        status: 'planned',
        condicao: null,
    });

    assert.deepEqual(normalizarRegistroOdontograma('valor-invalido'), {
        status: 'healthy',
        condicao: null,
    });
});

test('salva e restaura odontograma no armazenamento local', () => {
    const storage = fakeStorage();
    const chave = 'teste-odontograma';
    const estado = estadoInicialOdontograma();

    estado[11] = { status: 'done', condicao: 'restauracao' };
    salvarOdontograma(storage, chave, estado);

    const restaurado = carregarOdontograma(storage, chave);

    assert.deepEqual(restaurado[11], {
        status: 'done',
        condicao: 'restauracao',
    });
});

test('remove armazenamento inválido e volta aos exemplos iniciais', () => {
    let removido = false;
    const storage = {
        getItem() {
            return '{json-invalido';
        },
        setItem() {},
        removeItem() {
            removido = true;
        },
    };

    const restaurado = carregarOdontograma(storage, 'odontograma');

    assert.equal(removido, true);
    assert.equal(Object.keys(restaurado).length, 32);
    assert.deepEqual(restaurado[16], { status: 'planned', condicao: 'carie' });
});

test('incisivos inferiores recebem classe anatômica estreita', () => {
    for (const numero of [31, 32, 41, 42]) {
        assert.match(classeAnatomicaDente(numero), /incisivo-inferior-estreito/);
    }

    assert.doesNotMatch(classeAnatomicaDente(11), /incisivo-inferior-estreito/);
});

test('nome anatômico usa numeração FDI corretamente', () => {
    assert.equal(nomeAnatomicoDente(16), 'Primeiro molar superior direito');
    assert.equal(nomeAnatomicoDente(31), 'Incisivo central inferior esquerdo');
    assert.equal(nomeAnatomicoDente(42), 'Incisivo lateral inferior direito');
});
