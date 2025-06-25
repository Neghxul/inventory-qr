// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validación más específica
    if (!name) {
        return new NextResponse("Name is required", { status: 400 });
    }
    if (!email) {
        return new NextResponse("Email is required", { status: 400 });
    }
    if (!password) {
        return new NextResponse("Password is required", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      return new NextResponse(`User with email ${email} already exists`, { status: 409 }); // 409 Conflict es más apropiado
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role, // Aseguramos que el rol se guarde
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}