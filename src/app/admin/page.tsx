"use client";

import { useEffect, useState } from "react";
import BadgeEstado from "@/components/shared/BadgeEstado";

interface Evento {
  id: string;
  cliente: string;
  contacto: string;
  fecha: string;
  hora: string;
  lugar: string;
  personas: number;
  tipoServicio: string;
  estado: string;
  meseroAsignado: string | null;
  cotizacion: {
    total: number;
    subtotal: number;
    iva: number;
  } | null;
  restricciones: string;
}

const MESEROS = ["Carlos M.", "Diana R.", "Juan P."];

const TIPO_LABEL: Record<string, string> = {
  estacion_cafe: "Estación de café",
  refrigerio: "Refrigerio",
  almuerzo: "Almuerzo",
  canapes: "Canapés",
  desayuno: "Desayuno",
};

export default function AdminPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [asignandoId, setAsignandoId] = useState<string | null>(null);
  const [meseroSeleccionado, setMeseroSeleccionado] = useState<Record<string, string>>({});

  async function fetchEventos() {
    try {
      const res = await fetch("/api/eventos");
      const data = await res.json();
      setEventos(data.eventos ?? []);
    } catch {
      // Error de red, mantener estado
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEventos();
  }, []);

  async function patchEvento(id: string, payload: object, label: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/eventos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, actor: "admin", accion: label }),
      });
      const updated = await res.json();
      setEventos((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch {
      // Error silencioso — no hay toast en demo
    } finally {
      setUpdatingId(null);
      setAsignandoId(null);
    }
  }

  const orden: Record<string, number> = {
    EN_COTIZACION: 0,
    COTIZADO: 1,
    CONFIRMADO: 2,
    ASIGNADO: 3,
    EN_EJECUCION: 4,
    CERRADO: 5,
    BORRADOR: 6,
  };

  const sorted = [...eventos].sort(
    (a, b) => (orden[a.estado] ?? 99) - (orden[b.estado] ?? 99)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Cargando eventos...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tablero de eventos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {eventos.length} evento(s) en el sistema
          </p>
        </div>
        <button
          onClick={fetchEventos}
          className="px-4 py-2 text-sm border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* Resumen de estados */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { estado: "EN_COTIZACION", label: "En cotización" },
          { estado: "COTIZADO", label: "Cotizados" },
          { estado: "CONFIRMADO", label: "Confirmados" },
        ].map(({ estado, label }) => {
          const count = eventos.filter((e) => e.estado === estado).length;
          return (
            <div key={estado} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-indigo-800">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Lista de eventos */}
      <div className="space-y-4">
        {sorted.map((evento) => {
          const isUpdating = updatingId === evento.id;
          const isAsignando = asignandoId === evento.id;

          return (
            <div
              key={evento.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900 text-base">
                    #{evento.id}
                  </span>
                  <BadgeEstado estado={evento.estado} />
                </div>
                <div className="text-right text-xs text-gray-500">
                  {evento.fecha} · {evento.hora}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Cliente: </span>
                  <span className="text-gray-800 font-medium">{evento.cliente}</span>
                </div>
                <div>
                  <span className="text-gray-500">Personas: </span>
                  <span className="text-gray-800 font-medium">{evento.personas}</span>
                </div>
                <div>
                  <span className="text-gray-500">Lugar: </span>
                  <span className="text-gray-800">{evento.lugar}</span>
                </div>
                <div>
                  <span className="text-gray-500">Servicio: </span>
                  <span className="text-gray-800">
                    {TIPO_LABEL[evento.tipoServicio] ?? evento.tipoServicio}
                  </span>
                </div>
                {evento.restricciones && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Restricciones: </span>
                    <span className="text-amber-700">{evento.restricciones}</span>
                  </div>
                )}
                {evento.cotizacion && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Cotización: </span>
                    <span className="text-gray-800 font-semibold">
                      ${evento.cotizacion.total.toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
                {evento.meseroAsignado && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Mesero: </span>
                    <span className="text-teal-700 font-medium">{evento.meseroAsignado}</span>
                  </div>
                )}
              </div>

              {/* Acciones por estado */}
              <div className="mt-4 flex flex-wrap gap-2">
                {evento.estado === "EN_COTIZACION" && (
                  <button
                    onClick={() =>
                      patchEvento(
                        evento.id,
                        {
                          estado: "COTIZADO",
                          cotizacion: {
                            subtotal: evento.personas * 15000,
                            iva: Math.round(evento.personas * 15000 * 0.19),
                            total: Math.round(evento.personas * 15000 * 1.19),
                            validadaPor: "admin",
                            fechaValidacion: new Date().toISOString(),
                          },
                        },
                        "cotizacion_validada"
                      )
                    }
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isUpdating ? "Procesando..." : "Validar cotización"}
                  </button>
                )}

                {evento.estado === "COTIZADO" && (
                  <button
                    onClick={() =>
                      patchEvento(evento.id, { estado: "CONFIRMADO" }, "confirmado")
                    }
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isUpdating ? "Procesando..." : "Confirmar evento"}
                  </button>
                )}

                {(evento.estado === "CONFIRMADO" || evento.estado === "COTIZADO") && (
                  <>
                    {isAsignando ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={meseroSeleccionado[evento.id] ?? ""}
                          onChange={(e) =>
                            setMeseroSeleccionado((prev) => ({
                              ...prev,
                              [evento.id]: e.target.value,
                            }))
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Seleccionar mesero...</option>
                          {MESEROS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            meseroSeleccionado[evento.id] &&
                            patchEvento(
                              evento.id,
                              {
                                estado: "ASIGNADO",
                                meseroAsignado: meseroSeleccionado[evento.id],
                              },
                              "mesero_asignado"
                            )
                          }
                          disabled={!meseroSeleccionado[evento.id] || isUpdating}
                          className="px-3 py-1.5 text-sm bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 disabled:opacity-50 font-medium transition-colors"
                        >
                          Asignar
                        </button>
                        <button
                          onClick={() => setAsignandoId(null)}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAsignandoId(evento.id)}
                        className="px-4 py-2 text-sm bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-medium transition-colors"
                      >
                        Asignar mesero
                      </button>
                    )}
                  </>
                )}

                {evento.estado === "ASIGNADO" && (
                  <button
                    onClick={() =>
                      patchEvento(evento.id, { estado: "EN_EJECUCION" }, "en_ejecucion")
                    }
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isUpdating ? "Procesando..." : "Iniciar ejecución"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
