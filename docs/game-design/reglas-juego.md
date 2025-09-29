# ⚔️ REGLAS DEL JUEGO

> Sistema completo de reglas para Infradeck

## 🎯 **Objetivo del Juego**

Reduce la vida de tu oponente a 0 usando cartas de tu mazo personalizado.

---

## 🏗️ **Setup Inicial**

### **Configuración de Partida**
- **Vida inicial**: 20 puntos cada jugador
- **Mana inicial**: 0 (crece +1 por turno, máximo 10)
- **Tamaño de deck**: 30 cartas
- **Mano inicial**: 5 cartas
- **Primer jugador**: NO roba carta en turno 1
- **Segundo jugador**: SÍ roba carta en turno 1 → empieza con 6 cartas

### **Mulligan (Como Hearthstone)**
- **Individual**: Cada carta se puede devolver por separado
- **Una sola vez**: No hay mulligan múltiple
- **Sin reveal**: El oponente no ve qué cartas cambias

### **Restricciones de Deck**
- **Cartas básicas**: Máximo 2 copias
- **Cartas raras**: Máximo 2 copias  
- **Cartas legendarias**: Máximo 1 copia
- **Clases**: Solo cartas básicas + 1 clase elegida

---

## 🃏 **Tipos de Cartas**

### **1. CRIATURAS** 🛡️
- **Stats**: Ataque/Vida (ej: 3/2 = 3 ataque, 2 vida)
- **Tablero**: Van al tablero al ser jugadas
- **Combate**: Pueden atacar a partir del turno siguiente
- **Máximo**: 10 criaturas por jugador en tablero

### **2. HECHIZOS** ⚡
- **Timing**: Solo en tu turno, fase Principal
- **Efecto**: Inmediato, luego van al cementerio
- **Ejemplos**: Daño directo, card draw, buffs temporales

### **3. INSTANTÁNEAS** 💨
- **Timing**: Cualquier momento cuando tengas prioridad
- **Stack**: Sistema tipo Magic (simplificado)
- **Timer**: 10-15 segundos para responder
- **Usos**: Counterplay, combat tricks, responses

---

## ⏰ **Estructura de Turnos**

### **🌅 FASE 1: INICIO**
1. **Roba carta** (excepto primer jugador en T1)
2. **Gana +1 mana máximo** (hasta máximo 10)
3. **Triggers automáticos** de inicio de turno
4. **Instantáneas permitidas** después de triggers

### **⚡ FASE 2: PRINCIPAL**
1. **Jugar cartas** de tu mano (criaturas, hechizos)
2. **Activar habilidades** de criaturas en tablero
3. **Instantáneas permitidas** en respuesta a todo

### **⚔️ FASE 3: COMBATE**
1. **Declarar atacantes** (seleccionar criaturas que atacan)
2. **Elegir objetivos** para cada atacante:
   - **Cara**: Ataque directo al oponente
   - **Criatura**: Ataque a criatura específica del oponente
3. **Window de instantáneas** antes de resolución
4. **Resolución simultánea** de todo el daño de combate
5. **Destruir criaturas** con vida ≤ 0

### **🌙 FASE 4: FINAL**
1. **Triggers de final de turno** se resuelven
2. **Limpieza automática** de efectos temporales
3. **Instantáneas permitidas** durante triggers
4. **Pasa turno** al oponente

---

## ⚔️ **Sistema de Combate**

### **Tablero**
- **Layout**: Una fila por jugador (como Hearthstone)
- **Límite**: Máximo 10 criaturas por jugador
- **Orden**: Las criaturas mantienen orden de juego

### **Ataque**
- **Targeting libre**: Atacante elige objetivo para cada criatura
- **Sin interceptación**: Defensor no puede "bloquear"
- **Simultáneo**: Todo el daño de combate se aplica a la vez

### **Daño y Muerte**
- **Persistente**: El daño NO se cura entre turnos
- **Acumulativo**: Daño se suma hasta destruir la criatura
- **Muerte**: Vida ≤ 0 → criatura va al cementerio
- **Face damage**: Reduce vida del jugador directamente

---

## 🎲 **Sistema de Stack (Instantáneas)**

### **Prioridad**
1. **Jugador activo** tiene prioridad primera
2. **Responses**: Oponente puede responder a tu acción
3. **Chain responses**: Puedes responder a su response
4. **Resolve**: Cuando ambos pasan, stack resuelve LIFO

### **Timing Windows**
- ✅ **Tu turno**: Cualquier momento
- ✅ **Turno oponente**: En response a sus acciones
- ✅ **Combate**: Antes y después de declarar ataques
- ✅ **Spells**: En response a hechizos/instantáneas
- ✅ **Triggers**: En response a habilidades

### **Timer**
- **10-15 segundos** para responder
- **Auto-pass**: Si no respondes a tiempo
- **Extensión**: En situaciones complejas

---

## 🏆 **Condiciones de Victoria**

### **👑 Victoria Primaria: Eliminación**
**Reduces la vida del oponente a 0**

### **⚡ FINAL STAND** (Safety Valve)
**Cuando**: Solo si el **oponente** te causa daño letal  
**Efectos**:
1. Tu vida va a **1** (no mueres)
2. **Vida máxima** limitada a **10** resto del duelo
3. **Inmunidad total** hasta inicio de tu próximo turno
4. **Una sola vez** por partida
5. **No se puede responder** a la activación

