# Instrucciones para Hacer Pull en la Otra Mac

## Cambios Realizados

### 1. Configuración de WhatsApp Webhook
- ✅ Workflow de n8n configurado y actualizado
- ✅ Endpoints de WhatsApp en el backend
- ✅ Integración con Meta Business API
- ✅ Guardado de mensajes en la base de datos

### 2. Chatbot en Español
- ✅ Prompt del sistema actualizado a español
- ✅ Endpoint de WhatsApp configurado para responder en español

## Archivos Modificados

1. `server/endpoints/crm.js` - Endpoints de WhatsApp y chatbot en español
2. `server/models/systemSettings.js` - Prompt por defecto en español
3. `docker-compose.dev.yml` - Variables de entorno de WhatsApp
4. `n8n-workflows/webhook-to-crm.json` - Workflow actualizado
5. `CONFIGURAR_WEBHOOK_WHATSAPP.md` - Documentación actualizada
6. Varios archivos de documentación nuevos

## ✅ Push Completado

El push ya se realizó exitosamente. Los cambios están en GitHub.

## Pasos para Hacer Pull (En la Otra Mac)

### 1. Navegar al Directorio del Proyecto

```bash
cd "/ruta/a/anything-llm"
```

(Reemplaza `/ruta/a/anything-llm` con la ruta real donde tienes el proyecto)

### 2. Hacer Pull de los Cambios

```bash
git pull origin master
```

O simplemente:

```bash
git pull
```

### 3. Iniciar Docker Desktop (Si No Está Corriendo)

Si ves el error "Cannot connect to the Docker daemon", necesitas iniciar Docker Desktop:

1. **Abre Docker Desktop:**
   - Presiona `Cmd + Space` y busca "Docker"
   - O ve a Aplicaciones → Docker
   - Espera a que aparezca el ícono de Docker en la barra de menú (ballena) y esté en estado "Running"

2. **Verificar que Docker está corriendo:**
   ```bash
   docker ps
   ```
   Si funciona, verás una lista de contenedores (puede estar vacía).

### 4. Iniciar los Contenedores

Si los contenedores no están corriendo, inícialos:

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 5. Reiniciar el Servidor Docker

```bash
docker compose -f docker-compose.dev.yml restart server
```

O si prefieres recrear el contenedor completamente:

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate server
```

### 6. (Opcional) Actualizar Workspace si el Chatbot No Responde en Español

Si después del pull el chatbot todavía no responde en español, tienes dos opciones:

**Opción A: Recrear el contenedor para incluir los nuevos archivos**

```bash
docker compose -f docker-compose.dev.yml up -d --build server
```

Luego ejecutar el script:

```bash
docker exec agentos-server node server/scripts/update-workspaces-spanish.js
```

**Opción B: Ejecutar el script directamente sin el archivo**

Si el archivo no está en el contenedor, puedes ejecutar el código directamente:

```bash
docker exec agentos-server node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const SPANISH_PROMPT = 'Eres un asistente virtual amigable y profesional. Responde SIEMPRE en español (español de México). Sé conciso, claro y útil. Si no tienes información suficiente, sé honesto y ofrece ayudar de otra manera. Dada la siguiente conversación, contexto relevante y una pregunta de seguimiento, responde con una respuesta a la pregunta actual que el usuario está haciendo. Devuelve solo tu respuesta a la pregunta dada la información anterior siguiendo las instrucciones del usuario según sea necesario.';
(async () => {
  try {
    const workspaces = await prisma.workspaces.findMany();
    console.log(\`Encontrados \${workspaces.length} workspaces\`);
    for (const workspace of workspaces) {
      const newPrompt = workspace.openAiPrompt 
        ? \`\${workspace.openAiPrompt}\\n\\nIMPORTANTE: Responde SIEMPRE en español (español de México).\` 
        : SPANISH_PROMPT;
      await prisma.workspaces.update({
        where: { id: workspace.id },
        data: { openAiPrompt: newPrompt }
      });
      console.log(\`✓ Workspace \"\${workspace.name}\" actualizado\`);
    }
    console.log('\\n✅ Todos los workspaces actualizados a español');
    await prisma.\$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.\$disconnect();
  }
})();
"
```

## Verificar que Todo Funciona

1. **Verificar que el servidor está corriendo:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Verificar que n8n está corriendo:**
   - Abre n8n desktop app
   - Verifica que el workflow "WhatsApp Webhook → CRM Lead" esté activo

3. **Probar el chatbot en español:**
   - Envía un mensaje de WhatsApp
   - Verifica que la respuesta esté en español

## Variables de Entorno Necesarias

Asegúrate de que en `docker-compose.dev.yml` estén configuradas:
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`

## 📦 Compilar App de Escritorio (Opcional)

Si quieres que la aplicación se abra desde el escritorio sin ejecutar comandos, consulta:

**`COMPILAR_APP_ESCRITORIO.md`**

Este archivo contiene instrucciones detalladas para compilar la aplicación Electron como una app nativa de macOS.

## Notas Importantes

- ⚠️ El token de acceso de WhatsApp expira cada 24 horas. Si deja de funcionar, genera uno nuevo en Meta for Developers
- ⚠️ La verificación de Meta está en proceso (2 días hábiles). Mientras tanto, solo funcionará con números de prueba
- ✅ El chatbot ahora responde en español de México por defecto
- 📦 Para abrir la app desde el escritorio, compila la aplicación siguiendo `COMPILAR_APP_ESCRITORIO.md`

