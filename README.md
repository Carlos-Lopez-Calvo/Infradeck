# 🎮 Infradeck

## Objetivos del TFG

Infradeck será un juego de cartas digital completo, incluyendo:
- Inicio de sesión y gestión de usuarios
- Colección de cartas y sistema de sobres/recompensas
- Deckbuilder con selección de clase y edición de mazos
- Motor de juego avanzado con mecánicas de clase y Final Stand
- UI web completa con animaciones y feedback
- Pantalla de victoria/derrota y estadísticas
- Progreso, economía y tienda
- Documentación técnica y manual de usuario

## Estado actual

- Motor de juego y cartas: **100% funcional**
- UI básica: **en desarrollo**
- Sistema de clases, Final Stand y mecánicas avanzadas: **implementadas**
- Siguiente paso: **UI completa, deckbuilder, colección y sobres**


## 🎯 What We're Building

**Infradeck** is a fast-paced 1v1 card game designed for:
- ⚡ **Quick matches**: 5-10 minutes per game
- 🧠 **Strategic depth**: Easy to learn, hard to master  
- 🏛️ **4 Unique Classes**: Each with distinctive mechanics and playstyles
- 💨 **Instant responses**: Magic-style stack system for counterplay
- 🌐 **Online multiplayer**: Real-time PvP battles
- 📱 **Cross-platform**: Web-first, mobile-responsive

## 🎲 Core Game Features

### **Resource System**
- **Universal Mana**: 1-10 mana per turn (familiar)
- **Class Resources**: Each class has unique secondary resources
- **Dual-Mode Cards**: Basic effect + enhanced with class resources

### **4 Distinct Classes**
- 🧬 **ABOMINACIÓN**: Late-game engine with graveyard ability inheritance
- 🎲 **CAOS**: Adaptable control with managed randomness  
- 🌓 **CICLO**: Timing-based midrange with day/night cycles
- ❤️ **VITALIDAD**: Pure aggro using life as fuel

### **Combat System**
- **Hearthstone-style board**: Max 10 creatures, free targeting
- **Persistent damage**: Damage doesn't heal between turns
- **Instant responses**: Magic-style stack for reactive play

### **Card Abilities (9 Keywords)**
- **Offensive**: Prisa, Impaciente, Robo de vida, Veneno
- **Defensive**: Taunt, Sigilo, Escudo, Regeneración  
- **Special**: Vuelo, Doble Golpe

## 📊 Current Status

**Phase**: 2.1 - Engine MVP Complete  
**Progress**: ~75% (Design 100% + Engine 100% + UI 0%)  
**Next Step**: UI Development for user interaction

### **✅ Game Engine (COMPLETED)**
- **Real Stack System**: LIFO with complete priority windows
- **Priority APIs**: `getStack`, `canRespond`, `respondWithCard`, `passPriority`, `resolveStack`
- **14/14 Tests Green**: Complete coverage of advanced mechanics
- **Advanced Effects**: RANDOM_BY_ENTROPY, DISCOVER, LIFE_DIFFERENTIAL, COUNTER_SPELL, Specimen

### **✅ Card System (COMPLETED)**
- **70 Cards Implemented**: 30 basic + 40 class cards
- **92 Card Tests**: Complete validation of all cards
- **4 Balanced Classes**: ABOMINACIÓN, CAOS, CICLO, VITALIDAD  
- **9 Abilities**: Complete keyword system

### **✅ Technical Architecture (COMPLETED)**
- **Monorepo**: PNPM workspaces configured
- **TypeScript**: Shared types and validations
- **Testing**: Vitest with complete coverage
- **Shared Package**: Centralized game logic

## 📁 Project Structure

```
infradeck/
├── packages/
│   └── shared/                    # 🎯 Game engine + cards
│       ├── src/engine/           # ⚙️ Game logic
│       ├── src/cards/            # 🃏 70 cards implemented  
│       ├── src/types/            # 📝 TypeScript types
│       └── tests/                # 🧪 106 tests total
├── docs/                         # 📚 Complete documentation
│   ├── game-design/             # 🎮 Rules and mechanics
│   ├── development/             # 🔧 Roadmap and decisions
│   └── testing/                 # 📊 Results and analysis
└── PROJECT_STATUS.md            # 📋 Current state
```

## 🎲 Implemented Mechanics

### **Real Stack System**
```typescript
// Key APIs implemented
getStack(state): StackItem[]           // View current stack
canRespond(state, playerIndex): boolean // Can player respond?
respondWithCard(state, ...): PlayResult // Play instant
passPriority(state, playerIndex): void  // Pass priority
resolveStack(state): void              // Resolve LIFO stack
```

### **Advanced Effects**
- ✅ **RANDOM_BY_ENTROPY**: Damage/effects scaled by Entropy (with optional consumption)
- ✅ **DISCOVER_FROM_GRAVEYARD**: Summon from graveyard with ON_ENTER
- ✅ **LIFE_DIFFERENTIAL**: Scaling by life difference (+X/+X)
- ✅ **COUNTER_SPELL**: Counters opponent's next spell
- ✅ **Specimen**: Escalating cost system (5→7→9→10 mana)

