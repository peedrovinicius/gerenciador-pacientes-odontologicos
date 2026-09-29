(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.OdontogramModel = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const DENTES_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    const DENTES_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    const STATUS_CICLO = ['healthy', 'planned', 'done'];

    function registroOdontograma(status = 'healthy', condicao = null) {
        return { status, condicao };
    }

    function estadoInicialOdontograma() {
        const estado = [...DENTES_SUPERIORES, ...DENTES_INFERIORES].reduce((resultado, dente) => {
            resultado[dente] = registroOdontograma();
            return resultado;
        }, {});

        estado[16] = registroOdontograma('planned', 'carie');
        estado[12] = registroOdontograma('done', 'restauracao');
        estado[24] = registroOdontograma('planned', 'canal');
        estado[26] = registroOdontograma('done', 'profilaxia');
        estado[46] = registroOdontograma('done', 'restauracao');
        estado[44] = registroOdontograma('planned', 'carie');
        estado[36] = registroOdontograma('done', 'profilaxia');

        return estado;
    }

    function normalizarRegistroOdontograma(valor) {
        if (typeof valor === 'string') {
            return registroOdontograma(STATUS_CICLO.includes(valor) ? valor : 'healthy');
        }

        if (valor && typeof valor === 'object') {
            return registroOdontograma(
                STATUS_CICLO.includes(valor.status) ? valor.status : 'healthy',
                typeof valor.condicao === 'string' ? valor.condicao : null,
            );
        }

        return registroOdontograma();
    }

    function dadosCondicao(condicao) {
        const dados = {
            carie: {
                label: 'Cárie',
                status: 'planned',
                descricao: 'Exemplo fictício de lesão cariosa indicada para avaliação restauradora.',
            },
            restauracao: {
                label: 'Restauração',
                status: 'done',
                descricao: 'Exemplo fictício de restauração registrada como procedimento realizado.',
            },
            canal: {
                label: 'Canal',
                status: 'planned',
                descricao: 'Exemplo fictício de tratamento endodôntico registrado como planejado.',
            },
            profilaxia: {
                label: 'Profilaxia',
                status: 'done',
                descricao: 'Exemplo fictício de procedimento preventivo registrado como realizado.',
            },
        };

        return dados[condicao] || {
            label: 'Sem condição',
            status: 'healthy',
            descricao: 'Dente sem alteração demonstrativa registrada.',
        };
    }

    function tipoDente(numero) {
        const posicao = Number(String(numero).slice(-1));

        if (posicao === 1) return 'incisivo-central';
        if (posicao === 2) return 'incisivo-lateral';
        if (posicao === 3) return 'canino';
        if (posicao === 4 || posicao === 5) return 'premolar';
        return 'molar';
    }

    function classeAnatomicaDente(numero) {
        const classes = [tipoDente(numero)];

        if ([31, 32, 41, 42].includes(numero)) {
            classes.push('incisivo-inferior-central');
        } else if ([33, 43].includes(numero)) {
            classes.push('canino-inferior');
        }

        return classes.join(' ');
    }

    function nomeAnatomicoDente(numero) {
        const quadrante = Number(String(numero)[0]);
        const posicao = Number(String(numero)[1]);

        const tipos = {
            1: 'Incisivo central',
            2: 'Incisivo lateral',
            3: 'Canino',
            4: 'Primeiro pré-molar',
            5: 'Segundo pré-molar',
            6: 'Primeiro molar',
            7: 'Segundo molar',
            8: 'Terceiro molar',
        };

        const localizacoes = {
            1: 'superior direito',
            2: 'superior esquerdo',
            3: 'inferior esquerdo',
            4: 'inferior direito',
        };

        return `${tipos[posicao] || 'Dente'} ${localizacoes[quadrante] || ''}`.trim();
    }

    function carregarOdontograma(storage, chave) {
        const inicial = estadoInicialOdontograma();

        try {
            const salvo = JSON.parse(storage.getItem(chave) || 'null');

            if (salvo && typeof salvo === 'object') {
                Object.keys(inicial).forEach((dente) => {
                    if (Object.prototype.hasOwnProperty.call(salvo, dente)) {
                        inicial[dente] = normalizarRegistroOdontograma(salvo[dente]);
                    }
                });
            }
        } catch {
            storage.removeItem(chave);
        }

        return inicial;
    }

    function salvarOdontograma(storage, chave, estado) {
        storage.setItem(chave, JSON.stringify(estado));
    }

    return {
        DENTES_SUPERIORES,
        DENTES_INFERIORES,
        STATUS_CICLO,
        registroOdontograma,
        estadoInicialOdontograma,
        normalizarRegistroOdontograma,
        dadosCondicao,
        tipoDente,
        classeAnatomicaDente,
        nomeAnatomicoDente,
        carregarOdontograma,
        salvarOdontograma,
    };
});
