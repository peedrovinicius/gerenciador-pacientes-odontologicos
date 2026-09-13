# Gerenciador de Pacientes Odontológicos

[![CI](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml/badge.svg)](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

Aplicação web para cadastro e consulta de registros odontológicos, desenvolvida com **HTML, CSS, JavaScript, Node.js e Express**.

## Acesse o projeto

**[Demo online](https://gerenciador-pacientes-odontologicos.onrender.com)**

## Sobre o projeto

O projeto simula um fluxo simples de atendimento: a interface envia os dados de um paciente para uma API, o servidor valida a entrada e mantém os registros em memória, e a interface consulta e apresenta os dados cadastrados.

O objetivo é demonstrar, de forma prática, a integração entre **frontend e backend**, criação de rotas HTTP, validação de dados e testes automatizados.

## Funcionalidades

- cadastro de paciente e procedimento;
- consulta dos registros cadastrados;
- validação dos campos obrigatórios;
- limite de tamanho para os dados recebidos;
- geração de identificador único e data de criação;
- mensagens de sucesso e erro no frontend;
- endpoint de health check;
- resposta `404` para recursos inexistentes.

## Arquitetura

```text
Navegador
   │
   │ HTTP / JSON
   ▼
Frontend (HTML/CSS/JavaScript)
   │
   │ fetch()
   ▼
API Node.js + Express
   │
   ├── GET  /api/health
   ├── GET  /api/pacientes
   └── POST /api/pacientes
   │
   ▼
Memória da aplicação
```

A persistência é **intencionalmente em memória**. Os registros são perdidos quando o processo é reiniciado. Essa limitação mantém o projeto pequeno e adequado ao objetivo de estudo.

## API

### `GET /api/health`

Retorna o estado básico da aplicação.

```json
{
  "status": "ok"
}
```

### `GET /api/pacientes`

Retorna todos os registros cadastrados na execução atual.

### `POST /api/pacientes`

Recebe um objeto JSON com:

```json
{
  "nome": "Maria Silva",
  "procedimento": "Limpeza"
}
```

Em caso de sucesso, a API retorna `201 Created` com o registro criado, incluindo `id` e `criadoEm`.

Entradas inválidas retornam `400 Bad Request`.

## Segurança e validação

O backend não confia diretamente no corpo recebido. Antes de criar um registro, valida o tipo dos campos, remove espaços extras, verifica obrigatoriedade e aplica limites de tamanho. O payload JSON também possui limite de `10kb`.

No frontend, os dados retornados pela API são inseridos no DOM com `textContent` e elementos criados via JavaScript, evitando a interpolação direta de conteúdo recebido em `innerHTML`.

## Tecnologias

- **HTML5** — estrutura da interface;
- **CSS3** — layout e responsividade;
- **JavaScript** — interação e consumo da API;
- **Node.js 18+** — ambiente de execução;
- **Express 4.x** — servidor HTTP e API;
- **Node Test Runner** — testes automatizados;
- **GitHub Actions** — integração contínua.

## Testes e CI

Os testes podem ser executados localmente com:

```bash
npm test
```

A CI executa automaticamente:

```bash
npm install
npm test
```

O workflow é acionado em `push` e `pull_request` na branch `main`.

## Como executar localmente

1. Instale o Node.js 18 ou superior.
2. Clone o repositório:

```bash
git clone https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos.git
cd gerenciador-pacientes-odontologicos
```

3. Instale as dependências:

```bash
npm install
```

4. Inicie a aplicação:

```bash
npm start
```

5. Acesse `http://localhost:3000`.

## Estrutura do projeto

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── index.html
├── tests/
│   └── server.test.js
├── package.json
├── server.js
└── README.md
```

## Limitações

- os dados são armazenados apenas em memória;
- não há autenticação ou autorização;
- o projeto não possui banco de dados;
- o escopo atual é um protótipo funcional para estudo de integração frontend/backend.

## Próximas evoluções

A evolução natural do projeto seria separar a persistência da aplicação e adicionar operações de edição, exclusão e busca, mantendo a API como camada de acesso aos dados.
