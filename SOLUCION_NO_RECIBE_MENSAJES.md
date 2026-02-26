# 🔧 Solución: No Recibe Mensajes de WhatsApp

## ❌ Problema: Envías mensajes pero no aparecen ejecuciones en n8n

---

## 🔍 Diagnóstico

### Verificar 1: ¿Meta está enviando webhooks?

1. **Abre ngrok en el navegador**: `http://localhost:4040`
2. Ve a la pestaña **"HTTP"** o **"Requests"**
3. Verifica si hay peticiones POST recientes cuando envías un mensaje
4. Si NO hay peticiones POST nuevas, Meta no está enviando los webhooks

### Verificar 2: ¿El webhook está configurado correctamente en Meta?

1. Ve a Meta for Developers → Tu App → **WhatsApp** → **Configuración** → **Webhooks**
2. Verifica:
   - ✅ URL del webhook: `https://b16e-2806-103e-18-4e39-24d6-32fd-6ebc-5a73.ngrok-free.app/webhook/whatsapp-lead`
   - ✅ Token de verificación: `agentos-webhook-2024`
   - ✅ Webhook verificado (checkmark verde ✅)
   - ✅ Campo `messages` SUSCRITO (toggle activado)

### Verificar 3: ¿El workflow está activo y publicado?

1. En n8n, ve a **Workflows** → **"WhatsApp Webhook → CRM Lead"**
2. Verifica:
   - ✅ Badge **"Published"** (verde)
   - ✅ Toggle **"Active"** en verde (arriba a la derecha)

---

## 🚨 Problema Común: App Publicada pero Permisos No Aprobados

Aunque la app esté publicada, **los permisos de WhatsApp pueden no estar aprobados**.

### Verificar Permisos:

1. Ve a Meta for Developers → Tu App → **Revisión de la app**
2. Busca los permisos de WhatsApp:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Verifica el estado:
   - ⏳ **En revisión**: Esperando aprobación (no recibirás mensajes reales)
   - ✅ **Aprobado**: Listo para usar (deberías recibir mensajes)
   - ❌ **Rechazado**: Revisa comentarios y corrige

### Si los Permisos Están "En Revisión":

- Meta NO enviará webhooks de mensajes reales hasta que estén aprobados
- Solo recibirás webhooks de prueba desde el panel de Meta
- Puede tardar 24-48 horas en aprobarse

---

## 🧪 Prueba Rápida: Usar el Botón "Probar" en Meta

1. Ve a Meta → WhatsApp → Configuración → Webhooks
2. En la tabla de campos, busca la fila de `messages`
3. Haz clic en el botón **"Probar"** (Test)
4. Esto enviará un webhook de prueba a n8n
5. Verifica en n8n → **Executions** que aparezca una ejecución nueva

**Si el botón "Probar" funciona:**
- ✅ El webhook está configurado correctamente
- ✅ El problema es que los permisos no están aprobados
- ⏳ Debes esperar a que Meta apruebe los permisos

**Si el botón "Probar" NO funciona:**
- ❌ Hay un problema con la configuración del webhook
- Revisa la URL y el token

---

## 🔄 Solución Temporal: Usar Números de Prueba

Mientras esperas la aprobación de permisos, puedes:

1. Ve a Meta → WhatsApp → API Setup
2. En "Paso 1: Seleccionar números de teléfono"
3. En "Para" (To), agrega números de prueba
4. Los mensajes desde esos números SÍ llegarán (aunque la app no esté aprobada)

---

## ✅ Checklist de Verificación Completo

- [ ] Webhook configurado en Meta con URL correcta
- [ ] Token de verificación correcto
- [ ] Webhook verificado (checkmark verde ✅)
- [ ] Campo `messages` suscrito
- [ ] Workflow publicado y activo en n8n
- [ ] **Permisos de WhatsApp aprobados** ← **CRÍTICO**
- [ ] ngrok corriendo
- [ ] n8n corriendo

---

## 🎯 Próximo Paso

**Verifica el estado de los permisos en Meta → Revisión de la app**. Si están "En revisión", ese es el problema. Debes esperar a que Meta los apruebe.

