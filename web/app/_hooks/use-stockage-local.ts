"use client";
import { useEffect, useState } from "react";

// État sauvegardé dans le stockage local du navigateur (voir 4W6, rencontre 4.1).
export function useStockageLocal<T>(cle: string, valeurDepart: T) {
  const [valeur, setValeur] = useState<T>(valeurDepart);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      const brut = localStorage.getItem(cle);
      if (brut !== null) {
        try {
          setValeur(JSON.parse(brut) as T);
        } catch {
          localStorage.removeItem(cle);
        }
      }
      setCharge(true);
    }, 0);
    return () => clearTimeout(id);
  }, [cle]);

  useEffect(() => {
    if (charge) localStorage.setItem(cle, JSON.stringify(valeur));
  }, [cle, valeur, charge]);

  return [valeur, setValeur] as const;
}
