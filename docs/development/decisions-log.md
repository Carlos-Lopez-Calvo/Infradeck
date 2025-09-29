# 📋 Log de Decisiones - Infradeck

## 26 Sep 2025 - Tipo de Gameplay: Acción Rápida

**Contexto**: Necesitábamos definir el ritmo y duración del juego.

**Opciones Consideradas**:
- Acción rápida (5-10 min, estilo Hearthstone)
- Estratégico profundo (15-30 min, estilo Magic)
- Híbrido (estrategia con ritmo ágil)

**Decisión Tomada**: Acción rápida (5-10 minutos por partida)

**Razón**: 
- Respeta el tiempo del jugador moderno
- Permite múltiples partidas por sesión
- Reduce barreras de entrada
- Better market fit para audiencia casual-competitive

**Impacto**:
- Mecánicas deben ser streamlined
- UI debe permitir decisiones rápidas
- Balancing debe evitar partidas largas

---

## 26 Sep 2025 - Scope del MVP: Juego Completo Pequeño

**Contexto**: Definir el alcance inicial para balancear ambición vs tiempo.

**Decisión Tomada**: Juego completo pero pequeño (50-100 cartas)

**Razón**: Base sólida para expansiones futuras con scope manejable.

**Impacto**: Timeline ~12 semanas, plan de contenido post-launch esencial.

---

## 26 Sep 2025 - Estrategia de Desarrollo: Por Fases

**Contexto**: Cómo estructurar el desarrollo del proyecto.

**Decisión Tomada**: Desarrollo incremental, fase por fase

**Razón**: 
- Evita overwhelm
- Permite validar cada etapa
- Facilita mantener contexto
- Mejor gestión de scope

**Impacto**: Documentación por fases, objetivos claros por sprint.

---

## 26 Sep 2025 - Sistema de Recursos: Dual Layer

**Contexto**: ¿Cómo hacer que las clases se sientan únicas sin complicar?

**Opciones Consideradas**:
- Solo mana universal (simple pero genérico)
- Recursos únicos por clase (confuso para nuevos)
- Mana + recurso especial por clase (hybrid)

**Decisión Tomada**: Mana universal + recurso especial por clase

**Razón**:
- Familiar (mana) + único (recurso especial)
- Permite cartas neutras y específicas
- Skill progression natural (básico → avanzado)
- Design space rico para cada clase

**Impacto**:
- UI debe mostrar ambos recursos claramente
- Tutorial debe explicar ambos sistemas
- Balance debe considerar interacción dual

---

## 26 Sep 2025 - Vida Inicial: 20 Puntos

**Contexto**: Definir cuánta vida es apropiada para partidas de 5-10 min.

**Opciones Consideradas**:
- 15 vida (partidas muy rápidas)
- 20 vida (estándar)
- 30 vida (partidas más largas)

**Decisión Tomada**: 20 puntos de vida

**Razón**:
- Familiar (Hearthstone standard)
- Permite aggro viable pero no dominante
- Suficiente para comeback mechanics
- Matemática simple para damage calculation

**Impacto**: Curva de damage/mana debe estar balanceada para este life total.

---

## 26 Sep 2025 - Mecánica de Cartas: Doble Modo

**Contexto**: ¿Cómo hacer que las cartas tengan depth sin overwhelming?

**Decisión Tomada**: Cartas con modo básico + modo potenciado

**Razón**:
- Aprende gradualmente (básico first)
- Decisions interesantes (¿cuándo usar recursos?)
- Reduce card count needed (una carta = múltiples opciones)
- Skill expression alto

**Impacto**:
- UI design crítico (mostrar ambos modos claros)
- Balancing complejo (dos efectos por carta)
- Tutorial step-by-step esencial

---

## 26 Sep 2025 - Las 4 Clases: Definición Final

**Contexto**: Necesitábamos 4 arquetipos únicos y balanceados.

**Opciones Consideradas**:
- Abominación ✅ (rediseñado de Sinergia)
- Caos ✅
- Ciclo ✅ (refinado a 3 fases)
- Vitalidad ✅ (refinado a pure trade-off)

