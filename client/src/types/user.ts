export type UserRole = "ADMIN" | "USER";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type MeResponse = {
  user: AuthUser;
};
