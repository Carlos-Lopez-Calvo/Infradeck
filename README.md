# Infradeck

TCG digital 1v1 por turnos con clases asimétricas, deckbuilding y partidas online en tiempo real. Stack: TypeScript en todo el monorepo (motor de juego compartido, backend Express + Socket.IO + Prisma, frontend React + Vite + Tailwind).

> [!WARNING]
> **Todas las imágenes del proyecto (artwork de cartas, retratos de clase, fondos y texturas en `web/public/imgCards/`) son placeholders sacados directamente de internet.** No son arte propio ni cuentan con licencia para uso comercial; están únicamente como marcador temporal para el desarrollo y la demo académica. Deben sustituirse por arte original o con licencia antes de cualquier publicación.

---

## Puesta en marcha y despliegue

### Requisitos

- **Node.js >= 20** y **npm**
- Una base de datos **PostgreSQL** (en producción se usa [Neon](https://neon.tech); en local vale cualquier Postgres)
- (Opcional) Un **Google OAuth Client ID** si quieres habilitar el login con Google

### Estructura del monorepo

Monorepo manual (sin workspaces) con tres paquetes enlazados por `file:` y path aliases. Detalle completo en la [sección 3.1](#31-estructura-del-proyecto).

```
packages/shared/  → Motor de juego, tipos y cartas (@infradeck/shared). TypeScript puro, sin runtime.
packages/server/  → Backend Express + Socket.IO + Prisma (PostgreSQL).
web/              → Frontend React + Vite + Tailwind (cliente principal).
```

### Variables de entorno

**Backend** (`packages/server/.env`):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL (`postgresql://...`). |
| `JWT_SECRET` | Sí (prod) | Secreto para firmar los JWT. En dev usa un valor por defecto inseguro. |
| `CORS_ORIGIN` | Sí (prod) | Origen(es) permitido(s) del frontend, separados por coma. |
| `GOOGLE_CLIENT_ID` | No | Client ID de Google OAuth. Sin él, el login con Google queda deshabilitado. |
| `FRONTEND_URL` | No | URL del frontend (fallback de CORS / redirecciones). |
| `PORT` | No | Puerto del servidor (por defecto `3001`). |
| `HOST` | No | Host de escucha (por defecto `0.0.0.0`). |

**Frontend** (`web/.env`):

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_API_URL` | No | URL base de la API REST. Si se omite, usa `http(s)://<host>:3001`. |
| `VITE_WS_URL` | No | URL del WebSocket. Si se omite, deriva del host actual. |
| `VITE_GOOGLE_CLIENT_ID` | No | Client ID de Google OAuth para el botón de login. |

### Desarrollo local

```bash
# 1. Motor compartido (debe compilarse antes que el server)
cd packages/shared && npm install && npm run build

# 2. Backend (Express + Socket.IO + Prisma)
cd ../server && npm install
#    Crea packages/server/.env con al menos DATABASE_URL
npx prisma migrate dev      # aplica migraciones y genera el cliente
npm run dev                 # arranca en http://localhost:3001 (tsx watch)

# 3. Frontend (Vite)
cd ../../web && npm install
npm run dev                 # arranca en http://localhost:5173
```

Con eso, el frontend en `http://localhost:5173` apunta por defecto al backend en `http://localhost:3001`.

### Base de datos (Prisma)

El esquema está en `packages/server/prisma/schema.prisma` (provider `postgresql`).

```bash
cd packages/server
npx prisma migrate dev       # desarrollo: crea/aplica migraciones
npx prisma migrate deploy    # producción: aplica migraciones existentes
npx prisma studio            # inspeccionar datos (opcional)
```

### Despliegue en producción

El proyecto se despliega en tres servicios:

```mermaid
flowchart LR
    Browser["Navegador"] -->|HTTPS / SPA| Vercel["Frontend (Vercel)"]
    Browser -->|REST + WebSocket| Render["Backend (Render)"]
    Render -->|Prisma| Neon["PostgreSQL (Neon)"]
```

**Backend → Render** (configurado en [`render.yaml`](render.yaml)):
- `rootDir: packages/server`, `buildCommand: npm install`, `startCommand: npm run start:prod`.
- `start:prod` ejecuta `prisma migrate deploy` y arranca el servidor.
- Configura en el panel de Render: `DATABASE_URL`, `JWT_SECRET` (autogenerado), `CORS_ORIGIN` (la URL de Vercel) y `GOOGLE_CLIENT_ID`.
- Healthcheck en `/health`.

**Frontend → Vercel** (config SPA en [`web/vercel.json`](web/vercel.json)):
- Root del proyecto: `web/`. Build: `npm run build` (Vite). Output: `dist/`.
- Variables `VITE_API_URL` y `VITE_WS_URL` apuntando a la URL pública del backend en Render, y `VITE_GOOGLE_CLIENT_ID` si se usa Google.

**Base de datos → Neon**: crea un proyecto PostgreSQL y usa su connection string como `DATABASE_URL` en Render.

### Tests

```bash
cd packages/shared && npm test     # Vitest (motor de juego, cartas)
cd packages/server && npm test     # Node test runner vía tsx
```

---

## **1. INTRODUCCIÓN**

### **1.1. Contexto y justificación del Trabajo**
**Contenido a incluir:**
- **Popularidad de los TCG digitales**: Hearthstone (100M+ jugadores), Magic Arena, Legends of Runeterra
- **Nicho identificado**: Falta de TCG 1v1 con mecánicas profundas y clases asimétricas
- **Oportunidad educativa**: Aplicar conocimientos de desarrollo full-stack, arquitectura de software y teoría de juegos
- **Justificación técnica**: Demostrar capacidad de crear sistemas complejos (motor de juego, UI reactiva, backend con real-time)

### **1.2. Objetivos del Trabajo**
1. ✅ **Diseñar un sistema de juego completo** con 3 clases únicas (Abominación, Caos, Vitalidad)
2. ✅ **Implementar motor de juego robusto** con prioridad, triggers y mecánicas avanzadas
3. ✅ **Desarrollar UI web completa** con selección de objetivos, targeting modal, discover, scry y feedback visual
4. 🔄 **Crear sistema de colección** con recompensas y progresión (modelo de datos implementado, UI pendiente)
5. ✅ **Implementar sistema de usuarios** con login/registro, JWT, persistencia con Prisma/SQLite
6. ✅ **Desarrollar multijugador online** con matchmaking, Socket.IO y sincronización en tiempo real
7. ✅ **Documentar completamente** el diseño, desarrollo y testing

### **1.3. Impacto en sostenibilidad, ético-social y de diversidad**
**Contenido sugerido:**

**Sostenibilidad:**
- Aplicación web 100% digital (sin producción física de cartas)
- Arquitectura eficiente con optimización de recursos del servidor
- Código reutilizable y escalable (monorepo con shared package)

**Ético-Social:**
- Sistema de recompensas sin "pay-to-win" (todas las cartas accesibles)
- Transparencia en probabilidades de sobres
- Sistema anti-adicción (límites de tiempo, recordatorios)
- Comunidad inclusiva con código de conducta

**Diversidad:**
- Accesibilidad: soporte para lectores de pantalla
- Internacionalización (i18n) preparada desde el inicio
- UI con consideraciones para daltonismo

### **1.4. Enfoque y método seguido. Decisiones tomadas**
**Metodología Ágil:**
- Desarrollo iterativo en fases
- Testing continuo (106 tests desde fase 1)
- Documentación paralela al desarrollo

**Decisiones arquitectónicas clave:**
1. **Monorepo manual** con paquetes enlazados via `file:` y path aliases → compartir lógica entre frontend/backend
2. **TypeScript full-stack** → type safety crítica para lógica compleja
3. **Efectos declarativos con dispatcher** → cartas definidas como datos, ejecutadas por handlers registrados
4. **Espécimen con costo escalable** → balance y anti-spam

**Stack tecnológico:**
- Frontend: React 18/19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 3.4
- Backend: Node.js + Express 4 + Socket.IO 4 + TypeScript
- Base de datos: SQLite + Prisma ORM
- Testing: Vitest (shared), Node test runner via tsx (server)
- Real-time: Socket.IO 4 (matchmaking + partidas online)
- Auth: JWT + bcryptjs
- Game Engine: Shared package `@infradeck/shared`

### **1.5. Planificación del Trabajo**

#### **1.5.1. Recursos necesarios**
**Hardware:**
- MacBook/PC con 8GB RAM mínimo
- Servidor de desarrollo (local o cloud)

**Software:**
- Node.js 18+, npm, Git
- Cursor (basado en VSCode) con extensiones TypeScript
- Figma para diseño UI/UX

**Recursos externos:**
- Hosting: Vercel (frontend) + Render (backend) + Neon (PostgreSQL)
- CDN: Cloudinary para imágenes de cartas
- Analytics: Plausible o similar

#### **1.5.2. Hitos y planificación temporal**
**Basado en tu roadmap.md:**

| Fase | Duración | Estado | Entregables |
|------|----------|--------|-------------|
| **Fase 1: Motor y Cartas** | 4 semanas | ✅ Completada | Engine funcional, 70+ cartas, tests |
| **Fase 2: UI Completa** | 3 semanas | ✅ Completada | Juego jugable, bot local, combate, targeting, discover, scry |
| **Fase 3: Deckbuilder** | 2 semanas | ⏳ Pendiente | Construcción de mazos UI (modelo de datos existe) |
| **Fase 4: Sistema de Usuario** | 3 semanas | ✅ Completada | Login/registro JWT, Prisma/SQLite, perfiles, monedas |
| **Fase 5: Multijugador** | 4 semanas | ✅ Completada | Socket.IO, matchmaking, partidas online |
| **Fase 6: Pulido Final** | 2 semanas | 🔄 En progreso | Animaciones, feedback, responsive |
| **Documentación TFG** | 2 semanas | 🔄 En progreso | Memoria completa |

#### **1.5.3. Diagrama de Gantt**

#### **1.5.4. Gestión de riesgos y desviaciones**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad del stack system | Media | Alto | ✅ Resuelto con 14 tests engine |
| Balance de cartas difícil | Alta | Medio | Paper testing + iteración |
| WebSockets complejos | Media | Alto | Usar Socket.io, documentación |
| Overscope del proyecto | Alta | Alto | MVP primero, features opcionales después |
| Bugs en producción | Media | Medio | Testing exhaustivo, CI/CD |

### **1.6. Breve sumario de los productos obtenidos**
**Productos implementados:**
1. ✅ **Motor de juego completo** (combate, turnos, efectos por clase, Final Stand, espécimen)
2. ✅ **70+ cartas balanceadas** (3 clases + básicas, con tests)
3. ✅ **UI web completa** (tablero, mano, targeting modal, discover, scry, bot local)
4. ✅ **Backend con API REST** (Express, auth JWT, CRUD de mazos, colección, recompensas)
5. ✅ **Base de datos** (Prisma + SQLite: usuarios, perfiles, monedas, colección, mazos)
6. ✅ **Multijugador online** (Socket.IO, matchmaking FIFO, partidas en tiempo real)
7. ✅ **Sistema de usuarios** (registro, login, JWT, perfiles con nivel/XP)
8. ✅ **Documentación de diseño** (archivos de diseño y reglas completas)

**Productos pendientes:**
9. ⏳ Deckbuilder UI (modelo de datos existe, falta interfaz visual)
10. ⏳ UI de colección y sobres
11. 🔄 Pulido visual y animaciones finales

### **1.7. Breve descripción de los otros capítulos de la memoria**

- **Capítulo 2 (Materiales y Métodos)**: Análisis de mercado, arquitectura técnica, diseño UX/UI y prototipaje
- **Capítulo 3 (Desarrollo)**: Implementación detallada del frontend, backend, base de datos y testing
- **Capítulo 4 (Resultados)**: Métricas de rendimiento, testing de usabilidad, balance de cartas
- **Capítulo 5 (Conclusiones)**: Objetivos cumplidos, lecciones aprendidas, trabajo futuro

---

## **2. MATERIALES Y MÉTODOS**

### **2.1. Investigación de Mercado**

#### **2.2.1. Análisis de alternativas**

**Competidores analizados (Juegos TCG):**

| Juego | Fortalezas | Debilidades | Diferenciación Infradeck |
|-------|------------|-------------|--------------------------|
| **Hearthstone** | UI pulida, fácil de aprender | Sin stack, poca profundidad | Stack real, más counterplay |
| **Magic Arena** | Stack completo, profundo | Complejo para nuevos, UI densa | Simplificado pero estratégico |
| **Legends of Runeterra** | F2P generoso, innovador | Requiere aprender LoL | Standalone, mecánicas únicas |
| **Gwent** | Estrategia única | Nicho pequeño | Más tradicional pero innovador |

**Conclusión:** Espacio para TCG con profundidad táctica (stack) pero más accesible que Magic.

**Tecnologías de comunicación real-time evaluadas:**

| Tecnología | Ventajas | Desventajas | Decisión |
|------------|----------|-------------|----------|
| **Socket.io** | Abstracción fácil, rooms, fallback automático, reconnection | Algo más pesado que WS nativo | ✅ **Elegido** |
| WebSockets nativos | Ligero, estándar W3C | Sin fallback, sin rooms built-in, más código boilerplate | ❌ Rechazado |
| Server-Sent Events | Unidireccional simple | Solo server→client, no full-duplex | ❌ No adecuado |
| Long Polling | Funciona en todo lado | Latencia alta, ineficiente | ❌ Solo como fallback |
| Firebase Realtime DB | Setup rápido, escalable | Vendor lock-in, costos, menos control | ❌ Rechazado |

**Decisión final:** Socket.io por balance entre facilidad de desarrollo, features (rooms, reconnection) y rendimiento.

#### **2.2.2. Análisis DAFO**

**Fortalezas:**
- Sistema de clases único (Espécimen, Entropía, Ciclo, Vida)
- Stack simplificado pero funcional
- Motor de juego robusto y testeado
- Documentación completa desde inicio

**Debilidades:**
- Sin marca reconocida
- Pool de cartas limitado (70 iniciales)
- Equipo de 1 desarrollador
- Sin presupuesto marketing

**Oportunidades:**
- Mercado TCG en crecimiento
- Comunidad indie TCG activa
- Plataformas de distribución (Steam, web)
- Monetización ética

**Amenazas:**
- Competencia de AAA studios
- Retención de jugadores difícil
- Balance continuo necesario
- Costos de servidor

#### **2.2.3. Redacción de la propuesta**
**Propuesta de valor:**

> "Infradeck es un TCG 1v1 digital que combina la profundidad estratégica del stack de Magic con la accesibilidad de Hearthstone, presentando clases únicas con mecánicas asimétricas: construir el Espécimen Perfecto, controlar el caos con Entropía, o sacrificar vida por poder."

**Público objetivo:**
- Jugadores de TCG con experiencia (18-35 años)
- Buscan profundidad táctica
- Valoran sistemas únicos
- Dispuestos a aprender curva moderada

### **2.2. Usuarios, análisis de uso y casos de uso**

#### **2.2.1. Descripción de los usuarios**
**Persona 1: "Alex, el Competitivo"**
- 24 años, jugador de Magic Arena
- Busca skill ceiling alto
- Juega 10+ horas/semana
- Dispuesto a pagar por cosméticos

**Persona 2: "María, la Casual"**
- 28 años, juega Hearthstone ocasionalmente
- Prefiere sesiones de 30-60 min
- Le gustan sistemas únicos
- F2P, no paga

**Persona 3: "Jorge, el Coleccionista"**
- 32 años, fan de TCG en general
- Disfruta construir mazos
- Valora completar colecciones
- Pagaría por sobres

#### **2.2.2. Contexto de uso**
**Escenarios:**
1. Partida rápida en descanso del trabajo (15 min)
2. Sesión larga experimentando mazos (2 horas)
3. Torneo competitivo online (3-4 horas)
4. Construcción de mazos sin jugar (30 min)

**Dispositivos:**
- Desktop/Laptop (primario)
- Tablet (secundario, futuro)
- Mobile (no prioridad inicial)

#### **2.2.3. Casos de uso**

**CU-01: Jugar partida contra IA**
- Actor: Jugador registrado
- Precondición: Tiene al menos 1 mazo válido
- Flujo: Seleccionar mazo → Mulligan → Jugar turnos → Victoria/Derrota
- Postcondición: Actualizar estadísticas

**CU-02: Construir mazo**
- Actor: Jugador registrado
- Precondición: Tiene cartas en colección
- Flujo: Elegir clase → Añadir 30 cartas → Validar → Guardar
- Postcondición: Mazo disponible para jugar

**CU-03: Abrir sobre de cartas**
- Actor: Jugador registrado
- Precondición: Tiene monedas/gemas suficientes
- Flujo: Comprar sobre → Animación apertura → Recibir 5 cartas → Actualizar colección
- Postcondición: Cartas añadidas a colección

**CU-04: Jugar partida PvP**
- Actor: 2 jugadores registrados
- Precondición: Ambos con mazos válidos, conectados
- Flujo: Matchmaking → Mulligan → Turnos alternados con prioridad → Victoria/Derrota
- Postcondición: Actualizar ranking, estadísticas

### **2.3. Arquitectura de la aplicación**

#### **2.3.1. Arquitectura global**
```
┌─────────────────────────────────────────┐
│        Cliente Web (React + Vite)       │
│  ┌────────────┐      ┌───────────────┐  │
│  │ Components │◄────►│ Game Engine   │  │
│  │  (UI/UX)   │      │   (Shared)    │  │
│  └────────────┘      └───────────────┘  │
└──────────────┬──────────────────────────┘
               │ REST API + Socket.IO
┌──────────────▼──────────────────────────┐
│    Servidor (Express + Socket.IO)       │
│  ┌────────────┐      ┌───────────────┐  │
│  │ REST API + │◄────►│  Game Engine  │  │
│  │ WS Handlers│      │   (Shared)    │  │
│  └────────────┘      └───────────────┘  │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│         Base de Datos (SQLite)          │
│  Users | Profiles | Currency | Decks    │
└─────────────────────────────────────────┘
```

#### **2.3.2. Diagramación UML**

**Diagrama de Clases (simplificado):**
```typescript
interface GameState {
  players: PlayerState[]
  turn: TurnState
  stack: StackItem[]
}

interface PlayerState {
  id: string
  life: number
  mana: number
  deck: Card[]
  hand: Card[]
  board: Creature[]
  classResource: Resource
}

interface Card {
  id: string
  name: string
  cost: number
  type: CardType
  effects: Effect[]
}
```

**Diagrama de Secuencia (Jugar carta con stack):**
```
Jugador → UI: Click en carta
UI → Engine: playCard(state, cardId, targets)
Engine → Stack: Añadir item a pila
Engine → UI: Estado actualizado
UI → Jugador: Mostrar carta en stack
...
Oponente → UI: Pasar prioridad
Engine → Stack: Resolver top item
Engine → UI: Estado actualizado
UI → Jugadores: Mostrar efecto resuelto
```

#### **2.3.3. Tecnologías utilizadas**

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| Frontend | React | 18/19 | Ecosistema maduro, componentes reutilizables |
| Build Tool | Vite | 7.x | Build ultra-rápido, HMR excelente |
| Styling | Tailwind CSS | 3.4 | Utility-first, diseño rápido |
| Animaciones | Framer Motion | 12.x | Animaciones declarativas React |
| State | React Context | - | Estado local y de juego via Context API |
| Types | TypeScript | 5.9 | Type safety crítica |
| Testing | Vitest + Node test runner | 1.x | Vitest para shared, tsx --test para server |
| Backend | Node.js + Express | 20.x / 4.x | JavaScript isomórfico |
| DB | SQLite | - | Ligero, sin infraestructura, Prisma ORM |
| ORM | Prisma | 5.x | Type-safe, migrations fáciles |
| Real-time | Socket.io | 4.x | WebSockets con rooms, reconnection |
| Auth | JWT + bcryptjs | - | Tokens stateless, hashing seguro |

#### **2.3.4. Arquitectura Cliente**
```
web/
├── src/
│   ├── components/      # Componentes UI (flat)
│   │   ├── Card.tsx
│   │   ├── GameBoard.tsx
│   │   ├── OnlineGameBoard.tsx
│   │   ├── Hand.tsx
│   │   ├── Mazo.tsx
│   │   ├── ContenidoIzquierda.tsx   # Hero life orbs
│   │   ├── ContenidoDerecha.tsx     # Mana, deck, class resource
│   │   ├── UnifiedTargetModal.tsx   # Targeting UI
│   │   ├── DiscoverModal.tsx        # Online discover
│   │   ├── ScryModal.tsx            # Online scry
│   │   ├── Landing.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── OnlineMatchmaking.tsx
│   ├── context/
│   │   ├── GameEngineProvider.tsx    # Estado partida local + bot
│   │   ├── AuthContext.tsx           # Login/registro/token
│   │   └── OnlineGameProvider.tsx   # Socket.IO + estado online
│   ├── services/
│   │   └── websocket.ts             # WebSocketService singleton
│   ├── utils/
│   │   └── sample-decks.ts          # Mazos de prueba
│   └── main.tsx
├── public/
└── vite.config.ts
```

**Patrones:**
- `GameBoard` compartido entre local y online (OnlineGameBoard lo envuelve con mock de Context)
- Lógica pesada (targeting, discover, scry, bot) en `GameEngineProvider`, no en componentes
- Navegación manual via `useState<Route>` (sin React Router)
- 3 Contexts: Auth, GameEngine (local), OnlineGame

#### **2.3.5. Arquitectura Servidor** (Implementado)
```
packages/server/
├── src/
│   ├── index.ts              # Express + Socket.IO + rutas HTTP + handlers WS
│   ├── db.ts                 # Singleton PrismaClient
│   ├── game-engine.ts        # Bridge dinámico al engine de shared
│   ├── gameRoom.ts           # GameRoomManager (partidas en memoria)
│   ├── matchmaking.ts        # Cola FIFO de matchmaking
│   ├── card-resolver.ts      # Lookup de cartas desde shared
│   ├── target-detector.ts    # Detección de targets pre-engine
│   ├── game-handlers.ts      # Hooks discover/scry para server
│   ├── auth-economy-utils.ts # Utilidades auth + economía
│   ├── types.ts              # Tipos Socket.IO events
│   └── auth-economy-utils.test.ts
├── prisma/
│   ├── schema.prisma         # User, UserProfile, UserCurrency, UserCard, Deck, DeckCard
│   ├── dev.db                # SQLite database
│   └── migrations/           # Historial de migrations
└── package.json
```

#### **2.3.6. Diseño de arquitectura Front-End**

**Flujo de datos:**
```
User Action → Component → Hook → Context (GameEngine) 
             ↓
Context actualiza state → Re-render componentes afectados
             ↓
UI refleja nuevo estado
```

**Optimizaciones:**
- Memoización con `useMemo`, `useCallback`
- Lazy loading de componentes pesados
- Virtual scrolling en colección de cartas
- Debounce en búsquedas

#### **2.3.7. Diseño de arquitectura Back-End** (Implementado)

**Estructura actual (monolítica en `index.ts`):**
1. **Rutas HTTP**: Auth (register/login), CRUD mazos, colección, recompensas
2. **Middleware**: `requireAuth` (JWT Bearer), CORS, express.json
3. **Socket.IO handlers**: matchmaking (join/leave), game actions (playCard, attack, endTurn, discover, scry)
4. **GameRoomManager**: Partidas en memoria con engine de shared
5. **Prisma**: Acceso a SQLite (User, Profile, Currency, Cards, Decks)

**Principios:**
- Server como fuente de verdad para partidas online
- Engine de shared ejecuta lógica, server valida y emite estado
- Dynamic imports para el shared package (ESM compatibility)
- Partidas in-memory (se pierden al reiniciar servidor)

#### **2.3.8. Arquitectura Bases de datos** (Implementado)

**Prisma + SQLite** (`packages/server/prisma/schema.prisma`):

```prisma
model User {
  id           String        @id @default(cuid())
  username     String        @unique
  email        String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  profile      UserProfile?
  currency     UserCurrency?
  cards        UserCard[]
  decks        Deck[]
}

model UserProfile {
  id        String @id @default(cuid())
  userId    String @unique
  nickname  String?
  avatarUrl String?
  level     Int    @default(1)
  xp        Int    @default(0)
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserCurrency {
  id     String @id @default(cuid())
  userId String @unique
  gold   Int    @default(0)
  gems   Int    @default(0)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserCard {
  id        String @id @default(cuid())
  userId    String
  cardId    String
  owned     Int    @default(0)
  foilOwned Int    @default(0)
  user      User   @relation(fields: [userId], references: [id])
  @@unique([userId, cardId])
}

model Deck {
  id        String     @id @default(cuid())
  name      String
  classType String
  ownerId   String
  owner     User       @relation(fields: [ownerId], references: [id])
  cards     DeckCard[]
}

model DeckCard {
  id     String @id @default(cuid())
  deckId String
  cardId String
  count  Int
  deck   Deck   @relation(fields: [deckId], references: [id])
}
```

**Relaciones:**
- User 1:1 UserProfile (cascade delete)
- User 1:1 UserCurrency (cascade delete)
- User 1:N UserCard (colección)
- User 1:N Deck
- Deck 1:N DeckCard

#### **2.3.9. Flujo de datos y comunicación**

**Partida contra IA (actual):**
```
1. Usuario selecciona mazo → Frontend
2. Inicializar GameState → GameEngine (local)
3. Jugar turno → Actualizar state
4. Bot juega → Actualizar state
5. Loop hasta victoria → Mostrar resultado
```

**Partida PvP online (Fase 5 - WebSockets):**

```
1. MATCHMAKING
   Usuario → API REST: POST /matchmaking { deckId }
   Server → Usuario: { queuePosition }
   
2. MATCH FOUND
   Server → Ambos usuarios (WebSocket): matchFound { matchId, opponentId }
   Usuarios → Server (WebSocket): acknowledge
   
3. INICIALIZACIÓN
   Server: Crea GameState inicial con shared/engine
   Server → Ambos (WS): gameStarted { initialState, yourPlayerIndex }
   
4. MULLIGAN
   Server → Ambos (WS): mulliganPhase { hand, timeLimit: 30s }
   Usuarios → Server (WS): mulligan { cardsToReplace: [] }
   Server: Valida y ejecuta mulligan
   
5. BUCLE DE JUEGO
   a) Turno inicia
      Server → Ambos (WS): stateUpdate { state }
      Server → Jugador activo (WS): yourTurn { actions: [...] }
   
   b) Jugador activo juega carta
      Usuario → Server (WS): playCard { cardId, targets }
      Server: Valida con GameEngine
      Server → Ambos (WS): stateUpdate { state, lastAction }
   
   c) Ventana de prioridad (si hay instantánea)
      Server → Oponente (WS): priorityWindow { canRespond: true, timeLimit: 15s }
      Oponente → Server (WS): respondWithCard { cardId } | passPriority
      Server: Añade a stack o resuelve
      Server → Ambos (WS): stackResolved { state }
   
   d) Combate
      Usuario → Server (WS): attack { attackerId, targetId }
      Server: Valida y ejecuta combate
      Server → Ambos (WS): stateUpdate { state }
   
   e) Fin de turno
      Usuario → Server (WS): endTurn
      Server: Cambia turno, triggers END_OF_TURN
      Server → Ambos (WS): stateUpdate { state }
      Loop vuelve a 5.a con siguiente jugador
   
6. FIN DE PARTIDA
   Server: Detecta vida ≤ 0 o concesión
   Server → Ambos (WS): gameOver { winnerId, reason, stats }
   Server: Guarda match en DB (historial, estadísticas)
   
7. DESCONEXIÓN/RECONNECTION
   Si jugador desconecta:
      Server → Oponente (WS): opponentDisconnected { reconnectWindow: 60s }
      Server: Pausa timer del juego
   
   Si jugador reconecta en <60s:
      Usuario → Server (WS): reconnect
      Server → Usuario (WS): stateUpdate { currentState }
      Server → Oponente (WS): opponentReconnected
      Server: Reanuda juego
   
   Si no reconecta en 60s:
      Server → Oponente conectado (WS): gameOver { reason: 'TIMEOUT' }
      Server: Otorga victoria por W.O.
```

---

### **2.4. Diseño UX/UI**

#### **2.4.1. Diseño de experiencia de usuario (UX)**

**Principios aplicados:**
1. **Feedback inmediato**: Cada acción tiene respuesta visual
2. **Estado claro**: Vida, maná, fases siempre visibles
3. **Anticipación**: Hints sobre efectos de cartas
4. **Recuperación de errores**: Confirmación en acciones críticas
5. **Progresión visible**: Objetivos, logros, estadísticas

**User Flows críticos:**
- Onboarding: Tutorial interactivo → Primera partida → Reward
- Construcción de mazo: Filtros → Drag & drop → Validación → Guardar
- Partida: Mulligan → Turnos → Interacciones stack → Victoria

#### **2.4.2. Diseño de interfaz de usuario (UI)**

**Sistema de diseño:**
- **Paleta de colores:**
  - Abominación: Verdes oscuros/tóxicos
  - Caos: Rojos/naranjas caóticos
  - Vitalidad: Rojos sangre/carmesí
  - Básicas: Grises neutros

- **Tipografía:**
  - Headers: AvQest (custom, medieval)
  - Body: Inter/Roboto (legible)
  - Números: Monospace para stats

- **Componentes:**
  - Cartas: Border según rareza, glow en hover
  - Botones: Estados hover/active/disabled
  - Overlays: Semi-transparentes, blur backdrop
  - Animaciones: Smooth, 200-300ms

#### **2.4.3. Principios de usabilidad aplicados**

**Heurísticas de Nielsen:**
1. **Visibilidad del estado**: Fase actual, prioridad, stack
2. **Lenguaje usuario**: "Atacar" en vez de "Declarar atacantes"
3. **Control**: Poder deshacer acciones cuando posible
4. **Consistencia**: Mismos iconos para mismas acciones
5. **Prevención de errores**: Validar antes de ejecutar
6. **Reconocimiento vs recall**: Tooltips con info completa
7. **Flexibilidad**: Atajos teclado para usuarios avanzados
8. **Diseño minimalista**: No sobrecargar con info
9. **Mensajes de error**: Claros y con solución
10. **Ayuda**: Sistema de ayuda contextual

#### **2.4.4. Sitemap y navegación**
```
┌─ Inicio (Landing)
├─ Login / Registro
├─ Lobby (Principal)
│  ├─ Jugar
│  │  ├─ vs IA
│  │  └─ vs Jugador (Matchmaking)
│  ├─ Colección
│  │  ├─ Ver cartas
│  │  └─ Abrir sobres
│  ├─ Mazos
│  │  ├─ Listar mazos
│  │  ├─ Crear mazo
│  │  └─ Editar mazo
│  ├─ Perfil
│  │  ├─ Estadísticas
│  │  └─ Historial
│  └─ Tienda
│     ├─ Comprar sobres
│     └─ Cosméticos
└─ Configuración
   ├─ Audio
   ├─ Gráficos
   └─ Cuenta
```

#### **2.4.5. Accesibilidad**

**WCAG 2.1 Level AA:**
- Contraste mínimo 4.5:1 en textos
- Tamaño de fuente escalable
- Navegación con teclado completa
- ARIA labels en componentes interactivos
- Alt text en imágenes
- Modo daltonismo (opcional)
- Subtítulos en efectos de sonido (futuro)

**Implementación:**
```tsx
<button 
  aria-label="Jugar carta Mercenario Ágil"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && playCard()}
>
  <Card data={card} />
</button>
```

---

### **2.5. Prototipaje**

#### **2.5.1. Diseño de los wireframes baja calidad**
**Herramientas:** Papel y lápiz, Balsamiq, Excalidraw

**Pantallas clave:**
1. **Tablero de juego** (baja fidelidad):
   - Rectángulos para áreas (mano, tablero enemigo, tablero aliado)
   - Círculos para vida/maná
   - Cuadrados para cartas

2. **Deckbuilder** (baja fidelidad):
   - Lista lateral de cartas disponibles
   - Área central con mazo actual (30 cartas)
   - Filtros arriba

#### **2.5.2. Diseño de los wireframes en alta calidad**
**Herramientas:** Figma, Adobe XD

**Especificaciones:**
- Tablero: 1920x1080 (16:9 landscape)
- Carta: 200x280px
- Hand: 5-10 cartas visibles
- Board: Máximo 10 criaturas por fila
- Stack: Overlay lateral derecho
- Mana/Vida: Esquinas superior

#### **2.5.3. Mockups**
**Con diseño visual completo:**
- Texturas de fondo (textura_fondo.jpg)
- Cartas con artwork (ver /public/imgCards/)
- Tipografía final (AvQest)
- Colores de clase aplicados
- Animaciones esbozadas (Framer Motion)

#### **2.5.4. Justificación del prototipaje**
**Beneficios obtenidos:**
- Detectar problemas de espacio antes de código
- Iterar diseño rápidamente (cambios en Figma vs en React)
- Alinear expectativas con stakeholders (profesores, testers)
- Documentación visual para implementación

---

### **2.6. Variaciones sobre la idea principal**

**Ideas consideradas y descartadas:**
1. **Sistema de recursos compartido** → Rechazado: diluye identidad de clases
2. **Tablero con múltiples filas** → Rechazado: complejidad innecesaria
3. **PvE con campañas** → Pospuesto: scope demasiado grande
4. **Clases híbridas** → Rechazado: balance nightmare

**Ideas implementadas con variaciones:**
1. **Final Stand** → Originalmente solo +10 vida, ahora mecánica compleja por clase
2. **Stack system** → Simplificado vs Magic (sin instantes en respuesta infinita)
3. **Espécimen** → Originalmente costo fijo, ahora escalable

---

### **2.7. Conclusiones de los materiales y métodos escogidos**

**Aciertos:**
- Monorepo con shared package permitió reutilización efectiva (engine usado en web + server)
- TypeScript previno innumerables bugs en lógica compleja
- Testing desde día 1 dio confianza para refactorings
- Socket.IO simplificó enormemente la implementación de multijugador (rooms, eventos tipados)
- Documentación paralela facilitó TFG

**Lecciones aprendidas:**
- Paper prototype antes de código habría ahorrado tiempo en UI
- Balance de cartas requiere testing humano real (simulaciones insuficientes)
- Separar autenticación REST de identidad Socket.IO crea una brecha de seguridad a resolver
- SQLite es suficiente para desarrollo pero migrar a PostgreSQL sería necesario en producción

---

## **3. DESARROLLO**

### **3.1. Estructura del proyecto**
```
infradeck/
├── packages/
│   ├── shared/                        # Game engine compartido (@infradeck/shared)
│   │   ├── src/
│   │   │   ├── engine/               # Lógica core
│   │   │   │   ├── game-state.ts     # GameState, PlayerState, CreatureOnBoard
│   │   │   │   ├── turns.ts          # startTurn, endTurn, draw
│   │   │   │   ├── combat.ts         # declareAttackHero, declareAttackCreature
│   │   │   │   ├── priority.ts       # notifyEffectTriggered, notifyCardPlayed
│   │   │   │   ├── effects/          # Sistema de efectos
│   │   │   │   │   ├── dispatcher.ts # applyAction + EFFECT_HANDLERS
│   │   │   │   │   ├── core.ts       # EffectContext, effectConditionPasses
│   │   │   │   │   ├── board-effects.ts
│   │   │   │   │   ├── global-effects.ts
│   │   │   │   │   ├── caos-effects.ts
│   │   │   │   │   ├── vitalidad-effects.ts
│   │   │   │   │   ├── abominacion-effects.ts
│   │   │   │   │   └── transform-effects.ts
│   │   │   │   ├── final-stand.ts
│   │   │   │   ├── specimen.ts
│   │   │   │   ├── card-validator.ts
│   │   │   │   └── utils.ts
│   │   │   ├── cards/
│   │   │   │   ├── basic-cards.ts    # Cartas neutrales
│   │   │   │   └── class-cards.ts    # Cartas de clase
│   │   │   ├── types/
│   │   │   │   └── cards.ts          # Tipos, enums, GAME_CONSTANTS
│   │   │   └── index.ts             # Re-exports
│   │   └── package.json
│   └── server/                        # Backend (@infradeck/server)
│       ├── src/
│       │   ├── index.ts              # Express + Socket.IO (monolítico)
│       │   ├── db.ts                 # Prisma singleton
│       │   ├── game-engine.ts        # Bridge al shared engine
│       │   ├── gameRoom.ts           # GameRoomManager
│       │   ├── matchmaking.ts        # Cola FIFO
│       │   ├── card-resolver.ts
│       │   ├── target-detector.ts
│       │   ├── game-handlers.ts
│       │   ├── auth-economy-utils.ts
│       │   └── types.ts              # Socket.IO event types
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── dev.db
│       │   └── migrations/
│       └── package.json
├── web/                               # Frontend principal (@infradeck/web)
│   ├── src/
│   │   ├── components/               # Componentes UI (flat)
│   │   ├── context/                  # Auth, GameEngine, OnlineGame
│   │   ├── services/                 # WebSocketService
│   │   ├── utils/                    # Sample decks
│   │   └── main.tsx
│   ├── public/
│   │   └── imgCards/
│   └── vite.config.ts
├── docs/                              # Documentación de entrega
│   └── entrega/
├── render.yaml                        # Blueprint de despliegue del backend (Render)
├── .gitignore
└── .cursor/rules/                     # Reglas para Cursor AI
```

### **3.2. Plataforma de desarrollo**

#### **3.2.1. Software**
- **SO**: macOS 24.4.0 (Darwin)
- **IDE**: Cursor (basado en VSCode) + extensiones TypeScript, Tailwind CSS IntelliSense
- **Control versiones**: Git 2.x
- **Package manager**: npm (paquetes independientes enlazados con `file:`)
- **Browser DevTools**: Chrome DevTools, React DevTools
- **Dev server**: Vite 7 (frontend), tsx watch (backend)

#### **3.2.2. Hardware**
- **Mac**: MacBook con M1/M2 o equivalente Intel
- **RAM**: 16GB (8GB mínimo)
- **Storage**: 256GB SSD
- **Display**: 1920x1080 o superior

#### **3.2.3. Recursos externos utilizados**
- **Fuentes**: AvQest.ttf (custom)
- **Imágenes**: Artwork de cartas, retratos y fondos — **placeholders sacados directamente de internet** (sin licencia para uso comercial; pendientes de sustituir por arte original o con licencia)
- **Iconos**: @radix-ui/react-icons
- **Hosting**: Vercel (frontend), Render (backend, ver `render.yaml`), Neon (PostgreSQL)

#### **3.2.4. APIs utilizadas**
**Implementadas:**
- API REST propia (Express): auth, mazos, colección, recompensas
- Socket.IO: matchmaking, partidas en tiempo real

**Futuras:**
- Stripe/PayPal para pagos (opcional)

---

### **3.2. Implementación de base de datos** (Implementado)

**Esquema Prisma:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())
  
  cards     UserCard[]
  decks     Deck[]
  matchesAsP1 Match[] @relation("Player1")
  matchesAsP2 Match[] @relation("Player2")
}

model Card {
  id       String @id
  name     String
  cost     Int
  type     String
  rarity   String
  classType String?
  
  // JSON para effects complejos
  data     Json
  
  userCards UserCard[]
  deckCards DeckCard[]
}

model UserCard {
  userId   String
  cardId   String
  quantity Int @default(1)
  
  user User @relation(fields: [userId], references: [id])
  card Card @relation(fields: [cardId], references: [id])
  
  @@id([userId, cardId])
}

model Deck {
  id        String   @id @default(uuid())
  userId    String
  name      String
  classType String
  createdAt DateTime @default(now())
  
  user  User @relation(fields: [userId], references: [id])
  cards DeckCard[]
}

model DeckCard {
  deckId   String
  cardId   String
  quantity Int
  
  deck Deck @relation(fields: [deckId], references: [id])
  card Card @relation(fields: [cardId], references: [id])
  
  @@id([deckId, cardId])
}

model Match {
  id         String   @id @default(uuid())
  player1Id  String
  player2Id  String
  winnerId   String?
  duration   Int      // segundos
  createdAt  DateTime @default(now())
  
  player1 User @relation("Player1", fields: [player1Id], references: [id])
  player2 User @relation("Player2", fields: [player2Id], references: [id])
  
  turns MatchTurn[]
}

model MatchTurn {
  id         String @id @default(uuid())
  matchId    String
  turnNumber Int
  playerIndex Int
  actions    Json   // Array de acciones
  
  match Match @relation(fields: [matchId], references: [id])
}
```

**Migrations:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### **3.3. Desarrollo del Front-End**

**Componentes principales implementados:**

1. **`Card.tsx`** - Componente de carta individual
   - Props: `card`, `showMana`, `onClick`
   - Muestra: stats, habilidades, artwork, costo
   - Normalización segura de arrays (previene crashes)

2. **`Hand.tsx`** - Mano de cartas del jugador
   - Usa `resolver` del GameEngineProvider
   - Click para jugar carta (validación de maná)
   - Layout fan-out con CSS

3. **`GameBoard.tsx`** - Tablero principal
   - Muestra ambos jugadores (vida, maná, board)
   - Click en criatura para atacar
   - Overlay para seleccionar objetivo
   - Botón "Finalizar Turno"

4. **`GameEngineProvider.tsx`** - Context global
   - Inicializa `GameState` con mazos de muestra
   - Provee funciones: `playCard`, `attack`, `endTurn`
   - Maneja bot local (juega cartas asequibles, ataca, finaliza turno)
   - `useLayoutEffect` para resolver inicial

**Estilos con Tailwind:**
```tsx
<div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 shadow-xl">
  <h2 className="text-2xl font-bold text-white">{card.name}</h2>
  <p className="text-sm text-gray-300">{card.description}</p>
</div>
```

**Animaciones con Framer Motion:**
```tsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.8, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  <Card card={card} />
</motion.div>
```

---

### **3.4. Desarrollo del Back-End** (Implementado)

#### **Arquitectura Backend**

El servidor está implementado en `packages/server/` con una arquitectura monolítica en `index.ts` que combina rutas HTTP y handlers Socket.IO.

#### **Endpoints REST implementados**

```typescript
// Auth
POST   /auth/register           // Crear cuenta (username, email, password)
POST   /auth/login              // Login → JWT token (7d expiry)
POST   /auth/google             // Login/registro con ID token de Google → JWT

// User
GET    /me                      // Perfil + stats (requireAuth)
GET    /me/collection           // UserCard[] (requireAuth)
GET    /me/decks                // Decks con cards (requireAuth)
POST   /me/decks                // Crear/actualizar mazo (requireAuth)
DELETE /me/decks/:id            // Borrar mazo (requireAuth)
POST   /me/rewards              // Añadir gold/gems (requireAuth)

// Health
GET    /health                  // Status check
```

#### **Login con Google**

Flujo: el frontend obtiene un ID token con [Google Identity Services](https://developers.google.com/identity) (`@react-oauth/google`) y el backend lo verifica con `google-auth-library`. Mismo JWT y sesión que email/contraseña. Si el email ya existe con contraseña, la cuenta se vincula automáticamente.

**Google Cloud Console** (Credentials → OAuth 2.0 Client ID → Web application):

- **Authorized JavaScript origins** (añade todas las que uses; deben coincidir exactamente con la barra del navegador):
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - Si abres por IP de red (Vite muestra `Network:`): p. ej. `http://192.168.1.134:5173`
- Tipo de cliente: **Web application** (no Desktop ni Android)
- No uses el **Client Secret** en esta app; solo el **Client ID**
- No hace falta Client Secret para este flujo

**Variables de entorno:**

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `packages/server/.env` | Mismo Client ID (verificación del token) |
| `VITE_GOOGLE_CLIENT_ID` | `web/.env` | Mismo Client ID (botón de Google en el SPA) |
| `JWT_SECRET` | `packages/server/.env` | Secreto JWT (ya usado por auth email) |

Ejemplo `packages/server/.env`:

```
JWT_SECRET=tu_secreto
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

Ejemplo `web/.env`:

```
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

Sin `VITE_GOOGLE_CLIENT_ID`, el login email/contraseña sigue funcionando; el botón de Google no se muestra.

#### **Eventos WebSocket implementados**

Definidos en `packages/server/src/types.ts`:

```typescript
// Cliente → Servidor
interface ClientToServerEvents {
  'matchmaking:join': (playerName: string) => void
  'matchmaking:leave': () => void
  'game:playCard': (data) => void
  'game:discoverResponse': (data) => void
  'game:scryResponse': (data) => void
  'game:endTurn': () => void
  'game:attack': (data) => void
}

// Servidor → Cliente
interface ServerToClientEvents {
  'connection:success': (data: { playerId }) => void
  'matchmaking:joined': () => void
  'matchmaking:matched': (data: { roomId, opponentName }) => void
  'game:start': (data: { state, playerIndex, opponentName }) => void
  'game:stateUpdate': (data: { state }) => void
  'game:targetRequest': (data) => void
  'game:discoverRequest': (data) => void
  'game:scryRequest': (data) => void
  'game:over': (data: { winner, reason }) => void
  'opponent:disconnected': () => void
}
```

#### **Flujo de partida online**

```
1. Conexión: socket connect → server asigna nanoid() como playerId
2. Matchmaking: 'matchmaking:join' → MatchmakingQueue (FIFO)
3. Match found: 2 jugadores → GameRoomManager crea room con nanoid(10)
4. Game start: setTimeout 2s → 'game:start' con estado inicial
5. Game loop: acciones via socket → server valida con engine → broadcast estado
6. Game over: server detecta vida ≤ 0 → 'game:over'
```

**Gestión de estado:**
- Partidas in-memory (`GameRoomManager` con `Map<roomId, GameRoom>`)
- `socketToPlayer: Map<socketId, { playerId, roomId }>` vincula conexiones
- Engine de shared ejecuta lógica, server es authoritative
- Target detection pre-engine para discover/scry/targeting

**Nota:** Socket.IO actualmente no valida JWT — usa playerId por conexión. La identidad de cuenta (REST) y la de partida (Socket) son capas separadas.

---

### **3.5. Seguridad y privacidad**

#### **3.5.1. Seguridad del sistema**

**Autenticación:**
- JWT tokens via `Authorization: Bearer <token>` (7 días expiración)
- Passwords hasheados con bcryptjs (10 salt rounds)
- Middleware `requireAuth` extrae y verifica JWT en rutas protegidas

**Validación:**
- Todas las acciones validadas en servidor
- GameEngine valida legalidad de jugadas
- Rate limiting en API (express-rate-limit)

**Protección:**
- HTTPS obligatorio en producción
- CORS configurado correctamente
- Helmet.js para headers de seguridad
- Sanitización de inputs

**Autenticación REST:**
```typescript
// Middleware autenticación HTTP
import jwt from 'jsonwebtoken'

export async function authenticate(req, res, next) {
  const token = req.cookies.authToken
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
```

#### **Seguridad en WebSockets**

**Socket.IO (estado actual):**
- Sin autenticación JWT en Socket.IO — cada conexión recibe un `nanoid()` como playerId
- Identidad de cuenta (REST/JWT) y de partida (Socket/playerId) son capas separadas
- **Mejora pendiente**: Vincular socket con cuenta de usuario validando JWT en handshake

**Validación de acciones (implementado):**
- ✅ Toda acción validada server-side con GameEngine de shared
- ✅ Server es fuente de verdad para estado del juego
- ✅ Target detection pre-engine (discover, scry, targeting)
- ✅ Validar carta en mano y mana disponible antes de ejecutar

**Pendiente:**
- Rate limiting en eventos Socket.IO
- Autenticación JWT en handshake de Socket.IO
- Log de acciones para replay/auditoría

#### **3.5.2. Políticas de privacidad**

**GDPR Compliance:**
- Consentimiento explícito para cookies
- Derecho a acceder/exportar datos
- Derecho a borrar cuenta
- Política de privacidad clara

**Datos recolectados:**
- Email (obligatorio para registro)
- Username (público)
- Historial de partidas (anónimo)
- No se venden datos a terceros

**Cookies:**
- Esenciales: Autenticación
- Funcionales: Preferencias UI
- Analytics: Plausible (privacy-first, sin cookies)

---

### **3.6. Control de versionado del código**

**Git workflow:**
```bash
# Branches principales
main                 # Producción (protegida)
develop              # Desarrollo activo
feat/UI-juego-definitiva  # Branch actual (UI completa)

# Branches por feature (actuales)
feat/deckbuilder
feat/matchmaking
fix/combat-bug

# Branches futuras para WebSockets
feat/websocket-server      # Implementación server Socket.io
feat/websocket-client      # Client-side Socket.io
feat/matchmaking-queue     # Sistema de emparejamiento
feat/reconnection          # Sistema de reconnect

# Commits semánticos
feat: Añadir overlay de selección de objetivos
fix: Corregir crash al jugar instantánea
docs: Actualizar README con estado actual
test: Añadir tests para Final Stand
refactor: Extraer lógica de bot a hook
```

**Commits actuales (git status):**
- Modified: 11 archivos (README, componentes, engine)
- Branch: `feat/UI-juego-definitiva`
- Estado: Working on UI completa con overlays y prioridad

**GitHub/GitLab:**
- Pull Requests con review
- CI/CD con GitHub Actions (futuro)
  - Run tests on PR
  - Auto-deploy a Vercel on merge

---

### **3.7. Estructura física de los ficheros y dependencias**

**`package.json` principales:**

```json
// web/package.json
{
  "name": "@infradeck/web",
  "dependencies": {
    "react": "^18 || ^19",
    "framer-motion": "^12.23.22",
    "zustand": "^5.0.8",
    "@radix-ui/react-icons": "^1.3.2"
  },
  "devDependencies": {
    "vite": "^7.1.8",
    "typescript": "^5.9.3",
    "tailwindcss": "^3.4.18"
  }
}

// packages/shared/package.json
{
  "name": "@infradeck/shared",
  "devDependencies": {
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Dependencias clave frontend:**
- `react` + `react-dom`: Framework UI
- `framer-motion`: Animaciones
- `tailwindcss`: Styling utility-first
- `socket.io-client`: Comunicación real-time
- `clsx`: Utilidad para clases CSS condicionales

**Dependencias clave backend:**
- `express` + `cors`: HTTP server
- `socket.io`: WebSockets con rooms
- `@prisma/client`: ORM para PostgreSQL
- `jsonwebtoken` + `bcryptjs`: Auth
- `nanoid`: IDs únicos para jugadores y rooms

---

### **3.8. Test, pruebas y validación**

#### **3.8.1. Test de usabilidad** (Futuro - Paper Testing)

**Protocolo:**
1. Reclutamiento: 5-10 jugadores de TCG
2. Sesiones individuales: 1 hora cada una
3. Tareas:
   - Crear mazo desde cero
   - Jugar 2 partidas vs IA
   - Abrir sobre y añadir carta a mazo
4. Métricas:
   - Tiempo para completar tareas
   - Errores cometidos
   - Preguntas/confusiones
   - System Usability Scale (SUS)
5. Think-aloud protocol durante sesión
6. Cuestionario post-test

**Resultados esperados:**
- SUS score > 70 (Good)
- <3 confusiones por sesión
- Tasa de éxito > 90% en tareas core

#### **3.8.2. Test de funcionalidad**

**Tests unitarios (Vitest):**

```typescript
// packages/shared/tests/engine.test.ts
import { describe, it, expect } from 'vitest'
import { initializeGame, playCard } from '../src/engine/game-state'

describe('Stack LIFO Resolution', () => {
  it('should resolve stack in LIFO order', () => {
    const state = initializeGame(/* ... */)
    
    // Jugador 1 juega hechizo
    playCard(state, 'spell1')
    
    // Jugador 2 responde con instantánea
    playCard(state, 'instant1')
    
    // Resolver stack
    resolveStack(state)
    
    // Instantánea se resuelve primero (LIFO)
    expect(state.stack).toHaveLength(0)
    expect(state.players[1].life).toBe(/* expected value */)
  })
})
```

**Tests de integración:**
```typescript
describe('Complete Game Flow', () => {
  it('should play full game with Final Stand', () => {
    const state = initializeGame(/* ... */)
    
    // Simulate turns until Final Stand
    // ...
    
    // Trigger Final Stand
    dealDamage(state, /* lethal damage */)
    
    expect(state.players[0].finalStand.active).toBe(true)
    expect(state.players[0].life).toBe(1)
  })
})
```

**Resultados actuales:**
- ✅ Tests de engine: `packages/shared/src/engine/turn-system.test.ts`
- ✅ Tests de cartas: `packages/shared/src/engine/all-cards-smoke.test.ts`
- ✅ Tests de auth: `packages/server/src/auth-economy-utils.test.ts`
- Framework: Vitest (shared), Node test runner via tsx (server)

**Tests de integración WebSocket (Futuro):**
```typescript
// tests/sockets/game.test.ts
import { io as ioClient } from 'socket.io-client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('WebSocket Game Flow', () => {
  let client1, client2
  
  beforeAll(async () => {
    client1 = ioClient('http://localhost:3000', {
      auth: { token: 'test_token_player1' }
    })
    client2 = ioClient('http://localhost:3000', {
      auth: { token: 'test_token_player2' }
    })
    
    await Promise.all([
      new Promise(resolve => client1.on('connect', resolve)),
      new Promise(resolve => client2.on('connect', resolve))
    ])
  })
  
  it('should complete matchmaking flow', async () => {
    client1.emit('joinQueue', { deckId: 'deck1' })
    
    const queueJoined = await new Promise(resolve => {
      client1.on('queueJoined', resolve)
    })
    expect(queueJoined.position).toBe(1)
    
    client2.emit('joinQueue', { deckId: 'deck2' })
    
    const [match1, match2] = await Promise.all([
      new Promise(resolve => client1.on('matchFound', resolve)),
      new Promise(resolve => client2.on('matchFound', resolve))
    ])
    
    expect(match1.matchId).toBe(match2.matchId)
  })
  
  it('should handle full game turn', async () => {
    const [state1] = await Promise.all([
      new Promise(resolve => client1.on('gameStarted', resolve)),
      new Promise(resolve => client2.on('gameStarted', resolve))
    ])
    
    // Player 1 juega carta
    client1.emit('playCard', { 
      cardId: state1.initialState.players[0].hand[0]
    })
    
    // Ambos reciben actualización
    const [update1, update2] = await Promise.all([
      new Promise(resolve => client1.on('stateUpdate', resolve)),
      new Promise(resolve => client2.on('stateUpdate', resolve))
    ])
    
    expect(update1.state).toEqual(update2.state)
    expect(update1.state.players[0].hand.length).toBe(4)
  })
  
  afterAll(() => {
    client1.disconnect()
    client2.disconnect()
  })
})
```

#### **3.8.3. Resultados obtenidos**

**Testing técnico:**
- Coverage: ~85% (falta UI testing)
- No bugs críticos detectados
- Refactorings seguros gracias a tests

**Simulaciones de partidas:**
- 2 partidas completas documentadas
- Duración promedio: 6-7 turnos (✅ target 5-10 min)
- Final Stand activado en 50% de games (target 30-40%)
- Mecánicas funcionan coherentemente

**Balance inicial:**
- Tormenta Impredecible: Potencialmente OP (cap damage needed)
- Vitalidad: Dominancia early predicha (needs testing)
- Abominación: Alta curva aprendizaje

---

### **3.9. Problemas encontrados y soluciones implementadas**

| Problema | Impacto | Solución |
|----------|---------|----------|
| **Estado divergente UI/Engine** | Alto | Unificar en `GameEngineProvider` |
| **Mano vacía en primer render** | Medio | `useLayoutEffect` para resolver inicial |
| **Bot jugaba múltiples veces** | Alto | Candado `processedTurnRef` |
| **Cartas sin arrays crasheaban** | Medio | Normalización segura `Array.isArray()` |
| **Stack LIFO complejo** | Alto | 14 tests específicos + documentación |
| **Balance Tormenta** | Medio | Pendiente: cap damage en futuro patch |
| **Espécimen spam** | Alto | Costo escalable (5→7→9→10) |
| **Counter spell timing** | Medio | Flag pendiente en vez de stack direct |

**Ejemplo solución:**
```typescript
// Problema: Estado divergente
// ❌ Antes: GameBoard tenía su propio useState()
const [localState, setLocalState] = useState()

