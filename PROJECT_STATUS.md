# Project Status
## Objetivo del proyecto
Construir una web app full‑stack de un juego de cartas (frontend React, backend Node/WS) reutilizando `@infradeck/shared` como única fuente de lógica de juego.

Estado actual
- Engine MVP completo con stack real (LIFO) y ventanas de prioridad.
- APIs expuestas para interacción de prioridad (getStack, canRespond, respondWithCard, passPriority, resolveStack).
- 14/14 tests verdes: triggers START/END_OF_TURN, Sigilo, Vuelo, RANDOM_BY_ENTROPY, DISCOVER_FROM_GRAVEYARD, LIFE_DIFFERENTIAL, DOBLE_GOLPE, Espécimen, LIFO y counters encadenados.

Decisiones recientes
- COUNTER_SPELL: contrarresta el próximo hechizo del oponente (pendiente), no cancela items ya en pila.
- FREE_SUMMON_THIS_TURN: debe resolverse antes de invocar para que el coste sea 0 ese turno.

Siguientes hitos
- UI mínima para visualizar/responder en el stack.
- Ampliar cartas de Caos con RANDOM_BY_ENTROPY + consumeEntropy.
- Tests de “objetivo desaparecido” al resolver la pila.
- (Opcional) Nuevo tipo COUNTER_TARGET_ON_STACK si queremos contrarrestar elementos ya en pila.