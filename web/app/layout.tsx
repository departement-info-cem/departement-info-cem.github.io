import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Bandeau } from "@/components/bandeau";
import { Entete } from "@/components/entete";
import { BandeauApercu } from "@/components/bandeau-apercu";
import { PiedDePage } from "@/components/pied-de-page";
import { ThemeProvider } from "@/app/_contexts/theme-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScolaireProvider } from "@/app/_contexts/scolaire-context";
import { calendrierScolaire, donneesMesCours, laboratoires, profsHoraire } from "@/lib/donnees";
import { MesCoursProvider } from "@/app/_contexts/mes-cours-context";
import { profsUtiles } from "@/lib/maintenant";
import { indexRecherche } from "@/lib/index-recherche";

// Le guide de normes graphiques du cégep impose Montserrat, et Arial quand elle n'est pas disponible.
const montserrat = Montserrat({ variable: "--font-sans", subsets: ["latin"], fallback: ["Arial", "sans-serif"] });
// Police à chasse fixe réservée au code (commandes, YAML, terminaux).
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://info.cegepmontpetit.ca"),
  title: { default: "Département d'informatique | Cégep Édouard-Montpetit", template: "%s | Informatique Montpetit" },
  description: "DEC en informatique, DEC-BAC, AEC, profs, horaires et ressources du département d'informatique du Cégep Édouard-Montpetit.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg`, apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/apple-icon.png` },
  // Nom sous l'icône de l'écran d'accueil sur iPhone (le reste vient de app/manifest.ts)
  appleWebApp: { title: "Info CEM" },
};

// Barre du navigateur (et de l'appli installée) du même bleu que l'en-tête, dans les deux thèmes.
export const viewport: Viewport = { themeColor: "#0c3455" };

// Applique le thème sombre avant l'affichage pour éviter un flash blanc.
// Garde aussi l'offre d'installation d'Android (Chrome, Edge, Samsung), qui peut arriver avant que React soit prêt :
// le bouton « Ajouter à l'écran d'accueil » s'en sert (voir app/_hooks/use-installation.ts).
const scriptDepart = `try{var t=localStorage.getItem("theme-depinfo");if(t==='"sombre"'||t==="sombre"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}
addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.offreInstallation=e;dispatchEvent(new Event("offre-installation"))});`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr-CA" data-scroll-behavior="smooth" className={`${montserrat.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptDepart }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <ScolaireProvider calendrier={calendrierScolaire()}>
          <MesCoursProvider donnees={donneesMesCours()}>
          <TooltipProvider>
            <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-2">
              Aller au contenu
            </a>
            <Entete index={indexRecherche()} />
            <BandeauApercu />
            <main id="contenu" className="flex-1">
              {children}
            </main>
            <PiedDePage />
            <Bandeau profs={profsUtiles(profsHoraire(), laboratoires())} labos={laboratoires()} />
          </TooltipProvider>
          </MesCoursProvider>
          </ScolaireProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
