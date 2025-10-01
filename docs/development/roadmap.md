# Roadmap de Desarrollo

Estado actual
- Engine MVP con stack real y prioridad completa.
- Cobertura de tests funcionales (engine + stack) completada.

Siguientes hitos (orden sugerido)
1) UI mínima (CLI/Web):
   - Mostrar mano, fase, pila, prioridad.
   - Acciones: playCard, respondWithCard, passPriority.
2) Ampliar cartas de Caos con RANDOM_BY_ENTROPY + consumeEntropy en más diseños.
3) Tests adicionales:
   - Objetivo desaparecido antes de la resolución.
   - Interacciones múltiples en la misma ventana de prioridad.
4) (Opcional) Diseño/implementación de COUNTER_TARGET_ON_STACK para contrarrestar items ya en la pila.

Notas técnicas
- PRIORIDAD: se abre en cada cambio de fase y tras jugar/trigger de efectos.
- STACK: LIFO, resolución cuando ambos jugadores pasan.
- COUNTER_SPELL (actual): estado pendiente por jugador, no apunta al stack.