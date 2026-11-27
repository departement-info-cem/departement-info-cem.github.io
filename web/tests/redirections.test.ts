import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { nouvelleAdresse, scriptRedirection } from "@/lib/redirections";
import { ROUTES_RESERVEES } from "@/lib/validation";

const r = (adresse: string) => {
  const u = new URL(adresse, "https://info.cegepmontpetit.ca");
  return nouvelleAdresse(u.pathname, u.search, u.hash);
};

describe("anciennes adresses du site sous /react/", () => {
  it("/react et /react/ mènent à l'accueil", () => {
    expect(r("/react")).toBe("/");
    expect(r("/react/")).toBe("/");
  });
  it("garde le chemin, la query et le hash", () => {
    expect(r("/react/joris.deguet/horaire/?cours=420-5N6-EM#jeudi")).toBe("/joris.deguet/horaire/?cours=420-5N6-EM#jeudi");
    expect(r("/react/centre-aide/?mescours=SN1-1050,3W6")).toBe("/centre-aide/?mescours=SN1-1050,3W6");
    expect(r("/react/modifier-mon-profil")).toBe("/modifier-mon-profil");
  });
  it("ne confond pas un chemin qui commence par « react »", () => expect(r("/reactif/")).toBeNull());
});

describe("anciennes adresses du site Angular", () => {
  it("page d'un prof", () => {
    expect(r("/prof/joris.deguet")).toBe("/joris.deguet/");
    expect(r("/prof/joris.deguet/")).toBe("/joris.deguet/");
  });
  it("accueil", () => {
    expect(r("/accueil")).toBe("/");
    expect(r("/home")).toBe("/");
  });
  it("programmes", () => {
    expect(r("/dec")).toBe("/programmes/");
    expect(r("/dec?profil=p")).toBe("/programmes/dec-prog/");
    expect(r("/dec?profil=r")).toBe("/programmes/dec-reseau/");
    expect(r("/dec/p")).toBe("/programmes/dec-prog/");
    expect(r("/dec/r")).toBe("/programmes/dec-reseau/");
    expect(r("/dec/x")).toBe("/programmes/");
    expect(r("/decbac")).toBe("/programmes/dec-bac/");
  });
  it("autres pages", () => {
    expect(r("/faq/inscription")).toBe("/faq/");
    expect(r("/goodies")).toBe("/logiciels/");
    expect(r("/terminal")).toBe("/jeux/");
  });
  it("fichiers", () => {
    expect(r("/assets/photos/aa.jpg")).toBe("/photos/aa.jpg");
    expect(r("/assets/RequeteDDA.pdf")).toBe("/images/RequeteDDA.pdf");
  });
});

describe("adresses inconnues ou du site actuel", () => {
  it("pas de redirection (vraie 404, pas de boucle)", () => {
    for (const a of ["/", "/n-importe-quoi", "/profs/", "/faq/", "/programmes/dec-prog/", "/joris.deguet/", "/images/inconnu.png", "/photos/x.jpg", "/assets"]) {
      expect(r(a), a).toBeNull();
    }
  });
});

describe("script de la page 404", () => {
  it("est du JavaScript valide qui redirige", () => {
    let cible = "";
    const location = { pathname: "/react/profs/", search: "?a=1", hash: "", replace: (a: string) => { cible = a; } };
    new Function("location", scriptRedirection)(location);
    expect(cible).toBe("/profs/?a=1");
  });
});

describe("routes réservées", () => {
  it("chaque page et dossier public du site est interdit comme identifiant de prof", () => {
    const dossiers = (d: string) => readdirSync(path.resolve(__dirname, d), { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("[")).map((e) => e.name);
    for (const nom of [...dossiers("../app"), ...dossiers("../public")]) expect(ROUTES_RESERVEES, nom).toContain(nom);
  });
  it("les anciennes adresses redirigées aussi", () => {
    for (const nom of ["react", "prof", "dec", "decbac", "goodies", "terminal", "accueil", "home", "assets"]) expect(ROUTES_RESERVEES).toContain(nom);
  });
});
