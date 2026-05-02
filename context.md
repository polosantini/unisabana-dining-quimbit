# Sabana Dining — Sistema de Gestión de Eventos (Quimbit)

## Descripción

Plataforma web de gestión de eventos de catering para el Servicio de Alimentos y Bebidas de la Universidad de La Sabana (Sabana Dining). Automatiza el flujo completo: solicitud → cotización → confirmación → ejecución → cierre. Tres roles diferenciados: cliente, administrador y mesero. El agente IA conversacional captura solicitudes en lenguaje natural desde cualquier canal, extrae los datos del evento y pre-llena el portal antes de redirigir al cliente.

## Stack

- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Agente IA:** OpenIA API 
- **QR:** `qrcode.react`
- **HTTP cliente:** `axios`
- **Deploy:** Vercel (producción y preview)
- **Estado demo:** JSON estático en `/data/eventos.json` — sin base de datos en esta fase

## Arquitectura

```
/app
  /cliente          → Portal del cliente (crear, editar, aprobar evento)
  /cliente/chat     → Interfaz de chat con agente IA
  /admin            → Panel administrador (tablero, cotizaciones, meseros)
  /mesero           → Panel mesero (tareas del día, checklist, QR)
  /mesero/scan      → Endpoint de escaneo QR que actualiza estado
  /feedback         → Encuesta post-evento accesible por QR
/api
  /chat             → Route handler que llama a Claude API
  /eventos          → CRUD simulado sobre el JSON de estado
/data
  eventos.json      → Estado simulado de 4 eventos en distintas etapas
  portafolio.json   → Catálogo de productos y precios de Sabana Dining
/components
  /cliente          → Stepper, selector de menú, timeline de estado
  /admin            → Tablero, lista priorizada, asignador de meseros
  /mesero           → Panel de tareas, checklist, generador QR
  /shared           → Badge de estado, header con #ID de evento
```

## Sistema de color por rol (crítico para la demo)

| Rol | Color principal | Tailwind |
|---|---|---|
| Cliente | Verde teal | `bg-teal-700` / `text-teal-700` |
| Administrador | Azul índigo | `bg-indigo-800` / `text-indigo-800` |
| Mesero | Ámbar | `bg-amber-600` / `text-amber-600` |
| Agente IA | Púrpura | `bg-purple-700` / `text-purple-700` |

Cada vista tiene un header con el color de su rol. El cambio visual entre roles debe ser inmediato e inconfundible.

## Flujo de datos (demo)

1. Cliente escribe en `/cliente/chat` → API Route llama a Claude API → agente extrae datos y responde
2. Agente genera link a `/cliente?evento=BORRADOR&fecha=...&personas=...` con params pre-llenados
3. Cliente completa el stepper → estado cambia a `EN_COTIZACION` en `eventos.json`
4. Admin en `/admin` ve el evento en lista priorizada → valida cotización → estado pasa a `COTIZADO`
5. Cliente recibe notificación (simulada) → acepta → estado pasa a `CONFIRMADO`
6. Admin asigna mesero → estado pasa a `ASIGNADO`
7. Mesero en `/mesero` ve el evento → escanea QR por tarea → tareas se marcan completadas
8. Al final, mesero activa QR de feedback → clientes acceden a `/feedback?evento=ID`
9. Evento pasa a estado `CERRADO`

## Estados del evento

```
BORRADOR → EN_COTIZACION → COTIZADO → CONFIRMADO → ASIGNADO → EN_EJECUCION → CERRADO
```

## Estructura de eventos.json (demo)

```json
{
  "eventos": [
    {
      "id": "SD-2841",
      "cliente": "Departamento de Ingeniería",
      "contacto": "Ana Gómez",
      "fecha": "2026-05-06",
      "hora": "10:00",
      "lugar": "Sala de Juntas - Edificio E",
      "personas": 25,
      "tipoServicio": "estacion_cafe",
      "menu": ["cafe", "croissant_queso", "muffin_chocolate"],
      "centroCostos": "CC-2341",
      "estado": "EN_COTIZACION",
      "meseroAsignado": null,
      "cotizacion": null,
      "restricciones": "2 personas vegetarianas",
      "version": 1,
      "historial": []
    }
  ]
}
```

