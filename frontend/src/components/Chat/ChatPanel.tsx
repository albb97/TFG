/* ──────────────────────────────────────────────
   Componente: ChatPanel
   Panel principal responsive con historial de
   conversación y barra de entrada.
   ────────────────────────────────────────────── */

import { useState, useRef, useEffect, type UIEvent } from 'react';
import type { Message } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClear: () => void;
  /** Título del manual seleccionado (para el optimizador de queries) */
  selectedManualTitle?: string | null;
}

export default function ChatPanel({
  messages,
  isLoading,
  onSend,
  onClear,
  selectedManualTitle,
}: ChatPanelProps) {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Manejar el scroll para detectar si el usuario ha subido */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Consideramos que está "scrolleado hacia arriba" si la distancia al fondo es mayor a 100px
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setIsScrolledUp(isUp);
    
    // Si vuelve abajo del todo, quitamos la alerta de nuevos mensajes
    if (!isUp) {
      setHasNewMessages(false);
    }
  };

  /** Auto-scroll inteligente o alerta de nuevo mensaje */
  useEffect(() => {
    if (!isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Si está arriba y llega un mensaje nuevo (o empieza a cargar la respuesta), avisamos
      setHasNewMessages(true);
    }
  }, [messages.length, isLoading]);

  return (
    <div className="flex h-full flex-col relative">
      {/* Barra superior del chat */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg px-3 sm:px-6 py-2.5 sm:py-3 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4 text-slate-400 hidden sm:block"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            Consulta
          </h2>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {messages.filter((m) => m.role === 'user').length} msg
          </span>
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:shadow-sm active:bg-slate-100 dark:active:bg-slate-600"
          id="clear-chat-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          <span className="hidden sm:inline">Nueva consulta</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Historial de mensajes */}
      <div 
        className="flex-1 overflow-y-auto touch-scroll p-3 sm:p-6" 
        id="messages-container"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <div className="mx-auto max-w-3xl space-y-3 sm:space-y-5">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Botón flotante para bajar (Notificación de Autoscroll) */}
      {(isScrolledUp && hasNewMessages) && (
        <button
          onClick={() => {
            setIsScrolledUp(false);
            setHasNewMessages(false);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-teal-600 dark:bg-teal-500 px-4 py-2 text-[11px] sm:text-xs font-medium text-white shadow-lg shadow-teal-900/20 hover:bg-teal-700 dark:hover:bg-teal-400 transition-all z-10 animate-bounce cursor-pointer border border-teal-500 dark:border-teal-400"
        >
          <span>Nuevos mensajes</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Input fijo abajo */}
      <ChatInput onSend={onSend} isLoading={isLoading} selectedManualTitle={selectedManualTitle} />
    </div>
  );
}
