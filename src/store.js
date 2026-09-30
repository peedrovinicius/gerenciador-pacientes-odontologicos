const { cloneDemo, MAX_REGISTROS_DEMO } = require('../public/demo-patients');

const pacientes = cloneDemo();

module.exports = { pacientes, MAX_REGISTROS_DEMO };
