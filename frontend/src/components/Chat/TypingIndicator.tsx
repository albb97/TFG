/* ──────────────────────────────────────────────
   Componente: TypingIndicator
   Indicador animado de "escribiendo..." cuando
   el asistente está procesando la respuesta.
   ────────────────────────────────────────────── */

export default function TypingIndicator() {
  return (
    <div className="flex w-full gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-md shadow-teal-600/15 mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="white"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>

      {/* Burbuja con animación */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1.2s' }}
            />
            <span
              className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: '200ms', animationDuration: '1.2s' }}
            />
            <span
              className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: '400ms', animationDuration: '1.2s' }}
            />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
            Consultando manual...
          </span>
        </div>
      </div>
    </div>
  );
}
