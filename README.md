# Gerenciador de Pacientes Odontológicos

[![CI](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml/badge.svg)](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

[Demo](https://gerenciador-pacientes-odontologicos.onrender.com) · [Issues](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/issues) · [Como contribuir](CONTRIBUTING.md)

Aplicação web para cadastro, consulta, edição e exclusão de registros odontológicos, desenvolvida com **HTML, CSS, JavaScript, Node.js e Express**.

## Acesse o projeto

**[Demo online](https://gerenciador-pacientes-odontologicos.onrender.com)**

> Demonstração técnica pública. Utilize apenas dados fictícios. O projeto não possui autenticação, autorização ou persistência em banco de dados e não deve receber informações reais de pacientes.

## Sobre o projeto

O projeto simula um fluxo simples de atendimento: a interface envia dados para uma API, a aplicação Express valida as entradas e o armazenamento isolado mantém os registros em memória, enquanto a interface consulta, edita e exclui os registros cadastrados.

O objetivo é demonstrar, de forma prática, a integração entre **frontend e backend**, operações HTTP, validação de dados, manipulação segura do DOM, testes automatizados e integração contínua.

## Funcionalidades

- cadastro de paciente e procedimento;
- consulta dos registros cadastrados;
- edição de registros existentes;
- exclusão de registros com confirmação;
- validação dos campos obrigatórios e dos tipos recebidos;
- limite de tamanho para os dados recebidos;
- geração de identificador único e data de criação;
- mensagens de sucesso e erro no frontend;
- endpoint de health check;
- respostas HTTP adequadas para sucesso, erro de validação e recurso inexistente.

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
   ├── aplicação e rotas
   ├── validação
   └── armazenamento
       │
       ├── GET    /api/health
       ├── GET    /api/pacientes
       ├── POST   /api/pacientes
       ├── PUT    /api/pacientes/:id
       └── DELETE /api/pacientes/:id
       │
       ▼
Memória da aplicação
```

A persistência é **intencionalmente em memória**. Os registros são perdidos quando o processo é reiniciado. Essa decisão mantém o escopo concentrado na integração HTTP entre frontend e backend.

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

Em caso de sucesso, retorna `201 Created` com o registro criado, incluindo `id` e `criadoEm`. Entradas inválidas retornam `400 Bad Request`.

### `PUT /api/pacientes/:id`

Atualiza nome e procedimento de um registro existente. Mantém o `id` e a data original de criação. Retorna `200 OK` em caso de sucesso, `400 Bad Request` para dados inválidos e `404 Not Found` quando o registro não existe.

### `DELETE /api/pacientes/:id`

Remove um registro existente. Retorna `204 No Content` em caso de sucesso e `404 Not Found` quando o registro não existe.

## Segurança e validação

O backend não confia diretamente no corpo recebido. Antes de criar ou atualizar um registro, exige `Content-Type: application/json`, valida o tipo dos campos, remove espaços extras, verifica obrigatoriedade e aplica limites de tamanho. O payload JSON possui limite de `10kb`, e tipo de conteúdo incorreto, JSON malformado ou payload acima do limite recebe resposta controlada da API.

A aplicação também remove o cabeçalho `X-Powered-By`, impede cache das rotas `/api` e envia cabeçalhos básicos de proteção contra MIME sniffing, embedding em frames e envio desnecessário de referência.

No frontend, os dados retornados pela API são inseridos no DOM com `textContent` e elementos criados via JavaScript, evitando a interpolação direta de conteúdo recebido em `innerHTML`.

## Tecnologias

- **HTML5** — estrutura da interface;
- **CSS3** — layout e responsividade;
- **JavaScript** — interação e consumo da API;
- **Node.js 24 LTS** — ambiente de execução;
- **Express 4.22.3** — servidor HTTP e API;
- **Node Test Runner** — testes automatizados;
- **GitHub Actions** — integração contínua.

## Testes e CI

Os testes podem ser executados localmente com:

```bash
npm test
```

A suíte cobre validação dos dados e os principais fluxos da API, incluindo cadastro, atualização e exclusão, além de JSON malformado, excesso de payload, cabeçalhos de segurança e cenários de erro correspondentes.

A CI executa automaticamente:

```bash
npm ci
node --check server.js
npm test
npm audit --omit=dev --audit-level=high
```

O workflow é acionado em `push` e `pull_request` na branch `main`.

## Deploy

O repositório inclui `render.yaml` com a configuração reproduzível do serviço:

- runtime Node.js;
- instalação determinística com `npm ci`;
- inicialização com `npm start`;
- health check em `/api/health`;
- deploy automático a partir da branch `main`.

O serviço público permanece uma demonstração técnica e não deve receber dados reais de pacientes.

## Como executar localmente

1. Instale o Node.js 24 LTS.
2. Clone o repositório:

```bash
git clone https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos.git
cd gerenciador-pacientes-odontologicos
```

3. Instale exatamente as dependências registradas no lockfile:

```bash
npm ci
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
├── src/
│   ├── app.js
│   ├── store.js
│   └── validation.js
├── tests/
│   └── server.test.js
├── package.json
├── package-lock.json
├── render.yaml
├── server.js
└── README.md
```

## Contribuindo

Contribuições externas são bem-vindas. Antes de abrir um Pull Request, consulte o [guia de contribuição](CONTRIBUTING.md) e use as issues para alinhar o escopo da mudança.

Use somente dados fictícios em exemplos, testes, issues e Pull Requests.

## Limitações

- os dados são armazenados apenas em memória;
- não há autenticação ou autorização;
- o projeto não possui banco de dados;
- não deve ser utilizado como sistema clínico de produção;
- o escopo desta versão é demonstrar, de forma isolada, integração frontend/backend e operações CRUD sobre uma API REST.

## Status

**Versão demonstrativa concluída.**

Persistência em banco, autenticação e recursos clínicos reais estão deliberadamente fora do escopo desta aplicação e não são requisitos pendentes desta versão.
