# 1. Entrega final del proyecto — Infradeck

Documento de entrega final del proyecto **Infradeck**, un juego de cartas coleccionables (TCG) 1v1 digital full-stack.

---

## 1.1. Checklist de entregables

| Entregable | Estado | Ubicación |
|------------|--------|-----------|
| Repositorio GitHub final actualizado | ✅ | Repositorio del proyecto (rama principal) |
| Código funcional y organizado | ✅ | Monorepo `packages/shared`, `packages/server`, `web/` |
| README final revisado | ✅ | [README.md](../../README.md) |
| Recursos necesarios para ejecutar | ✅ | Ver sección 1.4 (instalación y ejecución) |
| Memoria final en PDF | ✅ | [02-memoria-final.md](02-memoria-final.md) (exportar a PDF) |
| Presentación | ✅ | [03-presentacion.md](03-presentacion.md) |
| Vídeo-presentación (máx. 10 min) | ✅ | [04-video-presentacion.md](04-video-presentacion.md) (guion) |

---

## 1.2. Descripción breve

Infradeck es un TCG 1v1 con **3 clases asimétricas** (Abominación, Caos, Vitalidad), un **motor de juego propio** con sistema de pila (stack), prioridad y efectos declarativos, **partidas contra IA local** y **multijugador online en tiempo real** mediante Socket.IO. Incluye sistema de usuarios (registro/login con email y Google), persistencia con Prisma/SQLite y colección/mazos por usuario.

---

## 1.3. Estructura del repositorio

```
Infradeck/
├── packages/
│   ├── shared/        # Motor de juego, tipos y cartas. Import: @infradeck/shared
│   └── server/        # Express + Socket.IO + Prisma (SQLite)
├── web/               # Frontend principal: React + Vite + Tailwind
├── apps/web/          # Frontend legacy (NO usar, preferir web/)
├── docs/              # Documentación (diseño, desarrollo, testing, entrega)
└── README.md          # Memoria/documentación principal
```

Monorepo manual (sin workspace manager). Los paquetes se enlazan con `file:` y path aliases:
- `packages/server` consume `@infradeck/shared` vía `file:../shared` (dynamic imports).
- `web/` resuelve `@infradeck/shared` vía path alias de TypeScript y alias de Vite a `../packages/shared/src/index.ts`.
- `packages/shared` no tiene dependencias runtime (TypeScript puro).

---

## 1.4. Recursos necesarios y ejecución

### Requisitos previos

- **Node.js 20+** y **npm**
- **Git**

### Variables de entorno

`packages/server/.env`:

```
JWT_SECRET=tu_secreto
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com   # opcional (login con Google)
PORT=3001                                                     # opcional
```

`web/.env`:

```
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com   # opcional
```

> El login con email/contraseña funciona sin las variables de Google. Si no se define `VITE_GOOGLE_CLIENT_ID`, el botón de Google simplemente no se muestra.

### Instalación

```bash
# 1) Motor de juego compartido
cd packages/shared && npm install

# 2) Backend (genera el cliente Prisma en postinstall)
cd ../server && npm install
npx prisma migrate dev      # crea/actualiza la base de datos SQLite (dev.db)
npx prisma generate         # genera el cliente (también se ejecuta en postinstall)

# 3) Frontend
cd ../../web && npm install
```

### Ejecución (desarrollo)

```bash
# Terminal 1 — Backend (Express + Socket.IO en puerto 3001)
cd packages/server && npm run dev

# Terminal 2 — Frontend (Vite en puerto 5173)
cd web && npm run dev
```

Abrir `http://localhost:5173`.

### Tests

```bash
# Motor de juego (Vitest)
cd packages/shared && npm test

# Backend (Node test runner vía tsx)
cd packages/server && npm test
```

---

## 1.5. Evolución respecto a entregas anteriores

El proyecto ha avanzado por fases claras (ver [docs/development/roadmap.md](../development/roadmap.md)):

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Motor de juego y 70+ cartas con tests | ✅ Completada |
| Fase 2 | UI de partida (tablero, mano, combate, targeting, discover, scry, bot local) | ✅ Completada |
| Fase 3 | Deckbuilder y colección | 🔄 Parcial (modelo de datos y pantallas base) |
| Fase 4 | Sistema de usuarios (registro/login JWT + Google, Prisma/SQLite) | ✅ Completada |
| Fase 5 | Multijugador online (Socket.IO, matchmaking, partidas en tiempo real) | ✅ Completada |
| Fase 6 | Pulido visual, animaciones y responsive | 🔄 En progreso |

**Hitos principales desde las primeras entregas:**
1. De un motor de juego sin interfaz a un **juego jugable completo** (local + online).
2. Incorporación del **backend** (Express + Socket.IO) y **base de datos** (Prisma/SQLite).
3. **Sistema de usuarios** con autenticación JWT y Google OAuth.
4. **Multijugador online** funcional con matchmaking y sincronización de estado server-authoritative.
