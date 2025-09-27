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

**Impacto**: Documentación primero, código después.

---

## 26 Sep 2025 - Sistema de Recursos: Dual (Mana + Especiales)

**Contexto**: Necesitábamos definir cómo funcionan los recursos del juego.

**Opciones Consideradas**:
- Solo mana universal
- Recursos únicos por clase
- Sistema dual: mana universal + recursos especiales

**Decisión Tomada**: Sistema dual - Mana universal + recursos especiales por clase

**Razón**:
- Familiaridad (todos entienden mana)
- Diferenciación (cada clase única)
- Complejidad escalable (fácil aprender, profundo dominar)
- Balance natural entre clases

**Impacto**:
- Cartas tienen "modo básico" + "modo potenciado"
- Cada clase necesita mecánica de recurso única
- Tutorial puede enseñar mana primero, luego especiales

---

## 26 Sep 2025 - Mecánica de Cartas: Doble Modo

**Contexto**: Cómo integrar los recursos especiales en las cartas.

**Opciones Consideradas**:
- Cartas separadas para efectos básicos vs potenciados
- Cartas con costos alternativos
- Cartas con efectos que cambian según recurso disponible

**Decisión Tomada**: Cartas con "modo básico" + "modo potenciado" opcional

**Razón**:
- Menos cartas necesarias (cada una tiene 2 usos)
- Decisiones estratégicas profundas (¿uso ahora o espero?)
- Curva de aprendizaje suave
- Gestión de recursos más interesante

**Impacto**:
- No todas las cartas necesitan potenciación
- Balance más complejo (2 efectos por carta)
- Mayor profundidad estratégica
- UI debe mostrar claramente ambos modos

---

## 26 Sep 2025 - Estructura de Deck: Básicas + Clase

**Contexto**: ¿Pueden los jugadores mezclar cartas de diferentes clases?

**Opciones Consideradas**:
- Decks completamente libres
- Solo cartas de una clase
- Cartas básicas + una clase elegida

**Decisión Tomada**: Cartas básicas (neutras) + cartas de una clase elegida

**Razón**:
- Balance más fácil de mantener
- Identidad de clase clara
- Cartas básicas aseguran variedad
- Evita combinaciones rotas entre clases

**Impacto**:
- ~40% cartas básicas, ~15% por clase
- Meta más predecible y balanceado
- Cada clase mantiene identidad única

---

## 26 Sep 2025 - Las 4 Clases: Balance Triangle + Aggro

**Contexto**: Definir las 4 clases evitando designs problemáticos como snowball.

**Opciones Consideradas**:
- Momentum (rechazado - muy snowball)
- Deuda (rechazado - muy snowball)
- Sinergia ✅
- Caos ✅
- Ciclo ✅ (refinado a 3 fases)
- Vitalidad ✅ (refinado a pure trade-off)

**Decisión Tomada**: 
1. **SINERGIA** (Engine building)
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

## 26 Sep 2025 - Vitalidad: 100% Pure Trade-off

**Contexto**: ¿Debe Vitalidad tener mecánicas de recovery de vida?

**Opciones Consideradas**:
- Con recovery limitado
- Con mecánicas de "emergency brake"
- 100% pure trade-off sin recovery

**Decisión Tomada**: 100% pure trade-off, sin recovery

**Razón**:
- Esencia del aggro: "win fast or die trying"
- Natural counter por control/midrange
- Skill expression en timing perfecto
- Evita snowball mientras mantiene identidad

**Impacto**:
- Vitalidad debe cerrar partidas antes turno 6-7
- Meta naturalmente balanceado
- Partidas rápidas como objetivo de diseño
- Decisiones de vida/poder extremadamente impactantes

---

## 26 Sep 2025 - Tipos de Cartas: Hearthstone + Instantáneas

**Contexto**: Definir qué tipos de cartas existirán en el juego.

**Opciones Consideradas**:
- Solo Criaturas + Hechizos (como Hearthstone)
- Sistema complejo con múltiples tipos
- Hearthstone + Instantáneas (como Magic)

**Decisión Tomada**: 3 tipos - Criaturas, Hechizos, Instantáneas

**Razón**:
- Familiaridad de Hearthstone para accessibility
- Instantáneas añaden profundidad y counterplay
- Mantiene simplicidad sin sacrificar estrategia
- Perfect fit con partidas de 5-10 minutos

**Impacto**:
- Sistema de stack simplificado necesario
- Timer de respuesta (10-15 segundos)
- UI debe mostrar claramente ventanas de respuesta
- Tutorial debe enseñar timing de instantáneas

---

## 26 Sep 2025 - Estructura de Turnos: 4 Fases Streamlined

**Contexto**: Definir las fases del turno para manejar instantáneas correctamente.

**Opciones Consideradas**:
- 5 fases como Magic (con Principal 1 y 2)
- 3 fases súper simple (Principal, Combate, Final)
- 4 fases balanceadas (sin Principal 2)

**Decisión Tomada**: 4 fases - Inicio, Principal, Combate, Final

**Razón**:
- Elimina redundancia de Principal 2
- Mantiene timing claro para instantáneas
- Streamlined para partidas rápidas
- Familiar para jugadores de otros TCGs

**Impacto**:
- Ritmo de juego más rápido
- Menos confusión sobre cuándo jugar cartas
- Timing de instantáneas bien definido
- Fases tienen propósitos claros

