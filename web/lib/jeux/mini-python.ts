// Un tout petit interpréteur Python (sous-ensemble) pour le jeu de programmation.
// Supporté : affectation, if/elif/else, while, for i in range(...), def, return, break, continue, pass,
// nombres, booléens, and/or/not, comparaisons, + - * / // %. Les messages d'erreur sont en français.

export class ErreurPython extends Error {
  constructor(
    message: string,
    public ligne: number,
  ) {
    super(message);
  }
}

type Valeur = number | boolean | string | null | number[];
type Expr =
  | { t: "val"; v: Valeur; l: number }
  | { t: "nom"; n: string; l: number }
  | { t: "appel"; n: string; args: Expr[]; l: number }
  | { t: "un"; op: string; e: Expr; l: number }
  | { t: "bin"; op: string; g: Expr; d: Expr; l: number };
type Instr =
  | { t: "expr"; e: Expr; l: number }
  | { t: "aff"; n: string; op: string; e: Expr; l: number }
  | { t: "si"; branches: { cond: Expr | null; corps: Instr[] }[]; l: number }
  | { t: "tantque"; cond: Expr; corps: Instr[]; l: number }
  | { t: "pour"; n: string; iter: Expr; corps: Instr[]; l: number }
  | { t: "def"; n: string; params: string[]; corps: Instr[]; l: number }
  | { t: "retour"; e: Expr | null; l: number }
  | { t: "break" | "continue" | "pass"; l: number };

type Ligne = { indent: number; jetons: string[]; l: number };

const MOTS = new Set(["if", "elif", "else", "while", "for", "in", "def", "return", "break", "continue", "pass", "and", "or", "not", "True", "False", "None"]);

