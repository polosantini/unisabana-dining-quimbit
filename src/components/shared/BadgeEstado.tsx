type EstadoEvento =
  | "BORRADOR"
  | "EN_COTIZACION"
  | "COTIZADO"
  | "CONFIRMADO"
  | "ASIGNADO"
  | "EN_EJECUCION"
  | "CERRADO";

interface BadgeEstadoProps {
  estado: EstadoEvento | string;
}

const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  BORRADOR: {
    label: "Borrador",
    className: "bg-gray-100 text-gray-600 border border-gray-300",
  },
  EN_COTIZACION: {
    label: "En cotización",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  COTIZADO: {
    label: "Cotizado",
    className: "bg-blue-100 text-blue-800 border border-blue-300",
  },
  CONFIRMADO: {
    label: "Confirmado",
    className: "bg-green-100 text-green-800 border border-green-300",
  },
  ASIGNADO: {
    label: "Asignado",
    className: "bg-teal-100 text-teal-800 border border-teal-300",
  },
  EN_EJECUCION: {
    label: "En ejecución",
    className: "bg-orange-100 text-orange-800 border border-orange-300",
  },
  CERRADO: {
    label: "Cerrado",
    className: "bg-gray-200 text-gray-700 border border-gray-400",
  },
};

export default function BadgeEstado({ estado }: BadgeEstadoProps) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: estado,
    className: "bg-gray-100 text-gray-600 border border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
