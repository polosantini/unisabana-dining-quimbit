import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

// GET /api/portafolio — devuelve el catálogo completo de productos
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "portafolio.json");
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error leyendo portafolio.json:", err);
    return NextResponse.json({ error: "No se pudo leer el portafolio" }, { status: 500 });
  }
}
