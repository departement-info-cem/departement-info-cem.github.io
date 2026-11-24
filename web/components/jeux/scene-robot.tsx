"use client";
import type { Monde } from "@/lib/jeux/robot";

// Scène isométrique dessinée en SVG : plancher du centre de données, serveurs, paquets, terminal et Octet le robot.
const L = 64; // largeur d'une tuile
const H = 32; // hauteur d'une tuile

const iso = (x: number, y: number) => ({ px: (x - y) * (L / 2), py: (x + y) * (H / 2) });

function Bloc({ x, y, h, dessus, gauche, droite, t = 1 }: { x: number; y: number; h: number; dessus: string; gauche: string; droite: string; t?: number }) {
  const { px, py } = iso(x, y);
  const l = (L / 2) * t;
  const d = (H / 2) * t;
  return (
    <g transform={`translate(${px} ${py - h})`}>
      <polygon points={`${-l},0 0,${d} 0,${d + h} ${-l},${h}`} fill={gauche} />
      <polygon points={`${l},0 0,${d} 0,${d + h} ${l},${h}`} fill={droite} />
      <polygon points={`0,${-d} ${l},0 0,${d} ${-l},0`} fill={dessus} />
    </g>
  );
}

function Serveur({ x, y }: { x: number; y: number }) {
  const { px, py } = iso(x, y);
  return (
    <g>
      <Bloc x={x} y={y} h={27} dessus="#2c5377" gauche="#0c3455" droite="#164469" t={0.9} />
      {[0, 1].map((i) => (
        <g key={i}>
          <polygon points={`${px - 24},${py - 20 + i * 11} ${px - 4},${py - 10 + i * 11} ${px - 4},${py - 4 + i * 11} ${px - 24},${py - 14 + i * 11}`} fill="#071a2b" />
          <circle cx={px - 20} cy={py - 15 + i * 11} r={1.6} fill={i === 1 ? "#fdb913" : "#8dc640"}>
            <animate attributeName="opacity" values="1;0.2;1" dur={`${1.2 + ((x * 7 + y * 3 + i) % 5) * 0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </g>
  );
}

export function SceneRobot({ monde, erreur, vitesse }: { monde: Monde; erreur: boolean; vitesse: number }) {
  const lignes = monde.carte.length;
  const colonnes = monde.carte[0].length;
  const minX = -lignes * (L / 2) - 20;
  const largeur = (lignes + colonnes) * (L / 2) + 40;
  const hauteur = (lignes + colonnes) * (H / 2) + 100;
  const robot = iso(monde.x, monde.y);
  const cases = monde.carte.flatMap((ligne, y) => ligne.map((c, x) => ({ c, x, y }))).sort((a, b) => a.x + a.y - (b.x + b.y));
  const transition = { transition: `transform ${vitesse * 0.8}ms ease-in-out` };
  // Serveurs et paquets, du plus loin au plus proche de nous : chacun cache ceux dessinés avant lui
  const objets = cases.flatMap(({ c, x, y }) => {
    const rang = x + y;
    if (c === "#") return [{ rang, el: <Serveur key={`m${x},${y}`} x={x} y={y} /> }];
    if (!monde.paquets.has(`${x},${y}`)) return [];
    const paquet = (
      // La ref recale le flottement sur l'horloge de la page : un paquet qui passe devant ou derrière Octet
      // est recréé, et sans ça il repartirait de zéro, décalé par rapport aux autres
      <g key={`p${x},${y}`} ref={(g) => g?.getAnimations().forEach((a) => (a.startTime = 0))} style={{ animation: "flotte 1.6s ease-in-out infinite" }}>
        <g transform="translate(0 -6)">
          <Bloc x={x} y={y} h={16} dessus="#ffe08a" gauche="#f37021" droite="#fdb913" t={0.36} />
        </g>
      </g>
    );
    return [{ rang, el: paquet }];
  });
  // Octet se glisse entre les objets de son rang (ou plus loin) et ceux plus proches de nous
  const rang = monde.x + monde.y;

  const octet = (
    <g key="octet" style={{ ...transition, transform: `translate(${robot.px}px, ${robot.py}px)` }}>
      <ellipse cx={0} cy={0} rx={20} ry={10} fill="rgb(0 0 0 / 30%)" />
      <g style={{ animation: erreur ? "secousse 0.35s" : undefined }}>
        {/* flèche de direction, au sol : la matrice met à plat une rotation dans le plan isométrique */}
        <g transform="matrix(0.707 0.354 -0.707 0.354 0 0)">
          <polygon points="17,-7 30,0 17,7" fill="#fdb913" style={{ ...transition, transform: `rotate(${monde.dir * 90}deg)` }} />
        </g>
        <rect x={-13} y={-13} width={9} height={11} rx={3} fill="#0c3455" />
        <rect x={4} y={-13} width={9} height={11} rx={3} fill="#0c3455" />
        <rect x={-15} y={-31} width={30} height={22} rx={7} fill="#f4f7fa" stroke="#0c3455" strokeWidth={2} />
        <rect x={-13} y={-48} width={26} height={17} rx={6} fill={erreur ? "#d93b20" : "#14b1e7"} stroke="#0c3455" strokeWidth={2} />
        <Yeux dir={monde.dir} erreur={erreur} />
        <line x1={0} y1={-48} x2={0} y2={-56} stroke="#0c3455" strokeWidth={2} />
        <circle cx={0} cy={-58} r={3.5} fill="#8dc640" />
        <text x={0} y={-16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#278637" fontFamily="monospace">
          {monde.ramasses}
        </text>
      </g>
    </g>
  );

  return (
    <svg viewBox={`${minX} -80 ${largeur} ${hauteur}`} className="max-h-[26rem] w-full" role="img" aria-label={`Octet est à la colonne ${monde.x + 1}, ligne ${monde.y + 1}. Paquets ramassés : ${monde.ramasses} sur ${monde.total}.`}>
      <style>{`@keyframes secousse{0%,100%{translate:0}25%{translate:-4px}75%{translate:4px}}@keyframes flotte{0%,100%{translate:0 0}50%{translate:0 -5px}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>
      {cases.map(({ c, x, y }) => {
        if (c === " ") return null;
        const pair = (x + y) % 2 === 0;
        const { px, py } = iso(x, y);
        return (
          <g key={`s${x},${y}`}>
            <Bloc x={x} y={y} h={0} dessus={c === "T" ? "#278637" : pair ? "#dbe6ee" : "#cbdae6"} gauche="" droite="" />
            <polygon points={`${px - 32},${py} ${px},${py + 16} ${px},${py + 26} ${px - 32},${py + 10}`} fill="#8aa3b8" />
            <polygon points={`${px + 32},${py} ${px},${py + 16} ${px},${py + 26} ${px + 32},${py + 10}`} fill="#7390a8" />
            {/* « >_ » tracé plutôt qu'écrit : centré pile sur la tuile, quelle que soit la police du système */}
            {c === "T" && (
              <g fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points={`${px - 7},${py - 3.5} ${px - 1.5},${py} ${px - 7},${py + 3.5}`} />
                <line x1={px + 1.5} y1={py + 3.5} x2={px + 7} y2={py + 3.5} />
              </g>
            )}
          </g>
        );
      })}
      {objets.filter((o) => o.rang <= rang).map((o) => o.el)}
      {/* Octet reste toujours au même endroit dans le SVG : déplacé, il perdrait son animation de déplacement */}
      {octet}
      {objets.filter((o) => o.rang > rang).map((o) => o.el)}
    </svg>
  );
}

function Yeux({ dir, erreur }: { dir: number; erreur: boolean }) {
  if (erreur)
    return (
      <text x={0} y={-35} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff" fontFamily="monospace">
        x x
      </text>
    );
  // Vu de devant (est, sud) : deux yeux du bon côté ; de dos (ouest, nord) : pas d'yeux
  const d = ((dir % 4) + 4) % 4;
  if (d >= 2) return <rect x={-6} y={-42} width={12} height={5} rx={2} fill="#0c3455" opacity={0.35} />;
  const decal = d === 0 ? 3 : -3;
  return (
    <>
      <circle cx={decal - 4.5} cy={-39.5} r={3} fill="#fff" />
      <circle cx={decal + 4.5} cy={-39.5} r={3} fill="#fff" />
      <circle cx={decal * 1.4 - 4.5} cy={-39.5} r={1.5} fill="#0c3455" />
      <circle cx={decal * 1.4 + 4.5} cy={-39.5} r={1.5} fill="#0c3455" />
    </>
  );
}
