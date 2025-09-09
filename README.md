# Escale Pokédex

Pokédex full‑stack (Node + React) com foco em **qualidade de tipos**, **simplicidade** e **DX**.  
Back-end em TypeScript **estrito** (Express 5, ESM + `tsx`), integração com **PokeAPI**, validação com **Zod**, persistência **SQLite**.  
Front-end em **Vite + React + TS** com CRUD (listar, criar, editar, deletar).

> ⚙️ Requisitos
>
> - **Node 20.17.0** (ou 22.12+) — use `nvm`/`nvm-windows`
> - npm 10+

---

## Sumário
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuração rápida](#configuração-rápida)
- [Executando em desenvolvimento](#executando-em-desenvolvimento)
- [Build e execução em produção](#build-e-execução-em-produção)
- [API & Swagger](#api--swagger)
- [Testes (backend)](#testes-backend)
- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Dicas e solução de problemas](#dicas-e-solução-de-problemas)
- [Próximos passos / Roadmap](#próximos-passos--roadmap)

---

## Stack

**Backend**
- Node 20.17+, TypeScript (ESM, `module`/`moduleResolution`: `NodeNext`)
- Express 5
- Zod (validação de entrada e parsing de integrações)
- SQLite (**better-sqlite3**) com bootstrap de schema
- Vitest (testes unitários)
- Swagger UI (`/docs`)

**Frontend**
- Vite + React + TypeScript

---

## Estrutura do projeto

```
/backend
  /src
    /domain          # Entidade e tipos (Pokemon), erros de domínio
    /integrations    # Cliente da PokeAPI (com Zod parse)
    /repositories    # Interface (IPokemonRepository) + implementação SQLite
    /services        # Regras de negócio (PokemonService)
    /routes          # Rotas Express
    /docs            # OpenAPI schema e Swagger hook
    /db              # Conexão e bootstrap do schema
    app.ts
    server.ts
  tests/             # Vitest (unitários do service)
  tsconfig.json      # dev/test (noEmit)
  tsconfig.build.json# build (outDir: dist)
  package.json

/frontend
  src/
  index.html
  vite.config.ts
  package.json

README.md (este arquivo)
```

---

## Configuração rápida

1) **Node via nvm (recomendado)**
```bash
nvm install 20.17.0
nvm use 20.17.0
node -v   # v20.17.0
```

2) **Instalar dependências**
```bash
# backend
cd backend
npm i

# frontend
cd ../frontend
npm i
```

3) **Variáveis de ambiente**
- **Frontend**: crie `frontend/.env`:
  ```env
  VITE_API=http://localhost:3000
  ```
- **Backend**: sem necessidade de env no MVP (usa `PORT` opcional).

---

## Executando em desenvolvimento

### Backend
```bash
cd backend
npm run dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/docs
```
O backend usa `ESM + tsx` e faz **bootstrap** do schema SQLite ao subir (cria a tabela `pokemons` se não existir).

### Frontend
```bash
cd frontend
npm run dev
# App: http://localhost:5173
```
O front usa `VITE_API` para falar com o backend.

---

## Build e execução em produção

### Backend
```bash
cd backend
npm run build        # tsc -p tsconfig.build.json -> dist/
npm start            # node dist/server.js
```

### Frontend
```bash
cd frontend
npm run build        # gera dist/
npm run preview      # serve estático para teste local
```

---

## API & Swagger

**Swagger UI:** `http://localhost:3000/docs`  
**Spec JSON:** `http://localhost:3000/docs.json` (se exposto)

**Endpoints principais**
- `GET /pokemons` — lista todos
- `POST /pokemons` — cria
  ```json
  { "name": "pikachu", "types": ["electric"] }
  ```
- `GET /pokemons/:id` — busca por id
- `PATCH /pokemons/:id` — atualização parcial
  ```json
  { "name": "raichu" }
  ```
- `DELETE /pokemons/:id` — remove

**Regras de negócio** (service):
- Enriquecimento via **PokeAPI** (nome canônico, types, abilities, height/weight)
- Validação com **Zod** (incluindo parse de `fetch().json()` que é `unknown`)
- Unicidade por `name` canônico
- Opcionais tratados com **exactOptionalPropertyTypes** (omitir chaves não definidas)

---

## Testes (backend)

### Rodar testes
```bash
cd backend
npm run test          # executa uma vez
npm run test:watch    # modo watch
npm run coverage      # cobertura (abre coverage/index.html)
```

### O que é coberto
- `PokemonService.create`: enrich da PokeAPI, 422 para nome inválido, 409 para duplicidade
- `PokemonService.get`: 404 quando não encontra
- `PokemonService.update`: convergência entre patch do usuário e dados externos
- `PokemonService.delete`: delegação para o repositório

> Testes unitários usam **mocks** de repositório e cliente externo (sem tocar DB/rede).

---

## Decisões de arquitetura

- **TypeScript estrito** (`strict`, `exactOptionalPropertyTypes`)  
  Evita “undefined fantasma”. Padrão: *narrowing* e spreads condicionais para **omitir** chaves não definidas.

- **Validação nas bordas (Boundary)**  
  Input HTTP e resposta da PokeAPI são validados com **Zod** em runtime → tipos confiáveis no domínio.

- **Camadas claras**  
  Domain ↔ Service ↔ Repository ↔ Integration ↔ HTTP. Fácil de testar/substituir dependências.

- **ESM + `tsx`**  
  DX simples para dev; `tsconfig` separado para build (emite para `dist/`) e dev/test (`noEmit`).

- **CORS / Preflight**  
  Configurado para `http://localhost:5173` e métodos necessários; sem `app.options('*')` (Express 5).

- **SQLite (MVP)**  
  Bootstrap de schema no start. Em produção: **Drizzle migrations** e Postgres.

---

## Dicas e solução de problemas

- **Vite exige Node 20.17+**  
  Se o front falhar com `crypto.hash is not a function`, atualize seu Node.

- **better-sqlite3 “NODE_MODULE_VERSION”**  
  Se você trocou a versão do Node e deu ABI mismatch, rode:
  ```bash
  cd backend
  rmdir /s /q node_modules
  del package-lock.json
  npm i
  # se necessário: npm rebuild better-sqlite3
  ```

- **CORS / “Failed to fetch”**  
  Garanta que o backend está com `cors()` habilitado e o `VITE_API` aponta para `http://localhost:3000` (sem https).

- **Express 5 + path-to-regexp**  
  Evite `app.options('*')`. Use `cors()` global ou `app.options('/pokemons', cors())` específico.

- **Arquivos .js/.d.ts dentro de src**  
  Use `tsconfig.json` (dev) com `"noEmit": true` e `tsconfig.build.json` para emitir em `dist/`.  
  Comando de limpeza (Windows OK):
  ```bash
  npm run clean
  # rimraf dist && rimraf --glob src/**/*.js src/**/*.d.ts src/**/*.js.map src/**/*.d.ts.map
  ```

---

## Próximos passos / Roadmap

- **Migrations Drizzle** (esquema versionado) e Postgres
- **Paginação e filtros** em `GET /pokemons` (ex.: `?type=electric&page=1&pageSize=10`)
- **Cache** da PokeAPI com TTL (in-memory/Redis)
- **Logger estruturado** + `request-id` e métricas básicas
- **zod-to-openapi** para gerar a spec a partir dos schemas
- **CI** simples (lint + test + coverage) e Dockerfile multi-stage

---

## Scripts úteis

### Backend
```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc -p tsconfig.build.json",
  "start": "node dist/server.js",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage",
  "clean": "rimraf dist && rimraf --glob src/**/*.js src/**/*.d.ts src/**/*.js.map src/**/*.d.ts.map"
}
```

### Frontend
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---