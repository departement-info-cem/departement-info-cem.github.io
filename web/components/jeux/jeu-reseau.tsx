"use client";
import { useEffect, useRef, useState } from "react";
import { Lightbulb, RotateCcw, Terminal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoixNiveau } from "@/components/jeux/choix-niveau";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import { appareil, cableDe, diode, MASQUE, NIVEAUX_RESEAU, ping, type Appareil, type Diode, type Reseau, type ResultatPing } from "@/lib/jeux/reseau";

const T = 40; // taille d'une case
const COULEUR: Record<Diode, string> = { eteinte: "#44515c", orange: "#f37021", verte: "#8dc640" };
type Point = { x: number; y: number };

/** Plus court chemin sur le plancher (les appareils et les murs bloquent). */
function cheminVers(depart: Point, cible: Point, bloque: (p: Point) => boolean, adjacent: boolean): Point[] | null {
  const cle = (p: Point) => `${p.x},${p.y}`;
  const venu = new Map<string, Point | null>([[cle(depart), null]]);
  const file = [depart];
  while (file.length) {
    const p = file.shift()!;
    const arrive = adjacent ? Math.abs(p.x - cible.x) + Math.abs(p.y - cible.y) === 1 : p.x === cible.x && p.y === cible.y;
    if (arrive) {
      const chemin: Point[] = [];
      for (let q: Point | null = p; q; q = venu.get(cle(q)) ?? null) chemin.unshift(q);
      return chemin.slice(1);
    }
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const v = { x: p.x + dx, y: p.y + dy };
      if (venu.has(cle(v)) || bloque(v)) continue;
      venu.set(cle(v), p);
      file.push(v);
    }
  }
  return null;
}

// Personnage dessiné pixel par pixel (12 x 14)
const PIXELS = ["...mmmmmm...", "..mmmmmmmm..", "..mpppppp...", "..ppnppnpp..", "..pppppppp..", "...pppppp...", "..vvvvvvvv..", ".vvvvjjvvvv.", ".pvvvvvvvvp.", ".p.vvvvvv.p.", "...bbbbbb...", "...bb..bb...", "...bb..bb...", "..nnn..nnn.."];
const TEINTES: Record<string, string> = { m: "#4a2c17", p: "#e8b48a", n: "#1b1b1b", v: "#278637", j: "#fdb913", b: "#0c3455" };

function Personnage({ miroir, cable }: { miroir: boolean; cable: boolean }) {
  return (
    <g transform={`translate(${T / 2} 2) scale(${miroir ? -2.5 : 2.5} 2.5) translate(-6 0)`} shapeRendering="crispEdges">
      {PIXELS.flatMap((l, y) => [...l].map((c, x) => (TEINTES[c] ? <rect key={`${x},${y}`} x={x} y={y} width={1.02} height={1.02} fill={TEINTES[c]} /> : null)))}
      {cable && <path d="M10 8 q3 0 2 3 t3 2" stroke="#14b1e7" strokeWidth={1} fill="none" />}
    </g>
  );
}

const portX = (a: Appareil, i: number) => a.x * T + T / 2 + (i - (a.ports.length - 1) / 2) * 8;
const portY = (a: Appareil) => a.y * T + (a.type === "pc" ? T - 5 : T - 8);

