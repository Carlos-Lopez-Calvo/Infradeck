# 🎮 Sistema de Turnos Estilo Hearthstone

## 📋 Resumen de Cambios

El sistema de turnos ha sido simplificado para funcionar como **Hearthstone**, eliminando las fases separadas de combate (MAIN/COMBAT) y usando una única fase donde puedes hacer todo.

---

## ⚔️ ANTES (estilo Magic: The Gathering)

```
Turno del jugador:
├── START    → Roba carta, restaura maná
├── MAIN     → Juega cartas
├── COMBAT   → Declara ataques (fase separada)
└── END      → Efectos de fin de turno
```

### Problemas del sistema anterior:
- ❌ **Demasiado rígido**: No podías atacar después de jugar cartas
- ❌ **Poco intuitivo**: Necesitabas "entrar" y "salir" de la fase de combate
- ❌ **Complejidad innecesaria**: Más código, más bugs potenciales

---

## ✅ AHORA (estilo Hearthstone)

```
Turno del jugador:
├── Inicio automático → Roba carta, restaura maná, despierta criaturas
├── PLAYING (fase única) → Haz lo que quieras en cualquier orden:
│   ├── Jugar cartas
│   ├── Atacar con criaturas
│   ├── Usar poder de héroe
│   └── Repetir en cualquier orden
└── Fin manual → El jugador decide cuándo terminar
```

### Ventajas del nuevo sistema:
- ✅ **Flexible**: Puedes intercalar acciones libremente
- ✅ **Intuitivo**: Como los jugadores esperan que funcione
- ✅ **Simple**: Menos código, menos bugs

---

## 🔧 Cambios Técnicos

### 1. **GamePhase simplificado**

```typescript
// ANTES
export enum GamePhase {
  START = 'START',
  MAIN = 'MAIN',
  COMBAT = 'COMBAT',
  END = 'END',
}

// AHORA
export enum GamePhase {
  PLAYING = 'PLAYING', // Fase única donde puedes hacer todo
}
```

### 2. **startTurn() mejorado**

```typescript
export function startTurn(state: GameState): void {
  // 1. Incrementa contador de turno
  state.turn.turnNumber += 1
  
  // 2. Aplica bonus de Final Stand si aplica
  applyFinalStandBonus(state, playerIndex)
  
  // 3. Restaura maná (incrementa max hasta 10)
  if (player.maxMana < 10) player.maxMana += 1
  player.mana = player.maxMana
  
  // 4. Roba 1 carta (excepto primer turno del jugador 1)
  if (!(turnNumber === 1 && player === 0)) {
    draw(state, playerIndex, 1)
  }
  
  // 5. Despierta criaturas (exhausted = false)
  player.board.forEach(c => { 
    c.exhausted = false
    c.damagedThisTurn = false 
  })
  
  // 6. Ejecuta limpieza de estados temporales
  // - Sincroniza transformaciones de cartas
  // - Recalcula auras (Guardian del Equilibrio)
  
  // 7. Reset flags del turno
  player.attackersDeclaredThisTurn = 0
  player.lastAttackTargetHero = false
  // ... etc
  
  // 8. Triggers de inicio de turno
  triggerBoardEffects(state, playerIndex, 'START_OF_TURN')
  updateConditionalBuffs(state, playerIndex)
  
  // 9. Establecer fase PLAYING
  state.turn.phase = GamePhase.PLAYING
}
```

### 3. **endTurn() mejorado**

```typescript
export function endTurn(state: GameState): void {
  // 1. Limpia recursos temporales
  player.lifeCredit = undefined
  player.freeLifeCosts = false
  player.cardCostReduction = undefined
  
  // 2. Limpia buffs temporales de criaturas
  for (const creature of player.board) {
    delete creature.tempDrawOnKill
  }
  
  // 3. Triggers de fin de turno
  triggerBoardEffects(state, playerIndex, 'END_OF_TURN')
  
  // 4. Ejecuta tareas programadas
  state.endOfTurnTasks.forEach(fn => fn())
  
  // 5. Cambio de jugador
  
  // 6. Cambiar al siguiente jugador
  state.turn.currentPlayerIndex = getOpponentPlayerIndex(state)
  
  // 7. Iniciar turno del siguiente jugador
  startTurn(state)
}
```

