# 🔑 Cómo Obtener el Token de Acceso y Phone Number ID de WhatsApp

Guía paso a paso para obtener las credenciales necesarias para enviar mensajes de WhatsApp.

---

## 📋 Requisitos Previos

1. **Cuenta de Meta Business** (Facebook Business)
2. **Aplicación creada** en Meta for Developers
3. **WhatsApp Business API** agregado a tu aplicación
4. **Número de teléfono verificado** en WhatsApp Business

---

## 🔧 Paso 1: Acceder a Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Inicia sesión con tu cuenta de Meta Business
3. Ve a **"Mis Apps"** (arriba a la derecha)
4. Selecciona tu aplicación (o crea una nueva si no tienes)

---

## 📱 Paso 2: Obtener el Phone Number ID

### 2.1. Ir a la configuración de WhatsApp

1. En el menú lateral izquierdo, busca **"WhatsApp"**
2. Haz clic en **"API Setup"** o **"Configuración de API"**

### 2.2. Encontrar el Phone Number ID

En la sección **"From"** (De), verás:
- Tu número de teléfono de WhatsApp Business
- **Phone number ID**: Un número largo (ejemplo: `123456789012345`)

**📝 Copia este Phone Number ID** - este es tu `WHATSAPP_PHONE_NUMBER_ID`

**Ubicación alternativa:**
- También puedes encontrarlo en: **WhatsApp → Configuración → Números de teléfono**
- Aparece como "ID" junto a tu número

---

## 🔐 Paso 3: Obtener el Access Token

### Opción A: Token Temporal (24 horas) - Para pruebas rápidas

1. En la misma página de **"API Setup"**
2. Busca la sección **"Temporary access token"** o **"Token de acceso temporal"**
3. Haz clic en **"Copy"** o **"Copiar"**

**⚠️ Este token expira en 24 horas** - solo útil para pruebas

### Opción B: Token Permanente (Recomendado para producción)

#### 3.1. Crear un token permanente

1. En el menú lateral, ve a **"Herramientas"** → **"Access Tokens"** o **"Tokens de acceso"**
2. Haz clic en **"Add or Remove Permissions"** o **"Agregar o quitar permisos"**
3. Selecciona los permisos necesarios:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
4. Haz clic en **"Generate Token"** o **"Generar token"**

#### 3.2. Configurar el token para que no expire

1. Después de generar el token, busca la opción **"Token Expiration"** o **"Expiración del token"**
2. Selecciona **"Never"** o **"Nunca"** (si está disponible)
3. Si no hay opción "Never", el token durará 60 días y necesitarás renovarlo

**📝 Copia este Access Token** - este es tu `WHATSAPP_ACCESS_TOKEN`

---

## 🎯 Paso 4: Verificar que tienes todo

Deberías tener:

1. ✅ **Phone Number ID**: Un número largo (ejemplo: `123456789012345`)
2. ✅ **Access Token**: Una cadena larga que empieza con algo como `EAABwzLix...`

---

## ⚙️ Paso 5: Configurar en tu servidor

Agrega estas variables en `server/.env.development`:

```env
# WhatsApp Business API Credentials
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABwzLixXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE:**
- Reemplaza los valores de ejemplo con tus valores reales
- No compartas estos tokens públicamente
- Si el token expira, genera uno nuevo

---

## 🔄 Paso 6: Reiniciar el servidor

Después de agregar las variables de entorno:

```bash
cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"
docker compose -f docker-compose.dev.yml restart server
```

---

## ✅ Paso 7: Probar que funciona

Prueba enviar un mensaje de prueba:

```bash
curl -X POST http://localhost:3001/api/crm/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5215512345678",
    "message": "Hola, esta es una prueba"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message_id": "wamid.xxx...",
  "result": { ... }
}
```

Si recibes un error, verifica:
- ✅ Las variables de entorno están configuradas correctamente
- ✅ El token no ha expirado
- ✅ El Phone Number ID es correcto
- ✅ El número de destino está en formato correcto (con código de país, sin +)

---

## 🆘 Solución de Problemas

### Error: "Invalid OAuth access token"

**Causa**: El token ha expirado o es incorrecto

**Solución**: 
1. Genera un nuevo token en Meta for Developers
2. Actualiza `WHATSAPP_ACCESS_TOKEN` en `.env.development`
3. Reinicia el servidor

### Error: "Phone number ID not found"

**Causa**: El Phone Number ID es incorrecto

**Solución**:
1. Verifica el ID en Meta for Developers → WhatsApp → API Setup
2. Asegúrate de copiar el ID completo (sin espacios)
3. Actualiza `WHATSAPP_PHONE_NUMBER_ID` en `.env.development`

### Error: "Permission denied"

**Causa**: El token no tiene los permisos necesarios

**Solución**:
1. Ve a Access Tokens → Add or Remove Permissions
2. Asegúrate de tener:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Genera un nuevo token con estos permisos

---

## 📚 Referencias

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de tokens de acceso de Meta](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)

---

## 💡 Tips

1. **Para desarrollo**: Usa tokens temporales (24 horas)
2. **Para producción**: Crea tokens permanentes o configura renovación automática
3. **Seguridad**: Nunca subas tus tokens a repositorios públicos
4. **Backup**: Guarda tus credenciales en un lugar seguro (gestor de contraseñas)

---

¡Listo! Con estas credenciales podrás enviar mensajes de WhatsApp automáticamente desde tu sistema.

