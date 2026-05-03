"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import BadgeEstado from "@/components/shared/BadgeEstado";

type TareaKey =
  | "recoger_cocina"
  | "transportar"
  | "montar"
  | "servir"
  | "recoger_menaje";

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
  tareas?: Record<string, boolean>;
}

const MESERO_DEMO = "Carlos M.";

const TAREAS_CONFIG: { key: TareaKey; label: string }[] = [
  { key: "recoger_cocina", label: "Recoger en cocina" },
  { key: "transportar", label: "Transportar" },
  { key: "montar", label: "Montar" },
  { key: "servir", label: "Servir" },
  { key: "recoger_menaje", label: "Recoger menaje" },
];

const DEFAULT_TAREAS: Record<TareaKey, boolean> = {
  recoger_cocina: false,
  transportar: false,
  montar: false,
  servir: false,
  recoger_menaje: false,
};

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
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

  async function markTask(eventoId: string, tareaKey: TareaKey) {
    const taskKey = `${eventoId}:${tareaKey}`;
    setActiveTask(taskKey);
    try {
      const evento = eventos.find((item) => item.id === eventoId);
      if (!evento) return;

      const tareas = { ...DEFAULT_TAREAS, ...(evento.tareas ?? {}) };
      if (tareas[tareaKey]) return;

      const updatedTareas = { ...tareas, [tareaKey]: true };

      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tareas: updatedTareas,
          actor: "mesero",
          accion: `tarea_${tareaKey}_completada`,
        }),
      });

      if (!response.ok) throw new Error("patch_failed");

      setEventos((prev) =>
        prev.map((item) =>
          item.id === eventoId ? { ...item, tareas: updatedTareas } : item
        )
      );
    } catch {
      // ignore patch error here
    } finally {
      setActiveTask(null);
    }
  }

  const eventosHoy = eventos.filter((evento) => evento.fecha === today);
  const displayedEventos = eventosHoy.length > 0 ? eventosHoy : eventos;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 text-gray-500 text-sm">
        Cargando eventos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-[2rem] border border-amber-200 bg-amber-100/90 p-8 shadow-xl shadow-amber-200/50">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-800 font-semibold">Panel del mesero</p>
            <h1 className="mt-3 text-4xl font-extrabold text-amber-950 leading-tight">
              Eventos asignados{eventosHoy.length > 0 ? " de hoy" : ""}
            </h1>
            <p className="mt-2 text-lg text-amber-900/80">
              Mesero: <span className="font-semibold">{MESERO_DEMO}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-3xl bg-white/90 border border-amber-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Fecha</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900">{today}</p>
            </div>
            <button
              onClick={fetchEventos}
              className="inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-amber-800 transition-colors"
            >
              Actualizar lista
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {displayedEventos.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-amber-900">No hay eventos asignados todavía</p>
              <p className="mt-3 text-sm text-amber-700/90">
                Cuando el administrador asigne un evento, aparecerá aquí con su checklist y QR.
              </p>
            </div>
          ) : (
            displayedEventos.map((evento) => {
              const tareas = { ...DEFAULT_TAREAS, ...(evento.tareas ?? {}) };
              const completadas = Object.values(tareas).filter(Boolean).length;
              const total = TAREAS_CONFIG.length;
              const isSelected = selectedEventoId === evento.id;

              return (
                <article
                  key={evento.id}
                  className="overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedEventoId((prev) => (prev === evento.id ? null : evento.id))}
                    className="w-full text-left px-6 py-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
                            {evento.id}
                          </span>
                          <BadgeEstado estado={evento.estado} />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-amber-950">{evento.cliente}</h2>
                        <p className="mt-2 text-base text-amber-800/90">
                          Recoger: Cocina central · Entrega: {evento.lugar}
                        </p>
                        <p className="mt-1 text-sm text-amber-700">
                          {evento.hora} · {evento.personas} personas · {TIPO_LABEL[evento.tipoServicio] ?? evento.tipoServicio}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 text-right">
                        <span className="text-sm text-amber-700">{evento.fecha}</span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                          {completadas}/{total} tareas
                        </span>
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="border-t border-amber-100 bg-amber-50 px-6 py-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-900">
                            Checklist de tareas
                          </p>
                          <p className="mt-1 text-sm text-amber-700">
                            Marca cada paso con el botón o con el QR.
                          </p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                          Abre la tarjeta para ver los QR
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {TAREAS_CONFIG.map(({ key, label }) => {
                          const done = tareas[key];
                          const taskKey = `${evento.id}:${key}`;
                          const qrHref = `/mesero/scan?evento=${evento.id}&tarea=${key}`;

                          return (
                            <div
                              key={key}
                              className="grid gap-4 rounded-[1.5rem] border border-amber-200 bg-white p-4 md:grid-cols-[1fr_auto]"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${done ? "bg-amber-600 text-white border-amber-600" : "bg-white text-amber-700 border-amber-200"}`}>
                                    {done ? "OK" : ""}
                                  </span>
                                  <div>
                                    <p className="text-base font-semibold text-amber-900">{label}</p>
                                    <p className="text-sm text-amber-600">
                                      {done ? "Completada" : "Pendiente"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={done || activeTask === taskKey}
                                    onClick={() => markTask(evento.id, key)}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${done ? "bg-amber-200 text-amber-700 cursor-not-allowed" : "bg-amber-700 text-white hover:bg-amber-800"}`}
                                  >
                                    {done ? "Completada" : activeTask === taskKey ? "Guardando..." : "Marcar completa"}
                                  </button>
                                  <Link
                                    href={qrHref}
                                    className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition"
                                  >
                                    Abrir QR
                                  </Link>
                                </div>
                              </div>

                              <div className="flex flex-col items-center justify-between gap-3 rounded-3xl bg-amber-50 p-3">
                                <QRCodeCanvas
                                  value={qrHref}
                                  size={110}
                                  bgColor="#fff"
                                  fgColor="#92400e"
                                />
                                <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
                                  QR tarea
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
