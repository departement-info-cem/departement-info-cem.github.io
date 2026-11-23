"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { RechercheGlobale, type ElementRecherche } from "@/components/recherche-globale";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/app/_contexts/theme-context";
import { GRILLES_DIRECTES, LIENS_LOGOS } from "@/lib/raccourcis";
import { chemin } from "@/lib/chemins";
import { cn } from "@/lib/utils";

export const GRILLES = [
  ...GRILLES_DIRECTES,
  { href: "/programmes", texte: "Tous les programmes", sousTitre: "AEC, comparateur" },
  { href: "/cours-service", texte: "Sciences de la nature et cours de service", sousTitre: "SN1, TIM, TAG, Z03" },
];

export const NAVIGATION = [
  { href: "/sites", texte: "Sites des cours" },
  { href: "/profs", texte: "Profs" },
  { href: "/maintenant", texte: "En ce moment" },
  { href: "/orientation", texte: "Est-ce pour moi ?" },
];

export const RESSOURCES = [
  { href: "/calendrier", texte: "Calendrier scolaire" },
  { href: "/faq", texte: "FAQ" },
  { href: "/nouveau", texte: "Conseils aux nouveaux" },
  { href: "/logiciels", texte: "Logiciels gratuits" },
  { href: "/git", texte: "Git et commits" },
  { href: "/plagiat", texte: "Plagiat et IA" },
  { href: "/contact", texte: "Nous joindre" },
];

export function Entete({ index }: { index: ElementRecherche[] }) {
  const chemin = usePathname();
  const { theme, basculer } = useTheme();
  const actif = (href: string) => chemin === href || chemin.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 bg-cadre text-cadre-texte shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 2xl:max-w-screen-2xl">
        <Link href="/" aria-label="Accueil" className="shrink-0">
          <Logo inverse taille={40} />
        </Link>

        <nav className="ml-auto hidden items-center xl:flex" aria-label="Navigation principale">
          <div className="group relative">
            <button className={cn("flex items-center gap-1 rounded-md px-2 py-2 text-sm font-semibold 2xl:px-3 hover:bg-white/10", (actif("/programmes") || actif("/cours-service")) && "bg-white/10 text-cem-vert")} aria-haspopup="true">
              Grilles <ChevronDown className="size-4" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-64 rounded-md border bg-popover p-1 text-popover-foreground opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {GRILLES.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm hover:bg-accent">
                  <span className="block font-semibold">{l.texte}</span>
                  <span className="text-xs text-muted-foreground">{l.sousTitre}</span>
                </Link>
              ))}
            </div>
          </div>
          {NAVIGATION.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-md px-2 py-2 text-sm font-semibold 2xl:px-3 transition-colors hover:bg-white/10",
                actif(l.href) && "bg-white/10 text-cem-vert",
              )}
            >
              {l.texte}
            </Link>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-md px-2 py-2 text-sm font-semibold 2xl:px-3 hover:bg-white/10" aria-haspopup="true">
              Étudiants <ChevronDown className="size-4" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-56 rounded-md border bg-popover p-1 text-popover-foreground opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {RESSOURCES.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded px-3 py-2 text-sm hover:bg-accent">
                  {l.texte}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-2">
          <RechercheGlobale index={index} />
          {/* SharePoint reste visible même sur un petit écran ; les autres logos passent dans le menu */}
          {LIENS_LOGOS.map((l, i) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer" title={l.texte} aria-label={l.texte} className={cn("rounded-md p-1 transition hover:bg-white/15", i > 0 && "hidden md:block")}>
              <LogoLien lien={l} />
            </a>
          ))}
          <button
            onClick={basculer}
            className="rounded-md p-2 hover:bg-white/10"
            aria-label={theme === "clair" ? "Passer au thème sombre" : "Passer au thème clair"}
            title={theme === "clair" ? "Thème sombre" : "Thème clair"}
          >
            {theme === "clair" ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </button>
          <Sheet>
            <SheetTrigger className="rounded-md p-2 hover:bg-white/10 xl:hidden" aria-label="Ouvrir le menu">
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {[{ href: "/", texte: "Accueil" }, ...GRILLES, ...NAVIGATION, ...RESSOURCES].map((l) => (
                  <Link key={l.href} href={l.href} className={cn("rounded-md px-3 py-2 font-medium hover:bg-accent", actif(l.href) && l.href !== "/" && "bg-accent")}>
                    {l.texte}
                  </Link>
                ))}
                <hr className="my-2" />
                <div className="space-y-1 rounded-lg bg-cadre p-2 text-cadre-texte">
                  {LIENS_LOGOS.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-white/10">
                      <LogoLien lien={l} /> {l.texte}
                    </a>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function LogoLien({ lien }: { lien: (typeof LIENS_LOGOS)[number] }) {
  return <Image src={chemin(`/images/liens/${lien.logo}`)} alt="" width={28} height={28} unoptimized className="size-7 object-contain xl:size-8" />;
}