function DessinAppareil({ a, r, cible }: { a: Appareil; r: Reseau; cible: boolean }) {
  const x = a.x * T;
  const y = a.y * T;
  return (
    <g shapeRendering="crispEdges">
      {a.type === "pc" && (
        <>
          <rect x={x + 5} y={y + 4} width={30} height={21} fill="#1f2d3a" />
          <rect x={x + 8} y={y + 7} width={24} height={15} fill={cible ? "#8dc640" : "#14b1e7"} />
          <rect x={x + 10} y={y + 9} width={10} height={2} fill="#fff" opacity={0.7} />
          <rect x={x + 10} y={y + 13} width={15} height={2} fill="#fff" opacity={0.5} />
          <rect x={x + 17} y={y + 25} width={6} height={4} fill="#1f2d3a" />
          <rect x={x + 10} y={y + 29} width={20} height={3} fill="#1f2d3a" />
        </>
      )}
      {a.type === "switch" && (
        <>
          <rect x={x + 1} y={y + 14} width={T - 2} height={20} fill="#0c3455" />
          <rect x={x + 1} y={y + 14} width={T - 2} height={4} fill="#2c5377" />
          <text x={x + T / 2} y={y + 12} textAnchor="middle" fontSize={8} fill="#0c3455" className="dark:fill-white">⇄</text>
        </>
      )}
      {a.type === "routeur" && (
        <>
          <rect x={x + 4} y={y + 10} width={T - 8} height={24} fill="#f37021" />
          <rect x={x + 4} y={y + 10} width={T - 8} height={5} fill="#ffa366" />
          <rect x={x + 8} y={y + 1} width={2} height={10} fill="#1f2d3a" />
          <rect x={x + 30} y={y + 1} width={2} height={10} fill="#1f2d3a" />
        </>
      )}
      {a.ports.map((_, i) => {
        const d = diode(r, a.id, i);
        return (
          <g key={i}>
            <rect x={portX(a, i) - 3} y={portY(a) - 3} width={6} height={6} fill="#0a0f14" />
            <rect x={portX(a, i) - 2} y={portY(a) - 2} width={4} height={4} fill={COULEUR[d]}>
              {d === "verte" && <animate attributeName="opacity" values="1;0.45;1" dur={`${0.8 + ((i + a.x) % 3) * 0.3}s`} repeatCount="indefinite" />}
            </rect>
          </g>
        );
      })}
    </g>
  );
}

