# Contribuindo

Contribuições são bem-vindas quando preservam o caráter demonstrativo do projeto e não transformam a aplicação em um sistema clínico de produção.

## Antes de começar

1. Procure uma issue aberta relacionada ao tema.
2. Se a mudança não estiver registrada, abra uma issue descrevendo problema, motivação e escopo.
3. Não use dados reais de pacientes em issues, testes, exemplos ou Pull Requests.

## Fluxo recomendado

1. Crie uma branch curta e específica a partir de `main`.
2. Faça uma alteração por tema.
3. Inclua ou atualize testes quando houver mudança de comportamento.
4. Execute as validações locais.
5. Abra um Pull Request com contexto suficiente para revisão.

Validação principal:

```bash
npm ci
node --check server.js
npm test
npm audit --omit=dev --audit-level=high
```

## Regras de qualidade

- use apenas dados fictícios;
- preserve as respostas HTTP e os contratos já documentados;
- mantenha validação de entrada e limite de payload;
- não introduza `innerHTML` com conteúdo vindo da API;
- mantenha os cabeçalhos de segurança existentes;
- não adicione persistência, autenticação ou recursos clínicos reais sem uma discussão de escopo;
- mantenha commits e Pull Requests pequenos e objetivos.

## Pull Requests

Inclua no PR:

- problema resolvido;
- arquivos afetados;
- testes executados;
- impacto no contrato da API, quando houver;
- evidência visual apenas quando a mudança afetar a interface.

Mudanças pequenas e bem delimitadas são preferíveis a PRs muito amplos.
