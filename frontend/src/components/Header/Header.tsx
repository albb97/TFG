/* ──────────────────────────────────────────────
   Componente: Header
   Barra superior responsive — compacta en móvil.
   ────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { checkN8nHealth } from '../../services/api';
import FeedbackButton from '../Feedback/FeedbackButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onAdminClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ onToggleSidebar, isSidebarOpen, onAdminClick, theme, onToggleTheme }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkN8nHealth().then(setIsConnected);
    const interval = setInterval(() => {
      checkN8nHealth().then(setIsConnected);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 lg:h-16 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors duration-300 safe-area-top">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Izquierda: toggle sidebar + logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 lg:hidden active:bg-slate-200 dark:active:bg-slate-700"
            aria-label={isSidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {/* Icono médico */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-md shadow-teal-600/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="white"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-800 dark:text-white">
                AGUS
              </h1>
              <p className="hidden text-[11px] leading-none text-slate-400 dark:text-slate-500 sm:block">
                Asistente de Guías de Uso Sanitario
              </p>
            </div>
          </div>
        </div>

        {/* Derecha: botón Feedback (Móvil) y Admin */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle de Tema Oscuro/Claro */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar modo noche"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <FeedbackButton variant="header" />
          
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 shadow-sm active:bg-slate-100 dark:active:bg-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="hidden sm:inline">Admin</span>
          </button>

        </div>
      </div>
    </header>
  );
}
