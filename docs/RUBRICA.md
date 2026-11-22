# Matriz de atendimento - revisão de 21/11/2026

Não confundir implementação com aprovação da banca ou teste real. A rubrica foi recebida como imagens; há uma linha DevOps de 0,50 e duas linhas de evolução de 0,20 sem texto legível. Esses itens precisam do enunciado completo para qualquer declaração de 100%.

| Critério | Implementação / evidência | Situação |
|---|---|---|
| Login, hash, e-mail, JWT | AuthService e authenticate; validação de e-mail/credenciais; bcrypt | Implementado; testes locais |
| Cadastro obrigatório, CPF/senha/duplicidade | Validação cliente + servidor, domínio AccountProfile e índices únicos | Implementado; testes locais |
| Editar somente próprio usuário | /auth/me usa req.userId validado do token | Implementado |
| Não alterar e-mail | Input desabilitado, serviço rejeita valor diferente | Implementado e testado |
| Editar nome/CPF/senha | Nome/CPF obrigatórios; senha nova opcional com validação e confirmação da atual | Implementado e testado |
| Quatro CRUDs autenticados | Department, Employee, Task, Asset; serviço genérico e middleware | Implementado; repositório em memória testado |
| Paginação e inexistência | Inteiros positivos, limite 1..50, 404 em get/update/delete | Implementado e testado |
| Cadastro/edição em telas separadas | Rotas /recurso, /recurso/new e /recurso/:id/edit | Implementado |
| Sessão global/localStorage | AuthContext, refreshUser/finally e interceptor Bearer | Implementado e testado |
| Componentização | ResourceFields, RelationSelect, Layout, CrudPage, ResourceFormPage | Implementado |
| Instruções de agentes | AGENTS.md com diretrizes específicas e proteção de .env | Implementado |
| Encapsulamento e domínio | AccountProfile, ResourceRecord, métodos e getters | Implementado e testado |
| SOLID | Separação de camadas, contrato/injeção em ResourceService, reutilização | Aplicado nos fluxos de recursos e autenticação, com testes por contrato |
| TypeScript também nos testes | backend/tests-ts e tsconfig.tests.json | Implementado; compilação obrigatória em npm test |
| Tratamento de erros | AppError, middleware ORM 400/409, JSON 400, limite 413 | Implementado e testado |
| Compose organizado, proxy, redes/volume | docker-compose.yml e nginx.conf; somente 8081 publicada | Configurado; validação estática |
| Integração e persistência reais | scripts/verify-docker.ps1 e docs/evidence/docker-validation.json | Depende de status passed no relatório |
| Persona e proposta | docs/PROPOSTA.md, persona fictícia e finalidade acadêmica confirmadas pelo autor | Documentado sem inventar cliente/entrevista |
| Integração JS/TS | React -> API Express -> Sequelize/MySQL | Implementado; integração Docker depende de execução |
| Critérios sem texto nas imagens | Necessário enunciado completo | Não verificáveis |

## Comprovação

Execute os comandos do README. Testes unitários e com adaptadores simulados não são prova de persistência nem substituem o script Docker. Um relatório failed é uma pendência, não uma aprovação parcial disfarçada. Caso o Engine esteja inacessível ao agente, execute o mesmo script no terminal com acesso ao Docker.
