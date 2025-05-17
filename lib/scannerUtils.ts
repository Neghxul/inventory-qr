import { ScanData } from "@/types";

export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export async function parseScannedCode(text: string): Promise<ScanData | null> {
  const encoded = isBase64(text);
  const decoded = encoded ? atob(text) : text;

  if (decoded.includes("/")) {
    const [key, rawPedimento, description, line, shelf, position] = decoded.split("/");
    if (!key || !rawPedimento) return null;

    return {
      key: key.toUpperCase(),
      year: rawPedimento.slice(0, 2),
      pedimento: rawPedimento.slice(2),
      description: description?.toUpperCase() || "",
      line: line?.toUpperCase() || "",
      shelf: shelf?.toUpperCase() || "",
      position: position?.toUpperCase() || "",
      encoded,
      type: "QR",
      quantity: 0,
    };
  } else if (decoded.includes("-")) {
    const [key, rawPedimento] = decoded.split("-");
    if (!key || !rawPedimento) return null;

    return {
      key: key.toUpperCase(),
      year: rawPedimento.slice(0, 2),
      pedimento: rawPedimento.slice(2),
      description: "",
      line: "",
      shelf: "",
      position: "",
      encoded,
      type: "Bar",
      quantity: 0,
    };
  }

  return null;
}
