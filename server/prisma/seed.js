const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const settings = [
    { label: "multi_user_mode", value: "false" },
    { label: "logo_filename", value: "anything-llm.png" },
  ];

  for (let setting of settings) {
    const existing = await prisma.system_settings.findUnique({
      where: { label: setting.label },
    });

    // Only create the setting if it doesn't already exist
    if (!existing) {
      await prisma.system_settings.create({
        data: setting,
      });
    }
  }

  // Set user to premium if SEED_PREMIUM_EMAIL is set
  const premiumEmail = process.env.SEED_PREMIUM_EMAIL;
  if (premiumEmail) {
    const user = await prisma.users.findFirst({
      where: {
        username: premiumEmail,
      },
    });

    if (user) {
      await prisma.users.update({
        where: { id: user.id },
        data: { plan: "premium" },
      });
      console.log(`✓ User ${premiumEmail} set to premium plan`);
    } else {
      console.log(`⚠ User with email ${premiumEmail} not found`);
    }
  }

  // Create admin premium user if SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const bcrypt = require("bcryptjs");
    const existingAdmin = await prisma.users.findFirst({
      where: { username: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await prisma.users.create({
        data: {
          username: adminEmail,
          password: hashedPassword,
          role: "admin",
          plan: "premium",
        },
      });
      console.log(`✓ Created admin premium user: ${adminEmail}`);
    } else {
      // Update existing admin to premium
      await prisma.users.update({
        where: { id: existingAdmin.id },
        data: { plan: "premium" },
      });
      console.log(`✓ Updated existing admin ${adminEmail} to premium plan`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
