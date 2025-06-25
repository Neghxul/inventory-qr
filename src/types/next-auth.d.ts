// src/types/next-auth.d.ts

import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extiende el tipo del token JWT
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}

// Extiende el tipo del objeto User que viene de la base de datos
declare module "next-auth" {
  interface User extends DefaultUser {
    role: Role;
  }

  // Extiende el tipo de la Sesión para incluir nuestros datos personalizados
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"]; // Mantiene las propiedades originales (name, email, image)
  }
}