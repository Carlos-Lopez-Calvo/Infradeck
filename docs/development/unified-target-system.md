# Sistema Unificado de Selección de Objetivos

## Resumen

Hemos unificado todas las interfaces de selección de objetivos en un solo componente: `UnifiedTargetModal`.

### Antes (5 interfaces diferentes)
- `targetModal` - Para seleccionar criaturas enemigas o aliadas
- `attackSpellModal` - Para ATTACK_SPELL (2 pasos: atacante + defensor)  
- Modal específico para héroes
- Modal específico para criaturas aliadas
- Modal específico para efectos especiales

### Ahora (1 sola interfaz)
- `UnifiedTargetModal` - Una interfaz inteligente que muestra solo los objetivos válidos

## Tipos de Objetivo (`TargetType`)

El componente unificado soporta los siguientes tipos:

```typescript
type TargetType = 
  | 'HERO_SELF'           // Solo héroe aliado
  | 'HERO_ENEMY'          // Solo héroe enemigo
  | 'CREATURE_SELF'       // Solo criaturas aliadas
  | 'CREATURE_ENEMY'      // Solo criaturas enemigas
  | 'ANY_CREATURE'        // Cualquier criatura (aliada o enemiga)
  | 'ANY_CHARACTER'       // Cualquier objetivo (héroes + criaturas)
  | 'DUAL_CREATURES'      // Dos criaturas (ej: atacante + defensor para ATTACK_SPELL)
```

## Características

### 1. Visualización Contextual
- Solo muestra los objetivos válidos según el `TargetType`
- Botones de héroe solo aparecen si son objetivos válidos
- Criaturas se muestran organizadas por jugador

### 2. Soporte Multi-paso
- Para efectos como ATTACK_SPELL que requieren seleccionar múltiples objetivos
- Indicador de paso actual (ej: "Paso 1 de 2")
- Botón "Volver" para corregir selecciones anteriores

### 3. Feedback Visual
- Bordes de colores según el tipo:
  - Verde: Selección de aliados
  - Rojo: Selección de enemigos
  - Azul: Selección general
- Hover effects para mejorar la UX
- Criaturas no válidas (ej: sin ataque) se muestran deshabilitadas

### 4. Responsive
- Grid adaptativo que funciona en diferentes tamaños de pantalla
- Máximo 5 columnas en pantallas grandes
- 2 columnas en móviles

## Cómo Usar

### Ejemplo 1: Seleccionar criatura enemiga

```typescript
setUnifiedTargetModal({
  playerIndex: 0,
  handIndex: 2,
  targetType: 'CREATURE_ENEMY',
  onComplete: (selection) => {
    setUnifiedTargetModal(null)
    // selection = { type: 'CREATURE', playerType: 'ENEMY', index: 3 }
    // Aplicar efecto...
  }
})
```

### Ejemplo 2: ATTACK_SPELL (dual selection)

```typescript
setUnifiedTargetModal({
  playerIndex: 0,
  handIndex: 5,
  targetType: 'DUAL_CREATURES',
  step: 1,
  onComplete: (selection) => {
    if (selection.type === 'DUAL') {
      // Segunda selección completa
      setUnifiedTargetModal(null)
      // selection = { type: 'DUAL', attacker: {...}, defender: {...} }
      // Aplicar efecto...
    } else {
      // Primera selección, ir al paso 2
      setUnifiedTargetModal({
        playerIndex: 0,
        handIndex: 5,
        targetType: 'DUAL_CREATURES',
        step: 2,
        previousSelection: selection,
        onComplete: (selection2) => {
          // Ahora sí, aplicar con ambas selecciones
        }
      })
    }
  }
})
```

### Ejemplo 3: Cualquier objetivo (héroe o criatura)

```typescript
setUnifiedTargetModal({
  playerIndex: 0,
  handIndex: 1,
  targetType: 'ANY_CHARACTER',
  onComplete: (selection) => {
    setUnifiedTargetModal(null)
    if (selection.type === 'HERO') {
      // selection = { type: 'HERO', playerType: 'SELF' | 'ENEMY' }
    } else {
      // selection = { type: 'CREATURE', playerType: 'SELF' | 'ENEMY', index: N }
    }
  }
})
```

## Formato de Selección (`TargetSelection`)

El callback `onComplete` recibe una de estas estructuras:

```typescript
type TargetSelection = 
  | { type: 'HERO'; playerType: 'SELF' | 'ENEMY' }
  | { type: 'CREATURE'; playerType: 'SELF' | 'ENEMY'; index: number }
  | { 
      type: 'DUAL'
      attacker: { playerType: 'SELF'; index: number }
      defender: { playerType: 'ENEMY'; index: number }
    }
```

## Beneficios

1. **Menos código duplicado**: Una sola implementación en lugar de 5
2. **Consistencia UX**: Mismo look & feel en todas las selecciones
3. **Mantenimiento fácil**: Un solo lugar para corregir bugs o agregar features
4. **Extensible**: Agregar nuevos `TargetType` es trivial
5. **Tipado fuerte**: TypeScript garantiza que los tipos sean correctos

## Próximos Pasos

- [ ] Agregar animaciones de transición entre pasos
- [ ] Soporte para selección múltiple (ej: "selecciona hasta 2 criaturas")
- [ ] Preview del efecto que se aplicará al objetivo
- [ ] Historial de selecciones para efectos complejos
