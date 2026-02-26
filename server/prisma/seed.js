const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Agentos seed...\n");

  // ============================================
  // 1. SYSTEM SETTINGS
  // ============================================
  const settings = [
    { label: "multi_user_mode", value: "true" },
    { label: "logo_filename", value: "anything-llm.png" },
    { label: "users_can_delete_workspaces", value: "true" },
    { label: "onboarding_complete", value: "true" },
    {
      label: "default_agent_skills",
      value: JSON.stringify([
        "web-browsing",
        "save-file-to-browser",
        "chat-history",
        "create-chart",
        "sql-agent",
      ]),
    },
    {
      label: "agent_sql_connections",
      value: JSON.stringify([
        {
          database_id: "agentos-crm",
          engine: "postgresql",
          connectionString: `postgresql://${process.env.DB_USER || "agentos"}:${process.env.DB_PASS || "agentos"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "agentos_dev"}`,
        },
      ]),
    },
  ];

  for (let setting of settings) {
    const existing = await prisma.system_settings.findUnique({
      where: { label: setting.label },
    });

    if (!existing) {
      await prisma.system_settings.create({ data: setting });
      console.log(`  ✓ Setting: ${setting.label} = ${setting.value}`);
    } else {
      await prisma.system_settings.update({
        where: { label: setting.label },
        data: { value: setting.value },
      });
      console.log(`  ✓ Updated setting: ${setting.label} = ${setting.value}`);
    }
  }

  // ============================================
  // 2. DEFAULT ADMIN USER (basic plan, full access)
  // ============================================
  const bcrypt = require("bcryptjs");
  const adminUsername = process.env.SEED_ADMIN_EMAIL || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  let adminUser = await prisma.users.findFirst({
    where: { username: adminUsername },
  });

  if (!adminUser) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    adminUser = await prisma.users.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
        plan: "basic",
      },
    });
    console.log(`\n  ✓ Created admin user: ${adminUsername} / ${adminPassword}`);
  } else {
    // Ensure admin has correct role and plan
    adminUser = await prisma.users.update({
      where: { id: adminUser.id },
      data: { role: "admin", plan: "basic" },
    });
    console.log(`  ✓ Admin user exists: ${adminUsername}`);
  }

  // ============================================
  // 3. SAMPLE AGENTES (AI Agents)
  // ============================================
  const agentesData = [
    {
      nombre: "Agente WhatsApp Ventas",
      motor: "ollama",
      version: "llama3.1:8b",
      prompt_base: "Eres un asistente de ventas profesional que atiende consultas de clientes por WhatsApp. Responde de forma amable, concisa y orientada a cerrar ventas. Siempre pregunta por las necesidades del cliente.",
    },
    {
      nombre: "Agente Soporte",
      motor: "ollama",
      version: "llama3.1:8b",
      prompt_base: "Eres un agente de soporte tecnico. Ayudas a resolver problemas de los clientes de forma rapida y eficiente. Si no puedes resolver, escala al equipo humano.",
    },
  ];

  for (const agenteData of agentesData) {
    const existing = await prisma.agentes.findFirst({
      where: { nombre: agenteData.nombre },
      });
    if (!existing) {
      await prisma.agentes.create({ data: agenteData });
      console.log(`  ✓ Agente: ${agenteData.nombre}`);
    } else {
      console.log(`  ○ Agente already exists: ${agenteData.nombre}`);
    }
  }

  // Get the sales agent for lead assignments
  const salesAgent = await prisma.agentes.findFirst({
    where: { nombre: "Agente WhatsApp Ventas" },
  });

  // ============================================
  // 4. SAMPLE PRODUCTOS (Product Catalog)
  // ============================================
  const productosData = [
    {
      nombre: "Plan Basico CRM",
      descripcion: "Acceso basico al CRM con gestion de leads y contactos",
      precio: 29.99,
      categoria: "Software",
    },
    {
      nombre: "Plan Premium CRM",
      descripcion: "Acceso completo al CRM con IA, analytics y automatizaciones",
      precio: 99.99,
      categoria: "Software",
    },
    {
      nombre: "Consultoria Setup",
      descripcion: "Servicio de configuracion inicial y capacitacion del equipo",
      precio: 499.00,
      categoria: "Servicios",
    },
    {
      nombre: "Integracion WhatsApp",
      descripcion: "Modulo de integracion con WhatsApp Business API via n8n",
      precio: 49.99,
      categoria: "Integraciones",
    },
    {
      nombre: "Soporte Prioritario",
      descripcion: "Soporte tecnico prioritario con SLA de 4 horas",
      precio: 149.99,
      categoria: "Servicios",
    },
  ];

  for (const productoData of productosData) {
    const existing = await prisma.productos.findFirst({
      where: { nombre: productoData.nombre },
    });
    if (!existing) {
      await prisma.productos.create({ data: productoData });
      console.log(`  ✓ Producto: ${productoData.nombre} — $${productoData.precio}`);
    } else {
      console.log(`  ○ Producto already exists: ${productoData.nombre}`);
    }
  }

  // ============================================
  // 5. SAMPLE LEADS (Commercial Pipeline)
  // ============================================
  const leadsData = [
    {
      name: "Maria Garcia",
      phone: "+525512345678",
      email: "maria.garcia@example.com",
      ciudad: "Ciudad de Mexico",
      interes: "Plan Premium CRM + Integracion WhatsApp",
      source: "WHATSAPP",
      status: "QUALIFIED",
      etapa: "INTERES_AVANZADO",
      probabilidad_cierre: 75,
    },
    {
      name: "Carlos Lopez",
      phone: "+525598765432",
      email: "carlos.lopez@empresa.mx",
      ciudad: "Guadalajara",
      interes: "Consultoria Setup",
      source: "WEB",
      status: "CONTACTED",
      etapa: "COTIZACION_ENVIADA",
      probabilidad_cierre: 50,
    },
    {
      name: "Ana Martinez",
      phone: "+525511223344",
      email: "ana.mtz@negocio.com",
      ciudad: "Monterrey",
      interes: "Plan Basico CRM",
      source: "REFERIDO",
      status: "NEW",
      etapa: "NUEVO_CLIENTE",
      probabilidad_cierre: 25,
    },
    {
      name: "Roberto Hernandez",
      phone: "+525544556677",
      email: "roberto.h@startup.io",
      ciudad: "Puebla",
      interes: "Plan Premium + Soporte Prioritario",
      source: "WHATSAPP",
      status: "CONVERTED",
      etapa: "CERRADA",
      probabilidad_cierre: 100,
    },
    {
      name: "Laura Sanchez",
      phone: "+525577889900",
      email: "laura.s@tienda.com",
      ciudad: "Queretaro",
      interes: "Integracion WhatsApp",
      source: "WEB",
      status: "CONTACTED",
      etapa: "NUEVO_CLIENTE",
      probabilidad_cierre: 25,
    },
  ];

  for (const leadData of leadsData) {
    const existing = await prisma.leads.findFirst({
      where: {
        owner_user_id: adminUser.id,
        email: leadData.email,
      },
    });

    if (!existing) {
      const lead = await prisma.leads.create({
        data: {
          owner_user_id: adminUser.id,
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          ciudad: leadData.ciudad,
          interes: leadData.interes,
          source: leadData.source,
          status: leadData.status,
          etapa: leadData.etapa,
          probabilidad_cierre: leadData.probabilidad_cierre,
          agente_id: salesAgent?.id || null,
        },
      });
      console.log(`  ✓ Lead: ${leadData.name} (${leadData.etapa} - ${leadData.probabilidad_cierre}%)`);

      // Add sample conversation for each lead
      if (leadData.source === "WHATSAPP") {
        await prisma.conversaciones.createMany({
          data: [
            {
              lead_id: lead.id,
              mensaje: `Hola, me interesa ${leadData.interes}. ¿Me pueden dar mas informacion?`,
              rol: "user",
            },
            {
              lead_id: lead.id,
              mensaje: `¡Hola ${leadData.name}! Con gusto te ayudo. ${leadData.interes} incluye funcionalidades avanzadas. ¿Te gustaria agendar una demo?`,
              rol: "assistant",
            },
          ],
        });
        console.log(`    ✓ Conversacion agregada para ${leadData.name}`);
      }

      // Add sample lead event
      if (leadData.status !== "NEW") {
        await prisma.lead_events.create({
          data: {
            lead_id: lead.id,
            type: "CONTACTED",
            meta: { canal: leadData.source, nota: "Primer contacto" },
          },
        });
      }

      if (leadData.status === "QUALIFIED" || leadData.status === "CONVERTED") {
        await prisma.lead_events.create({
          data: {
            lead_id: lead.id,
            type: "QUALIFIED",
            meta: { motivo: `Interesado en ${leadData.interes}` },
          },
        });
      }

      if (leadData.status === "CONVERTED") {
        await prisma.lead_events.create({
          data: {
            lead_id: lead.id,
            type: "PURCHASE",
            revenue: 149.98,
            meta: { productos: ["Plan Premium CRM", "Integracion WhatsApp"] },
          },
        });
      }
    } else {
      console.log(`  ○ Lead already exists: ${leadData.name}`);
    }
  }

  // ============================================
  // 6. SAMPLE WEBHOOK LOG
  // ============================================
  const existingWebhook = await prisma.crm_webhooks.findFirst({
    where: { origen: "whatsapp" },
  });

  if (!existingWebhook) {
    await prisma.crm_webhooks.create({
      data: {
        origen: "whatsapp",
        payload: {
          from: "+525512345678",
          body: "Hola, quiero informacion sobre sus servicios",
          timestamp: new Date().toISOString(),
        },
      },
      });
    console.log("  ✓ Webhook log de ejemplo creado");
  }

  // ============================================
  // SUMMARY
  // ============================================
  const counts = {
    users: await prisma.users.count(),
    leads: await prisma.leads.count(),
    agentes: await prisma.agentes.count(),
    productos: await prisma.productos.count(),
    conversaciones: await prisma.conversaciones.count(),
    lead_events: await prisma.lead_events.count(),
    webhooks: await prisma.crm_webhooks.count(),
  };

  console.log("\n========================================");
  console.log("  🎉 Agentos Seed Complete!");
  console.log("========================================");
  console.log(`  Users:          ${counts.users}`);
  console.log(`  Leads:          ${counts.leads}`);
  console.log(`  Agentes IA:     ${counts.agentes}`);
  console.log(`  Productos:      ${counts.productos}`);
  console.log(`  Conversaciones: ${counts.conversaciones}`);
  console.log(`  Lead Events:    ${counts.lead_events}`);
  console.log(`  Webhooks:       ${counts.webhooks}`);
  console.log("========================================");
  console.log(`  Login: ${adminUsername} / ${adminPassword}`);
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
