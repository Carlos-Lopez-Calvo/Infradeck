# 🎮 INFRADECK - Game Design Document

## 📋 Información General

- **Nombre del Juego**: Infradeck
- **Género**: Card Game 1v1 Online
- **Plataforma**: Web (PC/Mobile)
- **Duración de partida**: 5-10 minutos
- **Jugadores**: 2 (1v1)
- **Edad objetivo**: 13+

## 🎯 Concepto Central

### Vision Statement
"Un juego de cartas rápido y estratégico donde cada decisión cuenta, diseñado para partidas intensas pero rápidas que respetan el tiempo del jugador."

### Pilares de Diseño
1. **Accesible pero Profundo**: Fácil de aprender, difícil de dominar
2. **Ritmo Dinámico**: Decisiones rápidas, turnos ágiles
3. **Variedad Estratégica**: Múltiples caminos hacia la victoria
4. **Evolución Constante**: Contenido y balance en constante mejora

## 🎲 Mecánicas Core ✅ COMPLETADAS

### Sistema de Recursos
- **Mana Universal**: Todos los jugadores usan mana como recurso principal (1-10 por turno)
- **Recursos Especiales**: Cada clase tiene un recurso único adicional
- **Vida Inicial**: 20 puntos
- **Condición de Victoria**: Reducir vida del oponente a 0 (+ Final Stand)

### Sistema de Cartas Dual
- **Modo Básico**: Efecto estándar pagando solo mana
- **Modo Potenciado**: Efecto mejorado gastando recurso especial de clase
- **Selectividad**: No todas las cartas tienen potenciación

### Estructura de Deck
- **30 cartas por deck**
- **Cartas Básicas**: Neutras, disponibles para todas las clases
- **Cartas de Clase**: Exclusivas de cada clase
- **Composición**: Solo cartas básicas + cartas de tu clase elegida
- **Sistema de copias**: Máx 2 copias (Básicas/Raras), 1 copia (Legendarias)

## 🃏 Tipos de Cartas ✅ DEFINIDOS

### 1. **CRIATURAS** 🛡️
- Van al tablero con Ataque/Vida
- Pueden atacar al oponente o defender
- Persisten hasta ser destruidas
- Core del gameplay como Hearthstone

### 2. **HECHIZOS** ⚡
- Efecto inmediato
- Solo se pueden jugar en tu turno
- Van directamente al cementerio
- Efectos diversos: daño, curación, draw, etc.

### 3. **INSTANTÁNEAS** 💨
- Se pueden jugar en respuesta a acciones del oponente
- Sistema de stack como Magic (simplified)
- Timer de 10-15 segundos para responder
- Añaden profundidad estratégica y counterplay

#### Sistema de Stack para Instantáneas:
- ✅ **Tu turno** (cualquier momento)
- ✅ **Turno del oponente** (en respuesta)
- ✅ **En respuesta a hechizos/instantáneas**
- ✅ **En respuesta a habilidades de criaturas**
- ✅ **Cuando declara ataques**
- ✅ **Al final de cada turno**

## ⏰ Estructura de Turnos ✅ DEFINIDA

### 4 Fases por Turno:

#### 1. **🌅 INICIO**
- Roba 1 carta automáticamente
- Gana +1 mana máximo (cap 10)
- Triggers automáticos de inicio de turno
- *Instantáneas permitidas después de triggers*

#### 2. **⚡ PRINCIPAL**
- Jugar criaturas y hechizos
- Activar habilidades de criaturas
- *Instantáneas permitidas en respuesta a todo*

#### 3. **⚔️ COMBATE**
- Declarar ataques con criaturas
- Oponente declara bloqueos
- Resolución de daño de combate
- *Instantáneas permitidas en cada paso*

#### 4. **🌙 FINAL**
- Triggers de final de turno
- Limpieza automática de efectos temporales
- *Instantáneas permitidas*

## 🏆 Condiciones de Victoria y Derrota ✅ DEFINIDAS

### Victoria Primaria: Eliminación
- **Reduces la vida del oponente a 0**
- Condición más común y directa

