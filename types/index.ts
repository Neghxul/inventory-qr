export interface ScanData {
  id?: number;
  key: string;
  year: string;
  pedimento: string;
  description: string;
  line: string;
  shelf: string;
  position: string;
  quantity: number | null;
  encoded: boolean;
  type: "QR" | "Bar";
  createdAt?: string;
}
