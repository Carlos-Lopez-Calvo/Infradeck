# �� INFRADECK - Estado del Proyecto

## 📊 Estado Actual
- **Fase Actual**: 1.1 - Diseño Completo (74 Cartas)
- **Última Actualización**: 29 Septiembre 2025
- **Progreso General**: 100% (Diseño completo + 74 cartas + documentación modular)

## ✅ Decisiones Clave Tomadas

### Tipo de Juego
- **Ritmo**: Acción rápida (5-10 min por partida, estilo Hearthstone)
- **Scope**: Juego completo con set inicial robusto (70 cartas para MVP)
- **Estrategia de contenido**: Actualizaciones incrementales post-launch
- **Tema visual**: Por definir (no afecta mecánicas iniciales)

### Mecánicas Core ✅ COMPLETADAS
- **Sistema base**: Mana universal (1-10) + Recursos especiales por clase
- **Vida inicial**: 20 puntos, Final Stand a 1 vida (máx 10)
- **Cartas con doble modo**: Básico + Potenciado (usando recurso especial)
- **4 Clases**: ABOMINACIÓN, CAOS, CICLO, VITALIDAD
- **3 Tipos de cartas**: Criaturas, Hechizos, Instantáneas (stack system)
- **Estructura de turnos**: 4 fases (Inicio, Principal, Combate, Final)
- **Sistema de deck**: 30 cartas, mulligan individual, 3 rarezas
- **9 Habilidades**: Keywords system completamente definido

### **🃏 Set Completo: 70 Cartas Diseñadas**
- **30 Cartas Básicas** (neutras, todas las clases)
- **40 Cartas de Clase** (10 por cada una de las 4 clases)

### 4 Clases: ABOMINACIÓN, CAOS, CICLO, VITALIDAD

#### **🧬 ABOMINACIÓN** - Espécimen Perfecto
- **Mecánica**: Herencia de habilidades desde cementerio
- **Estrategia**: Late-game engine con massive payoff
- **Costo escalable**: 5→7→9→10 mana por invocación
- **Cartas**: 10 completas (Explorador Infectado, Recolector, Necrófago, Ritual Menor, Anatomista, Invocación Siniestra, Perfeccionista, Ritual de Perfección, Maestro Necromántico, Evolución Perfecta)

#### **🎲 CAOS** - RNG Controlado  
- **Mecánica**: Entropía persistente (0-10, no resetea)
- **Estrategia**: Accumulate + explosive random bursts
- **Scaling**: Breakpoints en 2,3,4,5,6,8,9,10 Entropía
- **Cartas**: 10 completas (Aprendiz Errático, Mago del Caos, Ritual Caótico, Mercader Loco, Manipulador del Destino, Portal Inestable, Caos Controlado, Señor del Caos, Tormenta Impredecible, Realidad Fracturada)

#### **🌓 CICLO** - Timing Perfecto
- **Mecánica**: Estados Día/Noche/Eclipse con effects únicos
- **Estrategia**: Optimal play según timing windows
- **Eclipse**: Estado especial activado por cartas
- **Cartas**: 10 completas (Explorador Crepuscular, Ritual del Amanecer, Vidente Lunar, Cambiaformas Lunar, Invocador de Eclipse, Guardián del Equilibrio, Momento Perfecto, Maestro del Tiempo, Eclipse Eterno, Convergencia Celestial)

#### **❤️ VITALIDAD** - All-in Aggro
- **Mecánica**: Vida como recurso (2-8 vida costs)
- **Estrategia**: Speed kills con life investment
- **Risk/Reward**: Más vida = más poder, más riesgo
- **Cartas**: 10 completas (Fanático Desesperado, Berserker Sanguinario, Cazador de Recompensas, Ritual Sangriento, Guerrero Herido, Señor de la Sangre, Pacto de Poder, Pacto Final, Frenesí Final, Avatar de la Destrucción)

### Stack Tecnológico Planeado
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL  
- **Monorepo**: PNPM workspaces + Turborepo
- **Tiempo real**: Socket.io (fase multiplayer)
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🗺️ **Fases de Desarrollo**

