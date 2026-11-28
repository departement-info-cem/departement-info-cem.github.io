"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useAnimationsReduites } from "@/app/_hooks/use-animations-reduites";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import {
  angle,
  deplacer,
  ECRAN_LARGEUR,
  faces as facesSalle,
  hauteurEcran,
  lieu,
  obstacles,
  poseAssise,
  poseDebout,
  posteAPortee,
  postes,
  reperes,
  YEUX_DEBOUT,
  type Face,
  type Orientation,
  type Pose,
  type Poste,
} from "@/lib/salle";

// Le mode rétro en 3D : on se lève de sa chaise et le site n'est plus que l'écran d'un vieil ordinateur,
// dans une classe dessinée en phosphore. Tout est en CSS 3D : chaque face est un <div> placé dans l'espace,
// et l'écran est une copie de la page, à sa taille réelle. Assis, on est à la distance exacte où cet écran
// remplit la fenêtre : on passe de la vraie page à la copie sans que rien ne bouge. En se levant, on recule
// en élargissant le champ de vue (un travelling compensé à l'envers) : la salle se déploie autour de l'écran.
// Les mesures de la salle et les calculs de déplacement sont dans lib/salle.ts.

const VITESSE = 260; // cm/s
const COURSE = 1.8; // avec Maj
const SAUT = 330; // cm/s vers le haut
const GRAVITE = 980;
const SENSIBILITE = 0.12; // degrés par pixel de souris
const ROTATION = 110; // degrés/s avec les flèches gauche et droite
const DUREE_LEVER = 1800;
const DUREE_ASSEOIR = 1200;
// Pixels par centimètre pour placer les faces dans l'espace.
const CM = 2;
// Chaque face est dessinée à sa propre résolution (pixels par cm), puis réduite ou agrandie à sa taille réelle.
// Le navigateur dessine une face 3D à sa taille en pixels, de près comme de loin, et garde le résultat en mémoire
// graphique : trop de pixels et il doit jeter des morceaux, qui disparaissent puis reviennent (la salle clignotait).
// Les grandes surfaces sont donc peu détaillées, et seules les faces avec du texte le sont davantage.
// L'écran du site, lui, garde la taille de la fenêtre (voir mesures.echelle).
const RESOLUTIONS: Record<string, number> = { mur: 1.5, plancher: 1.5, tableau: 3, affiche: 4, "ecran-eteint": 4, facade: 3, clavier: 3, fenetre: 3 };

function resolution(classe: string): number {
  for (const c of classe.split(" ")) if (RESOLUTIONS[c]) return RESOLUTIONS[c];
  return CM;
}

const AVANCER = new Set(["KeyW", "ArrowUp"]);
const RECULER = new Set(["KeyS", "ArrowDown"]);
const MOUVEMENTS = new Set([...AVANCER, ...RECULER, "KeyA", "KeyD", "ArrowLeft", "ArrowRight"]);

const ROTATIONS: Record<Orientation, string> = {
  avant: "",
  arriere: "rotateY(180deg)",
  droite: "rotateY(90deg)",
  gauche: "rotateY(-90deg)",
  haut: "rotateX(90deg)",
  bas: "rotateX(-90deg)",
};

// Place un rectangle : son centre en (x, y, z), sa largeur l et sa hauteur h, en cm, dessiné à r pixels par cm
// (--cm, pour les bordures et les textes à l'intérieur). Pour l'écran du site, l et h sont en pixels et r est 1.
function placer(x: number, y: number, z: number, l: number, h: number, vers: Orientation, r: number, echelle = CM / r): CSSProperties {
  const px = (n: number) => `${n * CM}px`;
  return {
    "--cm": `${r}px`,
    width: `${l * r}px`,
    height: `${h * r}px`,
    transform: `translate3d(${px(x)}, ${px(-y)}, ${px(z)}) ${ROTATIONS[vers]} scale(${echelle}) translate(-50%, -50%)`,
  } as CSSProperties;
}

// Adoucit le départ et l'arrivée d'un trajet de caméra
const doux = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function interpoler(de: Pose, a: Pose, t: number, lever: boolean): Pose {
  const e = doux(t);
  // En se levant, on monte plus vite qu'on recule : on passe par-dessus le dossier de la chaise
  const eY = lever ? doux(Math.min(1, t * 1.7)) : e;
  return {
    x: de.x + (a.x - de.x) * e,
    y: de.y + (a.y - de.y) * eY,
    z: de.z + (a.z - de.z) * e,
    lacet: de.lacet + angle(a.lacet - de.lacet) * e,
    tangage: de.tangage + (a.tangage - de.tangage) * e,
    champ: de.champ + (a.champ - de.champ) * e,
  };
}

