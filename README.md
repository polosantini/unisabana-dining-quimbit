# Sabana Dining — Sistema de Gestión de Eventos

Demo funcional para hackathon (sprint 2 días). Sistema para coordinar eventos de catering: cliente solicita, admin valida y asigna, mesero ejecuta.

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con OPENIA_API_KEY y NEXT_PUBLIC_BASE_URL

# Desarrollo local
npm run dev
# Visita http://localhost:3000
```

## Portales por Rol

| Rol | URL | Color | Función |
|-----|-----|-------|---------|
| **Cliente** | `/cliente/chat` → `/cliente` | Teal (`teal-700`) | Solicita evento, llena datos, confirma menú |
| **Admin** | `/admin` | Indigo (`indigo-800`) | Valida cotización, asigna mesero |
| **Mesero** | `/mesero` | Amber (`amber-600`) | Ve eventos asignados, marca tareas, genera QR |
| **Agente IA** | POST `/api/chat` | Purple (`purple-700`) | Extrae fecha/personas/servicio de chat |

## Flujo Completo de Demo

1. **Chat (Cliente)** → Usuario describe evento natural ("Cena el sábado para 8")
2. **Agente IA** → Extrae datos, devuelve link pre-llenado `/cliente?fecha=...&personas=...`
3. **Stepper (Cliente)** → 4 pasos: Datos → Menú → Confirmar → Enviado
4. **Estado EN_COTIZACION** → Evento aparece en `/admin` esperando validación
5. **Admin Valida** → Cambia estado a COTIZADO
6. **Admin Asigna Mesero** → Estado pasa a ASIGNADO, asignado a Carlos M.
7. **Mesero ve Evento** → Aparece en `/mesero` filtrado por nombre
8. **Mesero Ejecuta Checklist** → Marca tareas (entrada, servicio, postre, cierre)
9. **QR Scan** → Marca tarea y genera link a `/feedback`
10. **Feedback** → Encuesta post-evento (estrellas, sí/no, comentario libre)

## Estructura del Proyecto

```
src/
├── app/
│   ├── (landing)/           # Landing page con cards de rol
│   ├── admin/               # Dashboard admin
│   ├── cliente/
│   │   ├── chat/            # Chat con agente IA
│   │   └── page.tsx         # Stepper 4 pasos
│   ├── mesero/
│   │   ├── scan/            # QR scan endpoint
│   │   └── page.tsx         # Panel mesero
│   ├── feedback/            # Encuesta post-evento
│   └── api/
│       ├── chat/            # POST chat → OpenAI
│       ├── eventos/         # GET/POST/PATCH eventos
│       ├── portafolio/      # GET catálogo productos
│       └── mesero/scan/     # Marcar tarea completada
├── components/
│   ├── admin/               # Componentes admin (dashboard, modal cotización)
│   ├── cliente/             # Componentes cliente (stepper, menú selector)
│   ├── mesero/              # Componentes mesero (event card, checklist)
│   ├── chat/                # Chat UI con messages/input
│   └── shared/              # Header con ID evento, color por rol
├── data/
│   ├── eventos.json         # 4 eventos con estados variados
│   └── portafolio.json      # Catálogo de productos
├── lib/
│   ├── api-client.ts        # Helper para fetch
│   └── estado-evento.ts     # Estado machine helpers
└── hooks/
    └── useEventState.ts     # Hook para lectura/update evento
```

## Variables de Entorno

```env
# .env.local (no commitear)
OPENIA_API_KEY=sk-...                    # Clave OpenAI (sin = fallback scripted)
NEXT_PUBLIC_BASE_URL=https://...vercel.app  # URL de Vercel para QR
```

## Datos de Prueba

**Eventos (`data/eventos.json`):**
- `SD-2841` → EN_COTIZACION (espera validación)
- `SD-2842` → COTIZADO (validado, espera asignación)
- `SD-2843` → ASIGNADO (asignado a Carlos M., listo para ejecutar)
- `SD-2844` → CONFIRMADO (evento finalizado)

**Mesero asignado:** Carlos M. (filtro en `/mesero`)

## Máquina de Estados

```
BORRADOR
  ↓
EN_COTIZACION (cliente envía datos)
  ↓
COTIZADO (admin valida)
  ↓
CONFIRMADO (cliente confirma menú)
  ↓
ASIGNADO (admin asigna mesero)
  ↓
EN_EJECUCION (mesero comienza checklist)
  ↓
CERRADO (evento finalizado)
```

## Checklist de Demo (antes de grabar)

- [ ] Chat del agente extrae fecha, personas y tipo de servicio
- [ ] Link generado pre-llena el stepper del cliente
- [ ] Cliente puede enviar a cotizar, estado cambia a EN_COTIZACION en admin
- [ ] Admin valida cotización con un clic → estado cambia a COTIZADO
- [ ] Admin asigna mesero al evento → estado cambia a ASIGNADO
- [ ] Mesero ve evento asignado en su panel
- [ ] QR del mesero abre `/feedback` y marca la tarea
- [ ] Encuesta de feedback es accesible por QR
- [ ] Colores de rol visibles y diferenciados en cada pantalla
- [ ] Todo funciona en Vercel (no solo localhost)

## Deploy a Vercel

```bash
# Conectar repositorio a Vercel
# Configurar variables de entorno en Vercel dashboard
# Deploy automático en push a main
```

1. Push a main
2. Vercel build automático
3. Configurar `OPENIA_API_KEY` y `NEXT_PUBLIC_BASE_URL` en Vercel dashboard
4. Preview URL disponible al instante

## Decisiones de Diseño

- **Sin autenticación:** Las rutas abiertas para facilitar demostración
- **JSON estático:** `data/eventos.json` actualizado por PATCH en memoria (no persist), suficiente para demo
- **Tailwind únicamente:** Sin CSS modules ni inline styles
- **Color sagrado:** Cada rol tiene color fijo — teal/indigo/amber/purple
- **ID evento visible:** `#SD-XXXX` en header de toda vista relacionada
- **API routes:** Toda mutación pasa por `/api/eventos/[id]` — nunca directamente en JSON

## Contacto

Equipo Quimbit — Unisabana Hackathon 2026
