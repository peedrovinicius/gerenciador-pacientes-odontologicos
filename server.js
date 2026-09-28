const { app } = require('./src/app');
const { pacientes } = require('./src/store');
const { validatePaciente } = require('./src/validation');

const port = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

module.exports = { app, validatePaciente, pacientes };
