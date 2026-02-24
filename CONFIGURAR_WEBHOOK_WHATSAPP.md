# 📱 Configurar Webhook de WhatsApp en Meta Business

Guía paso a paso para configurar el webhook de WhatsApp Business API con Meta (Facebook) y conectarlo a tu instancia local de Agentos.

---

## 📋 Requisitos previos

1. **Cuenta de Meta Business** con acceso a WhatsApp Business API
2. **Aplicación creada** en [developers.facebook.com](https://developers.facebook.com)
3. **WhatsApp Business API** configurado en tu aplicación
4. **n8n corriendo** en tu máquina local (puerto 5678)
5. **Workflow importado** en n8n (`n8n-workflows/webhook-to-crm.json`)

---

## 🔗 Paso 1: Crear un túnel público

Para que Meta pueda enviar webhooks a tu n8n local, necesitas exponer el puerto 5678 a internet usando un túnel.

### Opción A: Usar ngrok (Recomendado)

#### 1.1. Instalar ngrok

```bash
# macOS (con Homebrew)
brew install ngrok

# O descargar desde https://ngrok.com/download
```

#### 1.2. Crear cuenta en ngrok (gratis)

1. Ve a [ngrok.com](https://ngrok.com) y crea una cuenta
2. Obtén tu token de autenticación desde el dashboard

#### 1.3. Autenticar ngrok

```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```

#### 1.4. Crear túnel para n8n

```bash
ngrok http 5678
```

**Salida esperada:**
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5678
```

**⚠️ IMPORTANTE:** Copia la URL `https://abc123.ngrok-free.app` - la necesitarás en los siguientes pasos.

#### 1.5. Mantener ngrok corriendo

Deja esta terminal abierta mientras uses el webhook. Si cierras ngrok, la URL cambiará.

**💡 Tip:** Para mantener ngrok corriendo en segundo plano:
```bash
nohup ngrok http 5678 > ngrok.log 2>&1 &
```

---

### Opción B: Usar Cloudflare Tunnel (Alternativa)

#### 1.1. Instalar cloudflared

```bash
# macOS (con Homebrew)
brew install cloudflared

# O descargar desde https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
```

#### 1.2. Crear túnel

```bash
cloudflared tunnel --url http://localhost:5678
```

**Salida esperada:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
|  https://abc123.trycloudflare.com
+--------------------------------------------------------------------------------------------+
```

**⚠️ IMPORTANTE:** Copia la URL `https://abc123.trycloudflare.com` - la necesitarás en los siguientes pasos.

---

## 🔧 Paso 2: Configurar el webhook en Meta Business

### 2.1. Acceder a Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesión con tu cuenta de Meta Business
3. Selecciona tu **Aplicación** (o créala si no tienes una)

### 2.2. Configurar WhatsApp

1. En el menú lateral, ve a **WhatsApp** → **Configuration**
2. Si es la primera vez, completa la configuración inicial:
   - **Phone Number ID**: Tu número de WhatsApp Business
   - **WhatsApp Business Account ID**: Tu cuenta de negocio

### 2.3. Configurar el Webhook

1. En la sección **Webhook**, haz click en **"Edit"** o **"Configure"**
2. En el campo **Callback URL**, ingresa:
   ```
   https://TU-TUNEL.ngrok-free.app/webhook/whatsapp-lead
   ```
   **Ejemplo:**
   ```
   https://abc123.ngrok-free.app/webhook/whatsapp-lead
   ```
   
   > **Nota:** Reemplaza `TU-TUNEL` con la URL que obtuviste de ngrok o Cloudflare Tunnel.

3. En el campo **Verify Token**, ingresa un token secreto (puede ser cualquier string):
   ```
   agentos-webhook-2024
   ```
   > **⚠️ IMPORTANTE:** Guarda este token, lo necesitarás para verificar el webhook.

4. Haz click en **"Verify and Save"**

### 2.4. Suscribirse a eventos

1. En la sección **Webhook Fields**, selecciona los eventos que quieres recibir:
   - ✅ **messages** - Para recibir mensajes entrantes
   - ✅ **message_status** - Para recibir actualizaciones de estado de mensajes
   - ✅ **message_template_status_update** - Para actualizaciones de plantillas

2. Haz click en **"Save"**

### 2.5. Verificar el webhook

Meta intentará verificar el webhook haciendo una petición GET a tu URL. Asegúrate de que:

1. **n8n esté corriendo** (`docker compose -f docker-compose.dev.yml ps` para verificar)
2. **El workflow esté publicado** en n8n
3. **El túnel esté activo** (ngrok o cloudflared corriendo)

Si la verificación falla:
- Revisa que la URL sea correcta
- Verifica que n8n esté accesible desde internet
- Revisa los logs de n8n: `docker logs agentos-n8n`

---

## 🐳 Paso 3: Actualizar configuración en Docker (Opcional)

Si quieres que la aplicación conozca la URL del webhook, puedes actualizar `docker-compose.dev.yml`:

### 3.1. Editar docker-compose.dev.yml

```bash
cd ~/agentos
nano docker-compose.dev.yml
# o
code docker-compose.dev.yml
```

### 3.2. Agregar variable de entorno

En la sección del servicio `n8n`, agrega o actualiza:

```yaml
services:
  n8n:
    # ... otras configuraciones ...
    environment:
      # ... otras variables ...
      - WEBHOOK_URL=https://TU-TUNEL.ngrok-free.app
```

**Ejemplo completo:**
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: agentos-n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_SECURE_COOKIE=false
      - N8N_PERSONALIZATION_ENABLED=false
      - WEBHOOK_URL=https://abc123.ngrok-free.app  # ← Agregar esta línea
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - agentos-net
    depends_on:
      - postgres
```

### 3.3. Reiniciar n8n

```bash
docker compose -f docker-compose.dev.yml restart n8n
```

---

## ✅ Paso 4: Probar el webhook

### 4.1. Enviar un mensaje de prueba

1. Envía un mensaje de WhatsApp a tu número de negocio
2. El mensaje debería llegar al webhook de n8n
3. n8n procesará el mensaje y creará un lead en el CRM

### 4.2. Verificar en Agentos

1. Abre la app de Agentos
2. Ve a **CRM → Leads**
3. Deberías ver un nuevo lead con source "WHATSAPP"

### 4.3. Ver logs

```bash
# Logs de n8n
docker logs agentos-n8n -f

# Logs del backend (para ver si se creó el lead)
docker logs agentos-server -f
```

---

## 🧪 Probar manualmente con curl

Puedes probar el webhook manualmente simulando una petición de Meta:

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-lead \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5215512345678",
            "text": {
              "body": "Hola, me interesa el Plan Premium"
            },
            "type": "text"
          }],
          "contacts": [{
            "profile": {
              "name": "Juan Perez"
            },
            "wa_id": "5215512345678"
          }]
        }
      }]
    }]
  }'
```

---

## 🔒 Seguridad

### Verificar el webhook en n8n

Para mayor seguridad, puedes configurar n8n para verificar que las peticiones vengan de Meta:

1. En n8n, edita el nodo **Webhook**
2. En **Options**, activa **"Verify SSL"**
3. Configura un **"Header Auth"** con el token que configuraste en Meta

### Usar HTTPS

- ✅ ngrok proporciona HTTPS automáticamente
- ✅ Cloudflare Tunnel proporciona HTTPS automáticamente
- ⚠️ No uses HTTP en producción

---

## 🆘 Solución de problemas

### El webhook no se verifica

1. **Verifica que n8n esté corriendo:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Verifica que el workflow esté publicado:**
   - En n8n, el workflow debe tener el botón **"Active"** (verde)

3. **Verifica la URL:**
   - Debe ser exactamente: `https://TU-TUNEL.ngrok-free.app/webhook/whatsapp-lead`
   - Sin espacios, sin trailing slash

4. **Revisa los logs:**
   ```bash
   docker logs agentos-n8n -f
   ```

### Los mensajes no llegan al CRM

1. **Verifica el formato del webhook:**
   - Revisa que el workflow de n8n esté procesando correctamente los datos
   - Verifica que la URL del backend sea correcta: `http://server:3001/api/crm/webhook/incoming`

2. **Revisa los logs del backend:**
   ```bash
   docker logs agentos-server -f
   ```

3. **Prueba el endpoint manualmente:**
   ```bash
   curl -X POST http://localhost:3001/api/crm/webhook/incoming \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test",
       "phone": "+5215512345678",
       "email": "test@example.com",
       "message": "Mensaje de prueba"
     }'
   ```

### La URL de ngrok cambia cada vez

**Solución:** Usa ngrok con cuenta gratuita y configuración estática:

1. Crea cuenta en [ngrok.com](https://ngrok.com)
2. En el dashboard, configura un dominio estático (gratis)
3. Usa ese dominio en lugar de la URL aleatoria

```bash
ngrok http 5678 --domain=tu-dominio.ngrok-free.app
```

---

## 📚 Referencias

- [Documentación oficial de Meta - Webhooks de WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint)
- [Documentación de n8n - Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

## ✅ Checklist final

- [ ] ngrok o Cloudflare Tunnel corriendo
- [ ] URL del túnel copiada
- [ ] Webhook configurado en Meta Business
- [ ] Workflow publicado en n8n
- [ ] Webhook verificado en Meta
- [ ] Mensaje de prueba enviado
- [ ] Lead creado en CRM
- [ ] Logs verificados

---

**🎉 ¡Listo!** Tu webhook de WhatsApp está configurado y funcionando.

