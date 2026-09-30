# Gerenciador de Pacientes Odontológicos

[![CI](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml/badge.svg)](https://github.com/peedrovinicius/gerenciador-pacientes-odontologicos/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

Aplicação web simples para organizar registros odontológicos fictícios, demonstrar integração entre frontend e backend e apresentar um odontograma interativo.

**Demo principal:** https://peedrovinicius.github.io/gerenciador-pacientes-odontologicos/

> Projeto demonstrativo público. Não utilize dados reais de pacientes.

## Escopo

O projeto tem somente três áreas:

1. **Visão geral**
2. **Pacientes**
3. **Odontograma**

O objetivo não é reproduzir um sistema clínico completo. O foco é mostrar uma aplicação pequena, funcional, bem apresentada e fácil de entender.

## Interface

### Visão geral

![Visão geral do Gerenciador](docs/screenshots/visao-geral.png)

### Odontograma

![Odontograma interativo do Gerenciador](docs/screenshots/odontograma.png)

As capturas são atualizadas por um workflow do GitHub Actions quando a interface é modificada.

## Funcionalidades

### Visão geral

- quantidade de pacientes cadastrados;
- quantidade de registros recentes;
- quantidade de tipos de procedimentos;
- lista dos registros mais recentes;
- resumo visual dos procedimentos cadastrados;
- indicador de disponibilidade da demonstração.

### Pacientes

- base fixa com 12 pacientes fictícios;
- cadastro temporário de nome do paciente e procedimento;
- listagem dos registros;
- busca por paciente ou procedimento;
- visualização de ficha demonstrativa;
- edição temporária de registro existente;
- indicação visual para registros temporários;
- exclusão desativada;
- mensagens de sucesso e erro.

### Odontograma

- dentição adulta representada pelo sistema FDI;
- 32 elementos dentários;
- desenho visual diferenciado para molares, pré-molares, caninos e incisivos;
- incisivos inferiores 31, 32, 41 e 42 representados com anatomia mais estreita;
- seleção de um dente por clique;
- painel lateral com número FDI, nome anatômico, condição e status;
- três estados demonstrativos:
  - hígido;
  - planejado;
  - realizado;
- exemplos fictícios pré-carregados de cárie, restauração, canal e profilaxia;
- atalhos para aplicar esses quatro exemplos ao dente selecionado;
- cárie e canal demonstrados como planejados;
- restauração e profilaxia demonstradas como realizadas;
- contadores por estado;
- botão para restaurar os exemplos iniciais;
- armazenamento local do estado do odontograma no navegador.

### Interface

- identidade visual editorial em marrom, vinho, marfim e tons neutros;
- logomarca **Gerenciador — Pacientes Odontológicos** adaptada à paleta do site;
- favicon próprio baseado na identidade visual;
- layout editorial e responsivo;
- tema claro e escuro;
- 12 pacientes fictícios iniciais para demonstração;
- cadastros e edições de pacientes temporários;
- navegação entre as três áreas sem recarregar a página.

## Como a demonstração funciona

A interface pode operar de duas formas.

### Com a API Express

Quando executada junto ao backend, o frontend usa:

- `GET /api/pacientes`
- `POST /api/pacientes`
- `PUT /api/pacientes/:id`

A base inicial contém 12 pacientes fictícios. Novos registros e edições ficam somente na memória do processo e desaparecem quando o servidor é reiniciado.

A exclusão é intencionalmente desativada. Requisições `DELETE /api/pacientes/:id` retornam `405 Method Not Allowed` e não removem registros.

### Como demonstração estática

No GitHub Pages não existe backend Node.js. A interface inicia sempre com os mesmos 12 pacientes fictícios e mantém novos cadastros ou edições apenas na memória da página.

Ao recarregar ou reabrir a demonstração:

- pacientes adicionados durante a sessão desaparecem;
- edições são desfeitas;
- a base fixa de 12 pacientes é restaurada.

Os dados de pacientes não são gravados em `localStorage`. O armazenamento local continua sendo usado somente pelo odontograma demonstrativo e pela preferência de tema.

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

A exclusão está desativada nesta demonstração. A rota responde com `405 Method Not Allowed` e preserva o registro.

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
- testes automatizados da API;
- teste da base fixa de 12 pacientes;
- teste de bloqueio da exclusão;
- testes do modelo do odontograma;
- testes de compatibilidade com o formato antigo salvo no navegador;
- testes de persistência simulada em `localStorage`;
- auditoria das dependências de produção.

## Estrutura

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── config.yml
│   │   └── feature_request.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── pages.yml
│   │   └── screenshots.yml
│   └── pull_request_template.md
├── docs/
│   └── screenshots/
│       ├── odontograma.png
│       └── visao-geral.png
├── public/
│   ├── app.js
│   ├── demo-patients.js
│   ├── favicon.svg
│   ├── gerenciador-logo-marrom.svg
│   ├── index.html
│   ├── odontogram-model.js
│   └── styles.css
├── src/
│   ├── app.js
│   ├── store.js
│   └── validation.js
├── tests/
│   ├── odontogram.test.js
│   └── server.test.js
├── .gitignore
├── CONTRIBUTING.md
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
- alterações de pacientes no backend existem somente em memória;
- pacientes criados ou editados no GitHub Pages são descartados ao recarregar;
- a exclusão de pacientes é desativada;
- `localStorage` é usado apenas para odontograma e preferência de tema.

## Regra de documentação

O README acompanha o escopo real da aplicação.

Qualquer funcionalidade adicionada ao projeto deve ser registrada neste arquivo na mesma alteração. Da mesma forma, uma funcionalidade removida da aplicação deve ser removida do README.

Assim, a documentação não anuncia recursos inexistentes e a interface não mantém recursos sem documentação.
