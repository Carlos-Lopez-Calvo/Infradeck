export const CLASS_COLORS = {
  ABOMINACION: {
    primary: 'violet-600',
    secondary: 'violet-400',
    bg: 'from-violet-800 to-violet-900',
    border: 'border-violet-600',
    shadow: 'shadow-violet-400/50'
  },
  CAOS: {
    primary: 'amber-600',
    secondary: 'amber-400', 
    bg: 'from-amber-800 to-amber-900',
    border: 'border-amber-600',
    shadow: 'shadow-amber-400/50'
  },
  CICLO: {
    primary: 'cyan-600',
    secondary: 'cyan-400',
    bg: 'from-cyan-800 to-cyan-900', 
    border: 'border-cyan-600',
    shadow: 'shadow-cyan-400/50'
  },
  VITALIDAD: {
    primary: 'red-600',
    secondary: 'red-400',
    bg: 'from-red-800 to-red-900',
    border: 'border-red-600', 
    shadow: 'shadow-red-400/50'
  }
} as const

// ✅ NUEVO: Colores para cartas básicas (sin classType)
export const BASIC_CARD_COLORS = {
  primary: 'slate-600',
  secondary: 'slate-400',
  bg: 'from-slate-800 to-slate-900',
  border: 'border-slate-700',
  shadow: 'shadow-slate-400/50'
} as const

// Resto del archivo sin cambios...
export const CARD_DIMENSIONS = {
  hand: 'w-32 h-44',
  field: 'w-28 h-40',
  stack: 'w-36 h-48',
  graveyard: 'w-24 h-32'
} as const

export const ANIMATION_VARIANTS = {
  cardEntrance: {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.9 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  
  cardHover: {
    scale: 1.05,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  
  cardTap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  },
  
  slideUp: {
    initial: { 
      opacity: 0, 
      y: 50 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }
}