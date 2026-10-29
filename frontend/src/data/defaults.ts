/* ──────────────────────────────────────────────
   Datos por defecto — dispositivos, manuales,
   catálogo de equipos
   ────────────────────────────────────────────── */

import type { MedicalDevice, SuggestedQuestion } from '../types';

/** Catálogo de dispositivos médicos disponibles */
export const DEVICE_CATALOG: MedicalDevice[] = [];

/** Dispositivo por defecto (placeholder cuando no hay dispositivos) */
export const DEFAULT_DEVICE: MedicalDevice = {
  id: 'sin-dispositivo',
  name: 'Sin dispositivo seleccionado',
  manufacturer: '',
  model: '',
  category: 'other',
  manuals: [
    {
      id: 'sin-manual',
      deviceId: 'sin-dispositivo',
      title: 'Ningún manual cargado',
      version: '-',
      language: 'es',
      lastUpdated: new Date(),
    },
  ],
};

/** Preguntas sugeridas por categoría */
export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'sq-1',
    text: '¿Cómo configuro las alarmas del monitor?',
    category: 'Configuración',
  },
  {
    id: 'sq-2',
    text: '¿Cuál es el procedimiento de limpieza?',
    category: 'Mantenimiento',
  },
  {
    id: 'sq-3',
    text: '¿Qué significan los códigos de error?',
    category: 'Resolución de problemas',
  },
  {
    id: 'sq-4',
    text: '¿Cómo realizo la calibración del sensor de SpO₂?',
    category: 'Configuración',
  },
  {
    id: 'sq-5',
    text: '¿Qué hacer ante una alarma de batería baja?',
    category: 'Emergencias',
  },
];

/** Mensaje de bienvenida del asistente */
export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content:
    '¡Hola! Soy **AGUS**, tu asistente de manuales médicos. Escribe tu consulta y te ayudo.',
  timestamp: new Date(),
  status: 'sent' as const,
};

/** Aviso de seguridad mostrado en el sidebar */
export const SAFETY_DISCLAIMER =
  'Esta herramienta es un apoyo documental. No sustituye la formación clínica ni el criterio profesional. Verifique siempre la información con el manual oficial impreso y siga los protocolos de su institución.';
