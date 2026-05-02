import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sabana Dining | Mesero",
};

export default function MeseroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-amber-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">Sabana Dining</span>
            <span className="text-amber-100 text-sm font-medium">| Mesero</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/mesero" className="text-amber-100 hover:text-white transition-colors">
              Mis eventos
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
