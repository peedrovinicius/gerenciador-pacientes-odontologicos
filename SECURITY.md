# Política de segurança

## Escopo

Este repositório mantém uma aplicação demonstrativa para gestão de pacientes odontológicos. Relatos de segurança devem focar em falhas reproduzíveis no código, dependências, autenticação, autorização, validação de entrada, exposição de dados ou configuração de implantação.

## Como relatar uma vulnerabilidade

Não publique detalhes sensíveis em uma issue pública.

Prefira um canal privado disponível no GitHub para o repositório. Caso esse recurso não esteja disponível, entre em contato de forma privada com o mantenedor pelo perfil do GitHub e informe apenas o necessário para estabelecer um canal seguro.

Inclua, quando possível:

- descrição objetiva da vulnerabilidade;
- passos mínimos para reprodução;
- impacto esperado;
- versão, commit ou ambiente afetado;
- evidências sem dados pessoais reais;
- sugestão de correção, se houver.

## Dados de teste

Não use dados reais de pacientes, documentos, credenciais ou qualquer informação clínica para demonstrar uma falha. Utilize somente dados fictícios.

## Tratamento do relato

O mantenedor avaliará o impacto, buscará reproduzir o problema e priorizará a correção de acordo com a gravidade. Uma vulnerabilidade só deve ser divulgada publicamente depois que a correção estiver disponível e houver tempo razoável para atualização.

## Boas práticas para contribuições

Mudanças relacionadas a segurança devem preservar, no mínimo:

- validação de entrada no servidor;
- controles de autenticação e autorização;
- princípio do menor privilégio;
- ausência de segredos no código-fonte;
- tratamento seguro de erros;
- testes para regressões de segurança quando aplicável.

## Aviso de escopo clínico

Este projeto não deve ser tratado como prontuário eletrônico certificado ou solução pronta para uso clínico real sem uma avaliação específica de segurança, privacidade, disponibilidade, retenção e conformidade aplicável.
