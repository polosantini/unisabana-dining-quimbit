"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FeedbackInner() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get("evento");

  const [calificacion, setCalificacion] = useState<number>(0);
  const [recomendaria, setRecomendaria] = useState<"si" | "no" | null>(null);
  const [comentario, setComentario] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!calificacion || !recomendaria) return;
    setSubmitting(true);

    if (eventoId) {
      try {
        await fetch(`/api/eventos/${eventoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado: "CERRADO",
            feedback: {
              calificacion,
              recomendaria: recomendaria === "si",
              comentario,
              fecha: new Date().toISOString(),
            },
            actor: "cliente",
            accion: "feedback_enviado",
          }),
        });
      } catch {
        // Si falla el PATCH, igual mostramos el agradecimiento
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-base font-semibold text-teal-700">OK</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Gracias por tu feedback</h2>
        <p className="text-gray-500 text-sm">
          Tu opinión nos ayuda a mejorar el servicio de Sabana Dining. Apreciamos tomarte el tiempo de respondernos.
        </p>
        {eventoId && (
          <p className="text-xs text-gray-400 font-mono">Evento #{eventoId}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Encuesta de satisfacción</h1>
        <p className="text-gray-500 text-sm mt-1">Sabana Dining — Servicio de Alimentos y Bebidas</p>
        {eventoId && (
          <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono font-medium">
            #{eventoId}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Calificación con estrellas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-4">
            ¿Cómo calificarías el servicio recibido? *
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setCalificacion(n)}
                className={`min-w-[42px] rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  n <= calificacion
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {calificacion > 0 && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {
                ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][
                  calificacion
                ]
              }
            </p>
          )}
        </div>

        {/* ¿Recomendarías? */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-4">
            ¿Recomendarías Sabana Dining a un colega? *
          </label>
          <div className="flex gap-3">
            {(["si", "no"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setRecomendaria(val)}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                  recomendaria === val
                    ? val === "si"
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "bg-red-500 border-red-500 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {val === "si" ? "Sí, lo recomendaría" : "No por ahora"}
              </button>
            ))}
          </div>
        </div>

        {/* Comentario libre */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Comentarios adicionales (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Qué podríamos mejorar? ¿Qué fue lo que más te gustó?"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!calificacion || !recomendaria || submitting}
          className="w-full py-3 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Enviando..." : "Enviar feedback"}
        </button>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>}>
      <FeedbackInner />
    </Suspense>
  );
}
