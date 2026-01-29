## **1. INTRODUCCIÓN**

### **1.1. Contexto y justificación del Trabajo**
**Contenido a incluir:**
- **Popularidad de los TCG digitales**: Hearthstone (100M+ jugadores), Magic Arena, Legends of Runeterra
- **Nicho identificado**: Falta de TCG 1v1 con mecánicas profundas de stack y counterplay
- **Oportunidad educativa**: Aplicar conocimientos de desarrollo full-stack, arquitectura de software y teoría de juegos
- **Justificación técnica**: Demostrar capacidad de crear sistemas complejos (motor de juego, UI reactiva, backend escalable)

### **1.2. Objetivos del Trabajo**
1. ✅ **Diseñar un sistema de juego completo** con 4 clases únicas (Abominación, Caos, Ciclo, Vitalidad)
2. ✅ **Implementar motor de juego robusto** con stack LIFO, prioridad, triggers y mecánicas avanzadas
3. 🔄 **Desarrollar UI web completa** con selección de objetivos, visualización de pila y feedback visual
4. ⏳ **Crear sistema de colección** con sobres, recompensas y progresión
5. ⏳ **Implementar sistema de usuarios** con login, persistencia de datos y estadísticas
6. ⏳ **Desarrollar multijugador online** con emparejamiento y sincronización en tiempo real
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
1. **Monorepo con PNPM workspaces** → compartir lógica entre frontend/backend
2. **TypeScript full-stack** → type safety crítica para lógica compleja
3. **Stack LIFO real** → profundidad estratégica vs resolución inmediata
4. **Espécimen con costo escalable** → balance y anti-spam

**Stack tecnológico:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript (futuro)
- Base de datos: PostgreSQL + Prisma ORM (futuro)
- Testing: Vitest (106 tests, <100ms)
- Game Engine: Shared package `@infradeck/shared`

### **1.5. Planificación del Trabajo**

#### **1.5.1. Recursos necesarios**
**Hardware:**
- MacBook/PC con 8GB RAM mínimo
- Servidor de desarrollo (local o cloud)

**Software:**
- Node.js 18+, PNPM, Git
- VSCode con extensiones TypeScript
- Docker para base de datos (futuro)
- Figma para diseño UI/UX

**Recursos externos:**
- Hosting: Vercel (frontend) + Railway (backend)
- CDN: Cloudinary para imágenes de cartas
- Analytics: Plausible o similar

#### **1.5.2. Hitos y planificación temporal**
**Basado en tu roadmap.md:**

| Fase | Duración | Estado | Entregables |
|------|----------|--------|-------------|
| **Fase 1: Motor y Cartas** | 4 semanas | ✅ Completada | Engine funcional, 70 cartas, 106 tests |
| **Fase 2: UI Básica** | 3 semanas | 🔄 80% | Juego jugable, bot local, combate |
| **Fase 3: Deckbuilder** | 2 semanas | ⏳ Pendiente | Construcción de mazos, selección de clase |
| **Fase 4: Sistema de Usuario** | 3 semanas | ⏳ Pendiente | Login, colección, progresión |
| **Fase 5: Multijugador** | 4 semanas | ⏳ Pendiente | WebSockets, emparejamiento |
| **Fase 6: Pulido Final** | 2 semanas | ⏳ Pendiente | Animaciones, feedback, responsive |
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
**Productos actuales:**
1. ✅ **Motor de juego completo** (14 tests engine, mecánicas avanzadas)
2. ✅ **70 cartas balanceadas** (4 clases + básicas, 92 tests)
3. ✅ **UI funcional básica** (mano, tablero, combate, bot)
4. ✅ **Documentación de diseño** (8 archivos, reglas completas)
5. ✅ **Sistema de testing** (106 tests verdes, CI ready)

**Productos pendientes:**
6. ⏳ Deckbuilder y validación de mazos
7. ⏳ Sistema de usuarios y autenticación
8. ⏳ Colección y sobres
9. ⏳ Backend con API REST
10. ⏳ Multijugador con WebSockets

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

> "Infradeck es un TCG 1v1 digital que combina la profundidad estratégica del stack de Magic con la accesibilidad de Hearthstone, presentando 4 clases únicas con mecánicas asimétricas innovadoras: construir el Espécimen Perfecto, controlar el caos con Entropía, dominar los ciclos Día/Noche/Eclipse, o sacrificar vida por poder."

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
│          Cliente Web (React)            │
│  ┌────────────┐      ┌───────────────┐  │
│  │ Components │◄────►│ Game Engine   │  │
│  │  (UI/UX)   │      │   (Shared)    │  │
│  └────────────┘      └───────────────┘  │
└──────────────┬──────────────────────────┘
               │ REST API / WebSockets
