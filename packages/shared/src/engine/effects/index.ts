/**
 * EFFECTS - Punto de entrada principal
 * Exporta todos los efectos y funciones relacionadas
 */

// Core
export * from './core'

// Dispatcher (punto de entrada principal)
export { applyAction, createEffectContext } from './dispatcher'

// Board effects (triggers, ON_ENTER, buffs condicionales, etc.)
export * from './board-effects'

// Efectos por categoría (exportados para uso interno y testing)
export * from './global-effects'
export * from './caos-effects'
export * from './ciclo-effects'
export * from './vitalidad-effects'
export * from './abominacion-effects'
