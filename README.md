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

- Motor de juego y cartas: 100% funcional (70 cartas, mecánicas de clase, Final Stand)
- UI básica: bucle de juego operativo
  - Mano conectada al engine (resolver global)
  - Jugar carta por click (bloqueo por maná)
  - Render del tablero con `Card` estilizada
  - Vida visible y actualizada de ambos héroes
  - Combate por selección (atacante → criatura/héroe)
  - Fases y fin de turno con botón único (MAIN → COMBAT → END)
- Bot local de prueba: juega cartas asequibles, ataca y finaliza su turno (con candado por turno)
- Siguiente paso: UI de selección de objetivos, visualización de prioridad/pila y deckbuilder

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

- Engine and cards: 100% (tested)
- Web UI: basic gameplay loop working (hand → play card → combat → end turn)
- Bot: simple opponent (plays affordable cards, attacks, ends turn)
- Next step: target selection UI, priority/stack UI, deckbuilder

## 🎲 Implemented Mechanics

### **Real Stack System**
```typescript
// Key APIs implemented
getStack(state): StackItem[]           // View current stack
canRespond(state, playerIndex): boolean // Can player respond?
respondWithCard(state, ...): PlayResult // Play instant
passPriority(state, playerIndex): void  // Pass priority
resolveStack(state): void               // Resolve LIFO stack
```

### **Advanced Effects**
- ✅ RANDOM_BY_ENTROPY
- ✅ DISCOVER_FROM_GRAVEYARD
- ✅ LIFE_DIFFERENTIAL
- ✅ COUNTER_SPELL
- ✅ Specimen (scaling cost)

### **Complete Abilities (9/9)**
- ✅ Prisa, Impaciente, Taunt, Sigilo, Escudo, Veneno
- ✅ Robo de Vida, Vuelo, Regeneración
- ✅ Doble Golpe

## 📁 Project Structure
Advanced Effects
✅ RANDOM_BY_ENTROPY
✅ DISCOVER_FROM_GRAVEYARD
✅ LIFE_DIFFERENTIAL
✅ COUNTER_SPELL
✅ Specimen (scaling cost)
Complete Abilities (9/9)
✅ Prisa, Impaciente, Taunt, Sigilo, Escudo, Veneno
✅ Robo de Vida, Vuelo, Regeneración
✅ Doble Golpe
📁 Project Structure
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

📈 Testing and Validation
Engine Tests: 14/14 ✅
Card Tests: 92/92 ✅
🔜 Next Up (Phase 3)
Target selection UI (ON_PLAY/INSTANT)
Priority window and stack visualization (pass/respond/resolve)
Deckbuilder + pre-match deck selection
Replace local bot with socket-based opponent (future phase)
Last updated: October 5, 2025

```1:140:/Users/carloslopez/Desktop/TFG/Infradeck/PROJECT_STATUS.mda web app full‑stack de un del TFG
Construir una web app full‑stack de unistrogintión gestiónrios usuariosolecciónbres sobresaraeguir conseguirrtas Deckerbuildernección selecciónclaseción ediciónazos-otor Motorego juegoado avanzadopleta completaEstadsísticasa tiendares progres##✅stado Estado actualne Engineas cartas00ncional funcionalests testss verdesUIsica básicamanoct conectblero tablerord `Card mancre decrealgar jugar vidable visiblee por porección selecciónanteriatura criatura,ases fases finderno turno Botple simplelocala juegas cartaselesiblesatacayinal finalrno turnocanddor porno turnomp Limpezanica técnicaaciónificacióno estadome `GameEngineerProvidernimindook hookic duplicesolver resolverinicialdos anteselmer primer render 🗺oad Roadp1** **Iompleta completaaidas partidas**kDeckderbuildercción selecciónclase** **eColencciónstema sistemaes sobres* **cioIniciosión sesiónión gestiónrios usuarios**tPantalladectoria/der/der y estadísticas**rota y estadísticas**a tiendamp recompsas7** **umentDocumentcnicaación técnicaanualio usuario# 🎲c Mecasicaslement Implementck StackrealPIsget getkStackpond respondassityPrioritye resolveck Ectfectvanz avanzosNDOMANDOMYT_ENTOPDISC DISCVERM_FROMRAVEDARDIFE LIFEIRFFERALENTIAL COUNRSLLPELLec Specmen- Hilidadesabilidades completasmp Impnteacienteuntig Siglosc Escdoen Vennoobo Roboeda VidaVueloeg Regenernaciónleoble Gol##
## 📋Suigutesientesitossease3-
-I UI delección selecciónvos objetivos/izos/ntinstantas-isual Visualizaciónoridad prioridadpasrontra/contrarizar/resrolvereckbuilder y yarga carga mazosr porario usuario
- Logs/feedbackones accionesauesiggers triggers📈 Méras del Proyecto del Proyecto **Progresol~80(Dise% (Dise100+ngine Engine0+I UI 40)
-* **tasasmplement Implement 7070 (0100)
-* **ineEngineres Features00re coret botal local**tsTests06 106106✅
-* **Ictual actualo manolero tableroida manombate combateurnotón botónse fase## 🏗rquitect Arquitectlyecto Proyecto

infradeck/
├── packages/
│ └── shared/
│ ├── src/engine/
│ ├── src/cards/
│ ├── src/types/
│ └── tests/
├── docs/
│ ├── game-design/
│ ├── development/
│ └── testing/
└── PROJECT_STATUS.md


## 🎯 Ready for Phase 3: UI Development
El engine está completamente funcional y validado. Próximo paso: UI para selección de objetivos, prioridad/pila y deckbuilder.

Última actualización: 5 octubre 2025