┌──────────────▼──────────────────────────┐
│       Servidor (Node.js + Express)      │
│  ┌────────────┐      ┌───────────────┐  │
│  │   API      │◄────►│  Game Logic   │  │
│  │  Endpoints │      │   (Shared)    │  │
│  └────────────┘      └───────────────┘  │
└──────────────┬──────────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────────┐
│      Base de Datos (PostgreSQL)         │
│  Users | Decks | Cards | Matches | ...  │
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
| State | Zustand | 5.x | Ligero, simple, sin boilerplate |
| Types | TypeScript | 5.9 | Type safety crítica |
| Testing | Vitest | 1.x | Integración Vite, velocidad |
| Backend | Node.js + Express | 20.x / 4.x | JavaScript isomórfico |
| DB | PostgreSQL | 16.x | Relacional, ACID, robusto |
| ORM | Prisma | 5.x | Type-safe, migrations fáciles |
| Real-time | Socket.io | 4.x | WebSockets simplificados |

#### **2.3.4. Arquitectura Cliente**
```
apps/web/
├── src/
│   ├── components/      # Componentes UI
│   │   ├── Card.tsx
│   │   ├── GameBoard.tsx
│   │   ├── Hand.tsx
│   │   └── ...
│   ├── context/         # React Context
│   │   └── GameEngineProvider.tsx
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilidades
│   └── main.tsx         # Entry point
├── public/              # Assets estáticos
└── vite.config.ts       # Configuración Vite
```

**Patrón de componentes:**
- Container/Presentational
- Hooks para lógica reutilizable
- Context para estado global (GameEngine)

#### **2.3.5. Arquitectura Servidor** (Futuro)
```
apps/api/
├── src/
│   ├── routes/          # Endpoints REST
│   │   ├── auth.ts
│   │   ├── cards.ts
│   │   ├── decks.ts
│   │   └── matches.ts
│   ├── services/        # Lógica de negocio
│   ├── middleware/      # Auth, validation
│   ├── sockets/         # WebSocket handlers
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Modelo de datos
└── tests/               # Tests backend
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

#### **2.3.7. Diseño de arquitectura Back-End** (Futuro)

**Capas:**
1. **Routes**: Validación de requests, autenticación
2. **Services**: Lógica de negocio (crear mazo, abrir sobre)
3. **Repositories**: Acceso a base de datos (Prisma)
4. **WebSockets**: Sincronización de partidas en tiempo real

**Principios:**
- Separación de responsabilidades
- Dependency injection
- Error handling centralizado
- Logging estructurado

#### **2.3.8. Arquitectura Bases de datos** (Futuro)

**Esquema principal:**
```sql
Users (id, email, username, created_at)
Cards (id, name, cost, type, rarity, class, ...)
UserCards (user_id, card_id, quantity)
Decks (id, user_id, name, class, created_at)
DeckCards (deck_id, card_id, quantity)
Matches (id, player1_id, player2_id, winner_id, duration, ...)
MatchTurns (match_id, turn_number, actions_json)
```

**Relaciones:**
- User 1:N Decks
- User M:N Cards (through UserCards)
- Deck M:N Cards (through DeckCards)
- User M:N Matches (as player)

**Índices:**
- `users(email)` - login rápido
- `decks(user_id)` - listar mazos de usuario
- `matches(player1_id, player2_id)` - historial

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
  - Ciclo: Azules/amarillos (Día/Noche)
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
- Monorepo permitió reutilización efectiva (shared package usado en web + futuro backend)
- TypeScript previno innumerables bugs en lógica compleja
- Testing desde día 1 dio confianza para refactorings
- Documentación paralela facilitó TFG

**Lecciones aprendidas:**
- Paper prototype antes de código habría ahorrado tiempo en UI
- Balance de cartas requiere testing humano real (simulaciones insuficientes)
- WebSockets requieren planificación cuidadosa (autenticación, reconnection, anti-cheat)
- Socket.io reduce complejidad vs WebSockets nativos (rooms, fallback, reconnection automática)

---

## **3. DESARROLLO**

### **3.1. Estructura del proyecto**
```
infradeck/
├── packages/
│   └── shared/                    # Game engine compartido
│       ├── src/
│       │   ├── engine/           # Lógica core
│       │   │   ├── game-state.ts
│       │   │   ├── turns.ts
│       │   │   ├── combat.ts
│       │   │   ├── priority.ts
│       │   │   ├── effects.ts
│       │   │   ├── final-stand.ts
│       │   │   └── utils.ts
│       │   ├── cards/            # Definiciones de cartas
│       │   │   ├── basic-cards.ts (30 cartas)
│       │   │   └── class-cards.ts (40 cartas)
│       │   └── types/
│       │       └── cards.ts      # TypeScript types
│       └── tests/                # 106 tests
│           ├── engine.test.ts (14)
│           └── cards.test.ts (92)
├── apps/
│   └── web/                      # Frontend React
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── hooks/
│       │   └── utils/
│       └── public/
│           └── imgCards/         # Assets de cartas
└── docs/                         # Documentación
    ├── game-design/
    ├── development/
    └── testing/
