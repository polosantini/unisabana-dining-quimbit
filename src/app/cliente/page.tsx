"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PortafolioItem {
  id: string;
  nombre: string;
  precioUnitario: number;
  unidad: string;
}

interface PortafolioCategoria {
  id: string;
  nombre: string;
  items: PortafolioItem[];
}

const TIPO_SERVICIO_OPTIONS = [
  { value: "estacion_cafe", label: "Estación de café" },
  { value: "refrigerio", label: "Refrigerio" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "canapes", label: "Canapés" },
];

const STEPS = ["Datos del evento", "Menú", "Confirmar", "Enviado"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i < current
                  ? "bg-teal-700 border-teal-700 text-white"
                  : i === current
                  ? "bg-white border-teal-700 text-teal-700"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 font-medium text-center max-w-[70px] ${
                i === current ? "text-teal-700" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-10 mb-5 transition-colors ${
                i < current ? "bg-teal-700" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ClientePageInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [portafolio, setPortafolio] = useState<PortafolioCategoria[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    cliente: "",
    contacto: "",
    fecha: searchParams.get("fecha") ?? "",
    hora: searchParams.get("hora") ?? "10:00",
    lugar: searchParams.get("lugar") ?? "",
    personas: searchParams.get("personas") ?? "",
    tipoServicio: searchParams.get("tipoServicio") ?? "",
    centroCostos: "",
    restricciones: searchParams.get("restricciones") ?? "",
  });

  const [selectedMenu, setSelectedMenu] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/portafolio")
      .then((r) => r.json())
      .then((d) => setPortafolio(d.categorias ?? []))
      .catch(() => {
        // portafolio no disponible, continuar sin él
      });
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMenuItem(id: string) {
    setSelectedMenu((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const step1Valid =
    form.fecha && form.hora && form.lugar && form.personas && form.tipoServicio;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: form.cliente || "Cliente web",
          contacto: form.contacto || "No especificado",
          fecha: form.fecha,
          hora: form.hora,
          lugar: form.lugar,
          personas: parseInt(form.personas, 10),
          tipoServicio: form.tipoServicio,
          menu: selectedMenu,
          centroCostos: form.centroCostos || "Por definir",
          restricciones: form.restricciones,
        }),
      });
      const data = await res.json();
      setSubmittedId(data.id);
      setStep(3);
    } catch {
      // Error al enviar, mantener en paso 2
    } finally {
      setSubmitting(false);
    }
  }

  // Filtrar categorías del portafolio según tipo de servicio
  const relevantCategories = portafolio.filter((cat) => {
    if (!form.tipoServicio) return true;
    const mapping: Record<string, string[]> = {
      estacion_cafe: ["estacion_cafe", "refrigerios", "bebidas"],
      refrigerio: ["refrigerios", "bebidas", "postres"],
      almuerzo: ["almuerzos", "bebidas", "postres"],
      canapes: ["canapes", "bebidas"],
    };
    return mapping[form.tipoServicio]?.includes(cat.id) ?? true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Solicitar evento de catering
      </h1>
      <p className="text-gray-500 text-sm text-center mb-6">
        Completa los datos para enviar tu solicitud a Sabana Dining
      </p>

      <StepIndicator current={step} />

      {/* Paso 0 — Datos del evento */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Nombre del departamento / cliente
              </label>
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => updateField("cliente", e.target.value)}
                placeholder="Ej: Facultad de Ingeniería"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Nombre de contacto
              </label>
              <input
                type="text"
                value={form.contacto}
                onChange={(e) => updateField("contacto", e.target.value)}
                placeholder="Ej: María López"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Fecha *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Hora *
              </label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => updateField("hora", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Lugar *
              </label>
              <input
                type="text"
                value={form.lugar}
                onChange={(e) => updateField("lugar", e.target.value)}
                placeholder="Ej: Sala de Juntas - Edificio E"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Número de personas *
              </label>
              <input
                type="number"
                min="1"
                value={form.personas}
                onChange={(e) => updateField("personas", e.target.value)}
                placeholder="Ej: 30"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Tipo de servicio *
              </label>
              <select
                value={form.tipoServicio}
                onChange={(e) => updateField("tipoServicio", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Seleccionar...</option>
                {TIPO_SERVICIO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Centro de costos
              </label>
              <input
                type="text"
                value={form.centroCostos}
                onChange={(e) => updateField("centroCostos", e.target.value)}
                placeholder="Ej: CC-2341"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Restricciones alimentarias
              </label>
              <input
                type="text"
                value={form.restricciones}
                onChange={(e) => updateField("restricciones", e.target.value)}
                placeholder="Ej: 2 personas vegetarianas, 1 celiaco"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!step1Valid}
            className="w-full mt-2 py-3 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente: Seleccionar menú
          </button>
        </div>
      )}

      {/* Paso 1 — Menú */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 text-sm text-teal-800">
            Selecciona los items que deseas incluir en tu evento. Son opcionales — el admin ajustará la cotización.
          </div>
          {relevantCategories.length > 0 ? (
            relevantCategories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                  {cat.nombre}
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMenu.includes(item.id)}
                          onChange={() => toggleMenuItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-teal-700">
                          {item.nombre}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        ${item.precioUnitario.toLocaleString("es-CO")}/{item.unidad}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
              Cargando portafolio...
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(0)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 transition-colors"
            >
              Siguiente: Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Paso 2 — Confirmar */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Resumen del evento</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: "Cliente", value: form.cliente || "No especificado" },
                { label: "Contacto", value: form.contacto || "No especificado" },
                { label: "Fecha", value: form.fecha },
                { label: "Hora", value: form.hora },
                { label: "Lugar", value: form.lugar },
                { label: "Personas", value: form.personas },
                {
                  label: "Tipo de servicio",
                  value:
                    TIPO_SERVICIO_OPTIONS.find((o) => o.value === form.tipoServicio)?.label ??
                    form.tipoServicio,
                },
                { label: "Centro de costos", value: form.centroCostos || "Por definir" },
                {
                  label: "Restricciones",
                  value: form.restricciones || "Ninguna",
                },
                {
                  label: "Ítems seleccionados",
                  value:
                    selectedMenu.length > 0
                      ? `${selectedMenu.length} ítem(s)`
                      : "Sin selección (el admin cotizará)",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-gray-500 font-medium min-w-[130px]">{label}</dt>
                  <dd className="text-gray-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Enviando..." : "Enviar a cotización"}
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 — Enviado */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">¡Solicitud enviada!</h2>
          {submittedId && (
            <p className="text-sm font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 inline-block">
              #{submittedId}
            </p>
          )}
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Tu solicitud fue recibida y está en revisión. El equipo de Sabana Dining te contactará pronto con la cotización.
          </p>
          <Link
            href="/cliente/chat"
            className="inline-block px-6 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 transition-colors"
          >
            Nueva solicitud por chat
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ClientePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-sm">Cargando...</div>}>
      <ClientePageInner />
    </Suspense>
  );
}
