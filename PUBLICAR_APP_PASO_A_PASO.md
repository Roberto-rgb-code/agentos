# 🚀 Cómo Publicar la App en Meta - Paso a Paso

Guía rápida para publicar tu app y recibir mensajes de WhatsApp de cualquier número.

---

## 📋 Paso 1: Ir al Panel de la App

1. En Meta for Developers, ve a tu app "agentos"
2. En el menú lateral izquierdo, busca **"Panel"** (Dashboard) - es el primer ítem con icono de casa
3. Haz clic en **"Panel"**

---

## ✅ Paso 2: Completar Requisitos Básicos

En el Panel, verás una sección **"Personalización y requisitos de la app"**. Necesitas completar:

### 2.1. Política de Privacidad (Requerido)

1. Ve a **"Configuración"** → **"Básica"** (en el menú lateral)
2. Busca **"URL de la política de privacidad"**
3. Necesitas crear una página web con tu política de privacidad

**Opción rápida (sin crear página web):**
- Usa un generador: https://www.privacypolicygenerator.info/
- O usa esta URL temporal: `https://www.privacypolicygenerator.info/live.php?token=TU_TOKEN`
- O crea una página simple en tu sitio web

**Ejemplo mínimo de política:**
```
https://tusitio.com/privacy-policy
```

### 2.2. Términos de Servicio (Requerido)

1. En la misma página de **"Configuración"** → **"Básica"**
2. Busca **"URL de los términos de servicio"**
3. Crea una página con tus términos de servicio

**Opción rápida:**
- Usa un generador: https://www.termsofservicegenerator.net/
- O crea una página simple

### 2.3. Email de Contacto

1. En **"Configuración"** → **"Básica"**
2. Verifica que **"Email de contacto"** esté configurado
3. Debe ser un email válido

---

## 🔐 Paso 3: Verificar Permisos de WhatsApp

1. Ve a **"Permisos y funciones"** (en el menú lateral)
2. Busca los permisos de WhatsApp:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Verifica que estén aprobados o solicita su revisión si es necesario

---

## 📱 Paso 4: Verificar Configuración de WhatsApp

1. Ve a **"WhatsApp"** → **"Configuración"** (en el menú lateral)
2. Verifica que:
   - Tu número de teléfono esté verificado
   - El perfil de negocio esté completo
   - El webhook esté configurado (ya lo tienes)

---

## 🚀 Paso 5: Publicar la App

### 5.1. Ir a la Sección de Publicación

1. Ve al **"Panel"** (Dashboard)
2. Busca la sección **"Publicar"** o **"Publish"**
3. O ve directamente a: **"Publicar"** en el menú lateral (arriba, con icono de upload)

### 5.2. Revisar Checklist

Antes de publicar, Meta te mostrará un checklist. Verifica que tengas:

- [ ] Política de privacidad configurada
- [ ] Términos de servicio configurados
- [ ] Email de contacto configurado
- [ ] Webhook configurado (ya lo tienes ✅)
- [ ] Número de WhatsApp verificado (ya lo tienes ✅)

### 5.3. Publicar

1. Si todos los requisitos están completos, verás un botón **"Publicar app"** o **"Publish App"**
2. Haz clic en **"Publicar app"**
3. Confirma la publicación

---

## ⏱️ Paso 6: Esperar Aprobación

### 6.1. Tiempo de Revisión

- **Revisión automática**: 24-48 horas
- **Revisión manual**: 3-7 días (si requiere revisión humana)

### 6.2. Verificar Estado

1. Ve a **"Revisión de la app"** (en el menú lateral)
2. Verás el estado de cada permiso:
   - ⏳ **En revisión**: Esperando
   - ✅ **Aprobado**: Listo
   - ❌ **Rechazado**: Revisa comentarios

---

## 🎉 Paso 7: Una Vez Publicada

Una vez que la app esté publicada y los permisos aprobados:

1. **Puedes recibir mensajes de cualquier número** (no solo números de prueba)
2. **El sistema funcionará completamente**:
   - Mensajes recibidos → n8n → CRM → Base de datos
   - Respuestas automáticas generadas
   - Todo guardado en la DB

---

## 🔧 Si Faltan Requisitos

Si al intentar publicar te dice que faltan requisitos:

1. **Lee el mensaje de error** - te dirá exactamente qué falta
2. **Completa lo que falta** (política, términos, etc.)
3. **Vuelve a intentar publicar**

---

## 📝 Notas Importantes

1. **Mientras la app no esté publicada**: Solo recibirás webhooks de prueba
2. **Después de publicar**: Recibirás mensajes reales de cualquier número
3. **La revisión puede tardar**: Sé paciente, Meta revisa todas las apps

---

## ✅ Checklist Final Antes de Publicar

- [ ] Política de privacidad: URL configurada
- [ ] Términos de servicio: URL configurada
- [ ] Email de contacto: Configurado
- [ ] Webhook: Configurado y verificado ✅
- [ ] Número de WhatsApp: Verificado ✅
- [ ] Permisos: Verificados o solicitados

---

¡Sigue estos pasos y tu app estará publicada en poco tiempo!

