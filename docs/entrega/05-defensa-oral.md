# Defensa oral final — Infradeck

Preparación para la defensa oral. El profesorado podrá preguntar sobre arquitectura, decisiones técnicas, problemas encontrados, funcionamiento del código y planificación/evolución. El objetivo es **demostrar conocimiento real del proyecto**.

> Consejo: responder con concreción, citando archivos/módulos reales. Si no se sabe algo, reconocerlo y razonar cómo se abordaría.

---

## 1. Resumen de 30 segundos (elevator pitch)

> "Infradeck es un TCG 1v1 full-stack en TypeScript. Tiene un motor de juego propio con sistema de pila y prioridad, compartido entre cliente y servidor mediante un monorepo. Se juega contra IA en local y contra otros jugadores online con Socket.IO, con el servidor como fuente de verdad. Incluye usuarios con JWT y Google, y persistencia con Prisma y SQLite."

---

## 2. Puntos fuertes a destacar

- **Motor compartido** (`@infradeck/shared`) reutilizado en cliente y servidor.
- **Efectos declarativos con dispatcher**: cartas como datos + handlers registrados.
- **Server authoritative** en online (anti-trampas).
- **Testing desde el inicio** (engine y cartas).
- **TypeScript full-stack** para seguridad de tipos.

---

## 3. Banco de preguntas y respuestas

### Arquitectura

**P: ¿Por qué un monorepo y cómo enlazas los paquetes?**
> Para compartir el motor de juego entre frontend y backend sin duplicar lógica. Es un monorepo manual (sin workspace manager): `server` consume `shared` con `file:../shared` y dynamic imports; `web` lo resuelve con un path alias de TypeScript y un alias de Vite a `../packages/shared/src/index.ts`.

**P: ¿Por qué el engine está en un paquete aparte y no en el server o el web?**
> Porque lo necesitan los dos: el cliente para partidas vs IA y el servidor para partidas online. Tenerlo en `shared` garantiza que las reglas son idénticas en ambos lados y evita mantener dos implementaciones.

**P: Describe el flujo de una partida online.**
> El cliente conecta por Socket.IO y recibe un `playerId`. Entra en matchmaking (cola FIFO). Cuando hay dos jugadores, `GameRoomManager` crea una sala y emite `game:start` con el estado inicial. Cada acción (`game:playCard`, `game:attack`, `game:endTurn`) se valida en el servidor con el engine y se difunde `game:stateUpdate`. Al detectar vida ≤ 0 se emite `game:over`.

**P: ¿Dónde vive el estado de las partidas online?**
> In-memory, en `GameRoomManager` (`Map<roomId, GameRoom>`), con un `Map<socketId, { playerId, roomId }>` que vincula conexiones. Se pierde al reiniciar el servidor; persistirlo es una mejora pendiente.

### Decisiones técnicas

**P: ¿Qué es el sistema de efectos declarativos?**
> Las cartas se definen como datos (sus efectos son una lista de acciones). Un dispatcher (`engine/effects/dispatcher.ts`) recorre esas acciones y las ejecuta mediante `EFFECT_HANDLERS` registrados. Añadir una carta nueva normalmente no requiere tocar el motor, solo declarar sus efectos.

**P: ¿Por qué Socket.IO y no WebSockets nativos?**
> Por las rooms, la reconexión automática, el fallback y los eventos tipados. Con WebSockets nativos tendría que implementar todo eso a mano. El coste es algo más de peso, asumible para este proyecto.

**P: ¿Cómo funciona el sistema de pila (stack)?**
> Resolución LIFO con ventanas de prioridad. Las APIs clave son `getStack`, `canRespond`, `respondWithCard`, `passPriority` y `resolveStack`. Cuando se juega una carta se añade a la pila; el oponente puede responder; al pasar prioridad ambos, se resuelve el item superior.

**P: ¿Cómo balanceaste el Espécimen de Abominación?**
> Originalmente tenía costo fijo y se podía spamear. Lo cambié a **costo escalable** (5→7→9→10 maná por invocación sucesiva), y hereda habilidades del cementerio. Así se controla el abuso y se premia jugarlo en el momento adecuado.

**P: ¿Cómo gestionas la autenticación?**
> Registro/login con email y contraseña hasheada con bcryptjs; se devuelve un JWT con expiración de 7 días que viaja en `Authorization: Bearer`. El middleware `requireAuth` lo verifica en las rutas protegidas. También hay login con Google: el frontend obtiene un ID token y el backend lo verifica con `google-auth-library`.

### Problemas y soluciones

**P: ¿Cuál fue el bug más difícil?**
> El estado divergente entre la UI y el engine: la UI mantenía su propio `useState` y se desincronizaba. Lo resolví unificando todo el estado en `GameEngineProvider` como única fuente de verdad en el cliente.

**P: ¿Cómo evitaste que el bot jugara varias veces por turno?**
> Con un candado `processedTurnRef` que marca el turno ya procesado, evitando que el efecto se dispare repetidamente.

**P: ¿Hay vulnerabilidades conocidas?**
> Sí, una que tengo documentada: la identidad de cuenta (REST/JWT) y la de partida (Socket/playerId) son capas separadas; Socket.IO no valida el JWT en el handshake. La mejora es vincular socket ↔ cuenta validando el token al conectar. También falta rate limiting.

### Funcionamiento del código

**P: ¿Cómo se comparte `GameBoard` entre local y online?**
> `GameBoard` es el componente de tablero. En online, `OnlineGameBoard` lo envuelve y le inyecta el estado que llega por Socket.IO. La lógica pesada (targeting, discover, scry, bot) vive en los Contexts, no en los componentes.

**P: ¿Cómo está organizado el frontend?**
> Componentes flat en `components/`, tres Contexts (`AuthContext`, `GameEngineProvider`, `OnlineGameProvider`), un `WebSocketService` singleton en `services/`, y navegación manual con `useState<Route>` en `App.tsx` (sin React Router).

**P: ¿Qué testeas y con qué?**
> El motor y las cartas con Vitest en `shared`; el backend (utilidades de auth/economía) con el test runner de Node vía tsx. Tests del engine (pila, triggers, habilidades) y smoke tests de todas las cartas.

### Planificación y evolución

**P: ¿Cómo planificaste el proyecto?**
> Por fases iterativas: 1) motor y cartas, 2) UI de partida, 3) deckbuilder/colección, 4) usuarios y DB, 5) multijugador online, 6) pulido. Prioricé un MVP funcional antes que features opcionales para controlar el riesgo de overscope.

**P: ¿Qué quedó pendiente y por qué?**
> El deckbuilder y la colección con UI completa (el modelo de datos existe), el JWT en Socket.IO, el ranking y el pulido visual. Quedaron fuera del MVP por tiempo; prioricé tener el juego jugable de extremo a extremo.

**P: Si empezaras de nuevo, ¿qué harías distinto?**
> Vincular la identidad de Socket.IO a la cuenta desde el principio, y hacer prototipos en papel de la UI antes de programar para ahorrar iteraciones.

---

## 4. Preguntas trampa frecuentes

- **"¿Qué pasa si el objetivo de un hechizo desaparece antes de resolverse?"** → El engine valida el target en el momento de resolver; si no existe, el efecto se anula con seguridad (normalización de targets).
- **"¿Es escalable SQLite?"** → Para desarrollo sí; en producción migraría a PostgreSQL (mismo ORM Prisma, cambio de provider).
- **"¿Cómo evitas trampas en online?"** → Servidor authoritative: el cliente solo envía intenciones; el servidor valida con el engine y difunde el estado.
