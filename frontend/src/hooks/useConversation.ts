/* ──────────────────────────────────────────────
   Hook: useConversation
   Gestiona el estado de la conversación y la
   comunicación con el servicio de n8n.
   ────────────────────────────────────────────── */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, Manual, MedicalDevice } from '../types';
import { sendMessageToAssistant, generateSessionId, fetchDeviceCatalog } from '../services/api';
import { DEFAULT_DEVICE, DEVICE_CATALOG, WELCOME_MESSAGE } from '../data/defaults';

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceCatalog, setDeviceCatalog] = useState<MedicalDevice[]>(DEVICE_CATALOG);
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice>(DEFAULT_DEVICE);
  const [selectedManual, setSelectedManual] = useState<Manual>(
    DEFAULT_DEVICE.manuals[0]
  );

  const sessionIdRef = useRef(generateSessionId());

  /** Cargar catálogo de dispositivos al iniciar */
  const loadCatalog = useCallback(async () => {
    const devices = await fetchDeviceCatalog();
    setDeviceCatalog(devices);
    // Si hay dispositivos, asegurarse de que haya uno seleccionado válido
    if (devices.length > 0) {
      // Intentar mantener la selección actual si aún existe
      setSelectedDevice((prev) => {
        const stillExists = devices.find(d => d.id === prev.id);
        if (stillExists) return stillExists;
        return devices[0];
      });
      setSelectedManual((prev) => {
        const currentDevice = devices.find(d => d.manuals.some(m => m.id === prev.id));
        if (currentDevice) {
          return currentDevice.manuals.find(m => m.id === prev.id) || currentDevice.manuals[0];
        }
        return devices[0].manuals[0] || prev;
      });
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  /** Genera un ID único para cada mensaje */
  const createMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }, []);

  /** Envía un mensaje del usuario y espera la respuesta */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: createMessageId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendMessageToAssistant({
          message: content.trim(),
          deviceId: selectedDevice.id,
          deviceName: selectedDevice.name,
          deviceModel: selectedDevice.model,
          manualTitle: selectedManual.title,
          manual_id: selectedManual.manualIdNumeric ?? null,
          sessionId: sessionIdRef.current,
          conversationHistory: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        });

        const assistantMessage: Message = {
          id: createMessageId(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
          status: 'sent',
          sources: response.sources,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorText =
          err instanceof Error
            ? err.message
            : 'Ha ocurrido un error inesperado.';
        setError(errorText);

        const errorMessage: Message = {
          id: createMessageId(),
          role: 'assistant',
          content: `⚠️ ${errorText}`,
          timestamp: new Date(),
          status: 'error',
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, createMessageId, selectedDevice, selectedManual, messages]
  );

  /** Limpia la conversación e inicia una nueva sesión */
  const clearConversation = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  }, []);

  /** Cambia el dispositivo y selecciona su primer manual automáticamente */
  const handleSelectDevice = useCallback((device: MedicalDevice) => {
    setSelectedDevice(device);
    if (device.manuals.length > 0) {
      setSelectedManual(device.manuals[0]);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    deviceCatalog,
    selectedDevice,
    selectedManual,
    sendMessage,
    clearConversation,
    setSelectedDevice: handleSelectDevice,
    setSelectedManual,
    refreshCatalog: loadCatalog,
  };
}