### ✅ Fase 1: Diseño de Juego (COMPLETADA)
- [x] Mecánicas core definidas
- [x] 4 clases balanceadas
- [x] 70 cartas diseñadas y documentadas
- [x] Sistema de habilidades (9 keywords)
- [x] Reglas completas especificadas

### 📋 Fase 2: Paper Prototype (SIGUIENTE)
- [ ] Crear cartas físicas para testing
- [ ] 10+ partidas de playtesting
- [ ] Iteraciones de balance basadas en feedback
- [ ] Refinamiento de reglas v2.0

### 🔧 Fase 3: MVP Digital
- [ ] Setup del monorepo y arquitectura
- [ ] Engine de juego básico (offline)
- [ ] UI/UX para single player
- [ ] Testing automatizado

### 🌐 Fase 4: Multiplayer
- [ ] Sistema real-time con Socket.io
- [ ] Matchmaking básico
- [ ] Spectator mode
- [ ] Ranking system

## 🔗 Navegación Rápida de Documentos

| Categoría | Archivo | Status | Cartas |
|-----------|---------|--------|--------|
| **📋 Índice** | [cartas-iniciales.md](./docs/game-design/cartas-iniciales.md) | ✅ Complete | 70 total |
| **🛡️ Básicas** | [cartas-basicas.md](./docs/game-design/cartas-basicas.md) | ✅ Complete | 30 neutras |
| **🏛️ Clases** | [cartas-clases.md](./docs/game-design/cartas-clases.md) | ✅ Complete | 40 (10×4) |
| **⚖️ Balance** | [balance-analisis.md](./docs/game-design/balance-analisis.md) | 🔄 Needs Update | 18→70 |
| **⚔️ Reglas** | [reglas-juego.md](./docs/game-design/reglas-juego.md) | ✅ Complete | - |
| **🎯 Mecánicas** | [mecanicas-clases.md](./docs/game-design/mecanicas-clases.md) | ✅ Complete | - |
| **🗺️ Roadmap** | [roadmap.md](./docs/development/roadmap.md) | 🔄 Needs Update | - |
| **🎮 Testing** | [simulaciones.md](./docs/testing/simulaciones.md) | ✅ Complete | - |
| **📝 Decisiones** | [decisions-log.md](./docs/development/decisions-log.md) | ✅ Complete | - |

## 📈 **Métricas del Proyecto**

### **Diseño Completado**
- **70 Cartas Totales**: 30 básicas + 40 clase
- **4 Mecánicas Únicas**: Espécimen, Entropía, Estados, Vida
- **9 Habilidades**: Keywords system completo
- **Perfect Curves**: 0-10 mana distribution balanceada
- **3 Arquetipos**: Por clase, múltiples estrategias

### **Distribución de Cartas**
- **Por Rareza**: 35% Básicas, 45% Raras, 20% Legendarias
- **Por Tipo**: 64% Criaturas, 26% Hechizos, 10% Instantáneas  
- **Por Mana**: Curva optimizada para partidas 5-10 minutos

### **Complejidad por Clase**
- **VITALIDAD**: ⭐⭐☆☆☆ (Beginner-friendly)
- **CAOS**: ⭐⭐⭐☆☆ (Intermediate)
- **CICLO**: ⭐⭐⭐⭐☆ (Advanced)
- **ABOMINACIÓN**: ⭐⭐⭐⭐⭐ (Expert)

## 📝 **Para Retomar Contexto**

Si vuelves a este proyecto después de un tiempo:

1. **Lee este archivo primero** para el estado general
2. **Revisa [reglas-juego.md](./docs/game-design/reglas-juego.md)** para mecánicas
3. **Explora [cartas-clases.md](./docs/game-design/cartas-clases.md)** para las 40 cartas de clase
4. **Consulta [cartas-basicas.md](./docs/game-design/cartas-basicas.md)** para las 30 cartas neutras
5. **Revisa [roadmap.md](./docs/development/roadmap.md)** para próximos pasos

**Estado**: Listo para paper testing y desarrollo digital 🚀
