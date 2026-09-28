function validatePaciente(body) {
    const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
    const procedimento = typeof body?.procedimento === 'string'
        ? body.procedimento.trim()
        : '';

    if (!nome || !procedimento) {
        return {
            valid: false,
            error: 'Nome e procedimento são obrigatórios.',
        };
    }

    if (nome.length > 120 || procedimento.length > 200) {
        return {
            valid: false,
            error: 'Nome ou procedimento excede o tamanho permitido.',
        };
    }

    return {
        valid: true,
        data: { nome, procedimento },
    };
}

module.exports = { validatePaciente };