---

## 26 Sep 2025 - Condiciones de Victoria: Eliminación + Final Stand

**Contexto**: Cómo se gana/pierde el juego, incluyendo mecánicas anti-frustración.

**Opciones Consideradas**:
- Solo reducir vida a 0 (simple)
- Múltiples condiciones complejas
- Eliminación + mecánica de "última oportunidad"

**Decisión Tomada**: Eliminación primaria + Final Stand + condiciones alternativas

**Razón**:
- Final Stand permite comebacks dramáticos
- Evita que partidas terminen demasiado abruptamente
- Condiciones alternativas previenen stall infinito
- Mantiene tensión hasta el final

**Impacto**:
- Partidas más emocionantes y menos frustrantes
- Skill expression en gestión de Final Stand
- Balance entre clases mejorado (especialmente Vitalidad)
- Necesario explicar mecánica en tutorial

---

## 26 Sep 2025 - Final Stand: Solo Defensivo y Temporal

**Contexto**: Cómo balancear la mecánica de Final Stand para evitar abuse.

**Opciones Consideradas**:
- Final Stand permanente hasta morir
- Final Stand activable voluntariamente
- Final Stand solo defensivo, temporal, una vez

**Decisión Tomada**: Solo se activa cuando oponente causa daño letal, efectos de 1 turno

**Razón**:
- Evita que Vitalidad abuse la mecánica
- Mantiene como "salvación" no "estrategia"
- Efectos temporales evitan partidas alargadas
- Inmunidad temporal da oportunidad real de comeback

**Impacto**:
- Vitalidad no puede "suicidarse" para activar Final Stand
- Cada clase tiene momentos épicos pero controlados
- Balance perfecto entre dramático y no abusable
- Clear timing rules evitan confusión

---

## 26 Sep 2025 - Tamaño de Deck y Sistema de Rarezas

**Contexto**: Definir el tamaño de deck y límites de copias para balancing y deckbuilding.

**Opciones Consideradas**:
- 20 cartas (máxima consistencia)
- 25 cartas (sweet spot)
- 30 cartas (estándar TCG)

**Decisión Tomada**: 30 cartas con sistema de copias por rareza

**Sistema Completo**:
- **30 cartas por deck**
- **Máximo 2 copias** de cartas Básicas y Raras
- **Máximo 1 copia** de cartas Legendarias
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

**Opciones Consideradas**:
- Cartas vanilla simples (solo stats)
- Cartas con efectos básicos
- Cartas con personalidad y trade-offs

**Decisión Tomada**: Cartas con personalidad, efectos únicos y trade-offs claros

**Razón**:
- Más gameplay interesante desde el primer turno
- Cada carta ofrece decisiones meaningful
- Synergy sutil con mecánicas de las 4 clases
- Evita gameplay aburrido en early game

**Impacto**:
- Cada carta básica tiene una "personalidad" única
- Trade-offs claros (power vs risk) en cada diseño
- Tutorial debe explicar efectos, no solo stats
- Balance más complejo pero gameplay más rico

---

## 26 Sep 2025 - Balance: Berserker Sanguinario

**Contexto**: La carta inicial de Vitalidad (3/1 por 2 → 5/2 prisa por 3 vida) estaba demasiado fuerte.

**Opciones Consideradas**:
- 3/1 → 5/2 prisa por 3 vida (original)
- 2/1 → 4/2 prisa por 4 vida
- 2/1 → 5/2 prisa por 4 vida (balanceado)

**Decisión Tomada**: 2/1 baseline, +3/+1 y prisa por 4 vida

**Razón**:
- Baseline justo (2/1 por 2 mana = stats estándar)
- Costo real de vida (4 vida = 20% de vida inicial)
- Sigue siendo amenaza seria (5/2 prisa) pero no roto
- Timing de decisión importante (¿vale la pena 4 vida en turno 2?)

**Impacto**:
- Vitalidad mantiene identidad agresiva sin ser OP
- Contraplay disponible para oponente
- Trade-off genuino entre poder y supervivencia
- Ejemplo de balance iterativo funcionando

---

## Template para Futuras Decisiones

```markdown
## [FECHA] - [TÍTULO]
**Contexto**: 
**Opciones Consideradas**: 
**Decisión Tomada**: 
**Razón**: 
**Impacto**: 
```
```

## ✅ **Documentación Completamente Actualizada**

He actualizado todos los archivos con el progreso completo:

### 📋 **PROJECT_STATUS.md**
- ✅ Progreso al 90% (18 cartas listas para testear)
- ✅ Fase 0.2 - Paper Prototype iniciada
- ✅ Todas las cartas diseñadas listadas

### 🎮 **game-design-document.md**
- ✅ 18 cartas específicas documentadas
- ✅ Template actualizado con mana 1-10
- ✅ Set de mini-test completo especificado

### 📝 **decisions-log.md**
- ✅ Decisión de cartas con personalidad
- ✅ Decisión de balance del Berserker
- ✅ Rationale completo para cada decisión

## 🚀 **Estado Actual**

**✅ COMPLETADO**: 18 cartas balanceadas listas para paper test

**🔄 EN CURSO**: Paper playtesting para validar mecánicas

**¡Perfecto para empezar el testing físico!** 🎲