# 🎮 Infradeck WebSocket Server

Servidor de juego multijugador en tiempo real para Infradeck.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot-reload)
npm run dev

# Compilar
npm run build

# Producción
npm start
```

## 📡 Endpoints

### HTTP
- `GET /health` - Health check

### WebSocket (Socket.IO)
- Puerto: `3001` (configurable vía `PORT` env)
- Namespace: `/` (default)

## 🎯 Eventos

### Cliente → Servidor
- `matchmaking:join(playerName)` - Unirse a la cola
- `matchmaking:leave()` - Salir de la cola
- `game:playCard({ handIndex, targets })` - Jugar carta
- `game:attack({ attackerIndex, targetType, targetIndex })` - Atacar
- `game:endTurn()` - Terminar turno

### Servidor → Cliente
- `connection:success({ playerId })` - Conexión exitosa
- `matchmaking:waiting()` - Esperando oponente
- `matchmaking:matched({ roomId, opponentName })` - Partida encontrada
- `matchmaking:playerLeft()` - Oponente desconectado
- `game:start(gameState)` - Juego iniciado
- `game:stateUpdate(gameState)` - Estado actualizado
- `game:end({ winner, reason })` - Juego terminado
- `game:error(error)` - Error en el juego

## 🏗️ Arquitectura

```
src/
├── index.ts        # Servidor principal + Socket.IO
├── types.ts        # TypeScript interfaces
├── gameRoom.ts     # Gestión de salas
└── matchmaking.ts  # Cola de matchmaking
```

## ⚙️ Configuración

### Variables de Entorno

```env
PORT=3001
NODE_ENV=development
```

### CORS

Por defecto permite conexiones desde `http://localhost:5173`. 
Para producción, actualizar en `src/index.ts`.

## 📝 Notas

- El estado del juego es simplificado para demostración
- Para producción, integrar con `@infradeck/shared` game engine
- Soporta reconexión automática del cliente
