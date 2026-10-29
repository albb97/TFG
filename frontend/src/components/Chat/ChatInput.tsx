/* ──────────────────────────────────────────────
   Componente: ChatInput
   Campo de entrada responsive con soporte para
   dictado por voz (Web Speech API).
   ────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useOptimizeText } from '../../hooks/useOptimizeText';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  /** Título del manual seleccionado (para el optimizador de queries) */
  selectedManualTitle?: string | null;
}

/** Tipado para la Web Speech API (no incluido en lib.dom por defecto) */
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

/** Comprobar si el navegador soporta reconocimiento de voz */
function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

export default function ChatInput({ onSend, isLoading, selectedManualTitle }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const valueBeforeVoiceRef = useRef('');
  const { optimize, isOptimizing } = useOptimizeText();

  const speechSupported = typeof window !== 'undefined' && getSpeechRecognition() !== null;

  /** Optimizar la pregunta con IA */
  const handleOptimize = useCallback(async () => {
    if (!value.trim() || isOptimizing || isLoading) return;
    const result = await optimize(value, selectedManualTitle);
    if (result) {
      setValue(result);
      setShowOptimized(true);
      setTimeout(() => setShowOptimized(false), 3000);
      // Enfocar el textarea
      textareaRef.current?.focus();
    }
  }, [value, isOptimizing, isLoading, optimize]);

  /** Ajuste automático de la altura del textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    // Si estamos grabando, parar primero
    if (isListening) stopListening();
    onSend(value);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Iniciar dictado por voz */
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = true;

    // Guardar el texto actual para concatenar lo que se dicte
    valueBeforeVoiceRef.current = value;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Si hay resultado final, añadirlo al texto base
      if (finalTranscript) {
        valueBeforeVoiceRef.current = valueBeforeVoiceRef.current
          ? valueBeforeVoiceRef.current + ' ' + finalTranscript
          : finalTranscript;
        setValue(valueBeforeVoiceRef.current);
      } else {
        // Resultado intermedio: mostrar en tiempo real
        const preview = valueBeforeVoiceRef.current
          ? valueBeforeVoiceRef.current + ' ' + interimTranscript
          : interimTranscript;
        setValue(preview);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      console.warn('[AGUS] Error de reconocimiento de voz:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [value]);

  /** Detener dictado */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  /** Toggle dictado */
  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /** Limpiar al desmontar */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="chat-input-container border-t border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-3 sm:px-4 py-2.5 sm:py-4 safe-area-bottom transition-colors duration-300">
      <div className="mx-auto max-w-3xl">
        <div className={`flex items-end gap-2 sm:gap-3 rounded-2xl border bg-white dark:bg-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg transition-all ${
          isOptimizing
            ? 'border-purple-300 dark:border-purple-700 shadow-purple-100/50 dark:shadow-purple-900/20 ring-4 ring-purple-50 dark:ring-purple-900/30'
            : isListening
              ? 'border-red-300 dark:border-red-700 shadow-red-100/50 dark:shadow-red-900/20 ring-4 ring-red-50 dark:ring-red-900/30'
              : 'border-slate-200/80 dark:border-slate-700 shadow-slate-200/50 dark:shadow-slate-900/50 focus-within:border-teal-300 dark:focus-within:border-teal-600 focus-within:shadow-teal-100/50 dark:focus-within:shadow-teal-900/20 focus-within:ring-4 focus-within:ring-teal-50 dark:focus-within:ring-teal-900/30'
        }`}>
          <div className={`relative flex-1 ${
            isOptimizing ? 'optimize-blur' : ''
          } ${
            showOptimized ? 'optimize-reveal' : ''
          }`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Escuchando...' : 'Escribe tu consulta...'}
              disabled={isLoading || isOptimizing}
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none disabled:opacity-50"
              id="chat-input"
              enterKeyHint="send"
              autoComplete="off"
            />
          </div>

          {/* Botón de micrófono */}
          {speechSupported && (
            <button
              onClick={toggleVoice}
              disabled={isLoading}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-40 ${
                isListening
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/25 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-label={isListening ? 'Detener dictado' : 'Dictar por voz'}
              id="voice-button"
              type="button"
            >
              {isListening ? (
                /* Icono de stop (cuadrado) cuando está grabando */
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                /* Icono de micrófono */
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}

          {/* Botón de optimizar pregunta con IA */}
          {value.trim() && (
            <button
              onClick={handleOptimize}
              disabled={isLoading || isOptimizing}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-40 ${
                showOptimized
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                  : isOptimizing
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-500 dark:text-purple-400'
                    : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              aria-label="Mejorar pregunta con IA"
              id="optimize-button"
              type="button"
              title="Mejorar pregunta con IA ✨"
            >
              {isOptimizing ? (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : showOptimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              )}
            </button>
          )}

          {/* Botón de enviar */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-md shadow-teal-600/25 transition-all hover:shadow-lg hover:shadow-teal-600/30 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:shadow-none"
            aria-label="Enviar mensaje"
            id="send-button"
          >
            {isLoading ? (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Label flotante de optimización */}
        {isOptimizing && (
          <div className="optimize-label flex items-center justify-center gap-1.5 mt-1.5">
            <svg className="h-3 w-3 animate-spin text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium text-purple-500">Mejorando con IA...</span>
          </div>
        )}

        {/* Label de texto mejorado */}
        {showOptimized && !isOptimizing && (
          <div className="optimize-label flex items-center justify-center gap-1 mt-1.5">
            <span className="text-[10px] sm:text-xs font-medium text-emerald-500">✨ Texto mejorado</span>
          </div>
        )}

        {!isOptimizing && !showOptimized && (
          <p className="mt-1.5 sm:mt-2 text-center text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
            Pulsa Enter para enviar · Shift+Enter para nueva línea
          </p>
        )}
      </div>
    </div>
  );
}
