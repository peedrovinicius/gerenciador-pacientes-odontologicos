function validatePaciente(body) {
    const nomeValido = typeof body?.nome === 'string';
    const procedimentoValido = typeof body?.procedimento === 'string';

    const nome = nomeValido ? body.nome.trim() : '';
    const procedimento = procedimentoValido ? body.procedimento.trim() : '';

    const camposObrigatorios = [];

    if (!nome) camposObrigatorios.push('nome');
    if (!procedimento) camposObrigatorios.push('procedimento');

    if (camposObrigatorios.length) {
        return {
            valid: false,
            error: 'Nome e procedimento são obrigatórios.',
            fields: camposObrigatorios,
        };
    }

    const camposAcimaDoLimite = [];

    if (nome.length > 120) camposAcimaDoLimite.push('nome');
    if (procedimento.length > 200) camposAcimaDoLimite.push('procedimento');

    if (camposAcimaDoLimite.length) {
        return {
            valid: false,
            error: 'Nome ou procedimento excede o tamanho permitido.',
            fields: camposAcimaDoLimite,
        };
    }

    return {
        valid: true,
        data: { nome, procedimento },
    };
}

module.exports = { validatePaciente };
