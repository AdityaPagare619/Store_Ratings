import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

async function main() {
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const ownerPass = await bcrypt.hash("Owner@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Administrator Default",
      email: "admin@example.com",
      address: "HQ",
      password: adminPass,
      role: Role.ADMIN,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Default Store Owner Account",
      email: "owner@example.com",
      address: "Owner Address",
      password: ownerPass,
      role: Role.OWNER,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Normal User Seed Account",
      email: "user@example.com",
      address: "User Address",
      password: userPass,
      role: Role.USER,
    },
  });

  const store1 = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Bluebird Market",
      address: "123 Main Street",
      ownerId: owner.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Sunset Grocers",
      address: "45 Sunset Blvd",
      ownerId: owner.id,
    },
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store1.id } },
    update: { score: 4, comment: "Nice selection" },
    create: { userId: user.id, storeId: store1.id, score: 4, comment: "Nice selection" },
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store2.id } },
    update: { score: 5, comment: "Great staff!" },
    create: { userId: user.id, storeId: store2.id, score: 5, comment: "Great staff!" },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });