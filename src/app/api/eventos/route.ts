import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "eventos.json");

function readEventos() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// GET /api/eventos — lista todos los eventos
export async function GET() {
  try {
    const data = readEventos();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error leyendo eventos.json:", err);
    return NextResponse.json({ error: "No se pudo leer los eventos" }, { status: 500 });
  }
}

// POST /api/eventos — crea un nuevo evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = readEventos();

    // Generar ID secuencial basado en el último ID
    const lastId = data.eventos
      .map((e: { id: string }) => parseInt(e.id.replace("SD-", ""), 10))
      .sort((a: number, b: number) => b - a)[0] ?? 2840;

    const newEvento = {
      id: `SD-${lastId + 1}`,
      cliente: body.cliente ?? "",
      contacto: body.contacto ?? "",
      fecha: body.fecha ?? "",
      hora: body.hora ?? "",
      lugar: body.lugar ?? "",
      personas: body.personas ?? 0,
      tipoServicio: body.tipoServicio ?? "",
      menu: body.menu ?? [],
      centroCostos: body.centroCostos ?? "",
      estado: "EN_COTIZACION",
      meseroAsignado: null,
      cotizacion: null,
      restricciones: body.restricciones ?? "",
      tareas: {
        setup_mesa: false,
        servicio: false,
        limpieza: false,
      },
      version: 1,
      historial: [
        {
          fecha: new Date().toISOString(),
          accion: "creado",
          actor: "cliente",
        },
      ],
    };

    data.eventos.push(newEvento);
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json(newEvento, { status: 201 });
  } catch (err) {
    console.error("Error creando evento:", err);
    return NextResponse.json({ error: "No se pudo crear el evento" }, { status: 500 });
  }
}