function decouper(source: string): Ligne[] {
  const lignes: Ligne[] = [];
  source.split("\n").forEach((brut, i) => {
    const l = i + 1;
    const sansCommentaire = brut.replace(/#.*$/, "").replace(/\s+$/, "");
    if (!sansCommentaire.trim()) return;
    const indent = /^[ \t]*/.exec(sansCommentaire)![0].replace(/\t/g, "    ").length;
    const jetons: string[] = [];
    const re = /\s*(\d+(?:\.\d+)?|[A-Za-z_À-ÿ]\w*|"[^"]*"|'[^']*'|\/\/|==|!=|<=|>=|\+=|-=|\*=|[-+*/%<>=():,])/y;
    const texte = sansCommentaire.trim();
    re.lastIndex = 0;
    let fin = 0;
    while (fin < texte.length) {
      re.lastIndex = fin;
      const m = re.exec(texte);
      if (!m) throw new ErreurPython(`je ne comprends pas « ${texte.slice(fin).trim()[0]} »`, l);
      jetons.push(m[1]);
      fin = re.lastIndex;
    }
    lignes.push({ indent, jetons, l });
  });
  return lignes;
}

class Analyseur {
  private i = 0;
  private j = 0;
  private ligne!: Ligne;
  constructor(private lignes: Ligne[]) {}

  programme(): Instr[] {
    if (!this.lignes.length) return [];
    if (this.lignes[0].indent > 0) throw new ErreurPython("la première ligne ne doit pas être décalée", this.lignes[0].l);
    const corps = this.bloc(0);
    if (this.i < this.lignes.length) throw new ErreurPython("le décalage (indentation) de cette ligne est inattendu", this.lignes[this.i].l);
    return corps;
  }

  private bloc(indent: number): Instr[] {
    const corps: Instr[] = [];
    while (this.i < this.lignes.length && this.lignes[this.i].indent === indent) corps.push(this.instruction(indent));
    if (this.i < this.lignes.length && this.lignes[this.i].indent > indent) throw new ErreurPython("cette ligne est trop décalée vers la droite", this.lignes[this.i].l);
    return corps;
  }

  private voir = () => this.ligne.jetons[this.j];
  private erreur = (m: string): never => {
    throw new ErreurPython(m, this.ligne.l);
  };
  private prendre(attendu?: string): string {
    const t = this.voir();
    if (attendu && t !== attendu) this.erreur(attendu === ":" ? "il manque les deux-points « : » à la fin de la ligne" : `il manque « ${attendu} »${t ? ` avant « ${t} »` : " à la fin de la ligne"}`);
    if (t === undefined) this.erreur("la ligne est incomplète");
    this.j++;
    return t;
  }

  private nom(): string {
    const n = this.prendre();
    if (!/^[A-Za-z_À-ÿ]/.test(n) || MOTS.has(n)) this.erreur(`« ${n} » n'est pas un nom valide`);
    return n;
  }

  /** Le corps après « : » : sur la même ligne, ou un bloc décalé. */
  private corps(indent: number): Instr[] {
    this.prendre(":");
    if (this.voir() !== undefined) return [this.simple()];
    const l = this.ligne.l;
    this.i++;
    const suivante = this.lignes[this.i];
    if (!suivante || suivante.indent <= indent) throw new ErreurPython("il faut au moins une ligne décalée (4 espaces) sous cette ligne", l);
    return this.bloc(suivante.indent);
  }

  private instruction(indent: number): Instr {
    this.ligne = this.lignes[this.i];
    this.j = 0;
    const l = this.ligne.l;
    switch (this.voir()) {
      case "if": {
        const branches: { cond: Expr | null; corps: Instr[] }[] = [];
        this.prendre();
        branches.push({ cond: this.expr(), corps: this.corpsLigne(indent) });
        while (this.lignes[this.i]?.indent === indent && this.lignes[this.i].jetons[0] === "elif") {
          this.ligne = this.lignes[this.i];
          this.j = 1;
          branches.push({ cond: this.expr(), corps: this.corpsLigne(indent) });
        }
        if (this.lignes[this.i]?.indent === indent && this.lignes[this.i].jetons[0] === "else") {
          this.ligne = this.lignes[this.i];
          this.j = 1;
          branches.push({ cond: null, corps: this.corpsLigne(indent) });
        }
        return { t: "si", branches, l };
      }
      case "while": {
        this.prendre();
        const cond = this.expr();
        return { t: "tantque", cond, corps: this.corpsLigne(indent), l };
      }
      case "for": {
        this.prendre();
        const n = this.nom();
        this.prendre("in");
        const iter = this.expr();
        return { t: "pour", n, iter, corps: this.corpsLigne(indent), l };
      }
      case "def": {
        this.prendre();
        const n = this.nom();
        this.prendre("(");
        const params: string[] = [];
        while (this.voir() !== ")") {
          params.push(this.nom());
          if (this.voir() === ",") this.prendre();
          else break;
        }
        this.prendre(")");
        return { t: "def", n, params, corps: this.corpsLigne(indent), l };
      }
      case "elif":
      case "else":
        return this.erreur(`« ${this.voir()} » doit suivre un « if »`);
    }
    const s = this.simple();
    this.i++;
    return s;
  }

  private corpsLigne(indent: number): Instr[] {
    const avant = this.i;
    const c = this.corps(indent);
    if (this.i === avant) this.i++; // corps écrit sur la même ligne
    return c;
  }

  private simple(): Instr {
    const l = this.ligne.l;
    const t = this.voir();
    let r: Instr;
    if (t === "break" || t === "continue" || t === "pass") {
      this.prendre();
      r = { t, l };
    } else if (t === "return") {
      this.prendre();
      r = { t: "retour", e: this.voir() === undefined ? null : this.expr(), l };
    } else if (["=", "+=", "-=", "*="].includes(this.ligne.jetons[this.j + 1])) {
      const n = this.nom();
      const op = this.prendre();
      r = { t: "aff", n, op, e: this.expr(), l };
    } else {
      r = { t: "expr", e: this.expr(), l };
      if (r.e.t === "nom" && this.voir() === undefined) this.erreur(`pour appeler une fonction, ajoute des parenthèses : ${r.e.n}()`);
    }
    if (this.voir() !== undefined) this.erreur(this.voir() === "=" ? "pour comparer deux valeurs, utilise « == »" : `je ne m'attendais pas à « ${this.voir()} » ici`);
    return r;
  }

  private gauche(ops: string[], suivant: () => Expr): Expr {
    let g = suivant();
    while (this.voir() !== undefined && ops.includes(this.voir())) {
      const op = this.prendre();
      g = { t: "bin", op, g, d: suivant(), l: this.ligne.l };
    }
    return g;
  }

  private expr = (): Expr => this.gauche(["or"], this.et);
  private et = (): Expr => this.gauche(["and"], this.non);
  private non = (): Expr => {
    if (this.voir() === "not") {
      this.prendre();
      return { t: "un", op: "not", e: this.non(), l: this.ligne.l };
    }
    const c = this.gauche(["==", "!=", "<", ">", "<=", ">="], this.somme);
    if (this.voir() === "=") this.erreur("pour comparer deux valeurs, utilise « == »");
    return c;
  };
  private somme = (): Expr => this.gauche(["+", "-"], this.produit);
  private produit = (): Expr => this.gauche(["*", "/", "//", "%"], this.unaire);
  private unaire = (): Expr => {
    if (this.voir() === "-") {
      this.prendre();
      return { t: "un", op: "-", e: this.unaire(), l: this.ligne.l };
    }
    return this.atome();
  };
  private atome = (): Expr => {
    const l = this.ligne.l;
    const t = this.prendre();
    if (t === "(") {
      const e = this.expr();
      this.prendre(")");
      return e;
    }
    if (/^\d/.test(t)) return { t: "val", v: Number(t), l };
    if (/^["']/.test(t)) return { t: "val", v: t.slice(1, -1), l };
    if (t === "True" || t === "False") return { t: "val", v: t === "True", l };
    if (t === "None") return { t: "val", v: null, l };
    if (!/^[A-Za-z_À-ÿ]/.test(t) || MOTS.has(t)) this.erreur(`je ne m'attendais pas à « ${t} » ici`);
    if (this.voir() !== "(") return { t: "nom", n: t, l };
    this.prendre("(");
    const args: Expr[] = [];
    while (this.voir() !== ")") {
      args.push(this.expr());
      if (this.voir() === ",") this.prendre();
      else break;
    }
    this.prendre(")");
    return { t: "appel", n: t, args, l };
  };
}

export function analyser(source: string): Instr[] {
  return new Analyseur(decouper(source)).programme();
}

/** Nombre de lignes de code (sans les lignes vides ni les commentaires). */
export function compterLignes(source: string): number {
  return source.split("\n").filter((l) => l.replace(/#.*$/, "").trim()).length;
}

export type Native = { arite: number; action: boolean; f: (...args: Valeur[]) => Valeur };
export type Etape = { ligne: number; action?: string };

class Retour {
  constructor(public v: Valeur) {}
}
const BREAK = Symbol("break");
const CONTINUE = Symbol("continue");
type Signal = undefined | Retour | typeof BREAK | typeof CONTINUE;

const vrai = (v: Valeur) => (Array.isArray(v) ? v.length > 0 : Boolean(v));

/** Exécute un programme pas à pas : chaque yield est une instruction commencée ou une action du robot. */
export function* executer(prog: Instr[], natives: Record<string, Native>, maxEtapes = 3000): Generator<Etape, void> {
  const globales = new Map<string, Valeur>();
  const fonctions = new Map<string, Extract<Instr, { t: "def" }>>();
  let etapes = 0;
  let profondeur = 0;

  function* pas(ligne: number, action?: string): Generator<Etape, void> {
    if (++etapes > maxEtapes) throw new ErreurPython("le programme tourne en rond (boucle infinie ?)", ligne);
    yield { ligne, action };
  }

  function nombre(v: Valeur, l: number): number {
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return Number(v);
    throw new ErreurPython("il faut un nombre ici", l);
  }

  function* evaluer(e: Expr, locales: Map<string, Valeur>): Generator<Etape, Valeur> {
    switch (e.t) {
      case "val":
        return e.v;
      case "nom":
        if (locales.has(e.n)) return locales.get(e.n)!;
        if (globales.has(e.n)) return globales.get(e.n)!;
        if (natives[e.n] || fonctions.has(e.n)) throw new ErreurPython(`pour appeler ${e.n}, ajoute des parenthèses : ${e.n}()`, e.l);
        throw new ErreurPython(`je ne connais pas « ${e.n} »`, e.l);
      case "un": {
        const v = yield* evaluer(e.e, locales);
        return e.op === "not" ? !vrai(v) : -nombre(v, e.l);
      }
      case "bin": {
        const g = yield* evaluer(e.g, locales);
        if (e.op === "and") return vrai(g) ? yield* evaluer(e.d, locales) : g;
        if (e.op === "or") return vrai(g) ? g : yield* evaluer(e.d, locales);
        const d = yield* evaluer(e.d, locales);
        if (e.op === "==") return g === d;
        if (e.op === "!=") return g !== d;
        const [a, b] = [nombre(g, e.l), nombre(d, e.l)];
        if (["/", "//", "%"].includes(e.op) && b === 0) throw new ErreurPython("division par zéro", e.l);
        switch (e.op) {
          case "+": return a + b;
          case "-": return a - b;
          case "*": return a * b;
          case "/": return a / b;
          case "//": return Math.floor(a / b);
          case "%": return ((a % b) + b) % b;
          case "<": return a < b;
          case ">": return a > b;
          case "<=": return a <= b;
          default: return a >= b;
        }
      }
      case "appel": {
        const args: Valeur[] = [];
        for (const a of e.args) args.push(yield* evaluer(a, locales));
        if (e.n === "range") {
          if (args.length < 1 || args.length > 3) throw new ErreurPython("range() prend de 1 à 3 nombres", e.l);
          const ns = args.map((a) => nombre(a, e.l));
          const [d, f, p] = ns.length === 1 ? [0, ns[0], 1] : [ns[0], ns[1], ns[2] ?? 1];
          if (p === 0) throw new ErreurPython("le pas de range() ne peut pas être 0", e.l);
          const liste: number[] = [];
          for (let k = d; p > 0 ? k < f : k > f; k += p) {
            if (liste.length > maxEtapes) throw new ErreurPython("range() trop grand", e.l);
            liste.push(k);
          }
          return liste;
        }
        const def = fonctions.get(e.n);
        if (def) {
          if (def.params.length !== args.length) throw new ErreurPython(`${e.n}() attend ${def.params.length} valeur(s), tu en donnes ${args.length}`, e.l);
          if (++profondeur > 60) throw new ErreurPython("trop d'appels imbriqués (récursion sans fin ?)", e.l);
          const s = yield* bloc(def.corps, new Map(def.params.map((p, k) => [p, args[k]])));
          profondeur--;
          return s instanceof Retour ? s.v : null;
        }
        const native = natives[e.n];
        if (!native) {
          const proche = Object.keys(natives).find((n) => n.replace(/_/g, "").toLowerCase() === e.n.replace(/_/g, "").toLowerCase() || n.startsWith(e.n));
          throw new ErreurPython(`la fonction ${e.n}() n'existe pas${proche ? `. Voulais-tu dire ${proche}() ?` : ""}`, e.l);
        }
        if (native.arite !== args.length) throw new ErreurPython(`${e.n}() ne prend ${native.arite ? `que ${native.arite}` : "aucune"} valeur entre les parenthèses`, e.l);
        let resultat: Valeur;
        try {
          resultat = native.f(...args);
        } catch (err) {
          throw err instanceof ErreurPython ? err : new ErreurPython((err as Error).message, e.l);
        }
        if (native.action) yield* pas(e.l, e.n);
        return resultat;
      }
    }
  }

  function* bloc(corps: Instr[], locales: Map<string, Valeur>): Generator<Etape, Signal> {
    for (const i of corps) {
      const s: Signal = yield* instruction(i, locales);
      if (s !== undefined) return s;
    }
    return undefined;
  }

  function* instruction(i: Instr, locales: Map<string, Valeur>): Generator<Etape, Signal> {
    switch (i.t) {
      case "def":
        fonctions.set(i.n, i);
        return;
      case "pass":
        return;
      case "break":
        return BREAK;
      case "continue":
        return CONTINUE;
      case "retour":
        return new Retour(i.e ? yield* evaluer(i.e, locales) : null);
      case "expr":
        yield* pas(i.l);
        yield* evaluer(i.e, locales);
        return;
      case "aff": {
        yield* pas(i.l);
        const v = yield* evaluer(i.e, locales);
        const portee = locales;
        if (i.op === "=") portee.set(i.n, v);
        else {
          const avant = portee.get(i.n) ?? globales.get(i.n);
          if (avant === undefined) throw new ErreurPython(`la variable ${i.n} n'existe pas encore`, i.l);
          const [a, b] = [nombre(avant, i.l), nombre(v, i.l)];
          portee.set(i.n, i.op === "+=" ? a + b : i.op === "-=" ? a - b : a * b);
        }
        return;
      }
      case "si":
        yield* pas(i.l);
        for (const b of i.branches) if (b.cond === null || vrai(yield* evaluer(b.cond, locales))) return yield* bloc(b.corps, locales);
        return;
      case "tantque":
        for (;;) {
          yield* pas(i.l);
          if (!vrai(yield* evaluer(i.cond, locales))) return;
          const s = yield* bloc(i.corps, locales);
          if (s === BREAK) return;
          if (s instanceof Retour) return s;
        }
      case "pour": {
        yield* pas(i.l);
        const liste = yield* evaluer(i.iter, locales);
        if (!Array.isArray(liste)) throw new ErreurPython("après « in », utilise range(...), par exemple range(4)", i.l);
        for (const v of liste) {
          yield* pas(i.l);
          locales.set(i.n, v);
          const s = yield* bloc(i.corps, locales);
          if (s === BREAK) return;
          if (s instanceof Retour) return s;
        }
        return;
      }
    }
  }

  yield* bloc(prog, globales);
}
