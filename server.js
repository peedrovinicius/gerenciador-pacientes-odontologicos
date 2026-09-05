// 1. Aqui estamos "chamando" as ferramentas que instalamos
const express = require('express');
const app = express();
const port = 3000;

// 2. Configurações básicas para o servidor entender os dados e onde ficará a parte visual
app.use(express.json());
app.use(express.static('public')); 

// 3. Nossa "gaveta" temporária para guardar as fichas. 
// Em um projeto avançado, isso seria um Banco de Dados de verdade.
let pacientes = []; 

// 4. Rota GET: É como se a tela perguntasse "Quais os pacientes cadastrados?"
app.get('/api/pacientes', (req, res) => {
    res.json(pacientes); // O servidor responde entregando a lista
});

// 5. Rota POST: É como se a tela dissesse "Tome aqui os dados de um paciente novo!"
app.post('/api/pacientes', (req, res) => {
    const novoPaciente = req.body;
    pacientes.push(novoPaciente); // O servidor guarda o paciente na nossa lista
    res.json({ mensagem: "Paciente salvo com sucesso!" });
});

// 6. Ligar o servidor e deixá-lo aguardando na porta 3000
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});