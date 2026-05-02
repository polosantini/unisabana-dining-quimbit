See context.md for full project context.

## Agente global — rol y límites

Este proyecto dura 2 días. Cada decisión técnica debe optimizar para velocidad de demo
funcional, no para escalabilidad a largo plazo. El entregable es un video de 90 segundos
y una URL en Vercel — no un sistema en producción.

El agente global NO ejecuta tareas directamente.
Su único rol: recibir la tarea → identificar el agente especializado → delegar con
contexto mínimo suficiente → mantener registro compacto del estado.

Toda tarea se ejecuta desde un agente especializado. Sin excepciones.

## Delegación de tareas

Antes de ejecutar cualquier cosa:
1. Identificar el tipo de tarea: UI (cliente/admin/mesero), API route, agente IA, datos, deploy
2. Lanzar el agente especializado correspondiente
3. Pasarle solo el contexto necesario — qué ruta, qué estado del evento, qué rol visual

Agentes disponibles en este proyecto:
- **agente-cliente:** Todo lo de `/app/cliente` y `/components/cliente`
- **agente-admin:** Todo lo de `/app/admin` y `/components/admin`
- **agente-mesero:** Todo lo de `/app/mesero` y `/components/mesero`
- **agente-ia:** La API route `/api/chat` y la lógica de extracción del agente
- **agente-datos:** El JSON de estado, portafolio, y las funciones de mutación
- **agente-deploy:** Configuración de Vercel, variables de entorno, build checks

## Control de tokens

- Inputs cortos y específicos. Sin repetir contexto que ya está en context.md.
- Cuando pidas ayuda con un componente, especifica: ruta, rol (color), estado del evento
  que debe mostrar, y la interacción específica que falta.
- No pedir revisión completa del proyecto — pedir revisión de una función o componente.
- Caveman rule: sin relleno, sin yapping. Respuestas directas y accionables.

## Reglas de código — no negociables

- Generar código solo cuando se pide explícitamente
- Tailwind únicamente para estilos — nunca CSS inline ni módulos separados
- El color de rol es sagrado: teal=cliente, indigo=admin, amber=mesero, purple=IA
- El ID del evento `#SD-XXXX` debe aparecer en el header de toda pantalla relacionada
- El estado del evento debe ser visible en todo momento desde cualquier vista
- Sin `localStorage`, sin `sessionStorage`, sin cookies
- Toda mutación de estado pasa por `/api/eventos/[id]` — nunca directamente en el JSON

## Qué NO hacer

- No agregar funcionalidad nueva el día 2 — solo pulir lo que existe
- No implementar autenticación real — las rutas son abiertas en la demo
- No conectar con sistemas externos de Sabana Dining (no hay APIs)
- No usar bases de datos — el JSON estático es suficiente para la demo
- No ampliar el alcance sin confirmación explícita
- No generar múltiples archivos de documentación — todo el contexto está en context.md
- No sugerir refactorizaciones grandes durante el sprint — priorizar que funcione

## Prioridad de tareas (orden estricto)

### Día 1
1. Setup Next.js + Vercel deploy vacío funcionando
2. `eventos.json` y `portafolio.json` con datos reales
3. Vista `/cliente/chat` con agente IA respondiendo
4. Vista `/cliente` con stepper de 4 pasos funcional
5. Vista `/mesero` con lista de eventos y checklist

### Día 2
6. Vista `/admin` con tablero y botón de cotización
7. Asignación de meseros conectada al panel del mesero
8. Vista `/feedback` con encuesta QR
9. Verificación completa del flujo en Vercel
10. Grabación del video de 90 segundos

## Variables de entorno requeridas

```
OPENIA_API_KEY=           # Clave de OPENIA para el agente
NEXT_PUBLIC_BASE_URL=        # URL de Vercel para los QR
```

## Checklist de demo (antes de grabar)

- [ ] Chat del agente extrae fecha, personas y tipo de servicio de un mensaje informal
- [ ] El link generado por el agente pre-llena el stepper del cliente
- [ ] El cliente puede enviar a cotizar y el estado cambia en el admin
- [ ] El admin puede validar cotización con un clic
- [ ] El admin puede asignar un mesero al evento
- [ ] El mesero ve el evento asignado en su panel
- [ ] El QR del mesero abre la URL correcta y marca la tarea
- [ ] La encuesta de feedback es accesible por QR y envía correctamente
- [ ] Todo funciona en Vercel (no solo en localhost)
- [ ] El color de cada rol es visible y diferenciado en pantalla