**Decisión Tomada**: 
1. **ABOMINACIÓN** (Espécimen Perfecto - herencia de habilidades)
2. **CAOS** (RNG controlado)
3. **CICLO** (Timing con Día/Noche/Eclipse)
4. **VITALIDAD** (Aggro con vida como recurso)

**Razón**:
- Cada clase tiene gameplay completamente distinto
- Meta triangle natural (aggro > control > midrange > aggro)
- Sin mecánicas snowball problemáticas
- Skill expression diferente en cada una

**Impacto**:
- 4 arquetipos viables y balanceados
- Cada clase counters a otra
- Design space claro para expansiones futuras
- Tutorial puede enseñar una clase a la vez

---

## 26 Sep 2025 - ABOMINACIÓN: Rediseño de SINERGIA

**Contexto**: La mecánica original de SINERGIA (contadores por tipo) era aburrida y genérica.

**Problema con SINERGIA**:
- Mecánica poco única (Magic ya tiene esto)
- Snowball problemático si no se controla bien
- Gameplay lineal (más contadores = mejor)

**Nueva Propuesta - ABOMINACIÓN**:
- **Concepto**: Espécimen Perfecto que hereda habilidades del cementerio
- **Mecánica**: Solo habilidades (Taunt, Prisa), no efectos
- **Timing**: Turno 5+, una vez por partida
- **Efectos**: Solo via cartas específicas de clase

**Razón del Cambio**:
- Mecánica 100% única y temática
- Skill expression alto (¿qué matar para maximizar?)
- No snowball (solo una vez)
- Counterplay claro (matar el Espécimen)

**Impacto**:
- Rediseño completo de cartas de clase
- Nueva strategy completamente diferente
- Documentación actualizada
- Testing protocol revisado

---

## 26 Sep 2025 - Sistema de Stack: Magic-like pero Simplificado

**Contexto**: ¿Cómo manejar instantáneas sin complicar demasiado?

**Decisión Tomada**: Stack system con timer de respuesta

**Razón**:
- Depth estratégico alto
- Familiar para jugadores de Magic
- Timer evita analysis paralysis
- Permite counterplay real

**Impacto**: UI complejo pero gameplay rico.

---

## 26 Sep 2025 - Tipos de Cartas: 3 Tipos Básicos

**Contexto**: Definir los tipos fundamentales de cartas.

**Decisión Tomada**:
1. **CRIATURAS** - van al tablero, atacan/defienden
2. **HECHIZOS** - efecto inmediato, solo tu turno  
3. **INSTANTÁNEAS** - stack system, timing flexible

**Razón**:
- Simple pero completo
- Cubre todos los use cases necesarios
- Familiar (similar a Magic básico)
- Permite counterplay y strategy depth

**Impacto**: 
- Sistema de targeting para cada tipo
- UI diferente según tipo
- Tutorial debe explicar cada uno

---

## 26 Sep 2025 - Estructura de Turnos: 4 Fases

**Contexto**: ¿Cuántas fases necesita un turno para ser estratégico pero no lento?

**Decisión Tomada**: 
1. **INICIO** - roba carta, gana mana, triggers
2. **PRINCIPAL** - jugar cartas, activar habilidades
3. **COMBATE** - declarar ataques, resolución
4. **FINAL** - cleanup, triggers de fin

**Razón**:
- Balance entre simplicidad y depth
- Timing windows claros para instantáneas
- Familiar (similar a Magic streamlined)
- Permite planning estratégico

**Impacto**: Tutorial debe explicar cada fase claramente.

---

## 26 Sep 2025 - Condiciones de Victoria: Eliminación + Final Stand

**Contexto**: ¿Cómo evitar feel-bad moments manteniendo tensión?

**Decisión Tomada**: Eliminación (vida a 0) + Final Stand safety valve

**Final Stand Mechanics**:
- Se activa UNA vez cuando oponente te haría daño letal
- Vida → 1, máximo 10 resto del duelo
- Inmunidad hasta tu próximo turno
- Bonus único por clase

**Razón**:
- Elimina blowouts súbitos
- Permite comebacks épicos
- No cambia estrategia fundamental
- Drama añadido a end game

