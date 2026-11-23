import { expect, it } from "vitest";
import { bot } from "@/lib/donnees";
import { etapeSuivante } from "@/lib/bot";

it("toutes les questions et tous les résultats sont atteignables, sans boucle", () => {
  const b = bot();
  const questions = new Set<string>();
  const resultats = new Set<string>();
  function parcourir(id: string, chemin: string[]) {
    expect(chemin, `boucle dans le bot : ${[...chemin, id].join(" -> ")}`).not.toContain(id);
    questions.add(id);
    b.questions[id].choix.forEach((_, i) => {
      const e = etapeSuivante(b, id, i);
      if (e.type === "question") parcourir(e.id, [...chemin, id]);
      else resultats.add(e.id);
    });
  }
  parcourir(b.depart, []);
  expect([...questions].sort()).toEqual(Object.keys(b.questions).sort());
  expect([...resultats].sort()).toEqual(Object.keys(b.resultats).sort());
});

it("la branche IA mène à un résultat sur l'IA", () => {
  const b = bot();
  const choix = (id: string, texte: RegExp) => b.questions[id].choix.findIndex((c) => texte.test(c.texte));
  expect(etapeSuivante(b, "passion", choix("passion", /intelligence artificielle/i))).toEqual({ type: "question", id: "ia-quoi" });
  expect(etapeSuivante(b, "ia-quoi", choix("ia-quoi", /remplace/i))).toEqual({ type: "question", id: "ia-peur" });
});
