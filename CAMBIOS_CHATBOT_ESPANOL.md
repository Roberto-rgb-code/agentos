# Cambios para Chatbot en Español

## Resumen
Se han realizado cambios para que el chatbot responda en español (español de México) en lugar de inglés.

## Archivos Modificados

### 1. `server/endpoints/crm.js`
**Cambio:** Modificado el endpoint `/api/crm/whatsapp/generate-response` para que use un prompt en español.

**Líneas modificadas:** Aproximadamente línea 390-413

**Cambio específico:**
- Se crea un objeto `workspaceWithSpanishPrompt` que agrega instrucciones en español al prompt del workspace
- Si el workspace ya tiene un prompt, se le agrega: "IMPORTANTE: Responde SIEMPRE en español (español de México)."
- Si no tiene prompt, se usa un prompt por defecto en español

### 2. `server/models/systemSettings.js`
**Cambio:** Actualizado el prompt por defecto del sistema (`saneDefaultSystemPrompt`) a español.

**Línea modificada:** Aproximadamente línea 24-25

**Cambio específico:**
- El prompt por defecto ahora está en español y especifica que debe responder en español de México

## Cómo Aplicar los Cambios

1. **Hacer pull en la otra Mac:**
   ```bash
   cd "/ruta/a/anything-llm"
   git pull
   ```

2. **Reiniciar el servidor:**
   ```bash
   docker compose -f docker-compose.dev.yml restart server
   ```

3. **Probar el chatbot:**
   - Envía un mensaje de WhatsApp
   - Verifica que la respuesta esté en español

## Notas

- El chatbot ahora responderá en español de México por defecto
- Si un workspace tiene su propio prompt, se le agregará la instrucción de responder en español
- Los cambios son compatibles con la configuración existente

