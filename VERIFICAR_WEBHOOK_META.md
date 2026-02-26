# 🔍 Verificar y Corregir el Webhook en Meta

## ❌ Problema: Los mensajes no llegan a n8n

Si estás enviando mensajes pero no aparecen ejecuciones en n8n, el problema está en la configuración del webhook en Meta.

---

## ✅ Paso 1: Verificar Configuración del Webhook

### 1.1. Ir a la Configuración del Webhook

1. Ve a Meta for Developers → Tu App → **WhatsApp** → **Configuración**
2. O directamente: **WhatsApp** → **Configuración** → **Webhooks**

### 1.2. Verificar URL del Webhook

La URL debe ser exactamente:
```
https://b16e-2806-103e-18-4e39-24d6-32fd-6ebc-5a73.ngrok-free.app/webhook/whatsapp-lead
```

**⚠️ IMPORTANTE**: Si reinicias ngrok, la URL cambia. Obtén la nueva URL con:
```bash
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"
```

### 1.3. Verificar Token de Verificación

Debe ser exactamente: `agentos-webhook-2024`

### 1.4. Verificar que el Webhook Esté Verificado

Debe aparecer un **checkmark verde** ✅ indicando que está verificado.

---

## 🔑 Paso 2: SUSCRIBIRSE AL CAMPO "messages" (CRÍTICO)

Este es el paso más importante y probablemente el problema:

### 2.1. En la Página de Webhooks

1. Busca la tabla **"Campos del webhook"** o **"Webhook fields"**
2. **Haz scroll hacia abajo** para encontrar el campo `messages`
3. En la columna **"Suscribirse"** (Subscribe):
   - **Activa el toggle** para el campo `messages`
   - Debe cambiar de "No suscritos" a "Suscritos" ✅

### 2.2. Verificar Otros Campos (Opcional)

También puedes suscribirte a:
- `message_status` (para recibir actualizaciones de estado de mensajes)

### 2.3. Guardar Cambios

1. Después de suscribirte a `messages`
2. Haz clic en **"Verificar y guardar"** (botón azul)
3. Espera a que aparezca el checkmark verde ✅

---

## 🧪 Paso 3: Probar el Webhook

### 3.1. Usar el Botón "Probar" en Meta

1. En la tabla de campos del webhook
2. Busca la fila del campo `messages`
3. Haz clic en el botón **"Probar"** (Test)
4. Esto enviará un webhook de prueba a n8n

### 3.2. Verificar en n8n

1. Ve a n8n → **Executions**
2. Deberías ver una ejecución nueva
3. Todos los nodos deberían estar en verde

---

## 🔄 Paso 4: Si la URL de ngrok Cambió

Si reinicias ngrok, la URL cambia. Debes:

1. **Obtener la nueva URL**:
   ```bash
   curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"
   ```

2. **Actualizar en Meta**:
   - Ve a WhatsApp → Configuración → Webhooks
   - Actualiza la "URL de devolución de llamada" con la nueva URL
   - Haz clic en "Verificar y guardar"

---

## ✅ Checklist de Verificación

Verifica que tengas:

- [ ] URL del webhook correcta y actualizada
- [ ] Token de verificación: `agentos-webhook-2024`
- [ ] Webhook verificado (checkmark verde ✅)
- [ ] **Campo `messages` SUSCRITO** ← **ESTO ES CRÍTICO**
- [ ] Botón "Verificar y guardar" presionado
- [ ] ngrok corriendo
- [ ] n8n corriendo y workflow publicado

---

## 🚨 Si Aún No Funciona

### Verificar Logs de ngrok:

```bash
# Ver las peticiones que llegan a ngrok
curl -s http://localhost:4040/api/requests/http | python3 -m json.tool | head -50
```

### Verificar que n8n Reciba las Peticiones:

1. En n8n, ve a **Settings** → **Logs**
2. O revisa los logs del contenedor:
   ```bash
   docker logs agentos-n8n --tail 100 | grep -i "webhook\|post"
   ```

---

## 💡 Nota Importante

**El campo `messages` DEBE estar suscrito** para que Meta envíe los webhooks cuando lleguen mensajes. Si no está suscrito, Meta no enviará nada aunque el webhook esté configurado.

---

¡Verifica especialmente que el campo `messages` esté suscrito!

