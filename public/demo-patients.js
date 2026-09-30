(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.DemoPatients = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const MAX_REGISTROS_DEMO = 20;

    const DEMO_PACIENTES = [
        {
            id: 'demo-ana-martins',
            nome: 'Ana Martins',
            procedimento: 'Profilaxia e orientação de higiene',
            criadoEm: '2026-09-29T12:30:00.000Z',
        },
        {
            id: 'demo-carlos-almeida',
            nome: 'Carlos Almeida',
            procedimento: 'Restauração em resina composta',
            criadoEm: '2026-09-29T11:10:00.000Z',
        },
        {
            id: 'demo-julia-rocha',
            nome: 'Júlia Rocha',
            procedimento: 'Avaliação odontológica',
            criadoEm: '2026-09-29T09:45:00.000Z',
        },
        {
            id: 'demo-lucas-monteiro',
            nome: 'Lucas Monteiro',
            procedimento: 'Aplicação tópica de flúor',
            criadoEm: '2026-09-28T18:20:00.000Z',
        },
        {
            id: 'demo-mariana-freitas',
            nome: 'Mariana Freitas',
            procedimento: 'Clareamento dental',
            criadoEm: '2026-09-28T15:40:00.000Z',
        },
        {
            id: 'demo-rafael-nogueira',
            nome: 'Rafael Nogueira',
            procedimento: 'Raspagem periodontal',
            criadoEm: '2026-09-28T13:05:00.000Z',
        },
        {
            id: 'demo-beatriz-costa',
            nome: 'Beatriz Costa',
            procedimento: 'Restauração em resina composta',
            criadoEm: '2026-09-27T17:15:00.000Z',
        },
        {
            id: 'demo-gabriel-sousa',
            nome: 'Gabriel Sousa',
            procedimento: 'Avaliação odontológica',
            criadoEm: '2026-09-27T14:30:00.000Z',
        },
        {
            id: 'demo-isabela-lima',
            nome: 'Isabela Lima',
            procedimento: 'Profilaxia e orientação de higiene',
            criadoEm: '2026-09-26T16:50:00.000Z',
        },
        {
            id: 'demo-matheus-barbosa',
            nome: 'Matheus Barbosa',
            procedimento: 'Tratamento endodôntico',
            criadoEm: '2026-09-26T10:25:00.000Z',
        },
        {
            id: 'demo-larissa-mendes',
            nome: 'Larissa Mendes',
            procedimento: 'Selante de fóssulas e fissuras',
            criadoEm: '2026-09-25T15:00:00.000Z',
        },
        {
            id: 'demo-felipe-araujo',
            nome: 'Felipe Araújo',
            procedimento: 'Ajuste oclusal',
            criadoEm: '2026-09-25T11:35:00.000Z',
        },
    ];

    function cloneDemo() {
        return DEMO_PACIENTES.map((paciente) => ({ ...paciente }));
    }

    return { DEMO_PACIENTES, MAX_REGISTROS_DEMO, cloneDemo };
});
