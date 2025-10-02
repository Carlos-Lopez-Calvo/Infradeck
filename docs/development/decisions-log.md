# 📋 DECISIONS LOG - INFRADECK

> Registro de decisiones técnicas y de diseño tomadas durante el desarrollo

## 🎯 **Decisiones de Arquitectura**

### **✅ Monorepo con PNPM Workspaces (Sept 2025)**
**Decisión**: Usar monorepo con pnpm workspaces  
**Razón**: Compartir lógica de juego entre frontend/backend  
**Alternativas**: Separate repos, Lerna, Nx  
**Resultado**: ✅ Funciona perfectamente, shared package reutilizable

### **✅ TypeScript Full Stack (Sept 2025)**
**Decisión**: TypeScript en todos los packages  
**Razón**: Type safety crítica para lógica de juego compleja  
**Alternativas**: JavaScript + JSDoc  
**Resultado**: ✅ Prevención de bugs, mejor DX

### **✅ Shared Game Engine Package (Sept 2025)**
**Decisión**: Centralizar toda la lógica en `@infradeck/shared`  
**Razón**: Evitar duplicación y desincronización  
**Alternativas**: Logic en backend, sync manual  
**Resultado**: ✅ Single source of truth, fácil testing

## 🎲 **Decisiones de Mecánicas de Juego**

### **✅ Stack System Real vs Resolución Inmediata (Oct 2025)**
**Decisión**: Implementar stack LIFO real con ventanas de prioridad  
**Razón**: Permite counterplay y decisiones tácticas profundas  
**Alternativas**: Hearthstone-style (resolución inmediata)  
**Implementación**:
```typescript
// Priority windows completas
getStack(state): StackItem[]
canRespond(state, playerIndex): boolean  
respondWithCard(state, ...): PlayResult
passPriority(state, playerIndex): void
resolveStack(state): void
```
**Resultado**: ✅ 14 tests validando mecánica compleja

### **✅ COUNTER_SPELL como Flag Pendiente (Oct 2025)**
**Decisión**: Counter no cancela items en stack, marca flag pendiente  
**Razón**: Más simple de implementar, diferente a Magic  
**Alternativas**: Counter directo de stack items  
**Comportamiento**: 
- Counter marca `counterSpellPending: true`
- Próximo hechizo del oponente es cancelado
- Flag se consume al cancelar
**Resultado**: ✅ Funciona bien, UI puede mostrar estado

### **✅ Espécimen con Costo Escalable (Oct 2025)**
**Decisión**: Espécimen cuesta 5→7→9→10 por invocación  
**Razón**: Evita spam, reward setup, late-game scaling  
**Alternativas**: Costo fijo, costo por habilidades  
**Mecánica**: 
```typescript
// Tracker en game state
specimenSummons: { [playerIndex]: number }
// Costo = 5 + (summons * 2), cap en 10
```
**Resultado**: ✅ Balanceado, reward engine building

### **✅ Entropy System con Generation/Consumption (Oct 2025)**
**Decisión**: Entropy persiste entre turnos, generation abundante, consumption limitado  
**Razón**: Permite planning, decisions de cuándo gastar  
**Stats actuales**:
- **Generators**: 4+ cartas
- **Consumers**: 1 carta (MANIPULADOR_DEL_DESTINO)
- **Scalers**: 4 cartas usan entropy sin consumir
**Resultado**: ✅ Sistema balanceado, 32/32 tests Caos

## 🔧 **Decisiones Técnicas**

### **✅ Vitest sobre Jest (Sept 2025)**
**Decisión**: Usar Vitest para testing  
**Razón**: Mejor integración con Vite, más rápido, mejor DX  
**Alternativas**: Jest, Node test runner  
**Resultado**: ✅ 106 tests ejecutan en <100ms

### **✅ Timing Enums Específicos (Oct 2025)**
**Decisión**: `ON_ENTER` vs `ON_PLAY` vs `INSTANT` vs `END_OF_TURN`  
**Razón**: Precision en timing de efectos  
**Uso**:
- `ON_PLAY`: Hechizos cuando se juegan
- `ON_ENTER`: Criaturas al entrar al campo  
- `INSTANT`: Efectos instantáneos
- `END_OF_TURN`: Triggers al final del turno
**Resultado**: ✅ Claridad en execution order

### **✅ Effect Actions con Tipos Específicos (Oct 2025)**
**Decisión**: `EffectActionType` enum extenso vs generic actions  
**Razón**: Type safety, autocomplete, validation  
**Tipos implementados**:
```typescript
DAMAGE, HEAL, SUMMON_CREATURE, DRAW_CARDS, 
GAIN_ENTROPY, BUFF_STATS, TRANSFORM, 
DISCOVER_FROM_GRAVEYARD, LIFE_DIFFERENTIAL, 
RANDOM_BY_ENTROPY, COUNTER_SPELL
```
**Resultado**: ✅ Extensible, type-safe