type Trajet = { de: Pose; a: Pose; debut: number; duree: number; lever: boolean; fin: () => void };

// Copie de la page (sans ses scripts ni ses id) dans l'écran virtuel, au même défilement,
// avec les animations en cours (bandeau défilant...) au même moment, pour que rien ne saute.
function copierPage(cible: HTMLElement, exclure: Element) {
  const copie = document.createElement("div");
  copie.className = `${document.body.className} retro-copie bg-background text-foreground`;
  const paires: [Element, Element][] = [];
  for (const enfant of Array.from(document.body.children)) {
    if (enfant === exclure || enfant.matches("script, nextjs-portal, .retro-noir")) continue;
    const double = enfant.cloneNode(true) as Element;
    copie.append(double);
    paires.push([enfant, double]);
  }
  cible.append(copie);
  for (const [a, b] of paires) synchroniser(a, b);
  // La vitre de l'écran (lignes de balayage, bande qui descend) : les pseudo-éléments de body et de la copie
  const vitre = (el: Element) => el.getAnimations({ subtree: true }).filter((a) => a.effect instanceof KeyframeEffect && a.effect.target === el && a.effect.pseudoElement);
  const avant = vitre(document.body);
  vitre(copie).forEach((a, i) => {
    if (avant[i] && avant[i].currentTime !== null) a.currentTime = avant[i].currentTime;
  });
  copie.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
  copie.querySelectorAll("script").forEach((e) => e.remove());
  copie.inert = true;
  cible.scrollTop = window.scrollY;
}

function synchroniser(a: Element, b: Element) {
  if (a.scrollTop || a.scrollLeft) {
    b.scrollTop = a.scrollTop;
    b.scrollLeft = a.scrollLeft;
  }
  if ((a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement || a instanceof HTMLSelectElement) && b instanceof a.constructor) {
    (b as HTMLInputElement).value = a.value;
    if (a instanceof HTMLInputElement) (b as HTMLInputElement).checked = a.checked;
  }
  const animations = b.getAnimations();
  a.getAnimations().forEach((x, i) => {
    if (animations[i] && x.currentTime !== null) animations[i].currentTime = x.currentTime;
  });
  for (let i = 0; i < a.children.length && i < b.children.length; i++) synchroniser(a.children[i], b.children[i]);
}

type Props = {
  /** On s'est rassis devant son ordinateur : retour au site. */
  rassis: () => void;
  /** On s'est assis devant un autre ordinateur, qui mène à cette page. */
  aller: (href: string) => void;
};

