# Actualizar Chatbot a Español - Instrucciones

## Problema
El chatbot todavía responde en inglés porque el workspace tiene su propio prompt configurado.

## Solución

### Opción 1: Usar el Endpoint API (Recomendado)

1. **Reiniciar el servidor primero:**
   ```bash
   cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"
   docker compose -f docker-compose.dev.yml restart server
   ```

2. **Esperar 10-15 segundos** para que el servidor se reinicie completamente.

3. **Actualizar todos los workspaces a español:**
   
   Abre tu navegador y ve a:
   ```
   http://localhost:3001/api/crm/workspaces/update-to-spanish
   ```
   
   O usa curl:
   ```bash
   curl -X POST http://localhost:3001/api/crm/workspaces/update-to-spanish \
     -H "Content-Type: application/json" \
     -b "connect.sid=TU_SESSION_ID" \
     -c cookies.txt
   ```

   **Nota:** Necesitas estar autenticado. La forma más fácil es hacerlo desde la interfaz web o usar las cookies de sesión.

### Opción 2: Actualizar Manualmente desde la Interfaz

1. **Abre la app en el navegador:**
   ```
   http://localhost:3001
   ```

2. **Ve a la configuración del workspace:**
   - Haz clic en el workspace (por ejemplo, "lool")
   - Ve a "Configuración" o "Settings"
   - Busca "Chat Prompt" o "System Prompt"

3. **Actualiza el prompt:**
   - Si tiene un prompt, agrega al final:
     ```
     IMPORTANTE: Responde SIEMPRE en español (español de México).
     ```
   - Si no tiene prompt, usa este:
     ```
     Eres un asistente virtual amigable y profesional. Responde SIEMPRE en español (español de México). Sé conciso, claro y útil. Si no tienes información suficiente, sé honesto y ofrece ayudar de otra manera.
     ```

4. **Guarda los cambios**

### Opción 3: Ejecutar Script Directamente (Avanzado)

```bash
cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"
docker exec -it agentos-server node server/scripts/update-workspaces-spanish.js
```

## Verificar que Funciona

1. **Abre el chat en la app**
2. **Envía un mensaje de prueba:** "Hola, ¿cómo estás?"
3. **Verifica que la respuesta esté en español**

## Si Sigue en Inglés

1. **Limpia el caché del navegador** (Ctrl+Shift+Delete o Cmd+Shift+Delete)
2. **Recarga la página** (F5 o Cmd+R)
3. **Prueba de nuevo**

## Nota Importante

Después de actualizar el prompt del workspace, el chatbot responderá en español tanto en:
- ✅ La interfaz web de la app
- ✅ Los mensajes de WhatsApp (ya configurado en el código)

