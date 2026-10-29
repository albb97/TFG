/* ──────────────────────────────────────────────
   Componente: FeedbackButton
   Botón flotante + modal para que los usuarios
   envíen ideas y sugerencias al administrador
   vía webhook de n8n.
   ────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOptimizeText } from '../../hooks/useOptimizeText';

const WEBHOOK_URL = import.meta.env.VITE_N8N_FEEDBACK_URL as string;

type SuggestionType = 'mejora' | 'nueva_funcionalidad' | 'error' | 'otro';

interface FeedbackForm {
  nombre: string;
  email: string;
  tipo: SuggestionType;
  descripcion: string;
}

const INITIAL_FORM: FeedbackForm = {
  nombre: '',
  email: '',
  tipo: 'mejora',
  descripcion: '',
};

const TIPO_LABELS: Record<SuggestionType, { label: string; emoji: string }> = {
  mejora: { label: 'Mejora', emoji: '✨' },
  nueva_funcionalidad: { label: 'Nueva funcionalidad', emoji: '🚀' },
  error: { label: 'Reportar error', emoji: '🐛' },
  otro: { label: 'Otro', emoji: '💬' },
};

export default function FeedbackButton({ variant = 'floating' }: { variant?: 'floating' | 'header' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FeedbackForm>(INITIAL_FORM);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [descOptimized, setDescOptimized] = useState(false);
  const { optimize, isOptimizing } = useOptimizeText();

  /* Animación de entrada del botón */
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);



  /* Bloquear scroll cuando el modal está abierto */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (field: keyof FeedbackForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.descripcion.trim()) return;

    setStatus('sending');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre || 'Anónimo',
          email: form.email || 'No proporcionado',
          tipo: TIPO_LABELS[form.tipo].label,
          descripcion: form.descripcion,
          fecha: new Date().toLocaleString('es-ES'),
        }),
      });

      if (!response.ok) throw new Error('Error en el envío');

      setStatus('success');
      setForm(INITIAL_FORM);

      // Cerrar automáticamente tras 2.5 segundos
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      {/* ── Botón flotante ── */}
      {variant === 'floating' && (
      <div
        className={`fixed bottom-5 right-5 z-[90] hidden sm:flex items-center gap-2 transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Tooltip / etiqueta */}
        <div
          className={`hidden sm:flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-lg border border-slate-200/80 dark:border-slate-700 transition-all duration-300 ${
            showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        >
          <span>¿Tienes una idea?</span>
          <span className="text-sm">💡</span>
        </div>

        <button
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-110 active:scale-95"
          aria-label="Enviar una idea o sugerencia"
          id="feedback-button"
        >
          {/* Icono bombilla */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-6 w-6 transition-transform duration-200 group-hover:rotate-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg>


        </button>
      </div>
      )}

      {/* ── Botón Header (Móvil) ── */}
      {variant === 'header' && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex sm:hidden items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/30 px-2 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-sm active:bg-amber-200 dark:active:bg-amber-900"
          aria-label="Sugerencias"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </button>
      )}

      {/* ── Modal del formulario ── */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && status !== 'sending') {
              setIsOpen(false);
              setStatus('idle');
            }
          }}
        >
          <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto feedback-modal-enter border border-slate-200 dark:border-slate-800">
            {/* Barra de arrastre móvil */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-5 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl z-10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setStatus('idle');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Cerrar formulario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-400/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">¡Comparte tu idea!</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tu opinión nos ayuda a mejorar AGUS</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-5 sm:px-6 py-4 sm:py-5">
              {status === 'success' ? (
                /* ── Estado: Éxito ── */
                <div className="flex flex-col items-center justify-center py-8 text-center feedback-success-enter">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-emerald-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">¡Gracias por tu idea!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">La revisaremos lo antes posible. 🙌</p>
                </div>
              ) : (
                /* ── Formulario ── */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Tipo de sugerencia */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Tipo de sugerencia
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(TIPO_LABELS) as [SuggestionType, { label: string; emoji: string }][]).map(
                        ([key, { label, emoji }]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleChange('tipo', key)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                              form.tipo === key
                                ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <span className="text-sm">{emoji}</span>
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label htmlFor="feedback-description" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                      Cuéntanos tu idea <span className="text-red-400 dark:text-red-500">*</span>
                    </label>
                    <textarea
                      id="feedback-description"
                      value={form.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
                      placeholder="Describe tu idea, sugerencia o lo que has encontrado..."
                      rows={4}
                      required
                      autoFocus
                    />
                    {/* Botón de mejorar descripción con IA */}
                    {form.descripcion.trim() && (
                      <button
                        type="button"
                        onClick={async () => {
                          const result = await optimize(form.descripcion);
                          if (result) {
                            handleChange('descripcion', result);
                            setDescOptimized(true);
                            setTimeout(() => setDescOptimized(false), 3000);
                          }
                        }}
                        disabled={isOptimizing}
                        className={`mt-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                          descOptimized
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : isOptimizing
                              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-400 dark:text-purple-300'
                              : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 dark:hover:text-purple-300'
                        }`}
                        id="feedback-optimize-button"
                      >
                        {isOptimizing ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Mejorando...
                          </>
                        ) : descOptimized ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            ¡Texto mejorado!
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-3.5 w-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            Mejorar texto con IA
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Nombre y Email en una fila */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="feedback-name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Nombre <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">(opcional)</span>
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        value={form.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                        Email <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">(opcional)</span>
                      </label>
                      <input
                        id="feedback-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      Error al enviar. Inténtalo de nuevo.
                    </div>
                  )}

                  {/* Botón de enviar */}
                  <button
                    type="submit"
                    disabled={status === 'sending' || !form.descripcion.trim()}
                    className="mt-1 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98]"
                    id="feedback-submit-button"
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Enviar sugerencia
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </span>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    Tus datos solo se usarán para mejorar AGUS
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
