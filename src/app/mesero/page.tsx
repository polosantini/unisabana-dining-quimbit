"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BadgeEstado from "@/components/shared/BadgeEstado";

interface Tareas {
  setup_mesa: boolean;
  servicio: boolean;
  limpieza: boolean;
}

interface Evento {
  id: string;
  cliente: string;
  fecha: string;
  hora: string;
  lugar: string;
  personas: number;
  tipoServicio: string;
  estado: string;
  meseroAsignado: string | null;
  tareas: Tareas;
}

const MESERO_DEMO = "Carlos M.";

const TAREAS_CONFIG: { key: keyof Tareas; label: string }[] = [
  { key: "setup_mesa", label: "Setup de mesa" },
  { key: "servicio", label: "Servicio" },
  { key: "limpieza", label: "Limpieza" },
];

const TIPO_LABEL: Record<string, string> = {
  estacion_cafe: "Estación de café",
  refrigerio: "Refrigerio",
  almuerzo: "Almuerzo",
  canapes: "Canapés",
  desayuno: "Desayuno",
};

export default function MeseroPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEventos() {
    try {
      const res = await fetch("/api/eventos");
      const data = await res.json();
      const asignados: Evento[] = (data.eventos ?? []).filter(
        (e: Evento) => e.meseroAsignado === MESERO_DEMO
      );
      setEventos(asignados);
    } catch {
      // Error de red
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEventos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Cargando eventos...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mis eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mesero: {MESERO_DEMO}</p>
        </div>
        <button
          onClick={fetchEventos}
          className="px-3 py-1.5 text-sm border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
        >
          Actualizar
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm">No tienes eventos asignados aún.</p>
          <p className="text-gray-400 text-xs mt-1">
            El administrador te asignará cuando haya eventos confirmados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => {
            const tareas = evento.tareas ?? {
              setup_mesa: false,
              servicio: false,
              limpieza: false,
            };
            const completadas = Object.values(tareas).filter(Boolean).length;
            const total = TAREAS_CONFIG.length;

            return (
              <div
                key={evento.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                {/* Header del evento */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">#{evento.id}</span>
                    <BadgeEstado estado={evento.estado} />
                  </div>
                  <span className="text-xs text-gray-500">
                    {evento.fecha} · {evento.hora}
                  </span>
                </div>

                <div className="text-sm text-gray-700 mb-1 font-medium">{evento.cliente}</div>
                <div className="text-xs text-gray-500 mb-1">{evento.lugar}</div>
                <div className="text-xs text-gray-500 mb-4">
                  {evento.personas} personas ·{" "}
                  {TIPO_LABEL[evento.tipoServicio] ?? evento.tipoServicio}
                </div>

                {/* Progreso de tareas */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Tareas
                    </span>
                    <span className="text-xs text-gray-500">
                      {completadas}/{total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(completadas / total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist con QR */}
                <div className="space-y-2">
                  {TAREAS_CONFIG.map(({ key, label }) => {
                    const done = tareas[key];
                    const qrHref = `/mesero/scan?evento=${evento.id}&tarea=${key}`;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-xs ${
                              done
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {done && "✓"}
                          </span>
                          <span
                            className={`text-sm ${
                              done ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                        {!done && (
                          <Link
                            href={qrHref}
                            className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium hover:bg-amber-200 transition-colors"
                          >
                            QR / Marcar
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Link de feedback si todas las tareas están completadas */}
                {completadas === total && (
                  <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
                    <p className="text-xs text-teal-700 font-medium mb-2">
                      Evento completado. Genera el QR de feedback para los clientes.
                    </p>
                    <Link
                      href={`/feedback?evento=${evento.id}`}
                      className="text-xs px-3 py-1.5 bg-teal-700 text-white rounded font-medium hover:bg-teal-800 transition-colors"
                    >
                      Abrir encuesta de feedback
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