## Portafolio (base para cotización automática)

Usar precios reales del portafolio de Sabana Dining. Categorías disponibles:
- Estación de café estándar y premium
- Refrigerios de sal, dulce y premium
- Desayunos, almuerzos, menú especial
- Canapés, bebidas, postres

Archivo `portafolio.json` contiene ítems con `id`, `nombre`, `precio`, `categoria`.

## Prompt del agente IA (sistema)

```
Eres el asistente virtual de Sabana Dining, servicio de Alimentos y Bebidas de la
Universidad de La Sabana. Ayudas a clientes a solicitar eventos de catering de forma
rápida y natural, como una conversación con una persona amable y profesional.

Recopila conversacionalmente: fecha y hora, lugar, número de personas, tipo de servicio
(estación de café / refrigerio / almuerzo / canapés), restricciones alimentarias,
centro de costos o forma de pago.

Reglas:
- Máximo 2 preguntas por mensaje
- Confirma cada dato extraído: "Entendido, 30 personas ✓"
- Cuando tengas los 4 datos mínimos (fecha, lugar, personas, tipo), genera resumen y link
- Tono cálido, profesional, en español
- Horario de solicitudes: 7:00 a.m. a 2:30 p.m., lunes a viernes
```

## Convenciones

- Idioma de código: inglés (variables, funciones, componentes)
- Idioma de comentarios y UI: español
- Componentes: PascalCase (`EventoCard`, `MeseroPanel`)
- Funciones/hooks: camelCase (`useEventoState`, `calcularCotizacion`)
- Rutas API: kebab-case (`/api/chat`, `/api/eventos/[id]`)
- Sin `console.log` en producción — usar `console.error` solo para errores reales
- Tailwind únicamente para estilos — sin CSS modules ni styled-components

## Restricciones técnicas

- Sin base de datos en fase demo — todo el estado vive en `eventos.json`
- Sin autenticación real — cada ruta `/cliente`, `/admin`, `/mesero` es accesible directamente
- Sin integración con sistemas existentes de Sabana Dining (no hay APIs disponibles)
- Sin WebSockets — el estado se actualiza por mutación del JSON y re-fetch
- La cotización se calcula en el cliente sumando precios del portafolio — sin backend de pricing
- No usar `localStorage` ni `sessionStorage`
- El agente IA no toma decisiones operativas — solo captura datos y redirige

## Contexto de negocio

**Cliente final:** Sabana Dining — Unidad de Eventos, Universidad de La Sabana  
**Problema central:** Flujo manual y fragmentado. 800–1.000 eventos/mes. Solo 40% de solicitudes llegan completas. ~600 correos/día de coordinación. Cero trazabilidad.  
**Causa raíz:** No existe identificador único de evento que viaje por todo el flujo.  
**Solución:** El número de evento `#SD-XXXX` es visible en todos los roles en todo momento.  
**Restricción de presupuesto:** Unidad autosostenible — soluciones de bajo costo o gratuitas.  
**Entregable del hackathon:** Demo funcional + video de 90 segundos + pitch de 5 minutos.  
**No implementar en producción** — esta es una propuesta viable, no un sistema en producción.

## Rúbrica del hackathon (prioridades)

| Criterio | Peso | Implicación |
|---|---|---|
| Prototipo desarrollado | 30% | La demo es lo más crítico |
| Relevancia de la propuesta | 20% | El problema está bien documentado |
| Viabilidad técnica | 20% | Stack real, deploy en Vercel |
| Análisis de impacto | 20% | Tabla as-is vs. to-be preparada |
| Presentación / Pitch | 10% | 5 minutos, video pregrabado de 90 seg |
