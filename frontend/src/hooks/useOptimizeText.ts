/* ──────────────────────────────────────────────
   Hook: useOptimizeText
   Envía un texto al webhook de n8n para que una
   IA lo reescriba de forma óptima.
   Ahora también envía el nombre del manual
   seleccionado para dar más contexto al agente.
   ────────────────────────────────────────────── */

import { useState, useCallback } from 'react';

const OPTIMIZE_URL = import.meta.env.VITE_N8N_OPTIMIZE_URL as string;

/**
 * Hook que llama al webhook de optimización de texto.
 * Devuelve el texto mejorado o null si falla.
 */
export function useOptimizeText() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimize = useCallback(async (
    text: string,
    manualTitle?: string | null
  ): Promise<string | null> => {
    if (!text.trim() || !OPTIMIZE_URL) return null;

    setIsOptimizing(true);
    try {
      const response = await fetch(OPTIMIZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: text,
          manual: manualTitle || null,
        }),
      });

      if (!response.ok) throw new Error('Error en la optimización');

      const data = await response.json();
      // n8n puede devolver el texto en diferentes formatos
      const optimized = data.output || data.texto || data.text || data.message || data.response || 
                        (typeof data === 'string' ? data : null);
      
      return optimized || null;
    } catch (error) {
      console.warn('[AGUS] Error al optimizar texto:', error);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return { optimize, isOptimizing };
}
