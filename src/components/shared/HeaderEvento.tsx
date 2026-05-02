import BadgeEstado from "./BadgeEstado";

interface HeaderEventoProps {
  eventoId: string;
  estado: string;
  cliente?: string;
  fecha?: string;
}

export default function HeaderEvento({ eventoId, estado, cliente, fecha }: HeaderEventoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
      <span className="text-lg font-bold text-gray-900 font-mono">
        #{eventoId}
      </span>
      <BadgeEstado estado={estado} />
      {cliente && (
        <span className="text-sm text-gray-600 font-medium">{cliente}</span>
      )}
      {fecha && (
        <span className="text-sm text-gray-500">
          {new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      )}
    </div>
  );
}
