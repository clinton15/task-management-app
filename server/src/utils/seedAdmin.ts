import User from "../models/User.js";
import { env } from "../config/env.js";

export const seedAdmin = async (): Promise<void> => {
  const email = env.adminEmail;
  const password = env.adminPassword;

  if (!email || !password) {
    const adminExists = await User.exists({ role: "ADMIN" });

    if (!adminExists) {
      console.warn(
        "No admin user exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the first admin."
      );
    }

    return;
  }

  const existingAdmin = await User.findOne({ role: "ADMIN" });

  if (existingAdmin) {
    return;
  }

  await User.create({
    name: env.adminName,
    email,
    password,
    role: "ADMIN",
  });

  console.log(`Seeded admin user: ${email}`);
};
