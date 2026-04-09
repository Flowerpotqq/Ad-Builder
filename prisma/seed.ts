import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Seed the database with a demo user and default brand profile */
async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@napsolutions.com" },
    update: {},
    create: {
      email: "demo@napsolutions.com",
      name: "NAP Demo User",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created user:", user.email);

  // Create default brand profile
  await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      primaryColor: "#0e0e2c",
      secondaryColor: "#1a1a4e",
      accentColor: "#b8dff0",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSizeBase: 16,
      siteUrl: "https://getnapsolutions.com",
      brandVoice: "SALES_FOCUSED",
      ctaStyle: "Dark navy background, white bold text, 8px border radius",
    },
  });

  console.log("Created brand profile");

  // Create a demo contact list
  const list = await prisma.contactList.create({
    data: {
      userId: user.id,
      name: "Demo Subscribers",
    },
  });

  // Add demo contacts
  const demoContacts = [
    { email: "john@example.com", firstName: "John", lastName: "Smith" },
    { email: "jane@example.com", firstName: "Jane", lastName: "Doe" },
    { email: "mike@example.com", firstName: "Mike", lastName: "Johnson" },
  ];

  for (const contact of demoContacts) {
    await prisma.contact.create({
      data: { listId: list.id, ...contact },
    });
  }

  console.log("Created demo contact list with 3 contacts");
  console.log("Seed complete!");
  console.log("Login: demo@napsolutions.com / demo1234");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
