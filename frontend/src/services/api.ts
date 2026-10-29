/* ──────────────────────────────────────────────
   Servicio API — Comunicación con n8n webhook
   ────────────────────────────────────────────── */

import type { N8nWebhookPayload, N8nWebhookResponse, MedicalDevice } from '../types';
import { DEVICE_CATALOG } from '../data/defaults';

/** URL base del webhook de n8n */
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;

/** URL del webhook para obtener el catálogo de dispositivos */
const N8N_DEVICES_URL = import.meta.env.VITE_N8N_DEVICES_URL as string;

/** URL del webhook para subir nuevos manuales */
const N8N_UPLOAD_URL = import.meta.env.VITE_N8N_UPLOAD_URL as string;

/** Tiempo máximo de espera para la respuesta (ms) */
const REQUEST_TIMEOUT = 60_000;

/**
 * Genera un ID de sesión único para agrupar mensajes
 * en la misma conversación dentro de n8n.
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Envía un mensaje al asistente a través del webhook de n8n.
 *
 * @param payload - Datos del mensaje a enviar
 * @returns La respuesta del asistente
 * @throws Error si la petición falla o el timeout expira
 */
export async function sendMessageToAssistant(
  payload: N8nWebhookPayload
): Promise<N8nWebhookResponse> {
  if (!N8N_WEBHOOK_URL) {
    console.warn(
      '[AGUS] VITE_N8N_WEBHOOK_URL no configurada. Usando respuesta simulada.'
    );
    return getMockResponse(payload.message);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Error del servidor: ${response.status} ${response.statusText}`
      );
    }

    // Leer respuesta como texto primero para evitar error con respuestas vacías
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      console.warn('[AGUS] n8n devolvió una respuesta vacía.');
      return { reply: '⚠️ El asistente no devolvió ninguna respuesta. Verifica que el flujo de n8n esté activo y escuchando.' };
    }

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.warn('[AGUS] Respuesta de n8n no es JSON válido:', responseText);
      // Si no es JSON, usar el texto directamente como respuesta
      return { reply: responseText };
    }

    // Log para depuración — ver qué devuelve n8n exactamente
    console.log('[AGUS] Respuesta de n8n:', JSON.stringify(data, null, 2));

    // Extraer el texto de respuesta de cualquier formato que n8n devuelva
    const reply = extractReplyFromResponse(data);

    return { reply };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        'La solicitud ha excedido el tiempo de espera. Inténtelo de nuevo.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extrae el texto de respuesta de cualquier formato que devuelva n8n.
 * n8n puede devolver strings, objetos con distintos campos, arrays, etc.
 */
function extractReplyFromResponse(data: unknown): string {
  // Si es directamente un string
  if (typeof data === 'string') {
    return data;
  }
  // Si es un array, tomar el primer elemento
  if (Array.isArray(data)) {
    if (data.length === 0) return 'No se recibió respuesta del asistente.';
    return extractReplyFromResponse(data[0]);
  }
  // Si es un objeto, buscar campos comunes
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    // Campos que n8n suele usar (en orden de prioridad)
    const possibleFields = [
      'reply',
      'output',
      'text',
      'response',
      'message',
      'answer',
      'content',
      'result',
      'data',
    ];
    for (const field of possibleFields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        const val = obj[field];
        if (typeof val === 'string') return val;
        // Si es un objeto anidado, intentar recursivamente
        if (typeof val === 'object') return extractReplyFromResponse(val);
      }
    }
    // Si no encontró ningún campo conocido, devolver el JSON formateado
    return JSON.stringify(data, null, 2);
  }
  return 'No se pudo interpretar la respuesta del asistente.';
}

/**
 * Respuesta simulada para desarrollo sin n8n.
 * Se elimina cuando el webhook esté configurado.
 */
async function getMockResponse(message: string): Promise<N8nWebhookResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('alarma') || lowerMsg.includes('alarm')) {
    return {
      reply:
        'Las alarmas del monitor de signos vitales se configuran desde el menú **Ajustes → Alarmas**. Cada parámetro (SpO₂, FC, PNI, Temp) tiene un rango superior e inferior ajustable.\n\n**Pasos:**\n1. Pulse el botón *Menú* en la pantalla principal.\n2. Seleccione **Ajustes de alarmas**.\n3. Seleccione el parámetro a configurar.\n4. Ajuste los límites con las flechas ▲▼.\n5. Confirme con *Aceptar*.\n\n⚠️ No desactive las alarmas críticas sin supervisión clínica.',
      sources: [
        {
          manualId: 'manual-001',
          section: 'Sección 5.3 — Configuración de alarmas',
          page: 42,
          excerpt: 'Los límites de alarma se ajustan de forma individual para cada parámetro...',
        },
      ],
    };
  }

  if (lowerMsg.includes('limpi') || lowerMsg.includes('desinfect')) {
    return {
      reply:
        'Para la **limpieza y desinfección** del dispositivo:\n\n1. Apague el equipo y desconéctelo de la red eléctrica.\n2. Use un paño suave humedecido con solución de **alcohol isopropílico al 70%**.\n3. No rocíe líquidos directamente sobre el dispositivo.\n4. Limpie las superficies con movimientos suaves, sin frotar.\n5. Deje secar al aire durante 5 minutos antes de encender.\n\n⚠️ **No utilice** productos abrasivos, acetona o disolventes orgánicos.',
      sources: [
        {
          manualId: 'manual-001',
          section: 'Sección 8.1 — Mantenimiento y limpieza',
          page: 67,
          excerpt: 'Utilice únicamente los productos de limpieza recomendados...',
        },
      ],
    };
  }

  if (lowerMsg.includes('error') || lowerMsg.includes('fallo')) {
    return {
      reply:
        'Los **códigos de error** más comunes son:\n\n| Código | Significado | Acción recomendada |\n|--------|-------------|--------------------|\n| E-01 | Fallo del sensor | Verificar conexión del sensor |\n| E-02 | Batería baja | Conectar a red eléctrica |\n| E-03 | Error de calibración | Recalibrar desde menú de servicio |\n| E-04 | Sobrecalentamiento | Apagar y dejar enfriar 15 min |\n\nSi el error persiste, contacte al servicio técnico autorizado.',
      sources: [
        {
          manualId: 'manual-001',
          section: 'Apéndice B — Códigos de error',
          page: 89,
          excerpt: 'Consulte la siguiente tabla para identificar y resolver errores...',
        },
      ],
    };
  }

  return {
    reply:
      `Gracias por tu consulta. He analizado el manual del dispositivo y esta es la información relevante:\n\nTu pregunta ha sido: *"${message}"*\n\nEn este momento estoy funcionando en **modo de demostración** ya que el webhook de n8n no está configurado. Cuando se conecte con el sistema RAG, podré:\n\n- 🔍 Buscar en los manuales indexados\n- 📋 Citar secciones y páginas específicas\n- ⚠️ Destacar advertencias de seguridad relevantes\n\nPara conectar la IA real, configura la variable \`VITE_N8N_WEBHOOK_URL\` en el archivo \`.env\`.`,
  };
}