**Impacto**: 
- Balancing debe considerar Final Stand scenarios
- UI debe comunicar mechanic claramente
- Testing para frequency (target: 30-40% de games)

---

## 26 Sep 2025 - Sistema de Deck: 30 Cartas, 3 Rarezas

**Contexto**: Tamaño de deck y sistema de copias para balance.

**Decisión Tomada**: 
- **30 cartas por deck**
- **Básicas/Raras**: Máx 2 copias
- **Legendarias**: Máx 1 copia
- **3 Rarezas**: Básica, Rara, Legendaria

**Razón**:
- Familiar y probado en TCGs exitosos
- 30 cartas permite consistencia con variedad
- Sistema de copias controla power level naturalmente
- Legendarias como build-around y win conditions

**Impacto**:
- Deckbuilding con decisiones meaningful
- Legendarias definen arquetipos únicos
- Necesidad de ~80-100 cartas para MVP completo
- Prototipo necesita ~40-45 cartas
- Balancing más fácil (menos copias de cartas potentes)

---

## 26 Sep 2025 - Cartas con Personalidad vs Vanilla

**Contexto**: ¿Deben las cartas básicas ser vanilla o tener efectos únicos?

**Decisión Tomada**: Todas las cartas tienen efectos únicos o trade-offs

**Razón**:
- Más decisions per game
- Ninguna carta feel dead
- Better play experience
- Skill expression más alto
- Synergies more interesting

**Ejemplos exitosos**:
- Mercenario Ágil: condicional scaling
- Berserker Herido: high stats con downside
- Centinela Vigilante: defensive con upside

**Impacto**: 
- Cada carta requiere más design effort
- Balancing más complejo
- Tutorial debe explicar trade-offs
- Más memorable play experience

---

## 26 Sep 2025 - Final Stand por Clase: Efectos Únicos

**Contexto**: Cada clase necesita un Final Stand thematic y balanceado.

**Decisiones Tomadas**:

**🧬 ABOMINACIÓN - "Evolución Urgente"**
- Espécimen Perfecto puede ser invocado inmediatamente
- Bonus: +1/+1 por cada habilidad diferente que tenga

**🎲 CAOS - "Entropía Máxima"** 
- Empiezas el turno con 6 Entropía
- Bonus: No se resetea al final del turno

**🌓 CICLO - "Eclipse Desesperado"**
- Todas tus cartas funcionan como Eclipse
- Bonus: Dura todo el turno

**❤️ VITALIDAD - "Adrenalina Mortal"**
- Todas las cartas de vida se activan gratis
- Bonus: Sin costo de vida este turno

**Razón**: 
- Cada clase tiene comeback único
- Thematic fit perfecto
- Power level similar entre clases
- Dramatic moment garantizado

**Impacto**: Necesita testing extensivo para balance.

---

## 26 Sep 2025 - Combat System: Hearthstone-style

**Contexto**: ¿Qué sistema de combate fit mejor con el target de 5-10 min?

**Decisión Tomada**: Tablero como Hearthstone + targeting libre

**Especificaciones**:
- **Máximo 10 criaturas** por jugador
- **Daño persistente** (no se cura)
- **Free targeting** (atacante elige objetivo)
- **Sin bloqueo** automático

**Razón**:
- Familiar para audiencia target
- Streamlined pero estratégico
- Permite aggressive strategies
- Fácil de implementar digitalmente

**Impacto**:
- UI debe mostrar targets claramente
- Removal es más importante
- Combat tricks más valuable
- Positioning no importa (diferente a Magic)

---

## 26 Sep 2025 - Mulligan System: Individual como Hearthstone

**Contexto**: ¿Cómo permitir starting hand optimization sin delays?

**Decisión Tomada**: Mulligan individual como Hearthstone

**Mechanics**:
- **5 cartas iniciales**
- **Primer jugador**: no roba turno 1
- **Segundo jugador**: roba turno 1 (empieza con 6)
- **Mulligan individual**: cada carta por separado
- **Solo una vez**: no hay re-mulligan

