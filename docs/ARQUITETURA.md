# Arquitetura, POO e SOLID

Navegador -> Nginx:8081 -> backend:3000 -> mysql:3306 -> volume mysql_data.

## Orientação a objetos

`AccountProfile` mantém nome/CPF em propriedades privadas e o e-mail privado somente leitura, com getters públicos. `rename` e `changeCpf` são as vias de alteração e preservam invariantes. `ResourceRecord` valida o estado completo dos quatro recursos por esquema, rejeita atributos não permitidos e devolve uma cópia congelada. Modelos Sequelize representam a camada de persistência, com tipos, restrições, relacionamentos e herança de Model. `AppError` especializa Error.

## Responsabilidades e SOLID

- SRP: controller traduz HTTP; serviço executa caso de uso; domínio valida; repositório persiste; middleware traduz falhas.
- OCP: cadastro de novos recursos usa configuração de esquema/campos sem duplicar toda a infraestrutura de CRUD.
- LSP: `ResourceService` opera pelo contrato `ResourceRepository`; o repositório em memória usado nos testes e o Sequelize implementam as mesmas operações e resultados.
- ISP: interface pequena com list/find/create/update/remove, focada no caso de uso genérico.
- DIP: `ResourceService` recebe o contrato por construtor; controller monta a implementação Sequelize. `AuthService` também recebe `AccountRepository`; o controller monta `SequelizeAccountRepository`. Os testes usam implementações em memória dos dois contratos.

Encapsulamento TypeScript é proteção de desenvolvimento; não substitui validação runtime ou autenticação. O fluxo aplica as três. Tipos isolados não validam JSON.

## Relacionamentos

Department 1:N Employee; Employee 1:N Task; Department 1:N Asset. As listas usam associações department e assignee para exibir nomes, sem obrigar o usuário a conhecer IDs. Vínculos opcionais vazios viram null.

## Segurança e limites

JWT identifica /me; payloads de recursos não podem injetar id/passwordHash. E-mail de conta não muda. Atualizar senha exige a senha atual e hash bcrypt novo. Unicidade no banco protege corridas além das verificações de serviço. CORS não substitui JWT. Tokens em localStorage atendem ao enunciado, mas requerem atenção a XSS; logout é local, sem revogação no servidor.
