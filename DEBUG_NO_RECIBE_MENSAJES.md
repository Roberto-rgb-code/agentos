# 🔍 Debug: No Recibe Mensajes de WhatsApp

## ✅ Lo que está bien:
- ✅ Campo `messages` suscrito en Meta
- ✅ Webhook configurado en Meta
- ✅ App publicada
- ✅ n8n corriendo
- ✅ Workflow publicado

## ❌ Problema: Los mensajes no llegan

---

## 🔍 Paso 1: Verificar que Meta Esté Enviando Webhooks

### 1.1. Usar el Botón "Probar" en Meta

1. En la página de webhooks (donde viste la lista de campos)
2. Busca la fila del campo `messages`
3. Haz clic en el botón **"Probar"** (Test) - es el botón azul
4. Esto debería enviar un webhook de prueba a n8n

### 1.2. Verificar en n8n

1. Ve a n8n → **Executions**
2. Deberías ver una ejecución nueva inmediatamente
3. Si aparece, el webhook está funcionando

---

## 🔍 Paso 2: Verificar URL del Webhook en Meta

### 2.1. Verificar URL Actual

La URL en Meta debe ser exactamente:
```
https://b16e-2806-103e-18-4e39-24d6-32fd-6ebc-5a73.ngrok-free.app/webhook/whatsapp-lead
```

### 2.2. Si la URL Cambió

Si reinicias ngrok, la URL cambia. Verifica:

1. **Obtén la URL actual de ngrok**:
   ```bash
   curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"
   ```

2. **Actualiza en Meta**:
   - Ve a WhatsApp → Configuración → Webhooks
   - Actualiza la "URL de devolución de llamada"
   - Haz clic en "Verificar y guardar"

---

## 🔍 Paso 3: Verificar que el Workflow Esté Activo

### 3.1. En n8n

1. Ve a **Workflows** → **"WhatsApp Webhook → CRM Lead"**
2. Verifica que:
   - El workflow esté **"Published"** (badge verde)
   - El toggle **"Active"** esté en verde (arriba a la derecha)

### 3.2. Si No Está Activo

1. Haz clic en el toggle **"Active"** para activarlo
2. Asegúrate de que esté **"Published"**

---

## 🔍 Paso 4: Verificar Logs en Tiempo Real

### 4.1. Ver Logs de ngrok

Abre una terminal y ejecuta:
```bash
# Ver peticiones que llegan a ngrok en tiempo real
curl -s http://localhost:4040/api/requests/http | python3 -m json.tool | tail -50
```

### 4.2. Ver Logs de n8n

```bash
docker logs agentos-n8n -f
```

Luego envía un mensaje y observa si aparece algo.

---

## 🔍 Paso 5: Probar Manualmente

### 5.1. Simular Webhook de Meta

Ejecuta este comando para simular un mensaje:

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-lead \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "526692635482",
            "id": "test123",
            "type": "text",
            "text": {"body": "Prueba manual"}
          }],
          "contacts": [{
            "profile": {"name": "Test"},
            "wa_id": "526692635482"
          }]
        }
      }]
    }]
  }'
```

### 5.2. Verificar en n8n

1. Ve a n8n → **Executions**
2. Deberías ver una ejecución nueva
3. Si funciona, el problema es que Meta no está enviando los webhooks

---

## 🚨 Posibles Causas

### 1. App Publicada pero Permisos No Aprobados

Aunque la app esté publicada, los permisos de WhatsApp pueden no estar aprobados:

1. Ve a **Revisión de la app** (en el menú lateral)
2. Verifica el estado de los permisos de WhatsApp:
   - ⏳ **En revisión**: Esperando aprobación
   - ✅ **Aprobado**: Listo para usar
   - ❌ **Rechazado**: Revisa comentarios

### 2. Número de Prueba vs Producción

Si estás usando un número de prueba (`+1 555 175 5610`), solo recibirás mensajes de números agregados a la lista de prueba.

Para recibir de cualquier número, necesitas:
- App publicada ✅ (ya lo tienes)
- Permisos aprobados (verifica esto)
- Número de producción (no número de prueba)

### 3. Webhook No Verificado

Aunque esté configurado, verifica que tenga el checkmark verde ✅ en Meta.

---

## ✅ Checklist de Verificación

- [ ] Campo `messages` suscrito ✅ (ya lo tienes)
- [ ] URL del webhook correcta y actualizada
- [ ] Webhook verificado (checkmark verde ✅)
- [ ] Workflow activo y publicado en n8n
- [ ] Permisos de WhatsApp aprobados en Meta
- [ ] Número de producción (no solo prueba)

---

## 🧪 Prueba Rápida

**Haz clic en el botón "Probar" del campo `messages` en Meta** y verifica si aparece una ejecución en n8n. Si aparece, el webhook funciona pero Meta no está enviando mensajes reales (probablemente por permisos no aprobados).

