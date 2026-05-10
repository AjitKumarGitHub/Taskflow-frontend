import type { Role } from "./role-types";

export type AuthSession = {
  token: string;
  user: {
    id: string;
    email: string;
    role?: Role;
  };
};

