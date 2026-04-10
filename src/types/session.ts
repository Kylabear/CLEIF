import { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
