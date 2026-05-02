import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Sabana Dining</h1>
        <p className="text-gray-500 mt-2 text-sm">Sistema de gestión de eventos — Demo Hackathon</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link
          href="/cliente/chat"
          className="flex flex-col items-center gap-3 p-6 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors shadow-md"
        >
          <span className="text-3xl">💬</span>
          <span className="font-bold text-base">Cliente</span>
          <span className="text-xs text-teal-200 text-center">Solicitar evento con asistente IA</span>
        </Link>

        <Link
          href="/admin"
          className="flex flex-col items-center gap-3 p-6 bg-indigo-800 text-white rounded-xl hover:bg-indigo-900 transition-colors shadow-md"
        >
          <span className="text-3xl">📊</span>
          <span className="font-bold text-base">Administrador</span>
          <span className="text-xs text-indigo-200 text-center">Tablero de cotizaciones y asignaciones</span>
        </Link>

        <Link
          href="/mesero"
          className="flex flex-col items-center gap-3 p-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-md"
        >
          <span className="text-3xl">🍽️</span>
          <span className="font-bold text-base">Mesero</span>
          <span className="text-xs text-amber-100 text-center">Panel de tareas y checklist</span>
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-400">Universidad de La Sabana · Quimbit · 2026</p>
    </div>
  );
}
