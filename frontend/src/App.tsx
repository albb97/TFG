/* ──────────────────────────────────────────────
   App principal — AGUS
   Layout responsive con Header, Sidebar y ChatPanel.
   En móvil: sidebar como drawer overlay.
   En desktop: sidebar fija a la izquierda.
   ────────────────────────────────────────────── */

import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import ChatPanel from './components/Chat/ChatPanel';
import LoginModal from './components/Admin/LoginModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import FeedbackButton from './components/Feedback/FeedbackButton';
import { useConversation } from './hooks/useConversation';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      // Abre el sidebar por defecto solo en pantallas móviles (< 1024px)
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [view, setView] = useState<'chat' | 'admin'>('chat');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const conversation = useConversation();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleAdminClick = useCallback(() => {
    if (isAdminAuthenticated) {
      setView('admin');
    } else {
      setShowLoginModal(true);
    }
  }, [isAdminAuthenticated]);

  /* Cerrar sidebar al cambiar a desktop (evita overlay fantasma) */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Bloquear scroll del body cuando el sidebar está abierto en móvil */
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  return (
    <div className="flex mobile-full-height flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans antialiased">
      {/* Header superior */}
      <Header 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
        onAdminClick={handleAdminClick}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Contenido principal bajo el header */}
      <div className="flex flex-1 overflow-hidden pt-14 lg:pt-16">
        {/* Sidebar izquierda */}
        <Sidebar
          isOpen={isSidebarOpen}
          deviceCatalog={conversation.deviceCatalog}
          selectedDevice={conversation.selectedDevice}
          selectedManual={conversation.selectedManual}
          onSelectDevice={(device) => {
            conversation.setSelectedDevice(device);
            // Cerrar sidebar en móvil al seleccionar dispositivo
            if (window.innerWidth < 1024) {
              closeSidebar();
            }
          }}
          onClose={closeSidebar}
        />

        {/* Panel principal (Chat o Admin) */}
        <main className={`flex-1 min-h-0 h-full ${view === 'chat' ? 'lg:ml-80' : 'w-full z-50 bg-slate-50 dark:bg-slate-900 absolute inset-0 pt-14 lg:pt-16'}`}>
          {view === 'admin' ? (
            <AdminDashboard 
              onLogout={() => {
                setIsAdminAuthenticated(false);
                setView('chat');
              }}
              onExitAdmin={() => setView('chat')}
              onManualUploaded={conversation.refreshCatalog}
            />
          ) : (
            <ChatPanel
              messages={conversation.messages}
              isLoading={conversation.isLoading}
              onSend={conversation.sendMessage}
              onClear={conversation.clearConversation}
              selectedManualTitle={conversation.selectedManual?.title ?? null}
            />
          )}
        </main>
      </div>

      {/* Modal de Login Admin */}
      {showLoginModal && (
        <LoginModal 
          onLogin={() => {
            setIsAdminAuthenticated(true);
            setShowLoginModal(false);
            setView('admin');
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Botón flotante de sugerencias */}
      <FeedbackButton />
    </div>
  );
}