## 🎨 **Decisiones de Testing**

### **✅ Dual Test Strategy (Oct 2025)**
**Decisión**: Tests separados para engine (14) y cards (92)  
**Razón**: Engine tests más complejos, card tests más unitarios  
**Estructura**:
- **Engine**: Scenarios completos con múltiples cartas
- **Cards**: Validación individual + synergies  
**Resultado**: ✅ 106/106 tests green, coverage completa

### **✅ Test Data Separation (Oct 2025)**
**Decisión**: Mock cards en engine tests, real cards en card tests  
**Razón**: Engine tests no deben romper por card changes  
**Implementación**: 
- Engine usa `createMockCard()` helpers
- Card tests importan cartas reales
**Resultado**: ✅ Tests estables y mantenibles

## 🚫 **Decisiones Rechazadas**

### **❌ Magic-style Counterspell (Oct 2025)**
**Rechazada**: Counter directo de items en stack  
**Razón**: Complejidad alta, edge cases difíciles  
**Problema**: ¿Qué pasa si target desaparece antes de counter?  
**Alternativa elegida**: Counter como flag pendiente

### **❌ Hearthstone-style Resolution (Oct 2025)**
**Rechazada**: Resolución inmediata sin stack  
**Razón**: Menos profundidad estratégica, menos counterplay  
**Problema**: No permite respuestas a amenazas  
**Alternativa elegida**: Stack LIFO real

### **❌ Resource Sharing entre Clases (Sept 2025)**
**Rechazada**: Clases híbridas con múltiples resources  
**Razón**: Complejidad innecesaria, identidad diluida  
**Problema**: Balance nightmare, deck building confusion  
**Alternativa elegida**: Una class resource por clase

### **❌ Auto-resolving Stack (Oct 2025)**
**Rechazada**: Stack se resuelve automáticamente sin priority  
**Razón**: Elimina counterplay, timing strategy  
**Problema**: No permite instant responses  
**Alternativa elegida**: Priority windows explícitas

## 🔮 **Decisiones Pendientes (Fase 3)**

### **🤔 UI Framework Choice**
**Opciones**: React + Tailwind, Vue + UnoCSS, Svelte + CSS  
**Consideraciones**: Familiaridad, ecosystem, performance  
**Timeline**: Decidir en Semana 1 de Fase 3

### **🤔 State Management**
**Opciones**: Zustand, Redux Toolkit, React Context  
**Consideraciones**: Complexity, devtools, game state sync  
**Timeline**: Decidir durante UI architecture

### **🤔 Animation Library**
**Opciones**: Framer Motion, React Spring, CSS transitions  
**Consideraciones**: Performance, bundle size, card animations  
**Timeline**: Decidir después de basic UI

### **🤔 Deployment Strategy**
**Opciones**: Vercel + Railway, Netlify + Heroku, Self-hosted  
**Consideraciones**: Cost, scalability, CI/CD integration  
**Timeline**: Decidir en Fase 5 (Multiplayer)

## 📊 **Impact Assessment**

### **Decisiones de Alto Impacto** ✅
1. **Stack System Real**: Definió la complejidad del juego
2. **Monorepo Architecture**: Permitió shared package exitoso  
3. **TypeScript Full**: Prevención de bugs críticos
4. **Espécimen Scaling**: Balanceó la clase ABOMINACIÓN

### **Decisiones de Medio Impacto** ✅
1. **Vitest Choice**: Mejor DX pero no crítico
2. **Counter as Flag**: Simplificó implementación
3. **Timing Enums**: Mejoró clarity pero agregó complexity

### **Decisiones Correctas Validadas** ✅
- **All tests green**: Arquitectura permite testing completo
- **Easy card addition**: Adding new cards es straightforward
- **Engine stability**: 0 bugs críticos encontrados
- **Type safety**: 0 runtime type errors

## 🎯 **Lessons Learned**

### **Keep Engine Simple**
Las decisiones que simplificaron el engine (Counter flag, Espécimen scaling) resultaron en código más mantenible.

### **Tests Drive Design**
Escribir tests primero forzó APIs más limpio y casos edge considerados temprano.

### **Type Safety Worth It**
TypeScript overhead pagó dividendos en prevención de bugs y refactoring confidence.

### **Separation of Concerns**
Engine tests vs Card tests separation permitió evolución independiente.

---

## 🚀 **Ready for Next Phase**

**Todas las decisiones críticas de engine están tomadas y validadas. Fase 3 se enfoca en decisiones de UI y UX.**

---

*Última actualización: 2 octubre 2025*