**Razón**:
- Familiar y probado
- Balance entre consistency y speed
- Simple de implementar
- Good risk/reward decisions

**Impacto**: 
- Deckbuilding debe considerar mulligan strategy
- UI needs clear mulligan interface
- Tutorial debe explicar timing

---

## 26 Sep 2025 - Documentación Modular: Organización Final

**Contexto**: La documentación creció mucho y necesitaba reorganización.

**Decisión Tomada**: Estructura modular por temas

**Nueva Estructura**:

docs/
├── game-design/
│ ├── cartas-iniciales.md # Índice navegable
│ ├── cartas-basicas.md # 10 cartas neutras
│ ├── cartas-clases.md # 8 cartas signature
│ ├── mecanicas-clases.md # Sistema de 4 clases
│ ├── reglas-juego.md # Reglas completas
│ └── balance-analisis.md # Meta analysis
├── development/
│ ├── decisions-log.md # Este archivo
│ └── roadmap.md # Plan 6-12 meses
└── testing/
└── simulaciones.md # Logs de partidas

**Razón**:
- Información única en cada archivo
- Navegación fácil
- Sin duplicados
- Modular para updates

**Impacto**:
- Mejor maintainability
- Enlaces entre documentos
- Context switching menor
- Colaboración más fácil

---

## 26 Sep 2025 - Paper Testing Protocol: Metodología

**Contexto**: ¿Cómo validar el diseño antes de implementar digital?

**Decisión Tomada**: Paper testing con protocol específico

**Methodology**:
1. **Phase 1**: 10+ single games (diferentes matchups)
2. **Phase 2**: Best-of-3 matches  
3. **Phase 3**: Mini tournament (4 jugadores)
4. **Phase 4**: Balance adjustments basado en data

**Metrics to Track**:
- Game duration (target: 5-10 min)
- Win rates por clase (target: 45-55%)
- Final Stand frequency (target: 30-40%)
- Fun rating (target: 7+/10)
- Rule questions per game (target: <5)

**Razón**:
- Validación barata y rápida
- Iteración fácil en paper
- Real user feedback
- Confidence antes de development

**Impacto**: 
- Phase 1 development delay hasta validation
- Possible balance changes needed
- Rules clarification v2.0

---

## 26 Sep 2025 - Tech Stack: Full-Stack TypeScript

**Contexto**: Selección de tecnologías para development.

**Decisión Tomada**: 
- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: NestJS + Prisma + PostgreSQL
- **Real-time**: Socket.io
- **Monorepo**: PNPM + Turborepo
- **Deploy**: Vercel + Railway

**Razón**:
- Type safety end-to-end
- Shared types entre frontend/backend
- Ecosistema maduro y stable
- Good performance para real-time gaming
- Cost-effective deployment

**Impacto**:
- Learning curve manageable
- Development velocity alta
- Shared code entre client/server
- Easy deployment pipeline

---

## 📊 Estado de Decisiones

### ✅ **Decisiones Implementadas** (26 Sep 2025)
- [x] Tipo de gameplay (acción rápida)
- [x] 4 clases únicas con mecánicas diferenciadas
- [x] Sistema dual de recursos
- [x] 3 tipos de cartas + stack system
- [x] Combat system tipo Hearthstone
- [x] Condiciones de victoria + Final Stand
- [x] 18 cartas balanceadas listas para testing
- [x] Documentación modular completa
- [x] Paper testing protocol definido

### 🔄 **En Evaluación**
- [ ] Balance final después de paper testing
- [ ] UI/UX approach específico
- [ ] Monetization strategy (post-MVP)
- [ ] Asset style (art direction)

### 📝 **Log de Cambios de Este Documento**

#### Version 1.0 (26 Sep 2025)
- Documento inicial creado con todas las decisiones hasta la fecha
- 26 decisiones clave documentadas
- Estado del proyecto tracking incluido

#### Version 1.1 (26 Sep 2025) 
- ✅ Actualizado SINERGIA → ABOMINACIÓN
- ✅ Añadida decisión sobre rediseño de clase
- ✅ Documentación modular reorganizada
- ✅ Paper