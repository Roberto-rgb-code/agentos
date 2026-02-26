/**
 * Script para actualizar todos los workspaces para que respondan en español
 * Ejecutar con: node server/scripts/update-workspaces-spanish.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SPANISH_PROMPT = "Eres un asistente virtual amigable y profesional. Responde SIEMPRE en español (español de México). Sé conciso, claro y útil. Si no tienes información suficiente, sé honesto y ofrece ayudar de otra manera. Dada la siguiente conversación, contexto relevante y una pregunta de seguimiento, responde con una respuesta a la pregunta actual que el usuario está haciendo. Devuelve solo tu respuesta a la pregunta dada la información anterior siguiendo las instrucciones del usuario según sea necesario.";

async function updateWorkspacesToSpanish() {
  try {
    console.log("Buscando workspaces...");
    
    const workspaces = await prisma.workspaces.findMany();
    console.log(`Encontrados ${workspaces.length} workspaces`);

    for (const workspace of workspaces) {
      const currentPrompt = workspace.openAiPrompt;
      
      // Si ya tiene un prompt, agregar la instrucción de español
      // Si no tiene prompt, usar el prompt completo en español
      const newPrompt = currentPrompt 
        ? `${currentPrompt}\n\nIMPORTANTE: Responde SIEMPRE en español (español de México).` 
        : SPANISH_PROMPT;

      await prisma.workspaces.update({
        where: { id: workspace.id },
        data: { openAiPrompt: newPrompt }
      });

      console.log(`✓ Workspace "${workspace.name}" (${workspace.slug}) actualizado`);
    }

    console.log("\n✅ Todos los workspaces han sido actualizados a español");
  } catch (error) {
    console.error("❌ Error actualizando workspaces:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWorkspacesToSpanish();

