# Proposta acadêmica e persona fictícia

## Natureza

Conforme orientação do autor em 21/11/2026, o Droz Control é genérico, destinado à apresentação acadêmica e ao portfólio. Não exige operação diária em empresa real. Não foram realizadas entrevistas nem há cliente contratante a comprovar.

## Persona de estudo (fictícia)

Pessoa responsável pela organização administrativa de uma pequena equipe. Precisa localizar colaboradores, associá-los a departamentos, atribuir tarefas e registrar ativos. A hipótese didática é que cadastros dispersos dificultam consultar responsáveis e acompanhar informações relacionadas.

## Problema e objetivos

Centralizar os quatro cadastros em uma aplicação web com login, validação e persistência. Exercitar React/TypeScript, Node/Express, Sequelize/MySQL, modelagem de entidades, orientação a objetos e Docker. O benefício esperado é facilitar consulta e associação de registros; não há métrica real de ganho de produtividade medida.

## Critérios de aceitação

1. Uma conta válida acessa os cadastros; chamadas sem JWT recebem 401.
2. Um colaborador pode ser vinculado a um departamento e uma tarefa a um colaborador.
3. Usuário altera somente seu próprio perfil e não altera o e-mail.
4. Listagem, criação e edição são telas separadas para cada recurso, com validação.
5. A recriação dos contêineres mantém os dados no volume MySQL.

## Limites de escopo

Sem permissões por papel, cobrança, multiempresa ou publicação na internet. Os recursos são compartilhados entre contas autenticadas. Não apresentar a persona como cliente real ou pesquisa validada. Se a instituição exigir validação com pessoa real, essa evidência continua externa ao código.
