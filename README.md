# Droz Control - Projeto_4modulo

Projeto acadêmico e de portfólio do 2º período de ADS. Gestão genérica de departamentos, colaboradores, tarefas e ativos. Não é uma implantação para cliente real nem há alegação de entrevistas ou uso diário.

## Abrir no navegador

Na raiz deste projeto, com Docker Engine em execução:

```powershell
docker compose config --quiet
docker compose up --build -d --wait
```

Abra http://127.0.0.1:8081/register para criar conta ou http://127.0.0.1:8081/login para entrar. Não há usuário padrão. Na primeira configuração de uma nova cópia, copie `.env.example` para `.env` e substitua os placeholders. Não sobrescreva credenciais de um banco já inicializado.

Somente o Nginx publica porta (8081). As portas 3000 e 3306 ficam comentadas. O servidor Embedthis ocupa 8080 neste computador. O frontend usa `/api`; o Nginx encaminha ao backend; o backend usa `mysql` como host de banco. As redes `application` e `database` são internas. O volume `mysql_data` armazena `/var/lib/mysql`.

## Telas e regras

- Cada recurso tem listagem (`/employees`), criação (`/employees/new`) e edição (`/employees/:id/edit`) em telas distintas; o mesmo padrão vale para departments, tasks e assets.
- Vínculos usam dropdown pesquisável; tabelas apresentam nomes de departamento/responsável.
- Cadastro valida CPF, e-mail, campos obrigatórios e força da senha no cliente e servidor.
- Perfil permite nome e CPF; o e-mail é imutável também no backend. Troca de senha opcional exige senha atual e nova senha forte.
- JWT protege os quatro CRUDs e o perfil. Edição usa exclusivamente o ID do token, nunca um ID enviado no corpo.
- Senhas são hashes bcrypt; hash e segredo JWT não são retornados ao cliente.
- Os recursos de gestão são compartilhados entre usuários autenticados. Não há papéis de administrador nesta proposta.

## Estrutura para estudar

Backend: routes -> controllers -> services -> repositories -> MySQL. `AccountProfile` e `ResourceRecord` encapsulam dados e validam mudanças. `ResourceService` recebe a interface `ResourceRepository`; a implementação Sequelize fica separada. Modelos ORM mapeiam persistência; eles não substituem as regras do domínio.

Frontend: configuração dos recursos em `config/resources.ts`, listagem em `CrudPage`, criação/edição em `ResourceFormPage`, campos reutilizáveis em `ResourceFields`, busca de vínculos em `RelationSelect`, sessão global em `AuthContext`.

## Testes

```powershell
npm ci --prefix backend
npm ci --prefix frontend
npm test --prefix backend
npm test --prefix frontend
npm run build --prefix frontend
```

Os testes backend incluem TypeScript compilado por `tsconfig.tests.json`, domínio, CRUDs contra repositório em memória, validações de perfil, erros ORM e HTTP. O frontend também contém testes TypeScript compilados, além dos testes React de sessão, CPF, perfil, rotas e busca de vínculos. Testes em memória não são prova de persistência em MySQL.

## Integração e persistência reais

```powershell
.\scripts\verify-docker.ps1
```

O script reconstrói a stack, testa Nginx, rotas SPA, login/perfil, quatro CRUDs, portas/redes e preservação após `down`/`up`. Cria dados sintéticos e tenta remover somente os dados dessa execução. Interrompe/recria os contêineres, preservando os volumes. Grave suas operações em andamento antes de executar. Resultado sanitizado em `docs/evidence/docker-validation.json`. Somente `status: passed` comprova a execução completa.

`docker compose down -v` apaga dados e não deve ser usado para o teste. `DB_SYNC=true` cria tabelas ausentes sem alterar tabelas existentes; alterações de schema futuras exigem migrações. Mudança de senha no `.env` não altera automaticamente credenciais já persistidas no MySQL.

## Rubrica e apresentação

Consulte `docs/RUBRICA.md`, `docs/PROPOSTA.md` e `docs/ARQUITETURA.md`. A persona é fictícia, conforme a finalidade acadêmica informada pelo autor. Critérios com texto cortado na imagem original e validação Docker sem execução bem-sucedida não podem ser declarados 100% comprovados.

Os PDFs gerados em 15/11/2026 descrevem uma versão anterior. Para as regras e rotas atuais, use este README e docs/RUBRICA.md.


O script é compatível com Windows PowerShell 5.1 e PowerShell 7. Não exige o comando pwsh. Execute na raiz do projeto.