```

### **3.2. Plataforma de desarrollo**

#### **3.2.1. Software**
- **SO**: macOS 24.4.0 (Darwin)
- **IDE**: VSCode + extensiones:
  - ESLint, Prettier
  - TypeScript + JavaScript
  - Tailwind CSS IntelliSense
  - Vitest Runner
- **Control versiones**: Git 2.x
- **Package manager**: PNPM 8.x
- **Browser DevTools**: Chrome DevTools, React DevTools

#### **3.2.2. Hardware**
- **Mac**: MacBook con M1/M2 o equivalente Intel
- **RAM**: 16GB (8GB mínimo)
- **Storage**: 256GB SSD
- **Display**: 1920x1080 o superior

#### **3.2.3. Recursos externos utilizados**
- **Fuentes**: AvQest.ttf (custom)
- **Imágenes**: Artwork de cartas (placeholder/generated)
- **Iconos**: @radix-ui/react-icons
- **Hosting**: Vercel (frontend), Railway (backend futuro)

#### **3.2.4. APIs utilizadas**
**Actuales:** Ninguna (juego local)
**Futuras:**
- API REST propia para backend
- Socket.io para WebSockets
- Stripe/PayPal para pagos (opcional)

---

### **3.2. Implementación de base de datos** (Futuro - Fase 4)

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

### **3.4. Desarrollo del Back-End** (Futuro - Fase 5)

#### **Arquitectura Backend con WebSockets**

```
apps/api/
├── src/
│   ├── server.ts                # Express + Socket.io setup
│   ├── routes/                  # REST API endpoints
│   │   ├── auth.ts             # POST /register, /login
│   │   ├── decks.ts            # CRUD mazos
│   │   ├── cards.ts            # GET cartas, colección
│   │   └── matchmaking.ts      # POST /queue (HTTP fallback)
│   ├── sockets/                 # ⭐ WebSocket handlers
│   │   ├── matchmaking.ts      # Queue, pairing logic
│   │   ├── game.ts             # Game actions (play, attack, etc)
│   │   └── disconnect.ts       # Reconnection logic
│   ├── services/
│   │   ├── game-manager.ts     # Gestión de partidas activas
│   │   ├── matchmaking.ts      # Cola y emparejamiento
│   │   └── auth.ts             # JWT verification
│   ├── middleware/
│   │   ├── auth.ts             # Socket & REST auth
│   │   └── validation.ts       # Input validation
│   └── types/
│       └── socket-events.ts    # TypeScript events interface
└── tests/
    ├── sockets/                # Tests WebSocket handlers
    └── integration/            # Tests end-to-end
```

#### **Endpoints REST (Complemento a WebSockets)**

```typescript
// Auth (HTTP)
POST   /api/auth/register       // Crear cuenta
POST   /api/auth/login          // Login → JWT token
POST   /api/auth/logout         // Invalidar token

// Cards (HTTP - solo lectura)
GET    /api/cards               // Lista todas las cartas
GET    /api/users/me/cards      // Colección del usuario

// Decks (HTTP - CRUD)
GET    /api/users/me/decks      // Listar mazos
POST   /api/decks               // Crear mazo
PUT    /api/decks/:id           // Editar mazo
DELETE /api/decks/:id           // Borrar mazo
POST   /api/decks/:id/validate  // Validar mazo

// Matches (HTTP - historial)
GET    /api/matches/:id         // Detalle partida pasada
GET    /api/users/me/matches    // Historial de partidas
GET    /api/users/me/stats      // Estadísticas globales

