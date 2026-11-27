// Anciennes adresses du site : celles de l'ancien site Angular (/prof/<id>, /dec/p, /goodies...)
// et celles du site Next.js quand il était servi sous /react/ (liens des sites de cours, Teams...).
// GitHub Pages sert 404.html pour toute adresse inconnue : la page 404 (app/not-found.tsx)
// exécute cette fonction avant l'affichage et redirige si elle renvoie une adresse.
//
// ATTENTION : la fonction est recopiée telle quelle dans la page (via toString()).
// Elle ne doit utiliser aucun import ni aucune variable extérieure.
export function nouvelleAdresse(pathname: string, search: string, hash: string): string | null {
  const suite = search + hash;

  // Site Next.js sous /react/ : même page, sans le préfixe
  if (pathname === "/react" || pathname.startsWith("/react/")) {
    const reste = pathname.slice("/react".length);
    return (reste === "" ? "/" : reste) + suite;
  }

  const p = pathname.replace(/\/+$/, "") || "/";
  const morceaux = p.split("/").filter(Boolean);
  const [premier, second] = morceaux;
  const programmes: Record<string, string> = { p: "dec-prog", r: "dec-reseau" };

  // Fichiers de l'ancien site : photos des profs et images
  if (premier === "assets" && morceaux.length > 1) {
    if (second === "photos") return "/photos/" + morceaux.slice(2).join("/");
    return "/images/" + morceaux.slice(1).join("/");
  }

  if (morceaux.length === 1) {
    switch (premier) {
      case "accueil":
      case "home":
        return "/";
      case "dec": {
        const profil = new URLSearchParams(search).get("profil");
        return profil && programmes[profil] ? "/programmes/" + programmes[profil] + "/" : "/programmes/";
      }
      case "decbac":
        return "/programmes/dec-bac/";
      case "goodies":
        return "/logiciels/";
      case "terminal":
        return "/jeux/";
    }
  }

  if (morceaux.length === 2) {
    if (premier === "prof") return "/" + second + "/";
    if (premier === "dec") return programmes[second] ? "/programmes/" + programmes[second] + "/" : "/programmes/";
    if (premier === "faq") return "/faq/";
  }

  return null;
}

/** Script à placer dans la page 404 : redirige tout de suite si l'adresse est une ancienne adresse connue. */
export const scriptRedirection = `try{var a=(${nouvelleAdresse.toString()})(location.pathname,location.search,location.hash);if(a)location.replace(a)}catch(e){}`;
