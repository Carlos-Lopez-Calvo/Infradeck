# 🏛️ MECÁNICAS DE CLASES

## 🧬 **ABOMINACIÓN - Espécimen Perfecto**

### **Concepto Core**
Crear la criatura definitiva heredando el poder de los caídos

### **Mecánica Detallada**
- **Invocación**: Turno 5+, cuesta 5 mana inicial, automático si cumples requisitos
- **Stats Base**: 5/5 (stats sólidos pero no OP)
- **Limitación**: Solo 1 Espécimen Perfecto en el campo, aumenta costo +2 mana cada invocación (máximo 10)
- **Herencia**: Todas las **habilidades** únicas de criaturas muertas
- **Efectos**: Solo via cartas específicas de ABOMINACIÓN

### **Progresión de Costo:**
- **1er Espécimen**: 5 mana
- **2do Espécimen**: 7 mana
- **3er Espécimen**: 9 mana  
- **4to+ Espécimen**: 10 mana (máximo)

### **Habilidades vs Efectos**

#### **Habilidades** (Se heredan automáticamente)
- **Prisa**: Puede atacar inmediatamente
- **Impaciente**: Puede atacar solo a criaturas
- **Robo de vida**: Convierte daño en vida
- **Taunt**: Debe ser atacada primero
- **Sigilo**: No puede ser objetivo hasta atacar
- **Veneno**: Cualquier daño destruye objetivo
- **Vuelo**: Solo atacada por criaturas con Vuelo
- **Escudo**: Previene próximo daño
- **Regeneración**: Se cura al final del turno

#### **Efectos** (Solo via cartas de clase)
- **"Al entrar"**: Triggers cuando entra al tablero
- **"Al morir"**: Triggers cuando es destruida
- **"Al atacar"**: Triggers al declarar ataque
- **"Al final de turno"**: Triggers en cleanup

### **Ejemplos de Herencia**

Cementerio: Centinela (Taunt) + Berserker Herido (Prisa) + [Criatura con Vuelo]
1er Espécimen: 5 mana, 5/5 con Taunt + Prisa + Vuelo
Si muere, 2do Espécimen: 7 mana, 5/5 con las mismas habilidades
Si muere, 3er Espécimen: 9 mana, 5/5 con las mismas habilidades


### **Estrategia**
1. **Early**: Poblar cementerio con criaturas que tengan buenas habilidades
2. **Mid**: Sobrevivir hasta turno 5 manteniendo board presence
3. **Late**: Invocar Espécimen como win condition, reinvocar si es necesario

### **Decisiones Clave**
- ¿Qué criaturas sacrificar para maximizar herencia?
- ¿Cuándo es seguro invocar el Espécimen?
- ¿Vale la pena reinvocar con costo aumentado?
- ¿Usar cartas de clase para añadir efectos o mantener board?

---

## 🎲 **CAOS - RNG Controlado**

### **Concepto Core**
Acumular Entropía para unleash massive random damage bursts

### **Mecánica Detallada**
- **Recurso**: Entropía (0-10, máximo)
- **Generación**: +1 Entropía por cada carta jugada
- **Uso**: Cartas específicas consumen Entropía para effects
- **Persistencia**: La Entropía NO se resetea entre turnos
- **Máximo**: 10 Entropía (no puede exceder)

### **Sistema de Entropía:**
- **Base**: Mantienes Entropía del turno anterior
- **+1 por carta jugada** (cualquier tipo)
- **Acumulación**: Se mantiene entre turnos hasta usar
- **Máximo 10**: Si llegas a 10, no puedes generar más
- **Consumption**: Solo cuando usas cartas que requieren Entropía

### **Ejemplo Multi-Turno:**
```
Turno 1: Juego 2 cartas → 2 Entropía (total: 2)
Turno 2: Juego 3 cartas → +3 Entropía (total: 5)  
Turno 3: Uso Tormenta (5 Entropía) → 0 Entropía restante
Turno 4: Juego 1 carta → 1 Entropía (total: 1)
```

### **Overflow Management:**
```
Turno X: Tengo 8 Entropía
Juego 3 cartas: +3 Entropía
Resultado: 10 Entropía (máximo), 1 Entropía perdida
```

### **Estrategia**
1. **Early**: Acumular Entropía jugando múltiples cartas baratas
2. **Mid**: Build up para big payoff turns
3. **Late**: Explosive turns con Entropía acumulada

### **Decisiones Clave**
- ¿Cuándo usar Entropía vs seguir acumulando?
- ¿Cómo optimizar para no waste Entropía en máximo 10?
- ¿Timing de big payoff spells?

---

## 🌓 **CICLO - Timing Perfecto**

### **Concepto Core**
Alternar entre estados Día/Noche/Eclipse para ventanas de poder

### **Mecánica Detallada**
- **Estados**: Día → Noche → Día (ciclo continuo)
- **Cambio**: Automático al final de cada turno
- **Eclipse**: Estado especial activado solo por cartas
- **Duración Eclipse**: Hasta el final del turno actual
- **Post-Eclipse**: Vuelve al estado anterior del ciclo

### **Sistema de Estados:**

#### **☀️ DÍA**
- **Efectos**: Cartas aggressive, more damage, Prisa
- **Philosophy**: Offensive windows, pressure opponent
- **Timing**: Odd turns (1, 3, 5...)

#### **🌙 NOCHE**  
- **Efectos**: Cartas defensive, healing, Taunt
- **Philosophy**: Defensive windows, sustain/setup
- **Timing**: Even turns (2, 4, 6...)

#### **🌓 ECLIPSE** (Special)
- **Activación**: Solo via cartas específicas
- **Efectos**: Best of both worlds + unique effects
- **Duración**: Hasta final del turno actual
- **Reset**: Vuelve a Día o Noche según correspondía

