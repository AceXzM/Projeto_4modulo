# Instruções para agentes - Droz Control

1. Preserve o caráter acadêmico de 2º período de ADS: TypeScript legível, CSS simples, nomes claros e sem novas bibliotecas sem necessidade concreta.
2. Não abra, imprima, copie, altere ou versione `.env`, senhas, tokens ou arquivos de credenciais. Use `.env.example` como referência; deixe a injeção dos valores reais ao Docker Compose. Nunca registre configuração interpolada ou respostas de login nos relatórios.
3. Mantenha as publicações de porta 3000 e 3306 comentadas. Somente o Nginx pode publicar a porta 8081; preserve as redes internas e o volume MySQL.
4. Nunca execute `docker compose down -v` ou apague volumes. O script de integração pode recriar contêineres preservando volumes e remover somente os dados sintéticos que ele próprio cadastrou.
5. E-mail de conta é imutável; perfil usa o ID do JWT. Toda alteração de nome, CPF ou senha deve passar pelos métodos de domínio e serviços, com confirmação da senha atual para trocas de senha.
6. Novos campos de recursos exigem esquema explícito, validação runtime, campo de interface e teste. Não passe `req.body` diretamente ao ORM e não aceite IDs/atributos internos arbitrários.
7. Listagem, criação e edição de cada CRUD devem continuar em rotas separadas; mantenha seletores pesquisáveis de vínculos, estados de erro e layout responsivo.
8. Ao alterar comportamento, execute `npm test --prefix backend`, `npm test --prefix frontend` e `npm run build --prefix frontend`. Ao alterar Docker, valide `docker compose config --quiet` e execute o script de integração quando o Engine estiver acessível.
9. Não declare testes Docker aprovados sem relatório `status: passed`; não invente entrevistas ou cliente real. A persona é fictícia, para apresentação e portfólio, conforme informado pelo autor.
