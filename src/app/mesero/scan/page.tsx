"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const TAREA_LABELS: Record<string, string> = {
  setup_mesa: "Setup de mesa",
  servicio: "Servicio",
  limpieza: "Limpieza",
};

type Status = "idle" | "loading" | "done" | "error" | "already_done";

function MeseroScanInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventoId = searchParams.get("evento");
  const tareaKey = searchParams.get("tarea");

  const [status, setStatus] = useState<Status>("idle");
  const [eventoCliente, setEventoCliente] = useState<string | null>(null);

  useEffect(() => {
    if (!eventoId || !tareaKey) {
      setStatus("error");
      return;
    }
    markTask();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function markTask() {
    if (!eventoId || !tareaKey) return;
    setStatus("loading");

    try {
      // Primero verificamos el estado actual
      const getRes = await fetch(`/api/eventos/${eventoId}`);
      if (!getRes.ok) throw new Error("not_found");

      const evento = await getRes.json();
      setEventoCliente(evento.cliente ?? null);

      if (evento.tareas?.[tareaKey]) {
        setStatus("already_done");
        return;
      }

      const updatedTareas = { ...(evento.tareas ?? {}), [tareaKey]: true };

      const patchRes = await fetch(`/api/eventos/${eventoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tareas: updatedTareas,
          actor: "mesero",
          accion: `tarea_${tareaKey}_completada`,
        }),
      });

      if (!patchRes.ok) throw new Error("patch_failed");

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (!eventoId || !tareaKey) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-medium">Parámetros inválidos en el QR.</p>
        <Link href="/mesero" className="mt-4 inline-block text-amber-700 underline text-sm">
          Volver al panel
        </Link>
      </div>
    );
  }

  const tareaLabel = TAREA_LABELS[tareaKey] ?? tareaKey;

  return (
    <div className="max-w-sm mx-auto px-4 py-12 text-center">
      {status === "loading" && (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
          <p className="text-gray-600 text-sm">Marcando tarea como completada...</p>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">¡Tarea completada!</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Evento: </span>
              <span className="font-mono font-bold text-gray-900">#{eventoId}</span>
            </p>
            {eventoCliente && (
              <p>
                <span className="text-gray-500">Cliente: </span>
                <span className="text-gray-800">{eventoCliente}</span>
              </p>
            )}
            <p>
              <span className="text-gray-500">Tarea: </span>
              <span className="text-amber-700 font-semibold">{tareaLabel}</span>
            </p>
          </div>
          <Link
            href="/mesero"
            className="inline-block mt-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Volver al panel
          </Link>
        </div>
      )}

      {status === "already_done" && (
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl text-gray-400">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-700">Ya estaba completada</h2>
          <p className="text-sm text-gray-500">
            La tarea <strong>{tareaLabel}</strong> del evento{" "}
            <span className="font-mono">#{eventoId}</span> ya fue marcada anteriormente.
          </p>
          <Link
            href="/mesero"
            className="inline-block mt-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Volver al panel
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl text-red-500">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Error al marcar tarea</h2>
          <p className="text-sm text-gray-500">
            No se pudo actualizar la tarea. Verifica tu conexión o intenta de nuevo.
          </p>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={markTask}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
            <Link
              href="/mesero"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Volver
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeseroScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>}>
      <MeseroScanInner />
    </Suspense>
  );
}
