# Desplegar Infradeck para jugar online (2 PCs distintos)

Stack: **Neon** (Postgres) + **Render** (API + WebSocket) + **Vercel** (frontend).

## 1. Base de datos — Neon (gratis)

1. Crea cuenta en [neon.tech](https://neon.tech).
2. Nuevo proyecto → copia la **connection string** (PostgreSQL).
3. Debe incluir `?sslmode=require` al final si no viene ya.

Ejemplo:
```txt
postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

## 2. Backend — Render (gratis con limitaciones)

1. Sube el repo a **GitHub** (si aún no está).
2. [render.com](https://render.com) → **New** → **Web Service** → conecta el repo.
3. Configuración:

| Campo | Valor |
|--------|--------|
| Root Directory | `packages/server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm run start:prod` (aplica migraciones al arrancar) |
| Health Check Path | `/health` |

4. **Environment variables** (Environment) — **obligatorio antes del primer deploy**:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Connection string de Neon (con `?sslmode=require`) |
| `JWT_SECRET` | String largo aleatorio (32+ chars) |
| `CORS_ORIGIN` | URL del front (paso 3), ej. `https://infradeck.vercel.app` |
| `GOOGLE_CLIENT_ID` | Mismo client ID de Google OAuth |

5. Deploy. Anota la URL del servicio, ej. `https://infradeck-api.onrender.com`.

**Nota:** el plan free **se duerme** tras ~15 min sin uso; la primera petición puede tardar ~30–60 s.

### Probar el API

```bash
curl https://TU-API.onrender.com/health
```

Debe responder `{"status":"ok",...}`.

## 3. Frontend — Vercel (gratis)

1. [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
2. Configuración:

| Campo | Valor |
|--------|--------|
| Root Directory | `web` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. **Environment Variables** (Production):

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://TU-API.onrender.com` |
| `VITE_WS_URL` | `https://TU-API.onrender.com` (misma URL que API) |
| `VITE_GOOGLE_CLIENT_ID` | Tu client ID de Google |

4. Deploy. Anota la URL, ej. `https://infradeck.vercel.app`.

5. Vuelve a **Render** y actualiza `CORS_ORIGIN` con la URL exacta de Vercel (sin barra final). Redeploy del API si hace falta.

## 4. Google OAuth

En [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → tu OAuth client:

**Authorized JavaScript origins:**
- `https://infradeck.vercel.app` (tu dominio Vercel)
- `http://localhost:5173` (desarrollo local)

**Authorized redirect URIs:** (si usas redirect flow; el login actual usa credential popup, origins suelen bastar)

Guarda cambios (pueden tardar unos minutos).

## 5. Probar con 2 ordenadores

En **cada PC**:

1. Abre la URL de Vercel (la misma en ambos).
2. Regístrate o inicia sesión (cuentas distintas).
3. Crea un mazo válido (30 cartas) en **Collection / Decks**.
4. En **Play**, selecciona el mazo.
5. **Play online** → Conectar → Buscar partida (los dos a la vez).

El matchmaking empareja en el mismo servidor Render.

## Desarrollo local con Postgres

El servidor ya usa `DATABASE_URL` (PostgreSQL). En `packages/server/.env`:

```env
DATABASE_URL=postgresql://...neon...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=...
```

```bash
cd packages/server && npm install && npm run prisma:deploy && npm run dev
cd web && npm run dev
```

Las migraciones SQLite antiguas están en `prisma/migrations_sqlite_legacy/` (solo referencia).

## Alternativa rápida (sin Vercel)

Puedes desplegar solo el API en Render y abrir el front en Vercel; **no** sirve abrir `localhost:5173` en el segundo PC sin tunelizar el API.

## Problemas frecuentes

| Síntoma | Causa probable |
|---------|----------------|
| Build falla en Render | Falta `DATABASE_URL` antes (ya no hace falta en build); o `prisma` no instalado — usa `npm install` + `start:prod` actual |
| No conecta al servidor | `VITE_WS_URL` / `VITE_API_URL` mal o API dormido (Render free) |
| Error CORS | `CORS_ORIGIN` no coincide exactamente con la URL del front |
| Login Google falla | Origen Vercel no añadido en Google Console |
| Matchmaking sin pareja | Solo un jugador en cola; los dos deben buscar a la vez |
| Mazo no válido | Falta mazo guardado o no cumple reglas de 30 cartas |