// Packs (HTTP)
POST   /api/packs/open          // Abrir sobre → 5 cartas
```

#### **Eventos WebSocket (Especificación TypeScript)**

```typescript
// packages/shared/src/types/socket-events.ts

// Cliente → Servidor
export interface ClientToServerEvents {
  // Matchmaking
  joinQueue: (data: { deckId: string }) => void
  leaveQueue: () => void
  
  // Game Actions
  playCard: (data: { cardId: string, targets?: TargetRef[] }) => void
  attack: (data: { attackerId: string, targetId: string }) => void
  mulligan: (data: { cardsToReplace: string[] }) => void
  passPriority: () => void
  endTurn: () => void
  respondWithCard: (data: { cardId: string, targets?: TargetRef[] }) => void
  
  // Social
  sendEmote: (data: { emoteId: string }) => void
  concede: () => void
}

// Servidor → Cliente
export interface ServerToClientEvents {
  // Matchmaking
  queueJoined: (data: { position: number }) => void
  matchFound: (data: { matchId: string, opponentId: string, yourPlayerIndex: number }) => void
  
  // Game State
  gameStarted: (data: { initialState: GameState, yourPlayerIndex: number }) => void
  mulliganPhase: (data: { hand: string[], timeLimit: number }) => void
  stateUpdate: (data: { state: GameState, lastAction?: ActionLog }) => void
  priorityWindow: (data: { canRespond: boolean, timeLimit: number }) => void
  stackResolved: (data: { state: GameState, resolvedActions: ResolvedAction[] }) => void
  
  // Game End
  gameOver: (data: { winnerId: string, reason: string, stats: MatchStats }) => void
  
  // Errors & Disconnection
  invalidAction: (data: { message: string, code: string }) => void
  opponentDisconnected: (data: { reconnectWindow: number }) => void
  opponentReconnected: () => void
}
```

#### **Setup del servidor Socket.io**

```typescript
// apps/api/src/server.ts
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Middleware de autenticación WebSocket
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  
  try {
    const user = await verifyToken(token)
    socket.data.userId = user.id
    socket.data.username = user.username
    next()
  } catch (err) {
    next(new Error('Authentication failed'))
  }
})

// Setup handlers
import { setupMatchmakingHandlers } from './sockets/matchmaking'
import { setupGameHandlers } from './sockets/game'

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.username}`)
  
  setupMatchmakingHandlers(io, socket)
  setupGameHandlers(io, socket)
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.data.username}`)
    handleDisconnect(io, socket)
  })
})

httpServer.listen(3000)
```

#### **Validación Server-Side (Anti-cheat)**

```typescript
// apps/api/src/sockets/game.ts
socket.on('playCard', ({ cardId, targets }) => {
  const match = getActiveMatch(socket.data.matchId)
  const state = match.gameState
  
  // 1. Verificar es tu turno
  if (state.turn.currentPlayerIndex !== socket.data.playerIndex) {
    return socket.emit('invalidAction', { 
      message: 'No es tu turno',
      code: 'NOT_YOUR_TURN'
    })
  }
  
  // 2. Verificar carta en mano
  const player = state.players[socket.data.playerIndex]
  if (!player.hand.includes(cardId)) {
    return socket.emit('invalidAction', { 
      message: 'No tienes esa carta',
      code: 'CARD_NOT_IN_HAND'
    })
  }
  
  // 3. Validar con GameEngine (shared package)
  const result = playCard(state, cardId, targets)
  
  if (!result.success) {
    return socket.emit('invalidAction', { 
      message: result.error,
      code: 'INVALID_PLAY'
    })
  }
  
  // 4. Actualizar estado y broadcast
  match.gameState = result.state
  match.lastActivity = new Date()
  
  io.to(match.matchId).emit('stateUpdate', { 
    state: result.state,
    lastAction: { type: 'PLAY_CARD', cardId }
  })
  
  // 5. Guardar en DB para replay
  await saveMatchAction(match.matchId, {
    turn: state.turn.turnNumber,
    playerId: socket.data.userId,
    action: 'PLAY_CARD',
    data: { cardId, targets }
  })
})
```

#### **Gestión de State del Server**

```typescript
// En memoria durante desarrollo
interface ActiveMatch {
  matchId: string
  player1: { userId: string, socketId: string, connected: boolean }
  player2: { userId: string, socketId: string, connected: boolean }
  gameState: GameState  // Del shared engine
  createdAt: Date
  lastActivity: Date
}

