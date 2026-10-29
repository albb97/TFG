/* ──────────────────────────────────────────────
   Componente: Sidebar
   Panel lateral responsive — drawer en móvil,
   fijo en desktop. Incluye aviso de seguridad.
   ────────────────────────────────────────────── */

import type { MedicalDevice, Manual } from '../../types';
import { SAFETY_DISCLAIMER } from '../../data/defaults';
import DeviceSearch from './DeviceSearch';

interface SidebarProps {
  isOpen: boolean;
  deviceCatalog: MedicalDevice[];
  selectedDevice: MedicalDevice;
  selectedManual: Manual;
  onSelectDevice: (device: MedicalDevice) => void;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  deviceCatalog,
  selectedDevice,
  selectedManual,
  onSelectDevice,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Overlay móvil — cubre toda la pantalla */}
      {isOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel lateral */}
      <aside
        className={`
          fixed left-0 z-40 border-r border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg 
          transition-transform duration-300 ease-in-out
          
          /* Móvil: fullscreen drawer desde la izquierda */
          top-0 bottom-0 w-[85vw] max-w-80
          
          /* Desktop: anclado bajo el header */
          lg:top-16 lg:bottom-0 lg:w-80 lg:translate-x-0
          
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header del sidebar en móvil */}
        <div className="flex h-14 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">AGUS</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-3.5rem)] lg:h-full flex-col overflow-y-auto touch-scroll p-4 lg:p-5">
          {/* Buscador de dispositivos */}
          <section className="mb-4 lg:mb-5">
            <SectionLabel text="Seleccionar dispositivo" />
            <div className="mt-2">
              <DeviceSearch
                devices={deviceCatalog}
                selectedDevice={selectedDevice}
                onSelectDevice={onSelectDevice}
              />
            </div>
          </section>

          {/* Manual activo (compacto) + botón descargar */}
          <section className="mb-4 lg:mb-6">
            <SectionLabel text="Manual cargado" />
            <div className="mt-2 flex items-center gap-2">
              {/* Info del manual */}
              <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{selectedManual.title}</p>
                  <div className="mt-1 flex gap-1.5">
                    <span className="inline-flex items-center rounded bg-teal-50 dark:bg-teal-900/40 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-400">
                      v{selectedManual.version}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón descargar/ver PDF */}
              {selectedManual.pdfUrl ? (
                <a
                  href={toDirectDownloadUrl(selectedManual.pdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm active:scale-95"
                  title="Descargar PDF"
                  aria-label="Descargar manual PDF"
                  id="download-manual-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </a>
              ) : (
                <button
                  disabled
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  title="PDF no disponible"
                  aria-label="PDF no disponible"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
              )}
            </div>
          </section>

          {/* Aviso de seguridad */}
          <section className="mt-auto">
            <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 dark:from-amber-950/30 to-orange-50/50 dark:to-orange-950/20 p-3 lg:p-4">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mt-0.5 h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-amber-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <p className="text-[11px] lg:text-xs font-semibold text-amber-800 dark:text-amber-500">
                    Aviso de seguridad
                  </p>
                  <p className="mt-1 text-[10px] lg:text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-500/80">
                    {SAFETY_DISCLAIMER}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

/** Etiqueta de sección reutilizable */
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] lg:text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
      {text}
    </p>
  );
}

/**
 * Convierte URLs de Google Drive a descarga directa.
 * Ej: https://drive.google.com/file/d/XXXXX/view
 *   → https://drive.google.com/uc?export=download&id=XXXXX
 */
function toDirectDownloadUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}