export function Salle3D({ rassis, aller }: Props) {
  const racine = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const defilement = useRef<HTMLDivElement>(null);
  const animationsReduites = useAnimationsReduites();
  // Composant chargé seulement dans le navigateur (dynamic, ssr: false) : on peut mesurer la fenêtre tout de suite.
  const [mesures] = useState(() => {
    const l = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    return { l, h, echelle: (ECRAN_LARGEUR * CM) / l, ecranH: hauteurEcran(l, h), defilement: window.scrollY };
  });
  const [decor] = useState(() => ({ faces: facesSalle(mesures.ecranH), postes: postes(), obstacles: obstacles() }));
  const moi = decor.postes.find((p) => p.place === "moi")!;
  const [invite, setInvite] = useState<Poste | null>(null);
  const [ou, setOu] = useState(lieu(moi.x));
  const [libre, setLibre] = useState(false);

  const etat = useRef({
    pose: poseAssise(moi, mesures.ecranH),
    touches: new Set<string>(),
    course: false,
    vy: 0,
    trajet: null as Trajet | null,
    relache: 0,
    invite: null as Poste | null,
    ou: lieu(moi.x),
  });

  function appliquer(p: Pose) {
    const perspective = mesures.h / 2 / Math.tan((p.champ / 2) * (Math.PI / 180));
    racine.current!.style.perspective = `${perspective}px`;
    const c = CM;
    camera.current!.style.transform = `translateZ(${perspective}px) rotateX(${p.tangage}deg) rotateY(${-p.lacet}deg) translate3d(${-p.x * c}px, ${p.y * c}px, ${-p.z * c}px)`;
  }

  function partir(a: Pose, duree: number, lever: boolean, fin: () => void) {
    const e = etat.current;
    e.touches.clear();
    e.trajet = { de: { ...e.pose }, a, debut: performance.now(), duree: animationsReduites ? 0 : duree, lever, fin };
    setLibre(false);
  }

  function asseoir(p: Poste) {
    if (document.pointerLockElement) document.exitPointerLock();
    partir(poseAssise(p, mesures.ecranH), DUREE_ASSEOIR, false, () => (p.place === "reseau" ? aller("/jeux/reseau/") : rassis()));
  }

  // Avant le premier affichage : la copie de la page dans l'écran, la caméra assise devant, et le vrai site
  // rendu inerte (il reste dessous, intact, pour le retour).
  useLayoutEffect(() => {
    const ici = racine.current!;
    let bloc: Element = ici;
    while (bloc.parentElement && bloc.parentElement !== document.body) bloc = bloc.parentElement;
    copierPage(defilement.current!, bloc);
    appliquer(etat.current.pose);
    // Puis on se lève ; on a les commandes une fois debout. La salle reste presque transparente (.salle-prepare)
    // pendant quelques images : le navigateur la dessine sans qu'on la voie, et elle apparaît nette d'un coup.
    const e = etat.current;
    e.trajet = { de: { ...e.pose }, a: poseDebout(moi, mesures.ecranH), debut: performance.now() + 150, duree: animationsReduites ? 0 : DUREE_LEVER, lever: true, fin: () => setLibre(true) };
    const rendusInertes = Array.from(document.body.children).filter((e): e is HTMLElement => e !== bloc && e instanceof HTMLElement && !e.inert);
    rendusInertes.forEach((e) => (e.inert = true));
    (document.activeElement as HTMLElement | null)?.blur?.();
    return () => {
      rendusInertes.forEach((e) => (e.inert = false));
      if (document.pointerLockElement) document.exitPointerLock();
      window.scrollTo(0, mesures.defilement);
    };
    // Une seule fois : la salle est recréée à chaque fois qu'on se lève
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La boucle : trajet automatique (se lever, s'asseoir) ou déplacements au clavier
  useEffect(() => {
    let precedent = performance.now();
    let id = requestAnimationFrame(boucle);
    function boucle(maintenant: number) {
      const dt = Math.min(0.05, (maintenant - precedent) / 1000);
      precedent = maintenant;
      const e = etat.current;
      const t = e.trajet;
      if (t) {
        if (maintenant >= t.debut) racine.current!.classList.remove("salle-prepare");
        const avancement = Math.max(0, Math.min(1, t.duree ? (maintenant - t.debut) / t.duree : maintenant >= t.debut ? 1 : 0));
        e.pose = interpoler(t.de, t.a, avancement, t.lever);
        if (avancement >= 1) {
          e.trajet = null;
          t.fin();
        }
      } else {
        const p = e.pose;
        const k = e.touches;
        if (k.has("ArrowLeft")) p.lacet += ROTATION * dt;
        if (k.has("ArrowRight")) p.lacet -= ROTATION * dt;
        p.lacet = angle(p.lacet);
        const avant = [...AVANCER].some((c) => k.has(c)) ? 1 : [...RECULER].some((c) => k.has(c)) ? -1 : 0;
        const cote = (k.has("KeyD") ? 1 : 0) - (k.has("KeyA") ? 1 : 0);
        if (avant || cote) {
          const r = (p.lacet * Math.PI) / 180;
          const n = Math.hypot(avant, cote);
          const v = (VITESSE * (e.course ? COURSE : 1) * dt) / n;
          // Devant : (-sin, -cos) ; à droite : (cos, -sin)
          const dx = (-Math.sin(r) * avant + Math.cos(r) * cote) * v;
          const dz = (-Math.cos(r) * avant - Math.sin(r) * cote) * v;
          Object.assign(p, deplacer(p.x, p.z, dx, dz, decor.obstacles));
        }
        // Saut et gravité
        if (e.vy || p.y > YEUX_DEBOUT) {
          e.vy -= GRAVITE * dt;
          p.y += e.vy * dt;
          if (p.y <= YEUX_DEBOUT) {
            p.y = YEUX_DEBOUT;
            e.vy = 0;
          }
        }
        const proche = posteAPortee(p, decor.postes, mesures.ecranH);
        if (proche !== e.invite) setInvite((e.invite = proche));
        const salle = lieu(p.x);
        if (salle !== e.ou) setOu((e.ou = salle));
      }
      appliquer(e.pose);
      id = requestAnimationFrame(boucle);
    }
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clavier, souris, fenêtre
  useEffect(() => {
    const ici = racine.current!;
    const e = etat.current;
    function bas(ev: KeyboardEvent) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      e.course = ev.shiftKey;
      if (ev.code === "Escape") {
        // Échap qui vient de libérer la souris ne compte pas ; sinon, on retourne s'asseoir à sa place
        ev.stopImmediatePropagation();
        ev.preventDefault();
        if (performance.now() - e.relache > 300 && !e.trajet) asseoir(moi);
        return;
      }
      if (e.trajet) {
        if (MOUVEMENTS.has(ev.code) || ev.code === "Space") ev.preventDefault();
        return;
      }
      if (MOUVEMENTS.has(ev.code)) {
        ev.preventDefault();
        e.touches.add(ev.code);
      } else if (ev.code === "Space" || ev.code === "Enter" || ev.code === "KeyE") {
        ev.preventDefault();
        if (ev.repeat) return;
        if (e.invite) asseoir(e.invite);
        else if (ev.code === "Space" && !e.vy && e.pose.y <= YEUX_DEBOUT) e.vy = SAUT;
      }
    }
    function haut(ev: KeyboardEvent) {
      e.course = ev.shiftKey;
      e.touches.delete(ev.code);
    }
    function souris(ev: MouseEvent) {
      if (e.trajet || (!document.pointerLockElement && !(ev.buttons & 1))) return;
      e.pose.lacet -= ev.movementX * SENSIBILITE;
      e.pose.tangage = Math.max(-85, Math.min(85, e.pose.tangage - ev.movementY * SENSIBILITE));
    }
    function clic() {
      if (!document.pointerLockElement && !e.trajet) ici.requestPointerLock?.()?.catch?.(() => {});
    }
    function verrou() {
      if (document.pointerLockElement !== ici) e.relache = performance.now();
    }
    const molette = (ev: WheelEvent) => ev.preventDefault();
    const oublier = () => e.touches.clear();
    // La copie de la page a la taille de la fenêtre : si elle change, on retourne au site
    const redimensionner = () => rassis();
    addEventListener("keydown", bas, true);
    addEventListener("keyup", haut, true);
    addEventListener("blur", oublier);
    addEventListener("resize", redimensionner);
    document.addEventListener("mousemove", souris);
    document.addEventListener("pointerlockchange", verrou);
    ici.addEventListener("mousedown", clic);
    ici.addEventListener("wheel", molette, { passive: false });
    return () => {
      removeEventListener("keydown", bas, true);
      removeEventListener("keyup", haut, true);
      removeEventListener("blur", oublier);
      removeEventListener("resize", redimensionner);
      document.removeEventListener("mousemove", souris);
      document.removeEventListener("pointerlockchange", verrou);
      ici.removeEventListener("mousedown", clic);
      ici.removeEventListener("wheel", molette);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ecran = reperes(moi, mesures.ecranH).ecran;

  return (
    <div ref={racine} className="salle salle-prepare" style={{ "--cm": `${CM}px` } as CSSProperties} aria-label="Salle de classe en 3D" role="application">
      <div ref={camera} className="salle-camera">
        {decor.faces.map((f, i) => (
          <FaceSalle key={i} f={f} ecranH={mesures.ecranH} />
        ))}
        {/* Derrière l'écran, du noir : rien ne passe par les bords de l'écran en retrait */}
        <div className="salle-face salle-noir" style={placer(ecran.x, ecran.y, ecran.z - 0.5, ECRAN_LARGEUR + 4, mesures.ecranH + 4, "avant", 1)} />
        {/* L'écran : la copie de la page, à la taille de la fenêtre, réduite à 32 cm de large */}
        <div className="salle-face salle-ecran" style={placer(ecran.x, ecran.y, ecran.z, mesures.l, mesures.h, "avant", 1, mesures.echelle)}>
          <div ref={defilement} className="salle-defilement" />
        </div>
      </div>

      <div className={`salle-hud ${libre ? "" : "salle-hud-cache"}`} aria-live="polite">
        <p className="salle-lieu">
          {ou}
          <span className="retro-clignote">_</span>
        </p>
        <span className="salle-viseur" aria-hidden>
          +
        </span>
        {invite ? (
          <p className="salle-invite">
            <kbd>Espace</kbd> {invite.place === "reseau" ? "Réparer la panne" : "T'asseoir"}
          </p>
        ) : (
          <p className="salle-aide">
            <kbd>WASD</kbd> (<kbd>ZQSD</kbd>) ou <kbd>↑↓</kbd> marcher · <kbd>←→</kbd> tourner · souris : regarder (clique pour la capturer) · <kbd>Maj</kbd> courir · <kbd>Espace</kbd> sauter · <kbd>Échap</kbd> te rasseoir
          </p>
        )}
      </div>
    </div>
  );
}

const COULEURS_DEL = ["", "salle-del-faible", "", "", "salle-del-faible", ""];

function FaceSalle({ f, ecranH }: { f: Face; ecranH: number }) {
  const classes = f.classe
    .split(" ")
    .map((c) => `salle-${c}`)
    .join(" ");
  return (
    <div className={`salle-face ${classes}`} style={placer(f.x, f.y, f.z, f.l, f.h, f.vers, resolution(f.classe))}>
      <Contenu f={f} ecranH={ecranH} />
    </div>
  );
}

function Contenu({ f, ecranH }: { f: Face; ecranH: number }) {
  if (f.classe.includes("ecran-eteint")) {
    // L'écran dessiné dans la façade du moniteur : cadre de 3 cm sur les côtés, 6 en bas et 7 en haut
    const h = ecranH + 13;
    return (
      <div className="salle-mini" style={{ left: `${(3 / 38) * 100}%`, right: `${(3 / 38) * 100}%`, top: `${(7 / h) * 100}%`, bottom: `${(6 / h) * 100}%` }}>
        {f.contenu}
      </div>
    );
  }
  switch (f.contenu) {
    case "tableau":
      return (
        <div className="salle-texte salle-craie">
          {"420-1B3-EM   Programmation 1\n\nwhile (vivant) {\n    apprendre();\n}\n\nExamen : jeudi !          Ctrl+S, souvent."}
        </div>
      );
    case "rtfm":
      return <div className="salle-texte salle-affiche-texte salle-grand">{"RTFM\n\n(lis le\nmanuel)"}</div>;
    case "binaire":
      return <div className="salle-texte salle-affiche-texte">{"IL Y A 10 SORTES\nDE PERSONNES :\n\nCELLES QUI\nCOMPRENNENT\nLE BINAIRE,\n\nET LES AUTRES."}</div>;
    case "manger":
      return <div className="salle-texte salle-affiche-texte">{"INTERDIT DE\nMANGER PRÈS\nDES ORDIS\n\n(oui, toi.)"}</div>;
    case "porte":
      return <div className="salle-texte salle-affiche-texte">SALLE RÉSEAU</div>;
    case "horloge":
      return <Horloge />;
    case "schema":
      return (
        <div className="salle-texte salle-schema">
          {"      [ ROUTEUR ]\n           |\n      [ SWITCH ]----[ SERVEUR ]\n       |   |   |\n      PC  PC  PC\n\n   NE PAS DÉBRANCHER LE SWITCH"}
        </div>
      );
    case "baie":
    case "baie-panneau":
      return <Facade panneau={f.contenu === "baie-panneau"} />;
    default:
      return null;
  }
}

function Horloge() {
  const maintenant = useMaintenant(10_000);
  const deux = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="salle-texte salle-horloge">
      {maintenant ? deux(maintenant.getHours()) : "--"}
      <span className="retro-clignote">:</span>
      {maintenant ? deux(maintenant.getMinutes()) : "--"}
    </div>
  );
}

// Façade d'une baie : des serveurs empilés, chacun avec sa rangée de diodes qui clignotent à leur rythme
function Facade({ panneau }: { panneau: boolean }) {
  return (
    <div className="salle-facade">
      {panneau && <div className="salle-texte salle-etiquette">NE PAS DÉBRANCHER</div>}
      {Array.from({ length: panneau ? 9 : 11 }, (_, u) => (
        <div key={u} className="salle-unite">
          {Array.from({ length: 8 }, (_, d) => (
            <span key={d} className={`salle-del ${COULEURS_DEL[(u + d) % COULEURS_DEL.length]}`} style={{ "--d": `${((u * 7 + d * 13) % 17) / 10}s` } as CSSProperties} />
          ))}
        </div>
      ))}
      {panneau && (
        <svg className="salle-cables" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
          <path d="M10 2 C 15 30, 35 30, 40 2 M25 2 C 30 36, 60 36, 65 2 M50 2 C 55 28, 80 28, 90 2" />
        </svg>
      )}
    </div>
  );
}

