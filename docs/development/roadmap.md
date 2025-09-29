# 🗺️ ROADMAP DE DESARROLLO

> Plan completo desde concepto hasta webapp funcional

## 🎯 **Visión General**

**Objetivo**: Webapp de juego de cartas 1v1 con mecánicas únicas, partidas rápidas y depth estratégico.

**Timeline Estimado**: 6-12 meses para MVP completo  
**Metodología**: Iterativo, design-first, validation-driven

---

## 📊 **Estado Actual** (26 Sep 2025)

### ✅ **COMPLETADO (Fase 0)**
- **Game Design**: 4 clases únicas, 18 cartas balanceadas
- **Core Rules**: Sistema completo de reglas y mecánicas  
- **Documentation**: Estructura modular y completa
- **Balance Theory**: Análisis inicial y predicciones de meta
- **Simulation**: 2 partidas completas simuladas

### 🎯 **Progreso General**: 100% (Design Complete)
- **Design**: 100% ✅
- **Development**: 0% ❌
- **Testing**: 15% ⚠️ (simulaciones completas, paper testing pendiente)

---

## 🚀 **FASE 1: Validación del Diseño** (1-2 semanas)

### **📋 Objetivos**
- Validar mecánicas core via paper testing
- Identificar problemas de balance
- Refinar reglas ambiguas
- Confirmar fun factor

### **🎯 Entregables**
- [ ] **Paper prototype**: Cartas imprimibles
- [ ] **10+ partidas** jugadas y documentadas  
- [ ] **Balance adjustments** basados en testing
- [ ] **Rules clarification** v2.0

### **⚠️ Criterios de Éxito**
- **Game duration**: 5-10 minutos consistente
- **Fun rating**: 7/10+ de playtesters
- **Balance**: Ninguna clase >60% winrate
- **Clarity**: <5 preguntas de reglas por partida

### **📅 Timeline Detallado**
- **Días 1-2**: Crear paper prototype
- **Días 3-7**: Testing intensivo (2-3 games/día)
- **Días 8-10**: Análisis y balance changes
- **Días 11-14**: Re-testing con cambios

---

## 🛠️ **FASE 2: Setup Técnico** (2-3 semanas)

### **📋 Objetivos**
- Configurar monorepo y herramientas
- Crear arquitectura base
- Implementar game engine básico
- Setup de CI/CD

### **🎯 Entregables**
- [ ] **Monorepo setup**: PNPM workspaces + Turborepo
- [ ] **Frontend base**: React + Vite + TypeScript
- [ ] **Backend base**: NestJS + Prisma + PostgreSQL
- [ ] **Shared package**: Game logic + types
- [ ] **CI/CD pipeline**: GitHub Actions
- [ ] **Local development**: Docker compose

### **📁 Estructura del Proyecto**

infradeck/
├── apps/
│ ├── web/ # React frontend
│ └── api/ # NestJS backend
├── packages/
│ ├── shared/ # Game logic compartida
│ ├── ui/ # Component library
│ └── database/ # Prisma schema
├── tools/
│ └── config/ # Shared configs (ESLint, TS, etc.)
└── docs/ # Documentación (ya existe

### **🔧 Tech Stack Confirmado**
- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: NestJS + Prisma + PostgreSQL
- **Shared**: TypeScript + Zod validation
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel (frontend) + Railway (backend)

---

## 🎮 **FASE 3: Game Engine** (3-4 semanas)

### **📋 Objetivos**
- Implementar core game logic
- Sistema de cartas y mecánicas
- Game state management
- Unit testing completo

### **🎯 Entregables**
- [ ] **Card system**: Todas las 18 cartas implementadas
- [ ] **Game state**: Turns, phases, win conditions
- [ ] **Class mechanics**: 4 sistemas únicos funcionando
- [ ] **Game actions**: Play cards, attack, triggers
- [ ] **Validation**: Reglas enforced automáticamente
- [ ] **Test coverage**: >90% del game engine

### **🏗️ Architecture Highlights**
```typescript
// Game state centralizado
interface GameState {
  players: [Player, Player]
  currentPlayer: 0 | 1
  phase: 'inicio' | 'principal' | 'combate' | 'final'
  turn: number
  stack: StackItem[]
}

// Sistema de cartas modular
abstract class Card {
  id: string
  mana: number
  rarity: 'basica' | 'rara' | 'legendaria'
  abstract play(game: GameState): void
}

// Mecánicas por clase
interface ClassMechanic {
  update(game: GameState): void
  getResource(player: Player): number
}
```

---

## 🎨 **FASE 4: UI/UX Básico** (2-3 semanas)

### **📋 Objetivos**
- Interface funcional para jugar
- Card rendering y animations
- Board state visualization
- Basic responsive design

### **🎯 Entregables**
- [ ] **Game board**: Tablero funcional y claro
- [ ] **Card rendering**: Design system para todas las cartas
- [ ] **Hand management**: Drag & drop, targeting
- [ ] **Game actions**: Click-to-play interface
- [ ] **State feedback**: Vida, mana, recursos de clase
- [ ] **Mobile friendly**: Responsive design básico

### **🎨 Design Principles**
- **Clarity over flashiness**: Information first
- **Fast interactions**: <100ms response time
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-first**: Touch-friendly desde día 1