/**
 * Comprueba si el webhook de n8n está accesible (health check).
 */
export async function checkN8nHealth(): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) return false;

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}


export async function fetchDeviceCatalog(): Promise<MedicalDevice[]> {
  if (!N8N_DEVICES_URL) {
    console.log('[AGUS] VITE_N8N_DEVICES_URL no configurada. Usando catálogo local.');
    return DEVICE_CATALOG;
  }

  try {
    const response = await fetch(N8N_DEVICES_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    console.log('[AGUS] Catálogo recibido de n8n:', data);

    // Normalizar: puede venir como array directo o dentro de un campo
    const devices = Array.isArray(data)
      ? data
      : Array.isArray(data.devices)
      ? data.devices
      : Array.isArray(data.data)
      ? data.data
      : DEVICE_CATALOG;

    // Asegurar que cada dispositivo tiene los campos necesarios
    return devices.map((d: Record<string, unknown>) => {
      // Log para depurar la estructura del catálogo
      console.log('[AGUS] Dispositivo raw:', JSON.stringify(d, null, 2));

      // Buscar manual_id a nivel del dispositivo (por si no está dentro de manuals)
      const deviceLevelManualId = (d.manual_id as number) ?? (d.manualId as number) ?? undefined;

      return {
        id: (d.id as string) || `dev-${Math.random().toString(36).slice(2, 7)}`,
        name: (d.name as string) || 'Dispositivo sin nombre',
        manufacturer: (d.manufacturer as string) || 'Fabricante desconocido',
        model: (d.model as string) || '',
        category: (d.category as string) || 'other',
        imageUrl: d.imageUrl as string | undefined,
        qrUrl: d.qrUrl as string | undefined,
        manuals: Array.isArray(d.manuals)
          ? (d.manuals as Record<string, unknown>[]).map((m) => {
              const numericId = (m.manual_id as number) ?? (m.manualId as number) ?? (m.manualIdNumeric as number) ?? deviceLevelManualId ?? undefined;
              console.log('[AGUS] Manual raw:', JSON.stringify(m), '→ manual_id:', numericId);
              return {
                id: (m.id as string) || `manual-${Math.random().toString(36).slice(2, 7)}`,
                deviceId: (m.deviceId as string) || (d.id as string) || '',
                title: (m.title as string) || 'Manual sin título',
                version: (m.version as string) || '1.0',
                language: (m.language as string) || 'es',
                lastUpdated: m.lastUpdated ? new Date(m.lastUpdated as string) : new Date(),
                totalPages: (m.totalPages as number) || undefined,
                manualIdNumeric: numericId,
                pdfUrl: (m.pdfUrl as string) ?? (m.pdf_url as string) ?? (m.downloadUrl as string) ?? (m.fileUrl as string) ?? undefined,
              };
            })
          : [],
      };
    });
  } catch (err) {
    console.warn('[AGUS] Error al obtener catálogo, usando catálogo local:', err);
    return DEVICE_CATALOG;
  }
}

/**
 * Función para subir un nuevo manual a n8n.
 */
export interface UploadManualParams {
  file: File;
  deviceName: string;
  manual_id: number;
  model: string;
  category: string;
}

export async function uploadManualToN8n(params: UploadManualParams): Promise<void> {
  if (!N8N_UPLOAD_URL) {
    // Simulamos subida si no hay webhook
    console.warn('[AGUS] VITE_N8N_UPLOAD_URL no configurada. Simulando subida...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return;
  }

  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('deviceName', params.deviceName);
  formData.append('manual_id', params.manual_id.toString());
  formData.append('model', params.model);
  formData.append('category', params.category);

  const response = await fetch(N8N_UPLOAD_URL, {
    method: 'POST',
    body: formData, // fetch pone automáticamente el Content-Type multipart/form-data
  });

  if (!response.ok) {
    throw new Error(`Error al subir manual: ${response.status} ${response.statusText}`);
  }
}

/**
 * Obtiene el siguiente manual_id disponible consultando el catálogo.
 * Recorre todos los manuales de todos los dispositivos y devuelve max(manual_id) + 1.
 * Si no hay manuales o no se puede consultar, devuelve 1.
 */
export async function getNextManualId(): Promise<number> {
  try {
    const devices = await fetchDeviceCatalog();
    let maxId = 0;

    for (const device of devices) {
      for (const manual of device.manuals) {
        if (manual.manualIdNumeric != null && manual.manualIdNumeric > maxId) {
          maxId = manual.manualIdNumeric;
        }
      }
    }

    console.log(`[AGUS] Max manual_id encontrado: ${maxId}. Siguiente: ${maxId + 1}`);
    return maxId + 1;
  } catch (err) {
    console.warn('[AGUS] No se pudo obtener el catálogo para calcular siguiente ID:', err);
    // Fallback a localStorage
    const savedId = localStorage.getItem('agus_next_manual_id');
    return savedId ? parseInt(savedId, 10) : 1;
  }
}
