import { useState } from "react";

// Hook du cours 4W6 : relie un <input> à un état.
// Utilisation : const recherche = useTwoWayBinding(""); <Input {...recherche} />
export function useTwoWayBinding(valeurDepart: string) {
  const [value, setValue] = useState(valeurDepart);
  return {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
  };
}