### ⚡ Mecánica FINAL STAND
**Activación**: Solo cuando el **oponente** te causaría daño letal

**Efectos**:
1. ✅ Tu vida va a 1 (no mueres)
2. ✅ **Vida máxima limitada a 10** hasta final del duelo
3. ✅ **Inmunidad total** hasta el inicio de tu próximo turno
4. ✅ **Una sola vez** por partida por jugador
5. ✅ **No se puede responder** a la activación

**Bonus por Clase (solo en tu turno después de Final Stand)**:
- **🔗 SINERGIA**: Todas tus cartas cuentan como si tuvieras el doble de contadores
- **🎲 CAOS**: Empiezas con 6 Entropía y no se resetea este turno
- **🌓 CICLO**: Todas tus cartas funcionan como si fuera Eclipse
- **❤️ VITALIDAD**: Todas tus cartas de vida se activan gratis (sin costo de vida)

### Condiciones Alternativas:
- **⏰ Victoria por Tiempo**: Turno 15-20, jugador con más vida gana
- **🃏 Victoria por Deck Vacío**: Si intentas robar sin cartas, pierdes
- **🏳️ Rendición**: Disponible en cualquier momento

## 🏛️ Las 4 Clases

### 1. SINERGIA 🔗 (Late Game Engine)
**Recurso Especial**: Contadores por tipo de carta jugada
**Filosofía**: "Construir lentamente, dominar completamente"

- **Estilo de Juego**: Late game, value engine, construcción gradual
- **Fortalezas**: Domina partidas largas, múltiples arquetipos
- **Debilidades**: Vulnerable early game, setup requerido
- **Contraplay**: Presión agresiva temprana

### 2. CAOS 🎲 (Adaptable Control)
**Recurso Especial**: Entropía (acumula por cartas jugadas, resetea cada turno)
**Filosofía**: "Adaptarse y superar cualquier situación"

- **Estilo de Juego**: Reactive control, múltiples opciones, adaptable
- **Fortalezas**: Responde a cualquier meta, swing turns
- **Debilidades**: Inconsistencia, skill floor alto
- **Contraplay**: Consistencia y presión constante

### 3. CICLO 🌓 (Midrange Timing)
**Recurso Especial**: Ciclo Día/Noche (automático cada turno) + Eclipse (activado por cartas)
**Filosofía**: "Timing perfecto para máximo impacto"

- **Estilo de Juego**: Midrange, timing estratégico, ventanas de poder
- **Fortalezas**: Burst damage en momentos clave, planificación
- **Debilidades**: Predecible, dependiente del timing
- **Contraplay**: Disrupción del timing, juego fuera de sus ventanas

### 4. VITALIDAD ❤️ (Pure Aggro)
**Recurso Especial**: Vida propia (sin métodos de recovery)
**Filosofía**: "Ganar rápido o morir en el intento"

- **Estilo de Juego**: All-in aggro, trade-offs extremos, presión constante
- **Fortalezas**: Poder early game explosivo, presión implacable
- **Debilidades**: Auto-limitante, sin recovery, vulnerable late game
- **Contraplay**: Supervivencia early, drag to late game

## 🃏 Set de Mini-Test: 18 Cartas ✅ DISEÑADAS

### **Cartas Básicas (Neutras) - 10 cartas**

#### **Criaturas (5)**
- **[Mercenario Ágil]** - 1 Mana 2/1 - *Al jugarse: Si tienes ≤15 vida, +1/+1*
- **[Escriba Estudioso]** - 2 Mana 1/3 - *Al jugarse: Roba 1, descarta 1*
- **[Berserker Herido]** - 3 Mana 4/2 - *Al inicio de turno: Recibe 1 daño*
- **[Centinela Vigilante]** - 4 Mana 2/5 - *Al final de turno: Si no atacaste, roba 1*
- **[Campeón Caído]** - 6 Mana 5/5 ★ - *Cuando aliado muere: +1/+1 permanente*

