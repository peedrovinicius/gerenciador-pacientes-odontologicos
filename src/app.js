const crypto = require('node:crypto');
const express = require('express');

const { pacientes, MAX_REGISTROS_DEMO } = require('./store');
const { validatePaciente } = require('./validation');

const app = express();

function responderErro(res, status, codigo, mensagem, campos = []) {
    const corpo = { codigo, mensagem };

    if (campos.length) {
        corpo.campos = campos;
    }

    return res.status(status).json(corpo);
}

app.disable('x-powered-by');

app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    next();
});

app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    next();
});

app.use('/api/pacientes', (req, res, next) => {
    if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
        return responderErro(res, 415, 'CONTENT_TYPE_INVALIDO', 'Content-Type deve ser application/json.');
    }
    return next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/pacientes', (_req, res) => {
    res.json(pacientes);
});

app.post('/api/pacientes', (req, res) => {
    if (pacientes.length >= MAX_REGISTROS_DEMO) {
        return responderErro(
            res,
            409,
            'LIMITE_DEMO_ATINGIDO',
            `Limite da demonstração atingido: máximo de ${MAX_REGISTROS_DEMO} registros por sessão.`,
        );
    }

    const validation = validatePaciente(req.body);

    if (!validation.valid) {
        return responderErro(res, 400, 'DADOS_INVALIDOS', validation.error, validation.fields);
    }

    const paciente = {
        id: crypto.randomUUID(),
        ...validation.data,
        criadoEm: new Date().toISOString(),
        temporario: true,
    };

    pacientes.push(paciente);
    return res.status(201).json(paciente);
});

app.put('/api/pacientes/:id', (req, res) => {
    const indice = pacientes.findIndex((paciente) => paciente.id === req.params.id);

    if (indice === -1) {
        return responderErro(res, 404, 'PACIENTE_NAO_ENCONTRADO', 'Paciente não encontrado.');
    }

    const validation = validatePaciente(req.body);

    if (!validation.valid) {
        return responderErro(res, 400, 'DADOS_INVALIDOS', validation.error, validation.fields);
    }

    pacientes[indice] = {
        ...pacientes[indice],
        ...validation.data,
        temporario: true,
    };

    return res.status(200).json(pacientes[indice]);
});

app.delete('/api/pacientes/:id', (_req, res) => {
    res.setHeader('Allow', 'GET, POST, PUT');
    return responderErro(
        res,
        405,
        'EXCLUSAO_DESATIVADA',
        'Exclusão desativada nesta demonstração.',
    );
});

app.use((error, _req, res, next) => {
    if (error?.type === 'entity.parse.failed') {
        return responderErro(res, 400, 'JSON_INVALIDO', 'JSON inválido.');
    }

    if (error?.type === 'entity.too.large') {
        return responderErro(res, 413, 'PAYLOAD_EXCEDIDO', 'Payload excede o limite de 10kb.');
    }

    return next(error);
});

app.use((_req, res) => {
    responderErro(res, 404, 'RECURSO_NAO_ENCONTRADO', 'Recurso não encontrado.');
});

module.exports = { app };
