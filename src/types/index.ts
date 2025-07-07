// src/types/crm.ts
import { Company, User, Contact, Order, Note, Task } from "@prisma/client";

export interface ScanData {
  id?: number;
  sessionId?: string;

  key: string;
  year: string;
  pedimento: string;

  description?: string;
  line?: string;
  shelf?: string;
  position?: string;

  quantity?: number;
  stock?: number;

  // <<── Añade estas dos
  encoded?: boolean;
  type?:    string;
  // ──────────────────>>

  createdAt?: string;
}

// El tipo para una compañía que incluye su propietario
export type CompanyWithOwner = Company & {
    owner?: User | null;
};

// El tipo para una orden con sus relaciones
export type OrderWithRelations = Order & {
    company: { name: string };
    contact: { firstName: string; lastName: string };
};

// El tipo para una nota con su autor
export type NoteWithAuthor = Note & { 
    author: User 
};

// El tipo para una tarea con su persona asignada
export type TaskWithAssignee = Task & { 
    assignee: User 
};