---

## 🌐 **FASE 5: Multiplayer Básico** (3-4 semanas)

### **📋 Objetivos**
- Real-time gameplay entre 2 jugadores
- Matchmaking simple
- Synchronización de game state
- Disconnect handling

### **🎯 Entregables**
- [ ] **WebSocket integration**: Socket.io setup
- [ ] **Real-time sync**: Game state synchronizado
- [ ] **Matchmaking**: Queue simple para opponents
- [ ] **Reconnection**: Handle disconnects gracefully
- [ ] **Spectator mode**: Básico watch games
- [ ] **Game history**: Log de partidas jugadas

### **🔧 Technical Considerations**
- **Server authority**: Backend validates todas las acciones
- **Optimistic updates**: Frontend predicts success
- **Conflict resolution**: Server state always wins
- **Latency handling**: <200ms for good UX

---

## 🎯 **FASE 6: MVP Polish** (2-3 semanas)

### **📋 Objetivos**
- Pulir UX para release público
- Performance optimization
- Bug fixing y stability
- Basic analytics

### **🎯 Entregables**
- [ ] **Performance**: <3s load time, >60fps gameplay
- [ ] **Error handling**: Graceful degradation
- [ ] **Analytics**: Basic usage tracking
- [ ] **Feedback system**: In-app bug reporting
- [ ] **Tutorial**: Interactive onboarding
- [ ] **Polish**: Animations, sounds, juice

---

## 🚀 **FASE 7: Beta Launch** (1-2 semanas)

### **📋 Objetivos**
- Deploy a producción
- Onboard initial users
- Gather feedback y metrics
- Iterate basado en data

### **🎯 Entregables**
- [ ] **Production deploy**: Stable infrastructure
- [ ] **User onboarding**: 50-100 initial beta users
- [ ] **Metrics dashboard**: KPIs tracked
- [ ] **Feedback collection**: Surveys, interviews
- [ ] **Hotfixes**: Address critical issues
- [ ] **Roadmap v2**: Plan next features

---

## 📈 **Métricas de Éxito**

### **📊 KPIs por Fase**

#### **Fase 1 (Validación)**
- **Games completed**: >10 partidas
- **Average duration**: 5-10 minutos
- **Fun rating**: >7/10
- **Rule questions**: <5 per game

#### **MVP Launch**
- **DAU**: 20-50 daily active users
- **Retention D1**: >40%
- **Game completion**: >80%
- **Average session**: 2-3 games
- **Bug reports**: <10% of sessions

#### **3 Months Post-Launch**
- **MAU**: 200-500 monthly active users
- **Retention D7**: >20%
- **NPS**: >40
- **Churn rate**: <30% monthly

---

## 🔮 **Roadmap Futuro (Post-MVP)**

### **🎴 Expansión de Contenido**
- **Nuevas cartas**: +20-30 cartas por set
- **Quinta clase**: Nueva mecánica única
- **Formato limitado**: Draft mode
- **Ranked system**: ELO/MMR matching

### **🎯 Features Avanzadas**
- **Deck builder**: In-app construction
- **Replay system**: Watch previous games
- **Tournament mode**: Organized competitions
- **Social features**: Friends, chat, guilds

### **📱 Platform Expansion**
- **Mobile app**: iOS/Android nativas
- **Steam release**: Desktop gaming market
- **Physical cards**: Print-on-demand
- **Esports**: Competitive scene

---

## ⚠️ **Risks y Mitigaciones**

### **🎮 Design Risks**
- **Risk**: Game no es fun enough
- **Mitigation**: Heavy paper testing en Fase 1

### **🛠️ Technical Risks**
- **Risk**: Multiplayer sync complexity
- **Mitigation**: Start simple, iterate incrementally

### **📈 Market Risks**
- **Risk**: Low user adoption
- **Mitigation**: Strong core loop + community building

### **💰 Financial Risks**
- **Risk**: High server costs
- **Mitigation**: Efficient architecture + usage monitoring

---

## 📝 **Próximos Pasos Inmediatos**

### **🎯 Esta Semana**
1. **Crear paper prototype** de las 18 cartas
2. **Organizar playtest session** con 2-4 personas
3. **Setup basic project structure** si testing va bien

### **📅 Próximo Mes**
1. **Complete Fase 1** validation
2. **Start Fase 2** technical setup
3. **Refine balance** basado en testing data

### **🎮 This Quarter**
1. **Complete MVP** through Fase 6
2. **Launch closed beta** con small user group
3. **Plan expansion** features basado en feedback

---

## 📝 **Log de Cambios**

### Version 1.0 (26 Sep 2025)
- ✅ **Roadmap completo** definido
- ✅ **7 fases** claramente scoped
- ✅ **Timeline realista** de 6-12 meses
- ✅ **Métricas de éxito** específicas
- ✅ **Risk assessment** y mitigaciones

### Version 1.1 (26 Sep 2025)
- ✅ **Estado actualizado**: Design 100% completo
- ✅ **Progreso realista**: Refleja documentación modular completa
- ✅ **Testing progress**: Simulaciones completadas
- **PRÓXIMO**: Empezar Fase 1