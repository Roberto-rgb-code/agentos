# 🔐 Verificar Permisos de WhatsApp en Meta

## ❌ Problema: Los mensajes no se procesan

Si envías mensajes pero no aparecen ejecuciones en n8n, **probablemente los permisos de WhatsApp no están aprobados**.

---

## 🔍 Paso 1: Verificar Estado de Permisos

### 1.1. Ir a Revisión de la App

1. En Meta for Developers, ve a tu app "agentos"
2. En el menú lateral izquierdo, busca **"Revisión de la app"** o **"App Review"**
3. Haz clic en esa opción

### 1.2. Buscar Permisos de WhatsApp

En la página de revisión, busca:
- `whatsapp_business_messaging`
- `whatsapp_business_management`

### 1.3. Verificar el Estado

Cada permiso puede tener uno de estos estados:

- ⏳ **"En revisión"** o **"In Review"**: 
  - Meta está revisando el permiso
  - **NO recibirás mensajes reales** hasta que esté aprobado
  - Solo recibirás webhooks de prueba desde el panel
  
- ✅ **"Aprobado"** o **"Approved"**:
  - El permiso está aprobado
  - **SÍ recibirás mensajes reales**
  - Todo debería funcionar correctamente
  
- ❌ **"Rechazado"** o **"Rejected"**:
  - Meta rechazó el permiso
  - Lee los comentarios de Meta
  - Corrige los problemas y vuelve a solicitar

---

## 🚨 Si los Permisos Están "En Revisión"

### Problema:
- Meta NO enviará webhooks de mensajes reales
- Solo enviará webhooks de estado (status) de mensajes
- El workflow saltará esos webhooks porque no son mensajes nuevos

### Solución Temporal:

1. **Usar el botón "Probar" en Meta**:
   - Ve a WhatsApp → Configuración → Webhooks
   - Haz clic en "Probar" en la fila de `messages`
   - Esto enviará un webhook de prueba que SÍ funcionará

2. **Agregar números de prueba**:
   - Ve a WhatsApp → API Setup
   - Agrega números a la lista "Para" (To)
   - Los mensajes desde esos números SÍ llegarán

### Solución Definitiva:

**Esperar a que Meta apruebe los permisos** (24-48 horas normalmente)

---

## ✅ Si los Permisos Están "Aprobados"

Si los permisos están aprobados pero aún no recibes mensajes:

1. **Verifica que el webhook esté configurado**:
   - URL correcta
   - Token correcto
   - Campo `messages` suscrito

2. **Verifica que el workflow esté activo**:
   - Publicado
   - Toggle "Active" en verde

3. **Prueba con el botón "Probar"**:
   - Si funciona, el problema es otro
   - Si no funciona, hay un problema con el webhook

---

## 🧪 Prueba Rápida

**Haz clic en "Probar" en Meta** (en la fila de `messages` en la configuración de webhooks):

1. Si aparece una ejecución en n8n → ✅ El webhook funciona, el problema son los permisos
2. Si NO aparece → ❌ Hay un problema con la configuración del webhook

---

## 📝 Resumen

**El problema más común es que los permisos están "En revisión"**. Mientras estén en revisión, Meta NO enviará webhooks de mensajes reales, solo de estado.

**Verifica el estado de los permisos en Meta → Revisión de la app**.

