# ✅ Prueba Final del Sistema - App Publicada

## 🎉 ¡Tu App Está Publicada!

Ahora puedes recibir mensajes de WhatsApp de **cualquier número**, no solo números de prueba.

---

## 🧪 Paso 1: Probar el Sistema Completo

### 1.1. Enviar un Mensaje Real

1. **Desde cualquier número de WhatsApp** (no necesariamente uno de prueba)
2. Envía un mensaje a tu número de negocio: `+526692635482`
3. Ejemplo de mensaje: "Hola, me interesa información sobre sus servicios"

### 1.2. Verificar en n8n

1. Abre n8n: `http://localhost:5678`
2. Ve a **"Workflows"** → **"WhatsApp Webhook → CRM Lead"**
3. Haz clic en la pestaña **"Executions"**
4. Deberías ver una ejecución nueva con:
   - ✅ "Procesar Mensaje Meta" - Verde
   - ✅ "Crear Lead en CRM" - Verde
   - ✅ "Generar Respuesta Chatbot" - Verde (puede tardar ~30 segundos)
   - ✅ "Enviar Respuesta WhatsApp" - Verde

### 1.3. Verificar en el CRM

1. Abre Agentos → **"CRM"** → **"Leads"**
2. Deberías ver:
   - ✅ Un nuevo lead creado (o actualizado si ya existía)
   - ✅ Nombre del contacto
   - ✅ Número de teléfono
   - ✅ Source: "WHATSAPP"
   - ✅ Mensaje en "Interés"

### 1.4. Verificar en la Base de Datos

Los datos se guardan automáticamente en:

- **Tabla `leads`**: Lead creado/actualizado
- **Tabla `whatsapp_messages`**: Mensaje guardado con todos los datos
- **Tabla `conversaciones`**: Mensaje del usuario guardado
- **Tabla `crm_webhooks`**: Log del webhook recibido

### 1.5. Verificar Respuesta Automática

1. Deberías recibir una respuesta automática en WhatsApp
2. La respuesta es generada por el chatbot (Ollama)
3. La respuesta también se guarda en `conversaciones` como "assistant"

---

## ✅ Checklist de Verificación

Después de enviar un mensaje, verifica:

- [ ] Ejecución aparece en n8n
- [ ] Todos los nodos en verde en n8n
- [ ] Lead creado/actualizado en el CRM
- [ ] Mensaje visible en el CRM
- [ ] Respuesta automática recibida en WhatsApp
- [ ] Datos guardados en la base de datos

---

## 🔍 Verificar Logs (Si Algo No Funciona)

### Logs de n8n:
```bash
docker logs agentos-n8n --tail 50
```

### Logs del servidor:
```bash
docker logs agentos-server --tail 50
```

---

## 🎯 Próximos Pasos

### 1. Personalizar Respuestas del Chatbot

Puedes mejorar las respuestas del chatbot:
- Configurando el prompt del workspace en Agentos
- Agregando contexto sobre tus productos/servicios
- Entrenando el modelo con información relevante

### 2. Agregar Más Funcionalidades

- Filtrar leads por source "WHATSAPP"
- Ver historial de mensajes por lead
- Configurar respuestas automáticas personalizadas
- Integrar con otros sistemas

### 3. Monitorear el Sistema

- Revisar ejecuciones en n8n regularmente
- Verificar que los leads se creen correctamente
- Monitorear que las respuestas se envíen

---

## 🚨 Solución de Problemas

### Si no recibes mensajes:

1. **Verifica que el webhook esté configurado**:
   - Meta → WhatsApp → Configuración → Webhooks
   - Debe estar verificado (checkmark verde)

2. **Verifica que ngrok esté corriendo**:
   ```bash
   ps aux | grep ngrok
   ```

3. **Verifica que n8n esté activo**:
   - n8n → Workflows → Verifica que esté "Published"

### Si los mensajes no se guardan:

1. **Verifica logs del servidor**:
   ```bash
   docker logs agentos-server --tail 100 | grep -i error
   ```

2. **Verifica que la base de datos esté conectada**:
   ```bash
   docker compose -f docker-compose.dev.yml ps postgres
   ```

### Si las respuestas no se envían:

1. **Verifica que Ollama esté funcionando**:
   ```bash
   docker exec agentos-ollama ollama list
   ```

2. **Verifica las credenciales de WhatsApp**:
   - Verifica que `WHATSAPP_ACCESS_TOKEN` no haya expirado
   - Verifica que `WHATSAPP_PHONE_NUMBER_ID` sea correcto

---

## 🎉 ¡Sistema Completo y Funcional!

Tu sistema ahora:
- ✅ Recibe mensajes de WhatsApp de cualquier número
- ✅ Crea/actualiza leads automáticamente
- ✅ Guarda todos los mensajes en la base de datos
- ✅ Genera respuestas automáticas con el chatbot
- ✅ Envía respuestas de vuelta a WhatsApp
- ✅ Todo funcionando en producción

**¡Prueba enviando un mensaje real y verifica que todo funcione!**

