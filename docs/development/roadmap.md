🗺️ ROADMAP DE DESARROLLO - INFRADECK

📊 Estado Actual
Motor de juego y cartas: 100% funcional
UI básica: en progreso (mano → jugar carta → combate → fin de turno)
Sistema de clases, Final Stand y mecánicas avanzadas: implementadas
Tests: 106 verdes (engine + cartas)
Siguiente paso: UI completa, deckbuilder, colección, sobres y multijugador online

📆 Línea de Tiempo y Fases

Fase 1: Motor de Juego y Cartas (Completada)
- Diseño y balance de clases y cartas
- Implementación del engine (turnos, stack, Final Stand, mecánicas de clase)
- Tests unitarios y de integración
- Documentación de reglas y mecánicas

Fase 2: UI Básica (Cerrando)
- UI web mínima operativa:
  - Mano conectada al engine (resolver global, mazos de muestra)
  - Jugar carta por click con bloqueo por maná
  - Tablero con `Card` estilizada
  - Vida visible en ambos héroes (targeteable para ataque del rival)
  - Combate por selección (atacante → criatura/héroe)
  - Fases y fin de turno en un botón
  - Bot simple local (juega, ataca y finaliza turno con candado por turno)
- Pendiente en Fase 2:
  - UI de selección de objetivos (hechizos/instantáneas)
  - Visualización básica de prioridad/pila

Fase 3: Deckbuilder y Colección (Próxima)
- Construcción y persistencia de mazos por usuario
- Selección de clase y mazo antes de jugar
- Integración de validaciones de mazo (ya disponibles en shared)
- Logs/feedback de acciones (ataques, triggers, pila)

Fase 4: Sistema de Usuario y Progreso
- Registro/login (email, Google)
- Guardado de colección, decks y progreso en base de datos
- Perfil de usuario y estadísticas

Fase 5: Multijugador y Backend
- Emparejamiento online y salas de juego
- Sincronización de estado en tiempo real (WebSockets)
- Modo espectador y repeticiones
- Ranking y logros

Fase 6: UI Avanzada y Experiencia de Juego
- Animaciones (ataques, invocación, muerte)
- Pantalla de victoria/derrota y estadísticas
- Responsive para móvil y desktop
- Pulido visual y feedback avanzado

Notas técnicas recientes
- Unificado estado en `GameEngineProvider` (evita estados divergentes)
- Resolver inicializado con `useLayoutEffect` (mano visible desde primer render)
- Enderezado explícito de criaturas al inicio de turno desde el provider (refuerzo)
- Bot con “candado” por turno (`processedTurnRef`) para evitar doble actuación