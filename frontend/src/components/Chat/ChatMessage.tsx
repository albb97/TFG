/* ──────────────────────────────────────────────
   Componente: ChatMessage
   Burbuja individual de mensaje (usuario/asistente)
   con soporte para markdown básico.
   ────────────────────────────────────────────── */

import { useState } from 'react';
import type { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.lang = 'es-ES';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div
      className={`flex w-full gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar del asistente */}
      {!isUser && (
        <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-md shadow-teal-600/15 mt-1">
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
      )}

      {/* Burbuja del mensaje */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] lg:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm transition-colors ${
          isUser
            ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-teal-600/15'
            : isError
            ? 'border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            : 'border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
        }`}
      >
        {/* Contenido con markdown básico */}
        <div
          className={`prose-sm leading-relaxed ${
            isUser ? 'text-white/95' : ''
          }`}
        >
          <FormattedContent content={message.content} isUser={isUser} />
        </div>

        {/* Fuentes citadas */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
            <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Fuentes
            </p>
            <div className="space-y-1">
              {message.sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{source.section}</span>
                    {source.page && (
                      <span className="ml-1 text-slate-400 dark:text-slate-500">· Pág. {source.page}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Timestamp y Acciones */}
        <div className="mt-2 flex items-center justify-between">
          <p
            className={`text-[10px] ${
              isUser ? 'text-white/50' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {!isUser && !isError && (
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                isSpeaking
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={isSpeaking ? "Detener lectura" : "Leer en voz alta"}
            >
              {isSpeaking ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                  </svg>
                  Detener
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                  Escuchar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Avatar del usuario */}
      {isUser && (
        <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-md shadow-slate-600/15 mt-1">
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
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Sub-componente: FormattedContent
   Renderiza markdown básico (negritas, cursivas,
   listas, tablas, código inline, saltos de línea).
   ────────────────────────────────────────────── */

function FormattedContent({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  // Dividimos por bloques para detectar tablas
  const blocks = content.split('\n\n');

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();

        // Detectar tablas markdown
        if (trimmed.includes('|') && trimmed.split('\n').length >= 3) {
          return <MarkdownTable key={blockIdx} raw={trimmed} />;
        }

        // Bloques normales (párrafos, listas)
        const lines = trimmed.split('\n');
        return (
          <div key={blockIdx} className="space-y-1">
            {lines.map((line, lineIdx) => {
              const l = line.trim();

              // Listas numeradas
              if (/^\d+\.\s/.test(l)) {
                return (
                  <div key={lineIdx} className="flex gap-2 pl-1">
                    <span className={`shrink-0 font-medium ${isUser ? 'text-white/60' : 'text-teal-600'}`}>
                      {l.match(/^\d+/)?.[0]}.
                    </span>
                    <span>
                      <InlineFormat text={l.replace(/^\d+\.\s/, '')} isUser={isUser} />
                    </span>
                  </div>
                );
              }

              // Listas con guión o viñeta
              if (/^[-•]\s/.test(l)) {
                return (
                  <div key={lineIdx} className="flex gap-2 pl-1">
                    <span className={`shrink-0 ${isUser ? 'text-white/60' : 'text-teal-500'}`}>
                      •
                    </span>
                    <span>
                      <InlineFormat text={l.replace(/^[-•]\s/, '')} isUser={isUser} />
                    </span>
                  </div>
                );
              }

              // Párrafo normal
              return (
                <p key={lineIdx}>
                  <InlineFormat text={l} isUser={isUser} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Formato inline: negritas, cursivas, código, emojis */
function InlineFormat({ text, isUser }: { text: string; isUser: boolean }) {
  // Patron para **negrita**, *cursiva*, `código`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className={isUser ? 'text-white font-semibold' : 'text-slate-800 dark:text-white font-semibold'}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={i} className={isUser ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}>
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className={`rounded px-1 py-0.5 text-[11px] font-mono ${
                isUser
                  ? 'bg-white/15 text-white'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-teal-700 dark:text-teal-300'
              }`}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Renderizador básico de tablas markdown */
function MarkdownTable({ raw }: { raw: string }) {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return <p>{raw}</p>;

  const parseRow = (line: string) =>
    line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2); // skip separator

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 mt-2 mb-2">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataLines.map((line, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-t border-slate-100 dark:border-slate-700/50 even:bg-slate-50/50 dark:even:bg-slate-800/50"
            >
              {parseRow(line).map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