export function JeuReseau() {
  const [niveau, setNiveau] = useState(0);
  const n = NIVEAUX_RESEAU[niveau];
  const [reussis, setReussis] = useStockageLocal<number[]>("jeu-reseau-reussis", []);
  const [reseau, setReseau] = useState<Reseau>(n.reseau);
  const [joueur, setJoueur] = useState<Point>(n.joueur);
  const [miroir, setMiroir] = useState(false);
  const [trajet, setTrajet] = useState<Point[]>([]);
  const [viser, setViser] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  /** câble tenu en main, et bout qui traîne encore au sol */
  const [enMain, setEnMain] = useState<string | null>(null);
  const [auSol, setAuSol] = useState(n.boutAuSol ?? null);
  const [console_, setConsole] = useState<{ texte: string; type: "cmd" | "ok" | "ko" | "info" }[]>([]);
  const [indice, setIndice] = useState(false);
  const [paquet, setPaquet] = useState<{ points: Point[]; etape: number; resultat: ResultatPing } | null>(null);
  const [gagne, setGagne] = useState(false);
  const [nbPings, setNbPings] = useState(0);
  const scene = useRef<SVGSVGElement>(null);
  const finConsole = useRef<HTMLDivElement>(null);

  const largeur = n.salle[0].length;
  const hauteur = n.salle.length;
  const bloque = (p: Point) => n.salle[p.y]?.[p.x] !== "." || reseau.appareils.some((a) => a.x === p.x && a.y === p.y);
  const proche = (a: Appareil) => Math.abs(a.x - joueur.x) + Math.abs(a.y - joueur.y) === 1;
  const voisin = reseau.appareils.find(proche);
  const actuel = ouvert ? appareil(reseau, ouvert) : null;

  function choisir(i: number) {
    const x = NIVEAUX_RESEAU[i];
    setNiveau(i);
    setReseau(x.reseau);
    setJoueur(x.joueur);
    setTrajet([]);
    setViser(null);
    setOuvert(null);
    setEnMain(null);
    setAuSol(x.boutAuSol ?? null);
    setConsole([]);
    setIndice(false);
    setPaquet(null);
    setGagne(false);
    setNbPings(0);
  }

  function deplacer(p: Point) {
    setMiroir(p.x < joueur.x ? true : p.x > joueur.x ? false : miroir);
    setJoueur(p);
    if (auSol && auSol.x === p.x && auSol.y === p.y) {
      setEnMain(auSol.cable);
      setAuSol(null);
      setConsole((c) => [...c, { texte: "Tu ramasses le bout de câble. Va le brancher dans un port libre.", type: "info" }]);
    }
  }

  // Marche automatique vers l'endroit cliqué
  useEffect(() => {
    if (!trajet.length) return;
    const id = setTimeout(() => {
      deplacer(trajet[0]);
      const reste = trajet.slice(1);
      setTrajet(reste);
      if (!reste.length && viser) {
        setOuvert(viser);
        setViser(null);
      }
    }, 90);
    return () => clearTimeout(id);
  });

  // Animation du message qui voyage
  useEffect(() => {
    if (!paquet) return;
    const id = setTimeout(() => {
      if (paquet.etape < paquet.points.length - 1) {
        setPaquet({ ...paquet, etape: paquet.etape + 1 });
        return;
      }
      const { resultat } = paquet;
      setPaquet(null);
      setConsole((c) => [...c, { texte: resultat.message, type: resultat.ok ? "ok" : "ko" }, { texte: resultat.explication, type: "info" }]);
      if (resultat.ok) {
        setGagne(true);
        setReussis((r) => (r.includes(niveau) ? r : [...r, niveau]));
      }
    }, 320);
    return () => clearTimeout(id);
  });

  useEffect(() => {
    const boite = finConsole.current?.parentElement;
    if (boite) boite.scrollTop = boite.scrollHeight;
  }, [console_.length]);

  function cliquerCase(p: Point) {
    if (paquet) return;
    const a = reseau.appareils.find((x) => x.x === p.x && x.y === p.y);
    if (a && proche(a)) {
      setOuvert(a.id);
      return;
    }
    const c = cheminVers(joueur, p, bloque, Boolean(a));
    if (!c) return;
    setOuvert(null);
    setViser(a?.id ?? null);
    setTrajet(c);
  }

  function surTouche(e: React.KeyboardEvent) {
    const pas: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
    const v = pas[e.key];
    if (v) {
      e.preventDefault();
      const p = { x: joueur.x + v[0], y: joueur.y + v[1] };
      setTrajet([]);
      setViser(null);
      setOuvert(null);
      if (bloque(p)) setMiroir(v[0] < 0 ? true : v[0] > 0 ? false : miroir);
      else deplacer(p);
    } else if ((e.key === "e" || e.key === "Enter" || e.key === " ") && voisin) {
      e.preventDefault();
      setOuvert(voisin.id);
    } else if (e.key === "Escape") setOuvert(null);
  }

  function lancerPing() {
    if (paquet) return;
    const resultat = ping(reseau, n.source, n.destination);
    const centre = (id: string) => {
      const a = appareil(reseau, id);
      return { x: a.x * T + T / 2, y: a.y * T + T / 2 };
    };
    setNbPings((k) => k + 1);
    setConsole((c) => [...c, { texte: `${appareil(reseau, n.source).nom}> ping ${appareil(reseau, n.destination).ip}`, type: "cmd" }]);
    setPaquet({ points: [...resultat.aller, ...resultat.retour.slice(1)].map(centre), etape: 0, resultat });
  }

  const modifier = (id: string, f: (a: Appareil) => Appareil) => {
    setGagne(false);
    setReseau((r) => ({ ...r, appareils: r.appareils.map((a) => (a.id === id ? f(a) : a)) }));
  };
  const modifierPort = (id: string, i: number, f: (p: Appareil["ports"][number]) => Appareil["ports"][number]) => modifier(id, (a) => ({ ...a, ports: a.ports.map((p, k) => (k === i ? f(p) : p)) }));

  function brancher(app: string, port: number) {
    if (!enMain) return;
    setReseau((r) => ({ ...r, cables: r.cables.map((c) => (c.id === enMain ? { ...c, b: { app, port } } : c)) }));
    setEnMain(null);
  }
  function debrancher(id: string) {
    setGagne(false);
    setReseau((r) => ({ ...r, cables: r.cables.map((c) => (c.id === id ? { ...c, b: null } : c)) }));
    setEnMain(id);
  }

  const cableLibre = reseau.cables.find((c) => !c.b);

  return (
    <div>
      <ChoixNiveau titres={NIVEAUX_RESEAU.map((x) => x.titre)} niveau={niveau} reussis={reussis} choisir={choisir} />
      <div className="mb-4 rounded-lg border-l-4 border-l-cem-vert bg-secondary/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{n.notion}</p>
        <p>{n.histoire}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          But : que <strong>{appareil(n.reseau, n.source).nom}</strong> réussisse un ping vers <strong>{appareil(n.reseau, n.destination).nom}</strong>. Clique pour marcher (ou flèches), clique sur un appareil (ou E) pour l&apos;examiner.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0">
          <svg
            ref={scene}
            viewBox={`0 0 ${largeur * T} ${hauteur * T}`}
            className="w-full rounded-lg border bg-[#16202a] outline-none focus-visible:ring-2 focus-visible:ring-primary"
            tabIndex={0}
            onKeyDown={surTouche}
            onClick={(e) => {
              const s = e.currentTarget.getBoundingClientRect();
              cliquerCase({ x: Math.floor(((e.clientX - s.left) / s.width) * largeur), y: Math.floor(((e.clientY - s.top) / s.height) * hauteur) });
            }}
            role="application"
            aria-label="Salle réseau. Flèches pour marcher, E pour examiner l'appareil voisin."
          >
            {n.salle.map((l, y) =>
              [...l].map((c, x) => (
                <g key={`${x},${y}`} shapeRendering="crispEdges">
                  {c === "#" ? (
                    <>
                      <rect x={x * T} y={y * T} width={T} height={T} fill="#33546f" />
                      <rect x={x * T} y={y * T + T - 10} width={T} height={10} fill="#22394d" />
                      <rect x={x * T + (y % 2 ? 0 : T / 2)} y={y * T} width={2} height={T - 10} fill="#2a475f" />
                    </>
                  ) : (
                    <>
                      <rect x={x * T} y={y * T} width={T} height={T} fill={(x + y) % 2 ? "#d9d2bf" : "#e4dfcf"} />
                      <rect x={x * T + 4} y={y * T + 4} width={2} height={2} fill="#c4bca5" />
                    </>
                  )}
                  {c === "=" && (
                    <>
                      <rect x={x * T + 3} y={y * T} width={T - 6} height={T - 2} fill="#1f2d3a" />
                      {[6, 14, 22, 30].map((dy) => (
                        <g key={dy}>
                          <rect x={x * T + 7} y={y * T + dy} width={T - 14} height={5} fill="#3a4d5e" />
                          <rect x={x * T + 9} y={y * T + dy + 1} width={3} height={3} fill={dy % 4 ? "#fdb913" : "#8dc640"} />
                        </g>
                      ))}
                    </>
                  )}
                </g>
              )),
            )}
            {/* câbles */}
            {reseau.cables.map((c) => {
              const a = appareil(reseau, c.a.app);
              const p1 = { x: portX(a, c.a.port), y: portY(a) };
              const b = c.b && appareil(reseau, c.b.app);
              const p2 = b
                ? { x: portX(b, c.b!.port), y: portY(b) }
                : enMain === c.id
                  ? { x: joueur.x * T + T / 2, y: joueur.y * T + T * 0.7 }
                  : auSol?.cable === c.id
                    ? { x: auSol.x * T + T / 2, y: auSol.y * T + T / 2 }
                    : p1;
              const milieu = Math.max(p1.y, p2.y) + 22;
              return (
                <g key={c.id} pointerEvents="none">
                  <path d={`M${p1.x} ${p1.y} C${p1.x} ${milieu} ${p2.x} ${milieu} ${p2.x} ${p2.y}`} fill="none" stroke="#071a2b" strokeWidth={5} opacity={0.25} />
                  <path d={`M${p1.x} ${p1.y} C${p1.x} ${milieu} ${p2.x} ${milieu} ${p2.x} ${p2.y}`} fill="none" stroke={c.b ? "#1c6fa8" : "#14b1e7"} strokeWidth={3} strokeDasharray={c.b ? undefined : "6 3"} />
                </g>
              );
            })}
            {auSol && cableLibre && (
              <g transform={`translate(${auSol.x * T + T / 2 - 6} ${auSol.y * T + T / 2 - 4})`}>
                <rect width={12} height={9} fill="#fff" stroke="#14b1e7" strokeWidth={2} />
                <rect x={3} y={-3} width={6} height={4} fill="#fdb913" />
                <animateTransform attributeName="transform" additive="sum" type="translate" values="0 0;0 -4;0 0" dur="1.2s" repeatCount="indefinite" />
              </g>
            )}
            {reseau.appareils.map((a) => (
              <g key={a.id} className="cursor-pointer">
                {(ouvert === a.id || voisin?.id === a.id) && <rect x={a.x * T - 1} y={a.y * T - 1} width={T + 2} height={T + 2} fill="none" stroke="#fdb913" strokeWidth={2} rx={3} />}
                <DessinAppareil a={a} r={reseau} cible={a.id === n.destination} />
                <text x={a.x * T + T / 2} y={a.y * T - 5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0c3455" stroke="#e4dfcf" strokeWidth={3} paintOrder="stroke">
                  {a.nom}
                </text>
              </g>
            ))}
            <g pointerEvents="none" style={{ transform: `translate(${joueur.x * T}px, ${joueur.y * T}px)`, transition: "transform 90ms linear" }}>
              <ellipse cx={T / 2} cy={T - 3} rx={12} ry={4} fill="rgb(0 0 0 / 25%)" />
              <Personnage miroir={miroir} cable={enMain !== null} />
            </g>
            {paquet && (
              <g pointerEvents="none" style={{ transform: `translate(${paquet.points[paquet.etape].x}px, ${paquet.points[paquet.etape].y}px)`, transition: "transform 300ms ease-in-out" }}>
                <rect x={-9} y={-7} width={18} height={13} fill="#fff" stroke="#278637" strokeWidth={2} />
                <path d="M-9 -7 L0 1 L9 -7" fill="none" stroke="#278637" strokeWidth={2} />
              </g>
            )}
          </svg>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(["verte", "orange", "eteinte"] as const).map((d) => (
              <span key={d} className="flex items-center gap-1">
                <span className="size-2.5 rounded-sm" style={{ background: COULEUR[d] }} />
                {d === "verte" ? "lien établi" : d === "orange" ? "câble branché, port désactivé" : "pas de câble"}
              </span>
            ))}
            {enMain && <span className="font-semibold text-foreground">Tu tiens un bout de câble.</span>}
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="min-h-44 rounded-lg border bg-card p-4">
            {!actuel && <p className="text-sm text-muted-foreground">Approche-toi d&apos;un appareil et clique dessus pour l&apos;examiner.</p>}
            {actuel && (
              <div className="space-y-3 text-sm">
                <h3 className="font-semibold">
                  {actuel.nom} <span className="font-normal text-muted-foreground">({actuel.type === "pc" ? "ordinateur" : actuel.type})</span>
                </h3>
                {actuel.ip && (
                  <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
                    <dt className="text-muted-foreground">Adresse IP</dt>
                    <dd className="font-mono">
                      {actuel.choixIp ? (
                        <select value={actuel.ip} onChange={(e) => modifier(actuel.id, (a) => ({ ...a, ip: e.target.value }))} className="w-full rounded border bg-background px-1 py-0.5">
                          {actuel.choixIp.map((ip) => <option key={ip}>{ip}</option>)}
                        </select>
                      ) : actuel.ip}
                    </dd>
                    <dt className="text-muted-foreground">Masque</dt>
                    <dd className="font-mono">{MASQUE}</dd>
                    <dt className="text-muted-foreground">Passerelle</dt>
                    <dd className="font-mono">
                      {actuel.choixPasserelle ? (
                        <select value={actuel.passerelle ?? "(aucune)"} onChange={(e) => modifier(actuel.id, (a) => ({ ...a, passerelle: e.target.value === "(aucune)" ? undefined : e.target.value }))} className="w-full rounded border bg-background px-1 py-0.5">
                          {actuel.choixPasserelle.map((ip) => <option key={ip}>{ip}</option>)}
                        </select>
                      ) : (actuel.passerelle ?? "(aucune)")}
                    </dd>
                  </dl>
                )}
                <ul className="space-y-1.5">
                  {actuel.ports.map((p, i) => {
                    const c = cableDe(reseau, actuel.id, i);
                    const d = diode(reseau, actuel.id, i);
                    const bout = c && (c.a.app === actuel.id && c.a.port === i ? c.b : c.a);
                    return (
                      <li key={i} className="flex flex-wrap items-center gap-2 rounded border px-2 py-1.5">
                        <span className="size-3 rounded-sm border border-black/40" style={{ background: COULEUR[d] }} title={`diode ${d}`} />
                        <span className="font-mono text-xs">
                          port {i + 1}
                          {p.ip && ` ${p.ip}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{c ? (bout ? `→ ${appareil(reseau, bout.app).nom}` : "→ câble pendant") : "libre"}</span>
                        <span className="ml-auto flex gap-1.5">
                          {actuel.choixVlan && (
                            <select value={p.vlan} onChange={(e) => modifierPort(actuel.id, i, (x) => ({ ...x, vlan: Number(e.target.value) }))} className="rounded border bg-background px-1 text-xs" aria-label={`VLAN du port ${i + 1}`}>
                              {actuel.choixVlan.map((v) => <option key={v} value={v}>VLAN {v}</option>)}
                            </select>
                          )}
                          {actuel.type !== "pc" && (
                            <button onClick={() => modifierPort(actuel.id, i, (x) => ({ ...x, actif: !x.actif }))} className={`rounded border px-1.5 text-xs font-semibold ${p.actif ? "border-primary text-primary" : "border-cem-orange bg-cem-orange/15 text-cem-orange"}`}>
                              {p.actif ? "activé" : "désactivé"}
                            </button>
                          )}
                          {!c && enMain && <button onClick={() => brancher(actuel.id, i)} className="rounded bg-primary px-1.5 text-xs font-semibold text-primary-foreground">Brancher</button>}
                          {c && !c.fixe && c.b?.app === actuel.id && c.b.port === i && !enMain && <button onClick={() => debrancher(c.id)} className="rounded border px-1.5 text-xs">Débrancher</button>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="h-40 overflow-y-auto rounded-lg border bg-[#071a2b] p-3 font-mono text-xs leading-5 text-[#e6f0f7]" aria-live="polite">
            <p className="text-white/50">Invite de commandes — {appareil(n.reseau, n.source).nom}</p>
            {console_.map((c, i) => (
              <p key={i} className={c.type === "ok" ? "text-cem-vert" : c.type === "ko" ? "text-cem-orange" : c.type === "info" ? "text-white/65" : ""}>
                {c.texte}
              </p>
            ))}
            <div ref={finConsole} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={lancerPing} disabled={paquet !== null}>
              <Terminal className="size-4" /> Lancer le ping
            </Button>
            <Button variant="outline" onClick={() => choisir(niveau)}>
              <RotateCcw className="size-4" /> Recommencer
            </Button>
          </div>
          {gagne && (
            <div className="flex items-start gap-2 rounded-md border border-primary bg-accent p-3 text-sm">
              <Trophy className="size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">Ping réussi{nbPings > 1 ? ` après ${nbPings} essais` : " du premier coup"} !</p>
                <p>{n.bravo}</p>
                {niveau < NIVEAUX_RESEAU.length - 1 && <Button size="sm" className="mt-2" onClick={() => choisir(niveau + 1)}>Niveau suivant</Button>}
              </div>
            </div>
          )}
          <button onClick={() => setIndice(!indice)} className="flex items-center gap-1 text-sm text-primary underline">
            <Lightbulb className="size-4" /> {indice ? "Cacher l'indice" : "Un indice ?"}
          </button>
          {indice && <p className="rounded-md bg-secondary p-3 text-sm">{n.indice}</p>}
        </div>
      </div>
    </div>
  );
}