const activeMatches = new Map<string, ActiveMatch>()

// Producción: Redis para horizontal scaling
// await redis.set(`match:${matchId}`, JSON.stringify(match))
```

#### **Sistema de Reconnection**

```typescript
socket.on('disconnect', () => {
  const match = getActiveMatch(socket.data.matchId)
  if (!match) return
  
  match.player1.connected = false
  
  // Notificar oponente
  io.to(match.player2.socketId).emit('opponentDisconnected', { 
    reconnectWindow: 60 
  })
  
  // Timer de 60 segundos
  setTimeout(() => {
    if (!match.player1.connected) {
      // Victoria por W.O.
      io.to(match.matchId).emit('gameOver', {
        winnerId: match.player2.userId,
        reason: 'TIMEOUT',
        stats: calculateStats(match.gameState)
      })
      activeMatches.delete(socket.data.matchId)
    }
  }, 60000)
})
```

---

### **3.5. Seguridad y privacidad**

#### **3.5.1. Seguridad del sistema**

**Autenticación:**
- JWT tokens (httpOnly cookies)
- Refresh tokens en DB
- Passwords hasheados con bcrypt (12 rounds)

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

**Autenticación Socket.io:**
```typescript
// Al conectar, validar JWT
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.data.userId = payload.userId
    socket.data.username = payload.username
    next()
  } catch (err) {
    next(new Error('Authentication failed'))
  }
})
```

**Validación de acciones:**
- ✅ Toda acción validada server-side con GameEngine
- ✅ No confiar en cliente para estado del juego
- ✅ Rate limiting en eventos (máx 10 acciones/segundo)
- ✅ Timeout en ventanas de prioridad (15s automático)

**Protección contra cheating:**
- ✅ Estado del juego solo en servidor (cliente recibe copia read-only)
- ✅ Validar carta en mano antes de jugar
- ✅ Validar mana disponible
- ✅ Validar targets legales
- ✅ Log completo de acciones para auditoría

**DDoS Protection:**
- Rate limiting por IP (express-rate-limit)
- Máximo de conexiones simultáneas por usuario (1)
- Timeout en matchmaking queue (5 minutos)

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
// apps/web/package.json
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

**Dependencias clave:**
- `react` + `react-dom`: Framework UI
- `framer-motion`: Animaciones
- `zustand`: State management
- `tailwindcss`: Styling utility-first
- `vitest`: Testing framework
- `@radix-ui/react-icons`: Iconos accesibles

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
- ✅ 14/14 tests de engine
- ✅ 92/92 tests de cartas
- ✅ 106/106 total (100% passing)
- ⏱️ Ejecución: <100ms

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
4. **Ciclo**: De manual completo → auto + manual Eclipse (mejor UX)
5. **Final Stand**: De simple +10 vida → bonus por clase (más interesante)

**Características pospuestas:**
- Sideboard para best-of-3 (Fase posterior)
- Torneo mode (Fase posterior)
- Replay system (Nice to have)
- Modo campaña PvE (Out of scope TFG)

---

### **3.11. Conclusiones del desarrollo**

**Logros principales:**
- ✅ Motor de juego robusto y testeado (106 tests verdes)
- ✅ 70 cartas balanceadas con mecánicas únicas
- ✅ 4 clases asimétricas completamente funcionales
- ✅ UI básica operativa con bucle de juego completo
- ✅ Documentación exhaustiva (8 archivos .md)

**Desafíos superados:**
- Complejidad del stack LIFO: tests exhaustivos
- Balance de cartas: simulaciones + teoría de juegos
- UI reactiva: Context API + performance optimizations
- Bot local: lógica simple pero efectiva

**Trabajo pendiente:**
- Deckbuilder con validación visual
- Sistema de usuarios y autenticación
- Colección y sobres con animaciones
- Backend con API REST
- Multijugador con WebSockets
- Testing de usabilidad real

**Viabilidad TFG:**
- Scope inicial ambicioso → Priorizado MVP funcional
- Fases 1-2 completas (Motor + UI básica)
- Fases 3-6 planificadas y factibles en tiempo restante
- Riesgo controlado con planning iterativo

**Aprendizajes clave:**
- Testing desde día 1 acelera desarrollo a largo plazo
- TypeScript esencial para sistemas complejos
- Documentación paralela facilita TFG enormemente
- Paper prototyping habría ahorrado tiempo en UI
- Balance requiere testing humano, no solo simulaciones