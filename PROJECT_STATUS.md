# 🎮 INFRADECK - Estado del Proyecto

## 📊 Estado Actual
- **Fase Actual**: 0.2 - Paper Prototype  
- **Última Actualización**: 26 Septiembre 2025
- **Progreso General**: 90% (18 cartas listas para testear)

## ✅ Decisiones Clave Tomadas

### Tipo de Juego
- **Ritmo**: Acción rápida (5-10 min por partida, estilo Hearthstone)
- **Scope**: Juego completo pero pequeño (50-100 cartas)
- **Estrategia de contenido**: Actualizaciones incrementales para añadir cartas y mecánicas
- **Tema visual**: Por definir (no afecta mecánicas iniciales)

### Mecánicas Core ✅ COMPLETADAS
- **Sistema base**: Mana universal (1-10) + Recursos especiales por clase
- **Vida inicial**: 20 puntos
- **Cartas con doble modo**: Básico + Potenciado (usando recurso especial)
- **4 Clases**: SINERGIA, CAOS, CICLO, VITALIDAD
- **3 Tipos de cartas**: Criaturas, Hechizos, Instantáneas
- **Estructura de turnos**: 4 fases definidas
- **Condiciones de victoria**: Eliminación + Final Stand
- **Sistema de deck**: 30 cartas, 3 rarezas (Básica, Rara, Legendaria)

### Stack Tecnológico Planeado
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Monorepo**: PNPM workspaces + Turborepo
- **Tiempo real**: Socket.io (fase multijugador)

## 🔄 Progreso Actual

### ✅ FASE 0.1: Conceptualización del Juego - COMPLETADA
- [x] Decisiones de tipo de juego y scope
- [x] Estructura básica de documentación
- [x] **COMPLETADO**: Sistema de recursos y clases definido
- [x] **COMPLETADO**: 4 clases balanceadas diseñadas
- [x] **COMPLETADO**: 3 tipos de cartas definidos
- [x] **COMPLETADO**: Estructura de turnos establecida
- [x] **COMPLETADO**: Condiciones de victoria/derrota + Final Stand
- [x] **COMPLETADO**: Sistema de deck y rarezas

### 🔄 FASE 0.2: Paper Prototype - EN PROGRESO
- [x] **COMPLETADO**: 18 cartas diseñadas y balanceadas
  - 10 cartas básicas con personalidad
  - 8 cartas signature (2 por clase)
- [ ] **EN CURSO**: Testing físico de mecánicas
- [ ] Validar duración de partidas (objetivo: 5-10 min)
- [ ] Iterar balance según resultados
- [ ] Documentar learnings del playtesting

### ⏭️ Próximas Tareas Inmediatas
1. **Paper Playtesting**
   - Probar partidas con las 18 cartas
   - Medir timing y balance
   - Identificar problemas mecánicos
   
2. **Iteración basada en feedback**
   - Ajustar cartas problemáticas
   - Refinar mecánicas según resultados
   
3. **Expansión del set** (si el core funciona)
   - Añadir 15-20 cartas más
   - Completar arquetipos de cada clase

## 🃏 **Set de Mini-Test: 18 Cartas Diseñadas**

### **10 Cartas Básicas** (Neutras)
- **Criaturas**: Mercenario Ágil (1), Escriba Estudioso (2), Berserker Herido (3), Centinela Vigilante (4), Campeón Caído (6)
- **Hechizos**: Flecha Certeza (2), Intercambio Justo (3), Llamarada Dolorosa (4)  
- **Instantáneas**: Reflejo Rápido (1), Momento Crucial (3)

### **8 Cartas Signature** (2 por clase)
- **🔗 SINERGIA**: Reclutador Veterano (3★), Forja de Almas (5⭐)
- **🎲 CAOS**: Mago del Caos (2★), Tormenta Impredecible (4⭐)
- **🌓 CICLO**: Cambiaformas Lunar (3★), Eclipse Eterno (6⭐)
- **❤️ VITALIDAD**: Berserker Sanguinario (2★), Pacto Final (4⭐)

*(★ = Rara, ⭐ = Legendaria)*

## 🎯 Sistema Completo Diseñado

### 🃏 Tipos de Cartas
1. **CRIATURAS** - Van al tablero, atacan/defienden
2. **HECHIZOS** - Efecto inmediato, solo en tu turno  
3. **INSTANTÁNEAS** - Stack como Magic, responden a acciones

### ⏰ Estructura de Turnos
1. **🌅 INICIO** - Roba carta, +1 mana, triggers automáticos
2. **⚡ PRINCIPAL** - Jugar criaturas/hechizos, habilidades
3. **⚔️ COMBATE** - Declarar ataques, bloqueos, resolución
4. **🌙 FINAL** - Triggers fin de turno, limpieza

### 🏆 Condiciones de Victoria/Derrota
- **Victoria Primaria**: Reducir vida del oponente a 0
- **Final Stand**: Primera vez que llegarías a 0 → 1 vida (máx 10)
- **Victoria por Tiempo**: Turno 15-20, más vida gana
- **Victoria por Deck Vacío**: Oponente no puede robar
- **Rendición**: Disponible siempre

### ⚡ Final Stand por Clase
- **🔗 SINERGIA**: Doble contadores este turno
- **🎲 CAOS**: 6 Entropía fija este turno  
- **🌓 CICLO**: Eclipse permanente este turno
- **❤️ VITALIDAD**: Habilidades de vida gratis este turno

## 🎯 Las 4 Clases

### 1. SINERGIA 🔗 (Late Game Engine)
- **Recurso**: Contadores por tipo de carta jugada
- **Estilo**: Construye ventaja gradualmente, domina late game

### 2. CAOS 🎲 (Adaptable Control)
- **Recurso**: Entropía por cartas jugadas (resetea cada turno)
- **Estilo**: RNG controlado, múltiples opciones, adaptable

### 3. CICLO 🌓 (Midrange Timing)
- **Recurso**: Día → Noche → Día (automático), Eclipse (activado por cartas)
- **Estilo**: Timing estratégico, ventanas de oportunidad

### 4. VITALIDAD ❤️ (Pure Aggro)
- **Recurso**: Vida propia como combustible (sin recovery)
- **Estilo**: All-in aggro, trade-offs extremos, ganar rápido o morir

## 🔗 Documentos Relacionados
- [Game Design Document](./docs/game-design/game-design-document.md)
- [Log de Decisiones](./docs/development/decisions-log.md)
- [Cartas Iniciales](./docs/game-design/cartas-iniciales.md)

## 📝 Para Retomar Contexto
Cuando vuelvas al proyecto, di: **"Continuemos con Infradeck"** y revisaré este archivo para retomar donde lo dejamos.

---
**18 cartas listas para paper test ✅ | En curso: Playtesting físico**
