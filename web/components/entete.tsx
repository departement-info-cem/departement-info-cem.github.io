"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid, Menu, Monitor, Moon, Share2, SquarePlus, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { RechercheGlobale, type ElementRecherche } from "@/components/recherche-globale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme, type Preference } from "@/app/_contexts/theme-context";
import { GRILLES_DIRECTES, LIENS_LOGOS } from "@/lib/raccourcis";
import { chemin } from "@/lib/chemins";
import { cn } from "@/lib/utils";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { PartagerPage } from "@/components/partager-page";
import { AideInstallation } from "@/components/installer-appli";
import { useInstallation } from "@/app/_hooks/use-installation";

export const GRILLES = [
  ...GRILLES_DIRECTES,
  { href: "/programmes", texte: "Tous les programmes", sousTitre: "AEC, comparateur" },
  { href: "/cours-service", texte: "Sciences de la nature et cours de service", sousTitre: "SN1, TIM, TAG, Z03" },
  { href: "/orientation", texte: "Est-ce pour moi ?", sousTitre: "Deux mini-jeux et un bot pour t'orienter" },
];

export const NAVIGATION = [
  { href: "/sites", texte: "Sites des cours" },
  { href: "/profs", texte: "Profs" },
  { href: "/maintenant", texte: "Locaux" },
  { href: "/calendrier", texte: "Calendrier" },
];

export const RESSOURCES = [
  { href: "/mes-cours", texte: "Mes cours" },
  { href: "/centre-aide", texte: "Centre d'aide" },
  { href: "/faq", texte: "FAQ" },
  { href: "/nouveau", texte: "Conseils aux nouveaux" },
  { href: "/logiciels", texte: "Logiciels gratuits" },
  { href: "/git", texte: "Git et commits" },
  { href: "/plagiat", texte: "Plagiat et IA" },
  { href: "/contact", texte: "Nous joindre" },
];

// La barre complète (logo, liens, icônes) s'affiche dès lg (1024 px), pas xl, pour les portables à petit écran
// ou en mise à l'échelle 125-150 %. À 1024 px, une barre de défilement laisse 1009 px : sous xl, les liens sont
// resserrés (px-2, sans espace entre eux) et le séparateur disparaît, et la barre tient en 989 px.
// Ajout ou changement d'un lien : revérifie à 1024 px (largeur du contenu de <header> > div = sa largeur visible).

// Tout ce qui est cliquable dans la barre a la même hauteur (36 px), le même arrondi et le même survol.
const BOUTON = "inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-2 xl:px-3 text-sm font-semibold transition-colors hover:bg-white/10";
const BOUTON_ICONE ="inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10";
const ACTIF = "bg-white/10 text-cem-vert";
const SOUS_MENU =
  "invisible absolute top-full z-50 rounded-md border bg-popover p-1 text-popover-foreground opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100";

