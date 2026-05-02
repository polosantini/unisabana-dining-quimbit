import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sabana Dining | Cliente",
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-teal-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">Sabana Dining</span>
            <span className="text-teal-200 text-sm font-medium">| Cliente</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/cliente" className="text-teal-100 hover:text-white transition-colors">
              Solicitar evento
            </Link>
            <Link href="/cliente/chat" className="text-teal-100 hover:text-white transition-colors">
              Asistente IA
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
