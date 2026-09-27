const express = require('express');
const crypto = require('node:crypto');

const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');

app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

const pacientes = [];

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

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/pacientes', (_req, res) => {
    res.json(pacientes);
});

app.post('/api/pacientes', (req, res) => {
    const validation = validatePaciente(req.body);

    if (!validation.valid) {
        return res.status(400).json({ erro: validation.error });
    }

    const paciente = {
        id: crypto.randomUUID(),
        ...validation.data,
        criadoEm: new Date().toISOString(),
    };

    pacientes.push(paciente);
    return res.status(201).json(paciente);
});

app.put('/api/pacientes/:id', (req, res) => {
    const indice = pacientes.findIndex((paciente) => paciente.id === req.params.id);

    if (indice === -1) {
        return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    const validation = validatePaciente(req.body);

    if (!validation.valid) {
        return res.status(400).json({ erro: validation.error });
    }

    pacientes[indice] = {
        ...pacientes[indice],
        ...validation.data,
    };

    return res.status(200).json(pacientes[indice]);
});

app.delete('/api/pacientes/:id', (req, res) => {
    const indice = pacientes.findIndex((paciente) => paciente.id === req.params.id);

    if (indice === -1) {
        return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    pacientes.splice(indice, 1);
    return res.status(204).send();
});

app.use((error, _req, res, next) => {
    if (error?.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'JSON inválido.' });
    }

    if (error?.type === 'entity.too.large') {
        return res.status(413).json({ erro: 'Payload excede o limite de 10kb.' });
    }

    return next(error);
});

app.use((_req, res) => {
    res.status(404).json({ erro: 'Recurso não encontrado.' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

module.exports = { app, validatePaciente, pacientes };
