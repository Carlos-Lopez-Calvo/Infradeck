const BASIC_FILLER = [
  'Ultima_Oportunidad',
  'Mercenario',
  'Explorador_Audaz',
  'Asesino_Delarossa',
  'Guardian_Novato',
  'Primera_Oportunidad',
  'Estudio_Frenetico',
  'Ascender',
  'Flecha_Certera',
  'Curandero_Sabio',
] as const

const fillToThirty = (classCards: string[]) => {
  const deck = [...classCards]
  let idx = 0
  while (deck.length < 30) {
    deck.push(BASIC_FILLER[idx % BASIC_FILLER.length])
    idx += 1
  }
  return deck.slice(0, 30)
}

const FIRST_30_CARDS = [
  'Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado','Fanatico_Desesperado',
  'Berserker_Sanguinario',
  'Cazador_de_Recompensas',
  'Ritual_Sangriento',
  'Guerrero_Herido',
  'Senor_de_la_Sangre',
  'Pacto_de_Poder',
  'Pacto_Final',
  'Frenesi_Final',
  'Avatar_de_la_Destruccion',
] as const

export const sampleDecks = {
  // Mazo de prueba: todas las cartas de clase ABOMINACION + relleno básico
  ABOMINACION: fillToThirty([
    'Especimen_Perfecto',
    'Especimen_Perfecto_Final_Stand',
    'Especimen_Perfecto_Evolucionado',
    'Explorador_Infectado',
    'Recolector_de_Tejidos',
    'Necrofago_Hambriento',
    'Ritual_Menor',
    'Anatomista_Experto',
    'Invocacion_Siniestra',
    'Perfeccionista_Obsesivo',
    'Ritual_de_Perfeccion',
    'Maestro_Necromantico',
    'Evolucion_Perfecta',
  ]),

  // Mazo de prueba: todas las cartas de clase CAOS + relleno básico
  CAOS: fillToThirty([
    'Aprendiz_Erratico',
    'Mago_del_Caos',
    'Ritual_Caotico',
    'Mercader_Loco',
    'Manipulador_del_Destino',
    'Portal_Inestable',
    'Caos_Controlado',
    'Senor_del_Caos',
    'Tormenta_Impredecible',
    'realidad_fracturada',
  ]),

  // Mazo de prueba: solo cartas de clase VITALIDAD
  VITALIDAD: [...FIRST_30_CARDS],
}

// Mazo del bot VITALIDAD: solo criaturas (generales + clase VITALIDAD)
export const botVitalidadCreatureDeck = [
  // Generales (criaturas)
  'Mercenario',
  'Cuervo_Astuto',
  'Asesino_Delarossa',
  'Guardian_Novato',
  'Explorador_Audaz',
  'Escriba_del_Lyrio',
  'Duelista_Frenetico',
  'Comerciante_Sagaz',
  'Berserker_Herido',
  'Soldado_Veterano',
  'Curandero_Sabio',
  'Centinela_Vigilante',
  'Maestro_de_Armas',
  'Acechador_Nocturno',
  'Vampiro_Ancestral',
  'Coloso_de_Hierro',
  'Ingeniera_Astuta',
  'Campeon_Caido',
  'Senor_de_la_Guerra',
  'Titan_Primordial',
  // VITALIDAD (criaturas de clase)
  'Fanatico_Desesperado',
  'Berserker_Sanguinario',
  'Cazador_de_Recompensas',
  'Guerrero_Herido',
  'Senor_de_la_Sangre',
  'Avatar_de_la_Destruccion',
  // Duplicados para llegar a 30
  'Fanatico_Desesperado',
  'Berserker_Sanguinario',
  'Guerrero_Herido',
  'Senor_de_la_Sangre',
] as const