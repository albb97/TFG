/* ──────────────────────────────────────────────
   Componente: AdminDashboard
   Panel de administración para subir nuevos manuales
   ────────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react';
import { uploadManualToN8n, getNextManualId } from '../../services/api';

interface AdminDashboardProps {
  onLogout: () => void;
  onExitAdmin: () => void;
  onManualUploaded?: () => void;
}

export default function AdminDashboard({ onLogout, onExitAdmin, onManualUploaded }: AdminDashboardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [manualId, setManualId] = useState<number>(1);
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('monitor');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cargar el próximo ID disponible consultando el catálogo (Qdrant)
    getNextManualId().then((nextId) => {
      setManualId(nextId);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !deviceName || !model) {
      setErrorMessage('Por favor, rellena todos los campos obligatorios y selecciona un archivo.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      await uploadManualToN8n({
        file,
        deviceName,
        manual_id: manualId,
        model,
        category,
      });
      setStatus('success');
      
      // Incrementar ID y guardarlo como fallback
      const nextId = manualId + 1;
      setManualId(nextId);
      localStorage.setItem('agus_next_manual_id', nextId.toString());

      // Notificar al componente principal para que recargue el catálogo
      if (onManualUploaded) {
        onManualUploaded();
      }

      // Limpiar el formulario
      setFile(null);
      setDeviceName('');
      setModel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al subir el manual.');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto touch-scroll bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header del Dashboard */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Panel de Administración</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sube nuevos manuales de dispositivos médicos al sistema.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onExitAdmin}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm active:bg-slate-100 dark:active:bg-slate-600"
            >
              Volver al Chat
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg bg-slate-800 dark:bg-slate-700 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm active:bg-slate-900 dark:active:bg-slate-800"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Formulario de subida */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Información del Dispositivo */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Información del Equipo</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nombre del Dispositivo *</label>
                  <input
                    type="text"
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Ej: Tensiómetro OMRON M4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">ID del Manual</label>
                  <input
                    type="text"
                    readOnly
                    value={manualId}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Se autoincrementa en cada subida.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Ej: HEM-7155T-EBK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white dark:bg-slate-800"
                  >
                    <option value="monitor">Monitor / Medición</option>
                    <option value="ventilator">Ventilador Mecánico</option>
                    <option value="infusion_pump">Bomba de Infusión</option>
                    <option value="defibrillator">Desfibrilador</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Archivo PDF */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Manual (PDF)</h3>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-slate-400 dark:text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-slate-700 dark:text-slate-300">Haz clic para subir</span> o arrastra y suelta</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">PDF (Max. 50MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
              {file && (
                <div className="mt-3 flex items-center gap-2 text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 py-2 px-3 rounded-lg border border-teal-100 dark:border-teal-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-teal-600/70 dark:text-teal-500/70 text-xs ml-auto">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* Mensajes de estado */}
            {status === 'error' && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                ⚠️ {errorMessage}
              </div>
            )}

            {status === 'success' && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-4 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                ✅ Manual subido correctamente. El webhook de n8n lo ha recibido.
              </div>
            )}

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={status === 'uploading'}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-70"
            >
              {status === 'uploading' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>Subir Manual</>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
