import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "eventos.json");

function readEventos() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// GET /api/eventos/[id] — devuelve un evento por ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readEventos();
    const evento = data.eventos.find((e: { id: string }) => e.id === id);

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(evento);
  } catch (err) {
    console.error("Error leyendo evento:", err);
    return NextResponse.json({ error: "No se pudo leer el evento" }, { status: 500 });
  }
}

// PATCH /api/eventos/[id] — único punto de mutación del estado del evento
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = readEventos();

    const index = data.eventos.findIndex((e: { id: string }) => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const evento = data.eventos[index];

    // Campos permitidos para mutar
    const allowed = [
      "estado",
      "meseroAsignado",
      "cotizacion",
      "menu",
      "restricciones",
      "tareas",
      "feedback",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // Registrar en historial si el estado cambió
    const historialEntry = {
      fecha: new Date().toISOString(),
      accion: body.accion ?? (updates.estado ? `estado_${updates.estado}` : "actualizado"),
      actor: body.actor ?? "sistema",
    };

    data.eventos[index] = {
      ...evento,
      ...updates,
      version: evento.version + 1,
      historial: [...(evento.historial ?? []), historialEntry],
    };

    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json(data.eventos[index]);
  } catch (err) {
    console.error("Error actualizando evento:", err);
    return NextResponse.json({ error: "No se pudo actualizar el evento" }, { status: 500 });
  }
}
