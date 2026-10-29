/* ──────────────────────────────────────────────
   Componente: DeviceSearch
   Buscador de dispositivos y manuales con
   filtrado en tiempo real.
   ────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react';
import type { MedicalDevice } from '../../types';

interface DeviceSearchProps {
  devices: MedicalDevice[];
  selectedDevice: MedicalDevice;
  onSelectDevice: (device: MedicalDevice) => void;
}

export default function DeviceSearch({
  devices,
  selectedDevice,
  onSelectDevice,
}: DeviceSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Filtrar dispositivos según la búsqueda */
  const filtered = devices.filter((device) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      device.name.toLowerCase().includes(q) ||
      device.model.toLowerCase().includes(q) ||
      device.manufacturer.toLowerCase().includes(q)
    );
  });

  /** Cerrar dropdown al hacer clic fuera */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (device: MedicalDevice) => {
    onSelectDevice(device);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Dispositivo seleccionado actualmente */}
      <div className="mb-3 rounded-xl border border-teal-200/80 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/80 dark:from-teal-950/40 to-white dark:to-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4.5 w-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedDevice.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {selectedDevice.manufacturer} · {selectedDevice.model}
            </p>
          </div>
        </div>
      </div>

      {/* Campo de búsqueda */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar dispositivo o modelo..."
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-teal-300 dark:focus:border-teal-600 focus:ring-2 focus:ring-teal-50 dark:focus:ring-teal-900/30"
          id="device-search-input"
        />
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No se encontraron dispositivos</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Prueba con otro nombre o modelo</p>
            </div>
          ) : (
            <div className="py-1">
              {filtered.map((device) => {
                const isSelected = device.id === selectedDevice.id;
                return (
                  <button
                    key={device.id}
                    onClick={() => handleSelect(device)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      <DeviceIcon category={device.category} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{device.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {device.manufacturer} · {device.model}
                      </p>
                    </div>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0 text-teal-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Icono según la categoría del dispositivo */
function DeviceIcon({ category }: { category: string }) {
  switch (category) {
    case 'ventilator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'infusion_pump':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    case 'defibrillator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      );
  }
}
