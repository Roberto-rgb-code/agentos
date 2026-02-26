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

## 🔧 Paso 2: Importar y configurar el workflow en n8n

### 2.1. Acceder a n8n

1. Abre tu navegador y ve a `http://localhost:5678`
2. Inicia sesión (por defecto: `admin` / `admin`)

### 2.2. Importar el workflow

1. En n8n, haz click en **"Workflows"** en el menú lateral
2. Haz click en **"Import from File"** o el botón **"+"** → **"Import from File"**
3. Selecciona el archivo: `n8n-workflows/webhook-to-crm.json`
4. El workflow se importará con el nombre **"WhatsApp Webhook → CRM Lead"**

### 2.3. Configurar el token de verificación (Opcional)

Si quieres cambiar el token de verificación del webhook:

1. Abre el workflow importado
2. Haz click en el nodo **"Verificar Webhook"**
3. En el código, busca la línea:
   ```javascript
   const EXPECTED_TOKEN = 'agentos-webhook-2024';
   ```
4. Cambia `'agentos-webhook-2024'` por el token que quieras usar
5. **⚠️ IMPORTANTE:** Usa el mismo token cuando configures el webhook en Meta

### 2.4. Activar el workflow

1. Haz click en el botón **"Active"** en la esquina superior derecha (debe estar verde)
2. El workflow ahora está escuchando en: `http://localhost:5678/webhook/whatsapp-lead`

---

## 🔧 Paso 3: Configurar el webhook en Meta Business

### 3.1. Acceder a Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesión con tu cuenta de Meta Business
3. Selecciona tu **Aplicación** (o créala si no tienes una)

### 3.2. Configurar WhatsApp

1. En el menú lateral, ve a **WhatsApp** → **Configuration**
2. Si es la primera vez, completa la configuración inicial:
   - **Phone Number ID**: Tu número de WhatsApp Business
   - **WhatsApp Business Account ID**: Tu cuenta de negocio

### 3.3. Configurar el Webhook

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

3. En el campo **Verify Token**, ingresa el mismo token que configuraste en n8n:
   ```
   agentos-webhook-2024
   ```
   > **⚠️ IMPORTANTE:** Debe ser exactamente el mismo token que está en el nodo "Verificar Webhook" del workflow de n8n.

4. Haz click en **"Verify and Save"**
   - Meta enviará una petición GET a tu webhook para verificar
   - El workflow de n8n responderá con el challenge
   - Si todo está correcto, verás un mensaje de éxito

### 3.4. Suscribirse a eventos

1. En la sección **Webhook Fields**, selecciona los eventos que quieres recibir:
   - ✅ **messages** - Para recibir mensajes entrantes
   - ✅ **message_status** - Para recibir actualizaciones de estado de mensajes
   - ✅ **message_template_status_update** - Para actualizaciones de plantillas

2. Haz click en **"Save"**

### 3.5. Verificar el webhook

Meta intentará verificar el webhook haciendo una petición GET a tu URL. Asegúrate de que:

1. **n8n esté corriendo** (`docker compose -f docker-compose.dev.yml ps` para verificar)
2. **El workflow esté publicado** en n8n
3. **El túnel esté activo** (ngrok o cloudflared corriendo)

Si la verificación falla:
- Revisa que la URL sea correcta
- Verifica que n8n esté accesible desde internet
- Revisa los logs de n8n: `docker logs agentos-n8n`

---

## 🐳 Paso 4: Actualizar configuración en Docker (Opcional)

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

## ✅ Paso 5: Probar el webhook

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

### Probar verificación del webhook (GET)

```bash
# Simular verificación de Meta
curl "http://localhost:5678/webhook/whatsapp-lead?hub.mode=subscribe&hub.verify_token=agentos-webhook-2024&hub.challenge=test123"
```

**Respuesta esperada:** `test123` (el challenge que enviaste)

### Probar recepción de mensaje (POST)

