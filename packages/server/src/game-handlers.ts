// Wrapper para configurar handlers de discover/scry
// Importa dinámicamente las funciones de configuración desde @infradeck/shared

export async function setDiscoverHandler(handler: any) {
  const { setDiscoverRequest } = await import('@infradeck/shared')
  setDiscoverRequest(handler)
}

export async function setScryHandler(handler: any) {
  const { setScryRequest } = await import('@infradeck/shared')
  setScryRequest(handler)
}

export async function setAdvancedSelectionHandler(handler: any) {
  const { setAdvancedSelectionRequest } = await import('@infradeck/shared')
  setAdvancedSelectionRequest(handler)
}
