"use client";
import { useSyncExternalStore } from "react";

// Ajouter le site à l'écran d'accueil (voir components/installer-appli.tsx).
// Android (Chrome, Edge, Samsung Internet) offre sa propre fenêtre d'installation : l'événement beforeinstallprompt,
// gardé dans window.offreInstallation par le script du <head> (app/layout.tsx), car il peut arriver avant React.
// iPhone : aucune offre possible, il faut passer par le bouton Partager.
type OffreInstallation = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global {
  interface Window {
    offreInstallation?: OffreInstallation | null;
  }
}

export type Plateforme = "ios" | "android" | "autre";

const MODE_APPLI = "(display-mode: standalone)";
// Installé depuis cet onglet : l'onglet reste dans le navigateur, mais il n'y a plus rien à proposer
let installeIci = false;

function abonner(prevenir: () => void) {
  const media = matchMedia(MODE_APPLI);
  const installe = () => {
    installeIci = true;
    prevenir();
  };
  media.addEventListener("change", prevenir);
  addEventListener("offre-installation", prevenir);
  addEventListener("appinstalled", installe);
  return () => {
    media.removeEventListener("change", prevenir);
    removeEventListener("offre-installation", prevenir);
    removeEventListener("appinstalled", installe);
  };
}

function estInstalle() {
  // navigator.standalone : iPhone avant iOS 16.4
  return installeIci || matchMedia(MODE_APPLI).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function plateforme(): Plateforme {
  const ua = navigator.userAgent;
  // L'iPad se présente comme un Mac, mais il est tactile
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return /Android/.test(ua) ? "android" : "autre";
}

/** Rien à proposer au rendu statique, ni sur ordinateur, ni une fois le site ouvert depuis l'écran d'accueil. */
export function useInstallation() {
  const installe = useSyncExternalStore(abonner, estInstalle, () => true);
  const offre = useSyncExternalStore(abonner, () => window.offreInstallation ?? null, () => null);
  const quelle = useSyncExternalStore(abonner, plateforme, (): Plateforme => "autre");

  /** Ouvre la fenêtre d'installation du navigateur. Faux s'il n'en offre pas : il faut alors expliquer les gestes. */
  async function installer(): Promise<boolean> {
    if (!offre) return false;
    window.offreInstallation = null; // elle ne sert qu'une fois
    await offre.prompt();
    if ((await offre.userChoice).outcome === "accepted") installeIci = true;
    dispatchEvent(new Event("offre-installation"));
    return true;
  }

  return { proposer: !installe && quelle !== "autre", plateforme: quelle, installer };
}
