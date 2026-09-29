# Gerenciador de Pacientes Odontológicos

[![CI](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml/badge.svg)](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

Aplicação web deliberadamente simples para demonstrar organização de registros odontológicos fictícios, integração frontend/backend e uma interface clínica enxuta.

**Demo principal:** https://peedrovinicius.github.io/gerenciador-pacientes-odontologicos/

> Projeto demonstrativo público. Não utilize dados reais de pacientes.

## Escopo

O projeto tem somente três áreas:

1. **Visão geral**
2. **Pacientes**
3. **Odontograma**

O objetivo não é reproduzir um sistema clínico completo. O foco é mostrar uma aplicação pequena, funcional, bem apresentada e fácil de entender.

## Funcionalidades

### Visão geral

- quantidade de pacientes cadastrados;
- quantidade de registros recentes;
- quantidade de tipos de procedimentos;
- lista dos registros mais recentes;
- resumo visual dos procedimentos cadastrados;
- indicador de disponibilidade da demonstração.

### Pacientes

- cadastro de nome do paciente e procedimento;
- listagem dos registros;
- busca por paciente ou procedimento;
- visualização de ficha demonstrativa;
- edição de registro existente;
- exclusão com confirmação;
- mensagens de sucesso e erro.

### Odontograma

- dentição adulta representada pelo sistema FDI;
- 32 elementos dentários;
- interação por clique;
- três estados demonstrativos:
  - hígido;
  - planejado;
  - realizado;
- contadores por estado;
- redefinição da avaliação;
- armazenamento local do estado do odontograma no navegador.

### Interface

- identidade visual própria em azul-marinho, azul vivo, branco e cinza-claro;
- cabeçalho com a marca **Gerenciador — Pacientes Odontológicos**;
- layout editorial e responsivo;
- tema claro e escuro;
- dados fictícios iniciais para demonstração;
- navegação entre as três áreas sem recarregar a página.

## Como a demonstração funciona

A interface pode operar de duas formas.

### Com a API Express

Quando executada junto ao backend, o frontend usa:

- `GET /api/pacientes`
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`
- `DELETE /api/pacientes/:id`

Os registros ficam em memória durante a execução do servidor.

### Como demonstração estática

No GitHub Pages não existe backend Node.js. Quando a API não está disponível, a interface utiliza `localStorage` para manter a demonstração funcional no próprio navegador.

Esse fallback é usado apenas para fins de portfólio e não representa persistência clínica real.

## API

### `GET /api/health`

Retorna:

```json
{
  "status": "ok"
}
```

### `GET /api/pacientes`

Retorna os registros da execução atual.

### `POST /api/pacientes`

Exemplo de corpo:

```json
{
  "nome": "Maria Silva",
  "procedimento": "Profilaxia"
}
```

### `PUT /api/pacientes/:id`

Atualiza nome e procedimento de um registro existente.

### `DELETE /api/pacientes/:id`

Remove um registro existente.

## Validação e segurança

O backend:

- exige `Content-Type: application/json` em criação e atualização;
- valida nome e procedimento;
- remove espaços extras;
- aplica limites de tamanho;
- limita o payload JSON a `10kb`;
- retorna respostas controladas para JSON inválido;
- remove `X-Powered-By`;
- desabilita cache nas rotas `/api`;
- envia cabeçalhos básicos contra MIME sniffing e embedding em frames.

No frontend, dados recebidos são inseridos por propriedades como `textContent`, sem interpolação direta em `innerHTML`.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js 24
- Express 4
- Node Test Runner
- GitHub Actions
- GitHub Pages

## Executar localmente

```bash
git clone https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos.git
cd gerenciador-pacientes-odontologicos
npm ci
npm start
```

Acesse:

```text
http://localhost:3000
```

## Testes

```bash
npm test
```

A CI executa:

- instalação das dependências;
- verificação de sintaxe do JavaScript;
- testes automatizados;
- auditoria das dependências de produção.

## Estrutura

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── pages.yml
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
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

## Limitações intencionais

- não possui banco de dados;
- não possui autenticação ou autorização;
- não deve receber informações reais de pacientes;
- não é um prontuário odontológico de produção;
- não inclui agenda, financeiro, documentos, prescrições ou outros módulos clínicos;
- a persistência do backend é somente em memória;
- o modo estático utiliza apenas o armazenamento local do navegador.

## Regra de documentação

O README acompanha o escopo real da aplicação.

Qualquer funcionalidade adicionada ao projeto deve ser registrada neste arquivo na mesma alteração. Da mesma forma, uma funcionalidade removida da aplicação deve ser removida do README.

Assim, a documentação não anuncia recursos inexistentes e a interface não mantém recursos sem documentação.
