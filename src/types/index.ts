// src/types.ts

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
