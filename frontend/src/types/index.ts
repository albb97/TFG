/* ──────────────────────────────────────────────
   Tipos globales de la aplicación MedAssist Docs
   ────────────────────────────────────────────── */

/** Rol del mensaje en la conversación */
export type MessageRole = 'user' | 'assistant' | 'system';

/** Estado de un mensaje individual */
export type MessageStatus = 'sending' | 'sent' | 'error';

/** Mensaje individual en el historial */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  /** Fuentes del manual citadas en la respuesta (futuro) */
  sources?: ManualSource[];
}

/** Fuente de un manual citada en la respuesta */
export interface ManualSource {
  manualId: string;
  section: string;
  page?: number;
  excerpt: string;
}

/** Dispositivo médico disponible */
export interface MedicalDevice {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: DeviceCategory;
  imageUrl?: string;
  /** Manuales asociados a este dispositivo */
  manuals: Manual[];
  /** URL del QR asociado al dispositivo (futuro) */
  qrUrl?: string;
}

/** Categorías de dispositivos médicos */
export type DeviceCategory =
  | 'monitor'
  | 'ventilator'
  | 'infusion_pump'
  | 'defibrillator'
  | 'imaging'
  | 'laboratory'
  | 'surgical'
  | 'other';

/** Manual de un dispositivo */
export interface Manual {
  id: string;
  deviceId: string;
  title: string;
  version: string;
  language: string;
  lastUpdated: Date;
  totalPages?: number;
  /** ID numérico del manual en Qdrant (campo manual_id en los metadatos) */
  manualIdNumeric?: number;
  /** URL directa al archivo PDF del manual (para descarga/visualización) */
  pdfUrl?: string;
}

/** Pregunta sugerida para el usuario */
export interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

/** Estado global de la conversación */
export interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  selectedDevice: MedicalDevice | null;
  selectedManual: Manual | null;
  error: string | null;
}

/** Payload enviado al webhook de n8n */
export interface N8nWebhookPayload {
  message: string;
  deviceId?: string;
  deviceName?: string;
  deviceModel?: string;
  manualTitle?: string;
  /** ID numérico del manual para filtrar en Qdrant (campo manual_id) */
  manual_id?: number;
  conversationHistory?: Array<{
    role: MessageRole;
    content: string;
  }>;
  sessionId: string;
}

/** Respuesta del webhook de n8n */
export interface N8nWebhookResponse {
  reply: string;
  sources?: ManualSource[];
  error?: string;
}
