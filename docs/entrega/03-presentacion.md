# Presentación del proyecto — Infradeck

Guion para la presentación visual (PowerPoint, Canva, Google Slides). Cada diapositiva indica **título**, **contenido mínimo** (poco texto, ideas clave) y **qué mostrar** (captura/esquema). Evitar bloques largos de texto.

> Recomendación: 12-14 slides, regla 1 idea por slide, mucha imagen/diagrama. Paleta por clase: Abominación (verde tóxico), Caos (rojo/naranja), Vitalidad (carmesí).

---

## Slide 1 — Portada

- **Título:** Infradeck — TCG 1v1 digital full-stack
- Nombre del alumno/a, módulo, fecha.
- **Visual:** logo / arte de carta de fondo.

## Slide 2 — ¿Qué es Infradeck?

- Juego de cartas coleccionables 1v1, vs IA y online.
- 3 clases asimétricas, motor de juego propio.
- **Visual:** captura del tablero de partida.

## Slide 3 — El problema / nicho

- TCG: o accesibles pero poco profundos, o profundos pero difíciles.
- Infradeck busca el punto intermedio (stack + accesibilidad).
- **Visual:** eje "accesible ↔ profundo" con Hearthstone, Magic e Infradeck.

## Slide 4 — Objetivos

- Motor de juego robusto (pila, prioridad, triggers).
- UI de partida completa.
- Usuarios + persistencia.
- Multijugador online.
- **Visual:** lista con iconos de check.

## Slide 5 — Las 3 clases

- Abominación → Espécimen escalable.
- Caos → Entropía y efectos aleatorios.
- Vitalidad → sacrificar vida por poder.
- **Visual:** 3 cartas representativas, una por clase, con su color.

## Slide 6 — Stack tecnológico

- Frontend: React + Vite + Tailwind + Framer Motion.
- Backend: Node + Express + Socket.IO.
- DB: Prisma + SQLite. Auth: JWT + Google.
- Todo TypeScript en monorepo.
- **Visual:** logos del stack agrupados por capa.

## Slide 7 — Arquitectura

- Cliente (React) ↔ Servidor (Express + Socket.IO) ↔ DB (SQLite).
- Motor de juego compartido (`@infradeck/shared`) en cliente y servidor.
- **Visual:** diagrama de 3 capas (reusar el de la memoria).

## Slide 8 — Motor de juego

- Pila LIFO + prioridad, efectos declarativos con dispatcher.
- Cartas definidas como datos, ejecutadas por handlers.
- 9 habilidades + Final Stand.
- **Visual:** esquema "carta (datos) → dispatcher → handler → estado".

## Slide 9 — Multijugador online

- Matchmaking FIFO + salas Socket.IO.
- Servidor authoritative: valida y difunde estado.
- **Visual:** diagrama de flujo (matchmaking → game:start → loop → game:over).

## Slide 10 — Sistema de usuarios

- Registro/login email + Google OAuth.
- JWT, perfiles, monedas, colección y mazos persistidos.
- **Visual:** captura de la pantalla de login + perfil.

## Slide 11 — Demo (capturas)

- Partida vs IA, modal de targeting, discover/scry.
- Partida online entre 2 jugadores.
- **Visual:** 2-3 capturas reales del juego en acción.

## Slide 12 — Problemas y soluciones

- Estado divergente → único estado en Provider.
- Espécimen spam → costo escalable.
- Engine en server (ESM) → dynamic imports.
- **Visual:** tabla corta problema → solución (3 filas).

## Slide 13 — Evolución del proyecto

- Fases 1→6: motor → UI → usuarios → online → pulido.
- **Visual:** línea de tiempo / Gantt simplificado.

## Slide 14 — Conclusiones y futuro

- Logrado: juego jugable local + online, engine testeado.
- Futuro: deckbuilder completo, JWT en Socket, ranking, PostgreSQL.
- **Visual:** cierre con call-to-action / demo en vivo.

---

## Consejos de presentación

- Una idea por slide; el texto es apoyo, no guion.
- Usa capturas reales del juego, no mockups genéricos.
- Reserva 1-2 minutos para una demo en vivo si es posible (Slide 11).
- Mantén coherencia visual con la paleta de clases del juego.
