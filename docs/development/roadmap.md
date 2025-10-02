# 🗺️ ROADMAP DE DESARROLLO - INFRADECK

> Plan de desarrollo actualizado con progreso actual

## 📊 **Estado Actual: Fase 2.1 - Engine MVP Completo**

### ✅ **Fase 1: Diseño de Juego (COMPLETADA)**
- [x] **Core mechanics**: 4 clases únicas balanceadas
- [x] **70 cartas**: Set completo implementado y documentado
- [x] **9 habilidades**: Sistema de keywords completo
- [x] **Reglas completas**: Documentación exhaustiva

### ✅ **Fase 2.1: Engine MVP (COMPLETADA)**
- [x] **Stack System Real**: LIFO con ventanas de prioridad
- [x] **APIs Completas**: `getStack`, `canRespond`, `respondWithCard`, `passPriority`, `resolveStack`
- [x] **Efectos Avanzados**: RANDOM_BY_ENTROPY, DISCOVER, LIFE_DIFFERENTIAL, COUNTER_SPELL
- [x] **14 Engine Tests**: Cobertura completa de mecánicas
- [x] **92 Card Tests**: Validación de todas las cartas
- [x] **Arquitectura TypeScript**: Monorepo con shared package

## 🎯 **Próximas Fases**

### 📋 **Fase 3: UI Mínima (SIGUIENTE - Prioridad Alta)**

#### **3.1 CLI Interface (Semana 1-2)**
```bash
# Objetivo: Jugar partidas desde terminal
infradeck play --player1 deck1.json --player2 deck2.json

# Features:
- Mostrar estado del juego (manos, tablero, stack)
- Input para acciones: playCard, respondWithCard, passPriority
- Logs detallados de todas las acciones
- Selección de objetivos para cartas
```

#### **3.2 Web UI Básica (Semana 3-4)**
```tsx
// Objetivo: Interfaz web mínima
<GameBoard>
  <PlayerHand cards={hand} onPlayCard={handlePlay} />
  <Battlefield creatures={board} />
  <StackDisplay stack={getStack(state)} />
  <PriorityIndicator canRespond={canRespond(state, 0)} />
  <ActionLog events={gameLog} />
</GameBoard>
```

**Componentes Clave:**
- [x] **Estado**: Integración con engine existente
- [ ] **Display**: Cartas, tablero, stack visual
- [ ] **Interacción**: Click para jugar, pasar prioridad
- [ ] **Targeting**: Selección de objetivos para cartas
- [ ] **Responsive**: Funciona en mobile y desktop

### 🔧 **Fase 4: Engine Expansión (Paralelo)**

#### **4.1 Más Cartas de Caos**
- [ ] **RANDOM_BY_ENTROPY + consumeEntropy**: Más cartas usando el sistema
- [ ] **Balancing**: Ajustar poder de efectos aleatorios
- [ ] **New mechanics**: Expandir el sistema de Entropía

#### **4.2 Mejoras de Engine**
- [ ] **COUNTER_TARGET_ON_STACK**: Contrarrestar items específicos en pila
- [ ] **Objetivos desaparecidos**: Handling cuando target muere antes de resolución
- [ ] **UI Integration**: Hooks y utilities para React

### 🌐 **Fase 5: Multiplayer (Futuro)**

#### **5.1 Backend Setup**
- [ ] **NestJS + Socket.io**: Real-time game server
- [ ] **Game Rooms**: Crear y unirse a partidas
- [ ] **State Sync**: Sincronización bidireccional
- [ ] **Reconnection**: Handle de desconexiones

#### **5.2 Features Multiplayer**
- [ ] **Matchmaking**: Sistema de emparejamiento
- [ ] **Spectator Mode**: Ver partidas en progreso
- [ ] **Replay System**: Guardar y reproducir partidas
- [ ] **Ranking**: Sistema de clasificación

## 🛠️ **Stack Tecnológico Actualizado**

### **✅ Implementado**
```typescript
// Core Game Engine
packages/shared/
├── src/engine/game-state.ts       // ⚙️ Engine principal
├── src/cards/                     // 🃏 70 cartas
├── src/types/                     // 📝 Types completos
└── tests/                         // 🧪 106 tests verdes
```

### **📋 Siguiente (Fase 3)**
```typescript
// UI Development
apps/web/                          // 🖥️ React app
├── src/components/GameBoard/      // 🎮 Componentes de juego
├── src/hooks/useGameEngine/       // 🔗 Integration hooks  
├── src/utils/gameDisplay/         // 🎨 Display utilities
└── src/pages/PlayPage/            // 📄 Game page
```

### **🔮 Futuro (Fase 5)**
```typescript
// Backend + Multiplayer
apps/api/                          // 🔧 NestJS backend
├── src/game/GameService/          // 🎲 Game management
├── src/rooms/RoomGateway/         // 🌐 Socket.io gateway
└── src/matchmaking/               // ⚔️ Player matching
```

## 📈 **Métricas de Progreso**

### **Actual**
- **📊 Progreso Total**: ~75%
- **⚙️ Engine**: 100% (funcional con stack real)
- **🃏 Cartas**: 100% (70 cartas implementadas)
- **🧪 Tests**: 106/106 verdes
- **🖥️ UI**: 0% (próximo objetivo)

### **Objetivos Fase 3** (4-6 semanas)
- **🖥️ CLI Interface**: 100%
- **🌐 Web UI Básica**: 80%
- **🎮 Playable Game**: Single-player completo
- **📱 Mobile Responsive**: Funciona en todos los devices

## 🎯 **Decisiones Técnicas Recientes**

### **Stack System Implementation**
- **Comportamiento**: LIFO real, no resolución inmediata
- **Priority Windows**: Ambos jugadores deben pasar para resolver
- **APIs**: Conjunto completo para UI integration

### **COUNTER_SPELL Current**
- **Implementación**: Flag `counterSpellPending` por jugador
- **Comportamiento**: Contrarresta próximo hechizo, no items en stack
- **UI Consideration**: Mostrar estado "counter pending"

### **Testing Strategy**
- **Engine Tests**: 14 tests cubren todas las mecánicas
- **Card Tests**: 92 tests validan cada carta
- **Integration**: Tests de end-to-end scenarios

## 📋 **Next Actions (Immediate)**

### **Semana 1-2: CLI Setup**
1. **Project Structure**: Setup de apps/cli en el monorepo
2. **Game Display**: Función para mostrar estado del juego
3. **Input Handling**: Parser para comandos de usuario
4. **Game Loop**: Ciclo principal CLI con engine integration

### **Semana 3-4: Web UI Foundation**  
1. **React Setup**: apps/web con Vite + TypeScript
2. **Engine Integration**: Hooks para usar game-state
3. **Basic Components**: Hand, Board, Stack display
4. **Styling Foundation**: Tailwind setup con componentes base

### **Próximas Decisiones Pendientes**
- **UI Framework**: ¿React + Tailwind o alternativa?
- **State Management**: ¿Zustand, Redux, o solo React state?
- **Animation Library**: ¿Framer Motion para transiciones?
- **Deployment**: ¿Vercel, Netlify, o self-hosted?

---

## 🚀 **Ready to Build UI**

**El engine está completo y probado. Todo está listo para crear la interfaz de usuario y hacer el juego jugable visualmente.**

**Próximo commit objetivo: CLI funcional que permita jugar partidas completas desde terminal.**

---

*Última actualización: 2 octubre 2025*