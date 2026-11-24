import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Bandeau } from "@/components/bandeau";
import { Entete } from "@/components/entete";
import { PiedDePage } from "@/components/pied-de-page";
import { ThemeProvider } from "@/app/_contexts/theme-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScolaireProvider } from "@/app/_contexts/scolaire-context";
import { calendrierScolaire, laboratoires, profsHoraire } from "@/lib/donnees";
import { profsUtiles } from "@/lib/maintenant";
import { indexRecherche } from "@/lib/index-recherche";

// Le guide de normes graphiques du cégep impose Montserrat, et Arial quand elle n'est pas disponible.
const montserrat = Montserrat({ variable: "--font-sans", subsets: ["latin"], fallback: ["Arial", "sans-serif"] });
// Police à chasse fixe réservée au code (commandes, YAML, terminaux).
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://info.cegepmontpetit.ca"),
  title: { default: "Département d'informatique — Cégep Édouard-Montpetit", template: "%s — Informatique Montpetit" },
  description: "DEC en informatique, DEC-BAC, AEC, profs, horaires et ressources du département d'informatique du Cégep Édouard-Montpetit.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg` },
};

// Applique le thème sombre avant l'affichage pour éviter un flash blanc.
const scriptTheme = `try{var t=localStorage.getItem("theme");if(t==='"sombre"'||t==="sombre"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr-CA" className={`${montserrat.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTheme }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <ScolaireProvider calendrier={calendrierScolaire()}>
          <TooltipProvider>
            <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-2">
              Aller au contenu
            </a>
            <Entete index={indexRecherche()} />
            <main id="contenu" className="flex-1">
              {children}
            </main>
            <PiedDePage />
            <Bandeau profs={profsUtiles(profsHoraire(), laboratoires())} labos={laboratoires()} />
          </TooltipProvider>
          </ScolaireProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