### **Progresión Típica:**
```
Turno 1 (CICLO): ☀️ DÍA (offense)
Turno 2 (Oponente): 🌙 NOCHE (defense)  
Turno 3 (CICLO): ☀️ DÍA (offense)
Turno 4 (Oponente): 🌙 NOCHE (defense)
Turno 5 (CICLO): Eclipse card → 🌓 ECLIPSE
Final turno 5: Vuelve a ☀️ DÍA
```

### **Estrategia**
1. **Día**: Maximize damage output, aggressive plays
2. **Noche**: Setup, defense, card advantage
3. **Eclipse**: Game-changing power turns

### **Decisiones Clave**
- ¿Cuándo activar Eclipse para maximum impact?
- ¿Adaptar strategy al estado actual o planear ahead?
- ¿Hold cartas para optimal timing windows?

---

## ❤️ **VITALIDAD - All-in Aggro**

### **Concepto Core**
Usar vida como recurso para effects más poderosos

### **Mecánica Detallada**
- **Recurso**: Tu vida actual
- **Costs**: 2-8 vida por effect
- **Timing**: Instant payment al activar
- **Limitación**: No puedes pagar más vida de la que tienes
- **Risk**: Te acerca a la muerte

### **Sistema de Vida:**
- **Vida Inicial**: 20 puntos
- **Payment**: Inmediato al usar ❤️ effects
- **No puede reducir**: Por debajo de 1 vida
- **Sinergias**: Algunas cartas mejores con vida baja

### **Ejemplo de Costs:**
- **❤️ Vida 2**: Effects pequeños (2 damage a criatura)
- **❤️ Vida 4**: Effects medianos (+3/+1, mass Prisa)
- **❤️ Vida 6**: Effects grandes (6 damage, unblockable)
- **❤️ Vida 8**: Effects masivos (12 damage)

### **Scaling de Risk/Reward:**
```
20 vida: Sin synergias, effects caros
15 vida: Mercenario Ágil +1/+1 
10 vida: Vampiro Ancestral +2/+2
5 vida: Avatar Doble golpe, Última Oportunidad available
1 vida: Vulnerable pero maximum payoffs
```

### **Estrategia**
1. **Early**: Moderate life investment para pressure
2. **Mid**: Bigger investments para crucial turns  
3. **Late**: All-in life spending para game-ending plays

### **Decisiones Clave**
- ¿Cuánta vida invertir en cada effect?
- ¿Cuándo es seguro go all-in?
- ¿Balance entre aggression y survival?
- ¿Timing de low-life synergies?

---

## 🎯 **Final Stand por Clase**

Cuando Final Stand se activa (vida → 1, max 10), cada clase obtiene:

### **🧬 ABOMINACIÓN - "Evolución Urgente"**
- **Efecto**: Tu Espécimen Perfecto puede ser invocado inmediatamente sin costo.
- **Regla**: Esta versión hereda solo habilidades del cementerio (no efectos programados).
- **Bonus**: Al entrar, +1/+1 por cada habilidad diferente que tenga.

### **🎲 CAOS - "Entropía Infinita"** 
- **Efecto**: Tu máximo de Entropía aumenta a 15
- **Bonus**: +2 Entropía al inicio de cada turno

### **🌓 CICLO - "Eclipse Perpetuo"**
- **Efecto**: Todas tus cartas funcionan como si fuera Eclipse
- **Bonus**: No cambias de estado hasta el final del duelo

### **❤️ VITALIDAD - "Furia Sanguinaria"**
- **Efecto**: Todas las cartas ❤️ Vida se activan gratis
- **Bonus**: Tus criaturas ganan +1/+0 por cada punto de vida perdido

---

## 📝 **Log de Cambios**

### Version 2.0 (28 Sep 2025)
- ✅ **4 Clases Completas**: Todas las mecánicas core definidas
- ✅ **ABOMINACIÓN**: Espécimen con scaling cost system
- ✅ **CAOS**: Entropía generation/consumption clarificado  
- ✅ **CICLO**: Day/Night/Eclipse timing system
- ✅ **VITALIDAD**: Life-as-resource risk/reward
- ✅ **Final Stand**: Class-specific powerful effects

**PRÓXIMO**: Completar cartas de cada clase (8 más por ABOMINACIÓN, CAOS, CICLO)

¡**MECÁNICAS DE LAS 4 CLASES COMPLETAS**! 

🎯 **Ahora incluye:**
- ✅ **ABOMINACIÓN**: Espécimen con nuevo sistema de costo escalable
- ✅ **CAOS**: Sistema de Entropía detallado
- ✅ **CICLO**: Estados Día/Noche/Eclipse  
- ✅ **VITALIDAD**: Vida como recurso
- ✅ **Final Stand**: Effects por clase

**¿Procedemos a documentar el set completo de ABOMINACIÓN o quieres ajustar alguna mecánica?**

## �� **Impacto del Cambio:**

### **✅ Mucho Más Potente:**
- **Build-up strategy** - acumular durante varios turnos
- **Bigger payoffs** - Tormenta con 8-10 Entropía = 16-20 damage
- **Consistent power** - no perder recursos

### **⚖️ Balance Considerations:**
- **Máximo 10** previene scaling infinito
- **Still requires setup** - necesitas jugar cartas
- **Consumption** - big effects vacían Entropía

### **🎲 New Strategy Patterns:**
- **Turns 1-3**: Accumulate phase (play cheap cards)
- **Turn 4-5**: Big payoff phase (Tormenta massive)
- **Management**: Balance building vs spending

**¿Te parece bien este cambio? ¿Procedemos con el set completo de ABOMINACIÓN?**
