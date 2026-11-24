import { Info } from "lucide-react";

// Prévient que l'horaire vient des locaux et que le prof ne l'a pas encore complété.
export function HorairePrerempli() {
  return (
    <p className="mb-3 flex items-start gap-2 rounded-md border bg-muted p-2 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" />
      Cours tirés de l&apos;horaire officiel des laboratoires. D&apos;autres cours ou des disponibilités peuvent manquer.
    </p>
  );
}
