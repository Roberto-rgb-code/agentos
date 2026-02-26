# Pasos Finales para Completar la Integración de WhatsApp

## ✅ Lo que ya está implementado

1. ✅ Guardado de mensajes en la base de datos (`whatsapp_messages`)
2. ✅ Endpoints para enviar mensajes y generar respuestas
3. ✅ Workflow de n8n actualizado con respuesta automática
4. ✅ Integración con el chatbot para generar respuestas

## 🔧 Pasos que debes ejecutar

### 1. Reiniciar el servidor Docker

```bash
cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"
docker compose -f docker-compose.dev.yml restart server
```

**O si el servidor no está corriendo:**
```bash
docker compose -f docker-compose.dev.yml up -d server
```

### 2. Configurar variables de entorno de WhatsApp

Necesitas agregar estas variables en `server/.env.development`:

```env
# WhatsApp Business API Credentials
WHATSAPP_ACCESS_TOKEN=EAAxZBvp3lAH4BQyZBh1deuKl89dWBM8ACk4B7z6XZBk3EbjtFwvMXbBrl7Ar6ACwti5enaFDz4z2ruyS53WA4glRZBVeBFYa6mQEaNVXGKuwYNhAIakUPCA9lDV3yGyWCdR2IzmSt1TczBDt1QZBw3PVeqVXhXYY2oIp9oSdU891bxWoSrMxInxOuOCgnxhIJHTfOYPjZAchm6lwMe5XCDeZA6xpZAkckqEZA9EWjkcCGqJZBXfJ6i9HouZAlYR9fqM0pqmSbIAyrZBAwyTEmS1lwUN0
WHATSAPP_PHONE_NUMBER_ID=1021497517710628
```

#### Cómo obtener las credenciales:

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Selecciona tu App → WhatsApp → API Setup
3. **Phone Number ID**: Lo encuentras en la sección "From" (número de teléfono de WhatsApp Business)
4. **Access Token**:
   - Temporal: Lo encuentras en "Temporary access token" (expira en 24 horas)
   - Permanente: Crea un token permanente en "Access Tokens" → "Add or Remove Permissions"

### 3. Reimportar el workflow en n8n

1. Abre n8n (http://localhost:5678)
2. Elimina el workflow actual "WhatsApp Webhook → CRM Lead"
3. Ve a "Workflows" → "Import from File"
4. Selecciona: `n8n-workflows/webhook-to-crm.json`
5. Activa el workflow (toggle "Active" en la parte superior)
6. Publica el workflow

### 4. Verificar que todo funcione

#### 4.1 Verificar que el servidor esté corriendo:

```bash
curl http://localhost:3001/api/system/health
```

Deberías recibir una respuesta JSON con el estado del sistema.

#### 4.2 Probar el endpoint de generación de respuestas:

```bash
curl -X POST http://localhost:3001/api/crm/whatsapp/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, me interesa el Plan Premium"
  }'
```

Deberías recibir una respuesta generada por el chatbot.

#### 4.3 Probar el endpoint de envío de WhatsApp (requiere credenciales):

```bash
curl -X POST http://localhost:3001/api/crm/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5215512345678",
    "message": "Hola, esta es una prueba"
  }'
```

**Nota**: Este endpoint solo funcionará si tienes configuradas las variables `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`.

### 5. Probar el flujo completo

1. Envía un mensaje de texto a tu número de WhatsApp Business
2. Verifica en n8n:
   - Ve a "Executions" → deberías ver una ejecución nueva
   - Todos los nodos deberían estar en verde
3. Verifica en el CRM:
   - Abre Agentos → "CRM → Leads"
   - Deberías ver el lead creado/actualizado
4. Verifica la respuesta automática:
   - Deberías recibir una respuesta automática en WhatsApp generada por el chatbot

## 🔍 Solución de problemas

### Error: "WhatsApp credentials not configured"

**Solución**: Agrega las variables de entorno en `server/.env.development` y reinicia el servidor.

### Error: "Failed to send WhatsApp message"

**Posibles causas**:
1. Token de acceso expirado → Genera un nuevo token en Meta for Developers
2. Phone Number ID incorrecto → Verifica que sea el correcto
3. Número de teléfono no verificado → Asegúrate de que el número esté verificado en Meta

### El workflow no responde automáticamente

**Verifica**:
1. El workflow está activo y publicado en n8n
2. El webhook está configurado correctamente en Meta
3. ngrok está corriendo y apuntando a `http://localhost:5678`
4. La URL del webhook en Meta apunta a: `https://tu-url-ngrok.ngrok.io/webhook/whatsapp-lead`

### Los mensajes no se guardan en la base de datos

**Verifica**:
1. El servidor está corriendo
2. La base de datos PostgreSQL está accesible
3. Revisa los logs del servidor: `docker logs agentos-server --tail 50`

## 📝 Notas importantes

1. **Workspace del Chatbot**: Por defecto, el sistema usa el primer workspace disponible. Si quieres usar un workspace específico, puedes:
   - Pasar `workspaceSlug` en el body del request a `/api/crm/whatsapp/generate-response`
   - O actualizar el workflow de n8n para incluir el slug del workspace

2. **IP Local**: El workflow usa `192.168.1.142`. Si tu IP cambia, actualiza la URL en el workflow de n8n.

3. **Tokens de WhatsApp**: Los tokens temporales expiran en 24 horas. Para producción, crea un token permanente.

## ✅ Checklist final

- [ ] Servidor reiniciado
- [ ] Variables de entorno configuradas (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`)
- [ ] Workflow reimportado y activo en n8n
- [ ] Webhook configurado en Meta apuntando a ngrok
- [ ] Prueba de mensaje enviada y respuesta recibida
- [ ] Lead creado/actualizado en el CRM
- [ ] Mensaje guardado en la base de datos

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sistema debería:
- ✅ Recibir mensajes de WhatsApp
- ✅ Crear/actualizar leads automáticamente
- ✅ Guardar mensajes en la base de datos
- ✅ Generar respuestas automáticas usando el chatbot
- ✅ Enviar respuestas de vuelta a WhatsApp