Puedes probar el webhook manualmente simulando una petición de Meta:

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-lead \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15550555555",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": {
              "name": "Juan Perez"
            },
            "wa_id": "5215512345678"
          }],
          "messages": [{
            "from": "5215512345678",
            "id": "wamid.test123456",
            "timestamp": "1234567890",
            "text": {
              "body": "Hola, me interesa el Plan Premium"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "lead": {
    "success": true,
    "action": "created",
    "lead_id": "uuid-del-lead"
  }
}
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
   Debe mostrar `agentos-n8n` con estado `Up`

2. **Verifica que el workflow esté activo:**
   - En n8n (`http://localhost:5678`), ve a **Workflows**
   - Abre el workflow **"WhatsApp Webhook → CRM Lead"**
   - El botón **"Active"** debe estar verde (activado)
   - Si está gris, haz click para activarlo

3. **Verifica la URL del webhook:**
   - En n8n, haz click en el nodo **"Webhook GET (Verificación)"**
   - Verifica que el path sea: `whatsapp-lead`
   - La URL completa debe ser: `https://TU-TUNEL.ngrok-free.app/webhook/whatsapp-lead`
   - Sin espacios, sin trailing slash

4. **Verifica el token de verificación:**
   - En n8n, haz click en el nodo **"Verificar Webhook"**
   - Verifica que el token en el código sea: `agentos-webhook-2024`
   - Debe ser **exactamente igual** al token que configuraste en Meta Business

5. **Prueba la verificación manualmente:**
   ```bash
   curl "http://localhost:5678/webhook/whatsapp-lead?hub.mode=subscribe&hub.verify_token=agentos-webhook-2024&hub.challenge=test123"
   ```
   Debe devolver: `test123`

6. **Revisa los logs de n8n:**
   ```bash
   docker logs agentos-n8n -f
   ```
   Busca errores relacionados con el webhook

7. **Verifica que el túnel esté activo:**
   - ngrok o cloudflared debe estar corriendo
   - La URL debe ser accesible desde internet
   - Prueba abrir la URL en tu navegador (debe mostrar un error 404 o similar, pero no "connection refused")

### Los mensajes no llegan al CRM

1. **Verifica que el workflow esté activo:**
   - En n8n, el workflow debe estar activo (botón verde)
   - Verifica que no haya errores en la ejecución del workflow

2. **Revisa la ejecución del workflow en n8n:**
   - En n8n, ve a **Executions** (en el menú lateral)
   - Busca ejecuciones recientes del workflow
   - Haz click en una ejecución para ver los detalles
   - Verifica que cada nodo haya ejecutado correctamente
   - Si hay un error, revisa el mensaje de error

3. **Verifica el formato del webhook:**
   - El nodo **"Procesar Mensaje Meta"** debe extraer correctamente los datos
   - Verifica que el formato del mensaje de Meta sea el esperado
   - El workflow solo procesa mensajes de tipo `text`

4. **Verifica la URL del backend:**
   - En n8n, haz click en el nodo **"Crear Lead en CRM"**
   - Verifica que la URL sea: `http://host.docker.internal:3001/api/crm/webhook/incoming`
   - Si el backend no está en Docker, cambia a: `http://localhost:3001/api/crm/webhook/incoming`

5. **Revisa los logs del backend:**
   ```bash
   # Si está en Docker
   docker logs agentos-server -f

   # Si está corriendo localmente
   # Revisa la consola donde está corriendo el servidor
   ```

6. **Prueba el endpoint del CRM manualmente:**
   ```bash
   curl -X POST http://localhost:3001/api/crm/webhook/incoming \
     -H "Content-Type: application/json" \
     -d '{
       "origen": "WHATSAPP",
       "lead_data": {
         "name": "Test Lead",
         "phone": "5215512345678",
         "email": "test@example.com",
         "interes": "Consulta de prueba",
         "etapa": "NUEVO_CLIENTE",
         "mensaje": "Mensaje de prueba"
       }
     }'
   ```
   Debe devolver: `{"success":true,"action":"created","lead_id":"..."}`

7. **Verifica que el backend esté corriendo:**
   ```bash
   # Verificar que el servidor responda
   curl http://localhost:3001/api/health || echo "Servidor no responde"
   ```

### La URL de ngrok cambia cada vez

**Solución:** Usa ngrok con cuenta gratuita y configuración estática:

1. Crea cuenta en [ngrok.com](https://ngrok.com)
2. En el dashboard, configura un dominio estático (gratis)
3. Usa ese dominio en lugar de la URL aleatoria

```bash
ngrok http 5678 --domain=tu-dominio.ngrok-free.app
```

**Nota:** Después de cambiar la URL, debes actualizar la configuración del webhook en Meta Business con la nueva URL.

### El workflow no procesa mensajes de tipo imagen/video/audio

**Comportamiento esperado:** El workflow actual solo procesa mensajes de tipo `text`. Para procesar otros tipos de mensajes (imágenes, videos, audio), necesitarías modificar el nodo **"Procesar Mensaje Meta"** en n8n para manejar esos tipos.

### El lead se crea pero sin nombre

**Causa:** Meta no siempre envía el nombre del perfil en el webhook.

**Solución:** El workflow usa el nombre del perfil si está disponible, o genera un nombre basado en los últimos 4 dígitos del teléfono: `Lead 5678`

Para mejorar esto, podrías:
1. Usar la API de Meta para obtener el perfil completo del contacto
2. Guardar el nombre cuando el usuario se registre en tu sistema
3. Permitir editar el nombre manualmente en el CRM

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
- [ ] n8n corriendo y accesible
- [ ] Workflow importado en n8n
- [ ] Workflow activado (botón verde "Active")
- [ ] Token de verificación configurado (mismo en n8n y Meta)
- [ ] Webhook configurado en Meta Business
- [ ] Webhook verificado en Meta (GET request exitosa)
- [ ] Eventos suscritos en Meta (messages, message_status)
- [ ] Mensaje de prueba enviado desde WhatsApp
- [ ] Lead creado en CRM
- [ ] Logs verificados en n8n y backend

---

**🎉 ¡Listo!** Tu webhook de WhatsApp está configurado y funcionando.

