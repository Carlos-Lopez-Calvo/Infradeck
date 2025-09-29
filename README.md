# 🎮 Infradeck

> Fast-paced 1v1 card game webapp with unique class mechanics and strategic depth

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
- **Instant responses**: Stack system for tactical counterplay
- **Final Stand**: Dramatic comeback mechanic when reaching 0 life

## 📊 Current Status

**Phase**: 1.0 - Design Complete  
**Progress**: 100% (18 cards + complete documentation)  
**Next Step**: Physical playtesting and iteration

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed progress.

## 🃏 Mini-Test Set Ready

**18 Balanced Cards:**
- ✅ **10 Basic Cards** with personality and trade-offs
- ✅ **8 Signature Cards** (2 per class) showcasing unique mechanics
- ✅ **Complete mana curve** from 0-6 cost
- ✅ **All card types**: Creatures, Spells, Instants

**Ready for Paper Testing:**
- Balanced gameplay mechanics
- 30-card deck construction 
- Class identity validation
- 5-10 minute game duration target

## 📁 Project Structure

infradeck/
├── PROJECT_STATUS.md # ⭐ Current state and progress
├── README.md # This file
└── docs/
├── game-design/
│ ├── cartas-iniciales.md # 📋 Card index & overview
│ ├── cartas-basicas.md # 🛡️ 10 neutral cards
│ ├── cartas-clases.md # 🏛️ 8 signature cards
│ ├── mecanicas-clases.md # 🎯 4 class systems
│ ├── reglas-juego.md # ⚔️ Complete rules
│ └── balance-analisis.md # ⚖️ Meta analysis
├── development/
│ ├── roadmap.md # 🗺️ Development timeline
│ └── decisions-log.md # 📝 All design decisions
└── testing/
└── simulaciones.md # 🎮 Game simulations

## 🚀 What's Been Designed

### ✅ **Complete Game System**
- **4 Classes** with unique resource mechanics
- **3 Card Types** (Creatures, Spells, Instants)
- **4-Phase Turns** (Start, Main, Combat, End)
- **Combat Rules** (Hearthstone-style targeting)
- **Win Conditions** (Life reduction + Final Stand)
- **Deck Construction** (30 cards, 3 rarities)

### ✅ **18 Cards Ready to Test**
Each card designed with:
- **Meaningful decisions** and trade-offs
- **Class synergies** without being class-locked
- **Strategic depth** appropriate for 5-10 min games
- **Balanced power level** for competitive play

## 🎯 Next Milestones

### **Phase 1**: Paper Prototype (Next)
- [ ] **Physical testing** of 18-card set
- [ ] **Timing validation** (5-10 min target)
- [ ] **Balance iteration** based on playtests
- [ ] **Mechanic refinement** where needed

### **Phase 2**: Technical Setup
- [ ] **Monorepo setup** (React + NestJS + TypeScript)
- [ ] **Digital prototype** with basic UI
- [ ] **Core game engine** implementation

### **Phase 3**: Digital MVP
- [ ] **Full 50-80 card set** design
- [ ] **Complete UI/UX** implementation
- [ ] **Local multiplayer** functionality

## 🛠️ Technology Stack (Planned)

### **Frontend**
- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **Zustand** for state management

### **Backend** 
- **NestJS** + **TypeScript**
- **Prisma** + **PostgreSQL**
- **Socket.io** for real-time play

### **DevOps**
- **PNPM** workspaces + **Turborepo**
- **Docker** + **GitHub Actions**
- **Vercel** (frontend) + **Railway** (backend)

## 📖 Documentation

- [📋 Project Status](./PROJECT_STATUS.md) - Current progress and next steps
- [🃏 Card Index](./docs/game-design/cartas-iniciales.md) - Complete card navigation
- [🛡️ Basic Cards](./docs/game-design/cartas-basicas.md) - 10 neutral cards
- [🏛️ Class Cards](./docs/game-design/cartas-clases.md) - 8 signature cards
- [🎯 Class Mechanics](./docs/game-design/mecanicas-clases.md) - 4 class systems
- [⚔️ Game Rules](./docs/game-design/reglas-juego.md) - Complete ruleset
- [⚖️ Balance Analysis](./docs/game-design/balance-analisis.md) - Meta predictions
- [🗺️ Roadmap](./docs/development/roadmap.md) - 6-12 month plan
- [📝 Decision Log](./docs/development/decisions-log.md) - Design rationale
- [🎮 Simulations](./docs/testing/simulaciones.md) - Playtesting logs

## 🎮 Game Philosophy

**"Strategic depth in rapid play"** - Every decision matters, but games respect your time.

- **No dead cards**: Every card offers meaningful choices
- **Class identity**: Each class feels completely different
- **Comeback potential**: Final Stand prevents feel-bad moments
- **Skill expression**: Multiple viable strategies and counter-play

## 🧪 Want to Test?

The paper prototype is ready! The game can be tested with:
- **Print the 18 cards** from [cartas-iniciales.md](./docs/game-design/cartas-iniciales.md)
- **Basic setup**: 20 life, 30-card decks, 1-10 mana per turn
- **Target**: 5-10 minute games with meaningful decisions

---

**Built with ❤️ and ⚡ by Carlos Lopez**  
*Ready for Phase 1: Paper Prototype Testing*