**Bonus por Clase** (en tu turno post-Final Stand):
- **🧬 ABOMINACIÓN**: Espécimen Perfecto inmediato con +1/+1 por habilidad
- **🎲 CAOS**: Empiezas con 6 Entropía, no resetea este turno
- **🌓 CICLO**: Todas tus cartas funcionan como Eclipse
- **❤️ VITALIDAD**: Cartas de vida se activan gratis

### **🏃 Victorias Alternativas**
- **⏰ Tiempo**: Turno 15-20 → jugador con más vida gana
- **🃏 Deck vacío**: Intentar robar sin cartas → pierdes inmediatamente
- **💀 Rendición**: Jugador puede rendirse cuando quiera

---

## 🧬 **Habilidades (Keywords)**

### **⚡ Agresivas**
#### **Prisa**
- **Efecto**: Puede atacar el turno que entra a cualquier objetivo
- **Uso**: Pressure inmediata, ignora summoning sickness

#### **Impaciente** 
- **Efecto**: Puede atacar el turno que entra pero solo a criaturas
- **Uso**: Control del board sin face damage inmediato

#### **Robo de vida**
- **Efecto**: Convierte el daño que hace la criatura en vida
- **Uso**: Recovery + pressure simultánea

#### **Veneno**
- **Efecto**: Cualquier daño que haga destruye la criatura objetivo
- **Uso**: Removal eficiente independiente de stats

### **🛡️ Defensivas**
#### **Taunt**
- **Efecto**: Obliga a las criaturas a ser objetivo de ataques
- **Uso**: Protege cara y criaturas importantes

#### **Sigilo**
- **Efecto**: No se puede seleccionar para un ataque hasta que ataque
- **Uso**: Setup protection, surprise attacks

#### **Escudo**
- **Efecto**: Previene el próximo daño que reciba (se consume)
- **Uso**: Survival tool, anti-removal

#### **Regeneración**
- **Efecto**: Se cura completamente al final del turno
- **Uso**: Persistent threat, long-term value

### **🔄 Especiales**
#### **Vuelo**
- **Efecto**: Solo puede ser atacada por criaturas con Vuelo
- **Uso**: Evasion, hard to remove threats

---

## 📏 **Zonas del Juego**

### **🃏 Mano**
- **Límite**: Sin límite específico
- **Información**: Privada (solo tú la ves)
- **Acceso**: Puedes jugar cartas desde aquí

### **🎯 Tablero**  
- **Límite**: 10 criaturas por jugador
- **Información**: Pública (ambos la ven)
- **Estados**: Criaturas pueden tener daño, buffs, etc.

### **⚰️ Cementerio**
- **Información**: Pública (ambos pueden revisar)
- **Orden**: Se mantiene orden de muerte
- **Acceso**: Algunas cartas pueden interactuar

### **📚 Biblioteca (Deck)**
- **Información**: Privada y oculta
- **Orden**: Aleatorio después de shuffle
- **Acceso**: Solo via "robar carta"

---

## ⚖️ **Reglas Especiales**

### **🔄 Efectos Simultáneos**
- **Triggers múltiples**: Se resuelven en orden de jugador activo
- **Muerte simultánea**: "Al morir" triggers se activan juntos
- **Stack complejo**: Se resuelve desde arriba hacia abajo

### **💰 Costos y Timing**
- **Mana**: Se gasta al jugar la carta
- **Vida (Vitalidad)**: Se paga inmediatamente al activar
- **Entropía (Caos)**: Se gana al jugar cartas, resetea cada turno
- **Ciclo**: Cambia automáticamente cada turno

### **🚫 Restrictions**
- **Una acción por timing**: No puedes jugar 2 hechizos simultáneamente
- **Mana disponible**: No puedes gastar más mana del que tienes
- **Vida disponible**: No puedes pagar más vida de la que tienes
- **Board space**: No puedes jugar criatura si tienes 10

---

## 📖 **Resolución de Conflictos**

### **🎯 Priority**
1. **Efectos de cartas** > reglas generales
2. **Instantáneas** > hechizos/habilidades
3. **Timestamp**: Efectos más recientes se resuelven primero

### **❓ Timing Ambiguity**
- **"Al mismo tiempo"**: Jugador activo elige orden
- **"Al final de turno"**: Después de todas las otras acciones
- **"Inmediatamente"**: No se puede responder con instantáneas

---

## 📝 **Notas de Implementación**

### **⏱️ Para Partidas Digitales**
- **Timer por acción**: 15-30 segundos máximo
- **Chess clock**: Tiempo total por jugador (5-10 min)
- **Auto-skip**: Skip automático en situaciones obvias

### **📱 Para Paper Prototype**
- **Tracking simple**: Vida en papel, mana con fichas
- **Stack mental**: Anotar orden de instantáneas
- **Timer manual**: Reloj/cronómetro para decisions

---

## 📝 **Log de Cambios**

### Version 1.0 (26 Sep 2025)
- ✅ Reglas completas establecidas
- ✅ Final Stand balanceado y especificado
- ✅ Sistema de mulligan como Hearthstone
- ✅ Stack simplificado pero funcional
- ✅ Timing windows claros para instantáneas

### Version 1.1 (26 Sep 2025)
- ✅ **Habilidades oficiales**: 9 keywords definidos
- ✅ **Categorización**: Agresivas, Defensivas, Especiales
- ✅ **Uso y ejemplos**: Cada habilidad con explicación
- **PRÓXIMO**: Paper testing con habilidades implementadas