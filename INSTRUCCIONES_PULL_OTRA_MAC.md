# Instrucciones para Hacer Pull en la Otra Mac

## Cambios Realizados

### 1. Configuración de WhatsApp Webhook
- ✅ Workflow de n8n configurado y actualizado
- ✅ Endpoints de WhatsApp en el backend
- ✅ Integración con Meta Business API
- ✅ Guardado de mensajes en la base de datos

### 2. Chatbot en Español
- ✅ Prompt del sistema actualizado a español
- ✅ Endpoint de WhatsApp configurado para responder en español

## Archivos Modificados

1. `server/endpoints/crm.js` - Endpoints de WhatsApp y chatbot en español
2. `server/models/systemSettings.js` - Prompt por defecto en español
3. `docker-compose.dev.yml` - Variables de entorno de WhatsApp
4. `n8n-workflows/webhook-to-crm.json` - Workflow actualizado
5. `CONFIGURAR_WEBHOOK_WHATSAPP.md` - Documentación actualizada
6. Varios archivos de documentación nuevos

## Pasos para Hacer Commit y Push (En esta Mac)

```bash
cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"

# Ver cambios
git status

# Agregar todos los cambios
git add -A

# Hacer commit
git commit -m "feat: Configuración completa de WhatsApp webhook y chatbot en español

- Integración completa con Meta Business API
- Workflow de n8n para procesar mensajes de WhatsApp
- Endpoints para enviar y recibir mensajes
- Chatbot configurado para responder en español
- Guardado de mensajes y conversaciones en DB
- Documentación completa del proceso"

# Hacer push
git push
```

## Pasos para Hacer Pull (En la Otra Mac)

```bash
cd "/ruta/a/anything-llm"

# Hacer pull de los cambios
git pull

# Reiniciar el servidor para aplicar cambios
docker compose -f docker-compose.dev.yml restart server
```

## Verificar que Todo Funciona

1. **Verificar que el servidor está corriendo:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Verificar que n8n está corriendo:**
   - Abre n8n desktop app
   - Verifica que el workflow "WhatsApp Webhook → CRM Lead" esté activo

3. **Probar el chatbot en español:**
   - Envía un mensaje de WhatsApp
   - Verifica que la respuesta esté en español

## Variables de Entorno Necesarias

Asegúrate de que en `docker-compose.dev.yml` estén configuradas:
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

## Notas Importantes

- ⚠️ El token de acceso de WhatsApp expira cada 24 horas. Si deja de funcionar, genera uno nuevo en Meta for Developers
- ⚠️ La verificación de Meta está en proceso (2 días hábiles). Mientras tanto, solo funcionará con números de prueba
- ✅ El chatbot ahora responde en español de México por defecto