### **Complete Abilities (9/9)**
- ✅ **Prisa, Impaciente, Taunt, Sigilo, Escudo, Veneno**
- ✅ **Robo de Vida, Vuelo, Regeneración**
- ✅ **DOBLE_GOLPE** (bonus mechanic)

## 🃏 Complete Card Set Overview

### **🛡️ Basic Cards (30 - Neutral)**
**Perfect mana curve from 0-8 mana:**
- **0-1 mana**: 7 cards (aggressive starts)
- **2-3 mana**: 17 cards (core gameplay)  
- **4-5 mana**: 10 cards (midgame power)
- **6+ mana**: 6 cards (late game bombs)

### **🏛️ Class Cards (40 - 10 per Class)**

#### **🧬 ABOMINACIÓN (Graveyard Engine)**
Build the ultimate creature by collecting abilities from fallen allies:
- **Espécimen Perfecto**: Inherits all abilities from graveyard
- **Scaling Cost**: 5→7→9→10 mana per summon
- **Strategy**: Sacrifice → Collect → Dominate

#### **🎲 CAOS (Entropy System)**  
Accumulate Entropy for explosive random effects:
- **Entropy**: Persists between turns (max 10)
- **Generation**: +1 per card played
- **Payoffs**: Scaling random damage and effects

#### **🌓 CICLO (Day/Night/Eclipse)**
Master timing with state-dependent power:
- **Day**: Aggressive effects (Prisa, damage)
- **Night**: Defensive effects (Taunt, healing)
- **Eclipse**: Best of both worlds (special activation)

#### **❤️ VITALIDAD (Life as Resource)**
Use your life force for immediate power:
- **Life Costs**: 2-8 life for enhanced effects
- **Risk/Reward**: More life = more power
- **All-in**: Speed kills strategy

## 📈 Testing and Validation

### **Engine Tests: 14/14 ✅**
- Stack LIFO and priority windows
- START/END_OF_TURN triggers
- Combat abilities (Sigilo, Vuelo, etc.)
- Advanced effects and chained counters

### **Card Tests: 92/92 ✅**
- Validation of all 70 cards
- Class-specific mechanics
- Rarity and mana curve distribution
- Synergies and combos

## 🎯 Key Milestones

### **✅ Completed (Phase 2.1)**
- [x] **Game Engine MVP**: Complete with stack system
- [x] **70 Cards**: Fully implemented and tested
- [x] **Advanced Mechanics**: All effects working
- [x] **106 Tests**: Full validation coverage
- [x] **TypeScript Architecture**: Shared package ready

### **🔄 Next Up (Phase 3)**
- [ ] **UI Minimal**: CLI/Web interface for game visualization
- [ ] **User Interaction**: Hand, board, stack display
- [ ] **Priority System**: Visual priority passing
- [ ] **Target Selection**: UI for card targeting

### **📋 Future (Phase 4+)**
- [ ] **Multiplayer**: Real-time Socket.io implementation
- [ ] **Advanced UI**: Polish and animations
- [ ] **Deployment**: Production ready app

## 🛠️ Tech Stack (Implemented + Planned)

### **Core (✅ Implemented)**
- **Monorepo**: PNPM Workspaces + TypeScript
- **Game Logic**: Complete engine in `@infradeck/shared`
- **Testing**: Vitest with 106 passing tests
- **Types**: Comprehensive TypeScript definitions

### **Frontend (📋 Planned)**
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand + game engine integration

### **Backend (📋 Planned)**
- **Framework**: NestJS + TypeScript  
- **Database**: Prisma + PostgreSQL
- **Realtime**: Socket.io
- **Auth**: JWT + Redis

### **DevOps (📋 Planned)**
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel (frontend) + Railway (backend)
- **E2E Testing**: Playwright

## 🚀 How to Get Started

### **For Developers**
```bash
# Clone and install
git clone <repo>
cd infradeck
pnpm install

# Run tests
cd packages/shared
pnpm test

# All tests should pass: 106/106 ✅
```

### **For Designers**
1. Read [reglas-juego.md](docs/game-design/reglas-juego.md) for complete rules
2. Browse [cartas-clases.md](docs/game-design/cartas-clases.md) for all 70 cards
3. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for current progress

### **For Testers**
1. Review the implemented mechanics above
2. Check out the test files in `packages/shared/tests/`
3. Try running the test suite locally

## 📈 Project Metrics

- **📊 Overall Progress**: ~75% (Design 100% + Engine 100% + UI 0%)
- **🃏 Cards Implemented**: 70/70 (100%)
- **⚙️ Engine Features**: 95% (Stack, abilities, advanced effects)
- **🧪 Test Coverage**: 106 tests passing (92 cards + 14 engine)
- **📚 Documentation**: 8 files updated

## 🎯 Ready for Phase 3: UI Development

**The engine is completely functional and validated. Next step: create an interface for players to interact with the stack system and advanced mechanics.**

---

*Last updated: October 2, 2025*