export function Entete({ index }: { index: ElementRecherche[] }) {
  const chemin = usePathname();
  const { mesCours } = useMesCours();
  const [partage, setPartage] = useState(false);
  const [menu, setMenu] = useState(false);
  const { proposer, installer } = useInstallation();
  const [aideInstallation, setAideInstallation] = useState(false);
  // Le centre d'aide devient « Mon centre d'aide » quand l'étudiant a entré ses cours
  const texteLien = (l: { href: string; texte: string }) => (l.href === "/centre-aide" && mesCours.length ? "Mon centre d'aide" : l.texte);
  const actif = (href: string) => chemin === href || chemin.startsWith(`${href}/`) || (href === "/maintenant" && chemin.startsWith("/locaux/")); // une page par labo

  return (
    <header className="sticky top-0 z-40 bg-cadre text-cadre-texte shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 2xl:max-w-screen-2xl">
        <Link href="/" aria-label="Accueil" className="shrink-0">
          {/* Logo, nom et quatre boutons tiennent en 370 px ; en dessous (iPhone SE avec le zoom d'affichage), le bouton du menu sortait de l'écran */}
          <Logo anime classeTexte="max-[369px]:hidden" />
        </Link>

        <nav className="ml-auto hidden items-center lg:flex xl:gap-1" aria-label="Navigation principale">
          <div className="group relative">
            <button className={cn(BOUTON, GRILLES.some((l) => actif(l.href)) && ACTIF)} aria-haspopup="true">
              Programmes <ChevronDown className="size-4" />
            </button>
            <div className={cn(SOUS_MENU, "left-0 w-64")}>
              {GRILLES.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm hover:bg-accent">
                  <span className="block font-semibold">{l.texte}</span>
                  <span className="text-xs text-muted-foreground">{l.sousTitre}</span>
                </Link>
              ))}
            </div>
          </div>
          {NAVIGATION.map((l) => (
            <Link key={l.href} href={l.href} className={cn(BOUTON, actif(l.href) && ACTIF)}>
              {l.texte}
            </Link>
          ))}
          <div className="group relative">
            <button className={cn(BOUTON, RESSOURCES.some((l) => actif(l.href)) && ACTIF)} aria-haspopup="true">
              Étudiants <ChevronDown className="size-4" />
            </button>
            <div className={cn(SOUS_MENU, "right-0 w-56")}>
              {RESSOURCES.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm hover:bg-accent">
                  {texteLien(l)}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <span className="hidden h-6 w-px bg-white/20 xl:block" aria-hidden="true" />

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          <RechercheGlobale index={index} className={BOUTON_ICONE} />
          {/* Sur mobile, le partage est dans le menu : l'en-tête n'a pas la place */}
          <button onClick={() => setPartage(true)} className={cn(BOUTON_ICONE, "hidden lg:inline-flex")} aria-label="Partager cette page" title="Partager cette page">
            <Share2 className="size-5" />
          </button>
          <MenuLiens />
          <ChoixTheme />
          <Sheet open={menu} onOpenChange={setMenu}>
            <SheetTrigger className={cn(BOUTON_ICONE, "lg:hidden")} aria-label="Ouvrir le menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {[{ href: "/", texte: "Accueil" }, ...GRILLES, ...NAVIGATION, ...RESSOURCES].map((l) => (
                  <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-2 font-medium hover:bg-accent", actif(l.href) && l.href !== "/" && "bg-accent")}>
                    {texteLien(l)}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMenu(false);
                    setPartage(true);
                  }}
                  className="mt-2 flex items-center gap-2 rounded-md border-t px-3 py-2 text-left font-medium hover:bg-accent"
                >
                  <Share2 className="size-4" /> Partager cette page
                </button>
                {proposer && (
                  <button
                    onClick={async () => {
                      setMenu(false);
                      if (!(await installer())) setAideInstallation(true);
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left font-medium hover:bg-accent"
                  >
                    <SquarePlus className="size-4" /> Ajouter à l&apos;écran d&apos;accueil
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <PartagerPage ouvert={partage} changer={setPartage} />
          <AideInstallation ouvert={aideInstallation} changer={setAideInstallation} />
        </div>
      </div>
    </header>
  );
}

// SharePoint, Omnivox, etc. : un seul bouton au lieu de cinq logos dans la barre.
function MenuLiens() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={BOUTON_ICONE} aria-label="Liens utiles" title="Liens utiles">
        <LayoutGrid className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        {LIENS_LOGOS.map((l) => (
          <DropdownMenuItem key={l.href} render={<a href={l.href} target="_blank" rel="noreferrer" />} className="gap-2.5 py-1.5 pr-3">
            {/* Pastille foncée : certains logos (GitHub) sont blancs */}
            <span className="rounded bg-cadre p-1">
              <Image src={chemin(`/images/liens/${l.logo}`)} alt="" width={20} height={20} unoptimized className="size-5 object-contain" />
            </span>
            {l.texte}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const THEMES = [
  { valeur: "clair", texte: "Clair", Icone: Sun },
  { valeur: "sombre", texte: "Sombre", Icone: Moon },
  { valeur: "systeme", texte: "Système", Icone: Monitor },
] as const;

// Le bouton montre le thème affiché (soleil ou lune), même en mode Système : c'est plus parlant qu'un écran.
function ChoixTheme() {
  const { theme, preference, choisir } = useTheme();
  const actuel = THEMES.find((t) => t.valeur === preference) ?? THEMES[2];
  const IconeBouton = theme === "sombre" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={BOUTON_ICONE} aria-label={`Thème : ${actuel.texte}`} title="Thème">
        <IconeBouton className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={preference} onValueChange={(valeur: Preference) => choisir(valeur)}>
          {THEMES.map(({ valeur, texte, Icone }) => (
            <DropdownMenuRadioItem key={valeur} value={valeur}>
              <Icone /> {texte}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