// ✅ Después: Único state en Provider
const { state, resolver } = useGameEngine()
```

---

### **3.10. Variaciones sobre la idea principal**

**Durante desarrollo:**
1. **Espécimen**: De costo fijo → costo escalable (mejor balance)
2. **Counter spell**: De cancelar stack item → flag pendiente (más simple)
3. **Entropía**: De resetear turno → persistir (más estratégico)
5. **Final Stand**: De simple +10 vida → bonus por clase (más interesante)

**Características pospuestas:**
- Sideboard para best-of-3 (Fase posterior)
- Torneo mode (Fase posterior)
- Replay system (Nice to have)
- Modo campaña PvE (Out of scope TFG)

---

### **3.11. Conclusiones del desarrollo**

**Logros principales:**
- ✅ Motor de juego robusto y testeado (combat, turns, effects, Final Stand, specimen)
- ✅ 70+ cartas balanceadas con mecánicas únicas
- ✅ 3 clases asimétricas funcionales (Abominación, Caos, Vitalidad)
- ✅ UI web completa (tablero, targeting, discover, scry, bot local)
- ✅ Backend con API REST + Socket.IO (auth, mazos, colección, matchmaking)
- ✅ Base de datos con Prisma/SQLite (usuarios, perfiles, monedas, mazos)
- ✅ Multijugador online funcional (matchmaking + partidas en tiempo real)
- ✅ Documentación exhaustiva

**Desafíos superados:**
- Efectos declarativos con dispatcher: cartas como datos + handlers registrados
- Balance de cartas: simulaciones + teoría de juegos
- UI reactiva: Context API + GameBoard compartido local/online
- Bot local: lógica simple pero efectiva
- Socket.IO: matchmaking, rooms, sincronización de estado

**Trabajo pendiente:**
- Deckbuilder UI (modelo de datos existe, falta interfaz visual)
- UI de colección y apertura de sobres
- Autenticación JWT en Socket.IO handshake
- Testing de usabilidad real
- Pulido visual y animaciones finales

**Viabilidad TFG:**
- Scope inicial ambicioso → Priorizado MVP funcional
- Fases 1, 2, 4 y 5 completas (Motor + UI + Auth/DB + Multijugador)
- Fase 3 (Deckbuilder UI) y Fase 6 (Pulido) en progreso
- Riesgo controlado con planning iterativo

**Aprendizajes clave:**
- Testing desde día 1 acelera desarrollo a largo plazo
- TypeScript esencial para sistemas complejos
- Documentación paralela facilita TFG enormemente
- Socket.IO simplifica enormemente vs WebSockets nativos (rooms, reconnection, fallback)
- Separar engine compartido (shared) permitió reutilizar lógica en frontend y backend
- Balance requiere testing humano, no solo simulaciones