#### **Hechizos (3)**
- **[Flecha Certeza]** - 2 Mana - *3 daño. Si mata, roba 1*
- **[Intercambio Justo]** - 3 Mana - *Ambos jugadores roban 2*
- **[Llamarada Dolorosa]** - 4 Mana ★ - *1 daño a todas las criaturas. Por cada muerte, 1 daño al oponente*

#### **Instantáneas (2)**  
- **[Reflejo Rápido]** - 1 Mana - *Anula hechizo que te tenga como objetivo*
- **[Momento Crucial]** - 3 Mana - *Criatura atacante +2/+2. Si mata, no recibe daño*

### **Cartas Signature por Clase - 8 cartas**

#### **🔗 SINERGIA**
- **[Reclutador Veterano]** - 3 Mana 2/3 ★ - *Al jugarse: +1 contador Soldado. 🔗2+ Soldados: Al final del turno, invoca Soldado 1/1*
- **[Forja de Almas]** - 5 Mana ⭐ - *Todas las criaturas +1/+1. 🔗3+ Soldados: +2/+2 y "Al morir: Soldado 2/2"*

#### **🎲 CAOS**
- **[Mago del Caos]** - 2 Mana 1/2 ★ - *Al jugarse: +1 Entropía. 🎲3+ Entropía: Al final del turno, efecto aleatorio*
- **[Tormenta Impredecible]** - 4 Mana ⭐ - *3 daño aleatorio. 🎲5+ Entropía: 6 daño aleatorio + roba 2*

#### **🌓 CICLO**
- **[Cambiaformas Lunar]** - 3 Mana ★ - *☀️Día: 2/3, 🌙Noche: 3/2 Sigilo, ☀️Eclipse: 4/4 Sigilo+Prisa*
- **[Eclipse Eterno]** - 6 Mana ⭐ - *4 daño. 🌓Solo en Eclipse: Activa Eclipse + 7 daño*

#### **❤️ VITALIDAD**
- **[Berserker Sanguinario]** - 2 Mana 2/1 ★ - *❤️4 Vida: +3/+1 y Prisa hasta final del turno*
- **[Pacto Final]** - 4 Mana ⭐ - *5 daño al oponente. ❤️8 Vida: 12 daño al oponente*

*(★ = Rara, ⭐ = Legendaria)*

## 🎮 Experiencia del Jugador

### Flujo de Partida Completo
1. **Selección de Clase** (5 segundos)
2. **Mulligan/Setup** (30 segundos)
3. **Gameplay principal** (4-8 minutos)
4. **Resolución + Final Stand** (15-60 segundos)

### Progresión
- **Corto plazo**: Ganar partidas individuales, dominar una clase
- **Medio plazo**: Mejorar ranking, experimentar con todas las clases
- **Largo plazo**: Dominar meta, adaptarse a nuevas expansiones

## 📊 Balance y Meta

### Triangle Meta Esperado
- **VITALIDAD** (Aggro) > **SINERGIA** (Control) > **CICLO/CAOS** (Midrange/Control) > **VITALIDAD**
- **Cada clase counter a otra**, ninguna dominante universal
- **Skill expression** diferente en cada arquetipo
- **Final Stand** permite comebacks épicos sin romper balance

---

## 📝 Log de Cambios

### Version 0.1 (26 Sep 2025)
- Documento inicial creado
- Framework del GDD definido

### Version 0.2 (26 Sep 2025)
- ✅ Sistema de recursos dual definido
- ✅ 4 clases completas diseñadas y balanceadas
- ✅ Mecánica de cartas con doble modo

### Version 0.3 (26 Sep 2025)
- ✅ 3 tipos de cartas definidos (Criaturas/Hechizos/Instantáneas)
- ✅ Estructura de turnos de 4 fases establecida
- ✅ Condiciones de victoria y Final Stand completas

### Version 0.4 (26 Sep 2025)
- ✅ Sistema de deck y rarezas definido (30 cartas, 3 rarezas)
- ✅ 18 cartas completas diseñadas y balanceadas
- ✅ Set de mini-test listo para paper prototype
- **PRÓXIMO**: Paper playtesting y validación