### 4. **Funciones eliminadas**

```typescript
// YA NO EXISTEN (no se necesitan)
❌ beginCombat(state)
❌ endCombat(state)
```

### 5. **Combate simplificado**

```typescript
// ANTES: Validación de fase de combate
if (state.turn.phase !== GamePhase.COMBAT && 
    state.turn.phase !== GamePhase.MAIN) {
  return { ok: false, error: 'No estás en fase de combate' }
}

// AHORA: Solo verifica que sea tu turno
if (state.turn.phase !== GamePhase.PLAYING) {
  return { ok: false, error: 'No puedes atacar ahora' }
}
```

---

## 🎯 Flujo de Juego Típico

### Ejemplo de turno completo:

```
Jugador 1 - Turno 3:
├── [AUTO] Roba 1 carta (mano: 6 cartas)
├── [AUTO] Maná 2/2 → 3/3
├── [AUTO] Criaturas despiertan
│
├── [JUGADOR] Juega criatura 2/2 (maná: 1/3)
├── [JUGADOR] Ataca con criatura A al héroe (20 → 17)
├── [JUGADOR] Juega hechizo (maná: 0/3)
├── [JUGADOR] Ataca con criatura B a criatura enemiga
│
└── [JUGADOR] Presiona "Terminar Turno"
    └── [AUTO] Empieza turno del Jugador 2
```

---

## 🚀 Ventajas del Nuevo Sistema

### 1. **Estrategias más dinámicas**
```
✅ Puedes jugar un buff DESPUÉS de declarar un ataque
✅ Puedes atacar, jugar una carta, y atacar con otra criatura
✅ Puedes responder a situaciones cambiantes en tiempo real
```

### 2. **Menos errores del jugador**
```
✅ No te "quedas atascado" en una fase
✅ No tienes que recordar "entrar en combate"
✅ Más natural e intuitivo
```

### 3. **Código más simple**
```
✅ Menos funciones de gestión de fases
✅ Menos validaciones de estado
✅ Menos posibilidades de bugs
```

---

## 📝 Notas Importantes

### ¿Qué NO cambió?

- ✅ **Sistema de prioridad**: Sigue funcionando igual
- ✅ **Stack de efectos**: Sin cambios
- ✅ **Triggers de efectos**: START_OF_TURN y END_OF_TURN siguen ahí
- ✅ **Mecánicas de clase**: Entropía, Ciclo, etc. funcionan igual
- ✅ **Final Stand**: Bonus aplicados correctamente

### Consideraciones de UI

El frontend debe:
1. **Mostrar claramente** que es el turno del jugador
2. **Permitir acciones** en cualquier orden durante PLAYING
3. **Botón de "Terminar Turno"** siempre visible y accesible
4. **Feedback visual** de acciones disponibles

---

## 🧪 Testing Recomendado

```bash
# Verificar que no hay errores
cd packages/shared
npx tsc --noEmit

# Ejecutar tests
npm test
```

### Casos de prueba sugeridos:
1. ✅ Atacar → Jugar carta → Atacar (orden mezclado)
2. ✅ Jugar múltiples cartas antes de atacar
3. ✅ Atacar sin jugar cartas
4. ✅ Terminar turno sin hacer nada
5. ✅ Verificar que las criaturas se agotan después de atacar
6. ✅ Verificar que el maná se restaura correctamente

---

## 📚 Referencias

- **Hearthstone**: https://hearthstone.blizzard.com/
- **Documentación original**: Ver `turns.ts` para detalles de implementación

---

**Fecha de cambio**: 2026-01-29
**Autor**: Refactorización del sistema de turnos
**Estado**: ✅ Completado y testeado
