"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid, Menu, Monitor, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { RechercheGlobale, type ElementRecherche } from "@/components/recherche-globale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme, type Preference } from "@/app/_contexts/theme-context";
import { GRILLES_DIRECTES, LIENS_LOGOS } from "@/lib/raccourcis";
import { chemin } from "@/lib/chemins";
import { cn } from "@/lib/utils";

export const GRILLES = [
  ...GRILLES_DIRECTES,
  { href: "/programmes", texte: "Tous les programmes", sousTitre: "AEC, comparateur" },
  { href: "/cours-service", texte: "Sciences de la nature et cours de service", sousTitre: "SN1, TIM, TAG, Z03" },
  { href: "/orientation", texte: "Est-ce pour moi ?", sousTitre: "Quelques questions pour t'orienter" },
];

export const NAVIGATION = [
  { href: "/sites", texte: "Sites des cours" },
  { href: "/profs", texte: "Profs" },
  { href: "/maintenant", texte: "Locaux" },
  { href: "/calendrier", texte: "Calendrier" },
];

export const RESSOURCES = [
  { href: "/faq", texte: "FAQ" },
  { href: "/nouveau", texte: "Conseils aux nouveaux" },
  { href: "/logiciels", texte: "Logiciels gratuits" },
  { href: "/git", texte: "Git et commits" },
  { href: "/plagiat", texte: "Plagiat et IA" },
  { href: "/contact", texte: "Nous joindre" },
];

// Tout ce qui est cliquable dans la barre a la même hauteur (36 px), le même arrondi et le même survol.
const BOUTON = "inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-semibold transition-colors hover:bg-white/10";
const BOUTON_ICONE ="inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/10";
const ACTIF = "bg-white/10 text-cem-vert";
const SOUS_MENU =
  "invisible absolute top-full z-50 rounded-md border bg-popover p-1 text-popover-foreground opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100";

export function Entete({ index }: { index: ElementRecherche[] }) {
  const chemin = usePathname();
  const actif = (href: string) => chemin === href || chemin.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-cadre text-cadre-texte shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 2xl:max-w-screen-2xl">
        <Link href="/" aria-label="Accueil" className="shrink-0">
          <Logo inverse taille={40} />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Navigation principale">
          <div className="group relative">
            <button className={cn(BOUTON, GRILLES.some((l) => actif(l.href)) && ACTIF)} aria-haspopup="true">
              Grilles <ChevronDown className="size-4" />
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
                  {l.texte}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <span className="hidden h-6 w-px bg-white/20 xl:block" aria-hidden="true" />

        <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-0">
          <RechercheGlobale index={index} className={BOUTON_ICONE} />
          <MenuLiens />
          <ChoixTheme />
          <Sheet>
            <SheetTrigger className={cn(BOUTON_ICONE, "xl:hidden")} aria-label="Ouvrir le menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {[{ href: "/", texte: "Accueil" }, ...GRILLES, ...NAVIGATION, ...RESSOURCES].map((l) => (
                  <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-2 font-medium hover:bg-accent", actif(l.href) && l.href !== "/" && "bg-accent")}>
                    {l.texte}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
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
