# 📱 Guía para Publicar la App en Meta y Recibir Mensajes Reales

Esta guía te ayudará a publicar tu app en Meta para que puedas recibir mensajes de WhatsApp de **cualquier número**, no solo números de prueba.

---

## 📋 Requisitos Previos

1. ✅ App creada en Meta for Developers
2. ✅ WhatsApp Business API configurado
3. ✅ Webhook configurado y verificado
4. ✅ Número de teléfono verificado en WhatsApp Business

---

## 🚀 Paso 1: Completar la Configuración de la App

### 1.1. Verificar Configuración Básica

1. Ve a [Meta for Developers](https://developers.facebook.com)
2. Selecciona tu app → **Configuración → Básica**
3. Verifica que tengas:
   - **Nombre para mostrar**: Un nombre descriptivo
   - **Categoría de la app**: Selecciona la más apropiada
   - **Email de contacto**: Tu email
   - **URL de la política de privacidad**: (Requerido para publicación)
   - **URL de los términos de servicio**: (Requerido para publicación)

### 1.2. Configurar Política de Privacidad y Términos

**Necesitas crear estas páginas web:**

1. **Política de Privacidad**: Explica cómo manejas los datos de los usuarios
2. **Términos de Servicio**: Condiciones de uso de tu servicio

**Opciones rápidas:**
- Usa un generador online como [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- O crea páginas simples en tu sitio web

**Ejemplo mínimo de Política de Privacidad:**
```
Política de Privacidad

[Tu Empresa] respeta tu privacidad. Los datos de WhatsApp se utilizan únicamente para:
- Responder a tus consultas
- Gestionar tu cuenta de cliente
- Mejorar nuestros servicios

No compartimos tus datos con terceros sin tu consentimiento.
```

---

## 🔐 Paso 2: Configurar Permisos y Revisión

### 2.1. Verificar Permisos Necesarios

1. Ve a **Permisos y funciones** en el menú lateral
2. Verifica que tengas estos permisos:
   - `whatsapp_business_messaging` (para enviar/recibir mensajes)
   - `whatsapp_business_management` (para gestionar la cuenta)

### 2.2. Solicitar Revisión de Permisos

1. Ve a **Revisión de la app** en el menú lateral
2. Busca los permisos de WhatsApp Business
3. Haz clic en **"Solicitar"** o **"Request"**
4. Completa el formulario:
   - **Descripción del caso de uso**: Explica cómo usarás WhatsApp
   - **Instrucciones paso a paso**: Cómo probar tu integración
   - **Video de demostración**: (Opcional pero recomendado)

**Ejemplo de descripción:**
```
Nuestra aplicación permite a los clientes contactarnos por WhatsApp para:
- Consultar información sobre nuestros productos
- Recibir respuestas automáticas a preguntas frecuentes
- Ser contactados por nuestro equipo de ventas

Los mensajes se procesan automáticamente y se almacenan en nuestro CRM para seguimiento.
```

---

## 📝 Paso 3: Completar Información de Negocio

### 3.1. Verificar WhatsApp Business Account

1. Ve a **WhatsApp → Configuración**
2. Verifica que tu número de teléfono esté verificado
3. Completa el perfil de negocio:
   - Nombre del negocio
   - Descripción
   - Dirección (si aplica)
   - Horario de atención

### 3.2. Configurar Plantillas de Mensajes

1. Ve a **WhatsApp → Plantillas de mensajes**
2. Crea plantillas para mensajes que quieras enviar
3. Las plantillas deben ser aprobadas por Meta antes de usarse

---

## ✅ Paso 4: Publicar la App

### 4.1. Verificar Checklist de Publicación

Antes de publicar, verifica:

- [ ] Política de privacidad configurada
- [ ] Términos de servicio configurados
- [ ] Email de contacto configurado
- [ ] Webhook configurado y verificado
- [ ] Permisos solicitados (si es necesario)
- [ ] Número de WhatsApp verificado
- [ ] Perfil de negocio completo

### 4.2. Publicar la App

1. Ve al **Panel** de tu app
2. Busca la sección **"Publicar"** o **"Publish"**
3. Haz clic en **"Publicar app"** o **"Publish App"**
4. Confirma la publicación

**Nota**: Si faltan requisitos, Meta te indicará qué falta.

---

## ⏱️ Paso 5: Esperar la Revisión

### 5.1. Tiempo de Revisión

- **Revisión automática**: 24-48 horas (si todo está correcto)
- **Revisión manual**: 3-7 días (si requiere revisión humana)

### 5.2. Verificar Estado

1. Ve a **Revisión de la app**
2. Verás el estado de cada permiso:
   - ⏳ **En revisión**: Esperando aprobación
   - ✅ **Aprobado**: Listo para usar
   - ❌ **Rechazado**: Revisa los comentarios y corrige

---

## 🎉 Paso 6: Una Vez Publicada

### 6.1. Verificar que Funciona

Una vez publicada, tu app podrá:
- ✅ Recibir mensajes de **cualquier número** (no solo números de prueba)
- ✅ Enviar mensajes a cualquier número
- ✅ Usar todas las funciones de WhatsApp Business API

### 6.2. Probar con un Número Real

1. Pide a alguien que te envíe un mensaje de WhatsApp
2. Verifica en n8n que aparezca la ejecución
3. Verifica en el CRM que se cree el lead
4. Verifica que recibas la respuesta automática

---

## 🔧 Solución de Problemas

### Error: "App no puede recibir mensajes de producción"

**Causa**: La app no está publicada o los permisos no están aprobados.

**Solución**: 
1. Verifica que la app esté publicada
2. Verifica que los permisos de WhatsApp estén aprobados
3. Espera 24-48 horas después de la publicación

### Error: "Webhook no recibe mensajes"

**Causa**: El webhook no está configurado o verificado.

**Solución**:
1. Ve a **WhatsApp → Configuración → Webhooks**
2. Verifica que la URL sea correcta
3. Haz clic en **"Verificar y guardar"**
4. Asegúrate de estar suscrito al campo `messages`

### Error: "Permisos rechazados"

**Causa**: Meta rechazó los permisos solicitados.

**Solución**:
1. Ve a **Revisión de la app**
2. Lee los comentarios de Meta
3. Corrige los problemas indicados
4. Vuelve a solicitar la revisión

---

## 📚 Recursos Adicionales

- [Documentación de Meta for Developers](https://developers.facebook.com/docs)
- [Guía de Revisión de Apps](https://developers.facebook.com/docs/app-review)
- [Políticas de WhatsApp Business](https://www.whatsapp.com/legal/business-policy)

---

## ✅ Checklist Final

Antes de considerar que todo está listo:

- [ ] App publicada en Meta
- [ ] Permisos de WhatsApp aprobados
- [ ] Webhook configurado y verificado
- [ ] Workflow de n8n activo y publicado
- [ ] Endpoints del servidor funcionando
- [ ] Ollama configurado con modelos descargados
- [ ] Probado con un mensaje real de WhatsApp
- [ ] Lead creado en el CRM
- [ ] Mensaje guardado en la base de datos
- [ ] Respuesta automática enviada

---

¡Una vez completados estos pasos, tu sistema estará completamente funcional y podrá recibir mensajes de cualquier número de WhatsApp!

