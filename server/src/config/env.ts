const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ?? "5050",
  clientOrigin: process.env.CLIENT_ORIGIN,
  jwtSecret: () => required("JWT_SECRET"),
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS ?? 7),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "accessToken",
  adminName: process.env.ADMIN_NAME ?? "Admin",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};

export const isProduction = () => env.nodeEnv === "production";
